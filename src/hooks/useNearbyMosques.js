'use client';

import { useState, useCallback } from 'react';

/**
 * useNearbyMosques — mencari masjid/musholla terdekat memakai GPS perangkat
 * dan data OpenStreetMap (Overpass API, gratis tanpa API key).
 *
 * Status:
 *  - 'idle'     : belum dicari
 *  - 'locating' : sedang meminta lokasi GPS
 *  - 'loading'  : sedang mengambil data masjid
 *  - 'success'  : ada hasil
 *  - 'empty'    : lokasi didapat tapi tidak ada masjid di radius
 *  - 'denied'   : izin lokasi ditolak / GPS gagal
 *  - 'error'    : gagal mengambil data
 *
 * @returns {{ status, mosques, coords, errorMsg, findNearby }}
 */

// Endpoint mirror diurut dari yang biasanya paling responsif.
const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

// Batas waktu tiap permintaan ke server (ms). Mencegah loading menggantung.
const REQUEST_TIMEOUT = 12000;
const GEO_TIMEOUT = 10000;

// Hitung jarak dua titik (meter) dengan rumus Haversine.
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Ambil posisi GPS sebagai Promise. enableHighAccuracy=false jauh lebih cepat
// & lebih andal di dalam ruangan; akurasi kasar sudah cukup untuk cari masjid.
function getPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: GEO_TIMEOUT, maximumAge: 300000 },
    );
  });
}

// fetch dengan batas waktu via AbortController.
async function fetchWithTimeout(url, options, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Query Overpass: coba endpoint satu per satu sampai ada yang berhasil.
async function queryOverpass(lat, lon, radius) {
  // timeout server dibuat kecil (10s) agar tidak menggantung lama.
  const query = `[out:json][timeout:10];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
);
out center tags 40;`;

  let lastErr;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetchWithTimeout(
        endpoint,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'data=' + encodeURIComponent(query),
          cache: 'no-store',
        },
        REQUEST_TIMEOUT,
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      lastErr = err; // lanjut ke endpoint berikutnya
    }
  }
  throw lastErr || new Error('overpass failed');
}

export default function useNearbyMosques() {
  const [status, setStatus] = useState('idle');
  const [mosques, setMosques] = useState([]);
  const [coords, setCoords] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const findNearby = useCallback(async () => {
    setErrorMsg('');
    setStatus('locating');

    // 1) Ambil lokasi GPS
    let position;
    try {
      position = await getPosition();
    } catch (err) {
      setStatus('denied');
      setErrorMsg(
        err?.code === 1
          ? 'Izin lokasi ditolak. Aktifkan akses lokasi untuk aplikasi ini di pengaturan, lalu coba lagi.'
          : 'Tidak bisa mendapatkan lokasi. Pastikan GPS/lokasi aktif, lalu coba lagi.',
      );
      return;
    }

    const { latitude: lat, longitude: lon } = position;
    setCoords({ lat, lon });
    setStatus('loading');

    // 2) Cari masjid. Mulai radius 5 km (cukup untuk kota); jika kosong,
    //    perlebar SEKALI ke 12 km. Dibatasi agar tidak loading terlalu lama.
    try {
      let elements = [];
      for (const radius of [5000, 12000]) {
        const data = await queryOverpass(lat, lon, radius);
        elements = data?.elements || [];
        if (elements.length > 0) break;
      }

      if (elements.length === 0) {
        setMosques([]);
        setStatus('empty');
        return;
      }

      const list = elements
        .map((el) => {
          const elat = el.lat ?? el.center?.lat;
          const elon = el.lon ?? el.center?.lon;
          if (elat == null || elon == null) return null;
          const tags = el.tags || {};
          return {
            id: `${el.type}-${el.id}`,
            name: tags['name'] || tags['name:id'] || 'Masjid / Musholla',
            lat: elat,
            lon: elon,
            distance: haversine(lat, lon, elat, elon),
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20);

      setMosques(list);
      setStatus('success');
    } catch (err) {
      console.error('Gagal mencari masjid terdekat:', err);
      setStatus('error');
      setErrorMsg(
        'Server peta sedang sibuk atau koneksi lambat. Coba lagi sebentar ya.',
      );
    }
  }, []);

  return { status, mosques, coords, errorMsg, findNearby };
}
