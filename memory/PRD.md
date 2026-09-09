# Live Room — Simulator TikTok Live (Multi-Guest)

## Ringkasan
Aplikasi Expo React Native (web) yang meniru tampilan live room multi-guest.
Awalnya murni UI lokal per-device; kini state disimpan bersama di server (MongoDB) dan
disinkronkan real-time antar device via Socket.IO.

## Arsitektur
- Frontend: Expo Router (web via react-native-web). `yarn start` -> `expo start --web --port 3000`.
- Backend: FastAPI + Socket.IO ASGI (`app = socketio.ASGIApp(...)`), path `/api/socket.io`.
- DB: MongoDB, koleksi `rooms`, satu dokumen id `live` menyimpan seluruh state.
- Real-time: server broadcast `room_state` (full state) tiap mutasi.

## Halaman
- `/`  = Layar tampilan (bersih, tanpa setting). Gestur rahasia: tap 5x pojok kanan-atas -> `/control`.
- `/control` = Panel kontrol untuk device lain, dilindungi PIN (default `1234`).
  Bisa atur: nama, foto (avatar & latar, base64), jumlah penonton, mute/unmute, target singa,
  tombol "Munculkan Singa", dan Reset ke default. Ada indikator koneksi (Terhubung/Terputus).

## Fitur khusus
- "Munculkan Singa": penonton kotak target naik +29.999; gambar singa muncul kecil di pojok
  kanan-atas kotak target selama ~2 detik.
- Format penonton: >=1000 -> "K" kapital (mis. 30K). Animasi angka gaya odometer
  (angka baru geser dari bawah ke tengah, angka lama geser ke atas) — `RollingNumber.tsx`.
- Ikon mic-off di pojok kanan-bawah kotak peserta saat muted; bingkai nama menyempit + ikon plus tebal.

## API (prefix /api)
- GET  /room, PUT /room, PATCH /room/host, PATCH /room/guest/{id}
- POST /room/lion {targetIdx}, POST /room/reset
- POST /control/auth {pin}
- Socket.IO: connect -> auto join room `live` + kirim state; event broadcast `room_state`.

## Status (2026-09-09)
- Migrasi repo lama (Expo) ke environment ini: DONE (berjalan sebagai web di port 3000).
- Penyesuaian UI singa/nama/ikon/penonton + animasi: DONE.
- Kontrol multi-device real-time + PIN + server storage: DONE & terverifikasi
  (backend curl semua endpoint OK, socket.io handshake OK, sync display<-control OK,
   gestur rahasia OK, PIN gate OK).

## Backlog / Next
- P1: Ubah PIN dari dalam panel kontrol.
- P2: Beberapa room (kode room) agar bisa banyak sesi paralel.
- P2: Object storage untuk foto (saat ini base64 di dalam state — cukup untuk skala kecil).
- P2: Animasi/efek tambahan saat singa muncul (suara, confetti).
