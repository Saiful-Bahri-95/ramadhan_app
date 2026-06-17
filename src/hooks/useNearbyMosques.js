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

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

// Hitung jarak dua titik (meter) dengan rumus Haversine.
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000; // radius bumi (m)
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Ambil posisi GPS sebagai Promise.
function getPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  });
}

// Query Overpass dengan fallback ke mirror jika endpoint pertama gagal.
async function queryOverpass(lat, lon, radius) {
  const query = `[out:json][timeout:25];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
);
out center tags 40;`;

  let lastErr;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      lastErr = err;
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
          ? 'Izin lokasi ditolak. Aktifkan akses lokasi di pengaturan browser, lalu coba lagi.'
          : 'Tidak bisa mendapatkan lokasi. Pastikan GPS aktif dan coba lagi.',
      );
      return;
    }

    const { latitude: lat, longitude: lon } = position;
    setCoords({ lat, lon });
    setStatus('loading');

    // 2) Cari masjid; perluas radius bertahap jika kosong (2km → 5km → 10km)
    try {
      let data;
      let elements = [];
      for (const radius of [2000, 5000, 10000]) {
        data = await queryOverpass(lat, lon, radius);
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
      setErrorMsg('Gagal memuat data lokasi. Periksa koneksi internet dan coba lagi.');
    }
  }, []);

  return { status, mosques, coords, errorMsg, findNearby };
}
