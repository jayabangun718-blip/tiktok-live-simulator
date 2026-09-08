# PRD — TikTok Live Room Simulator

## Problem Statement
Impor repo lama `jayabangun718-blip/tiktok-live-simulator` (Expo React Native + TypeScript + FastAPI) ke environment ini dan lanjutkan pengembangan. Aplikasi mereplikasi tampilan live streaming multi-guest ala TikTok: Host besar + 7 kotak peserta yang bisa diedit (foto galeri, nama, jumlah penonton), tema gelap, portrait lock, Bahasa Indonesia.

## Architecture
- **Frontend**: Expo React Native + TypeScript (expo-router), penyimpanan lokal via AsyncStorage (`@/src/utils/storage`).
- **Backend**: FastAPI (template default `/api/status`) — belum dipakai untuk fitur (persistensi masih lokal).
- **Database**: MongoDB tersedia, belum dipakai.

## User Personas
- Content creator TikTok/YouTube yang butuh mock/thumbnail live room.
- Pemakaian demo, latihan konten, scoreboard/roster tiruan.

## Core Requirements (static)
- Layout live room: Host box besar (kiri) + grid 2×4 peserta (kanan).
- Edit Host (foto avatar, nama, pesan gelembung) & Peserta (foto avatar, foto latar, nama, jumlah penonton) via bottom sheet + image picker.
- Fitur "Kotak singa": pilih target lewat chip, tombol "Munculkan Singa" menampilkan overlay singa 2 detik di kotak terpilih.
- Persistensi lokal via AsyncStorage.
- Tema gelap, portrait lock, Bahasa Indonesia.

## Implemented (2026-06)
- [2026-06] Impor penuh dari repo GitHub ke environment ini:
  - Install deps: `@react-native-vector-icons/ionicons`, `@react-native-vector-icons/material-design-icons`, `expo-image-picker`, `expo-media-library`.
  - Pindahkan source: `app/index.tsx`, `app/_layout.tsx`, `app/+html.tsx`, `src/theme.ts`, `src/store/slotsStore.ts`, komponen `HostBox`, `GuestBox`, `EditSlotSheet`.
  - Pindahkan asset: `lion.png`, `lion-flash.png`, `app-image.png`.
  - Merge `app.json` (plugin image-picker & vector-icons, dark mode, portrait lock, izin foto) — bundle identifier environment ini dipertahankan.
- Preview + lint bersih, app render sesuai referensi.

## Backlog (prioritized)
- **P1**: Persistensi lintas perangkat — pindahkan preset roster dari AsyncStorage ke MongoDB via FastAPI (endpoint simpan/muat preset).
- **P2**: Aktifkan bottom action bar tambahan (bottom sheet hadiah, toggle mic/kamera).
- **P2**: Tombol reset grid + ekspor/impor preset grid (JSON).
- **P2**: Ganti placeholder Host default dengan gambar karakter.

## Next Tasks
- Tunggu arahan user untuk fitur berikutnya (persistensi backend / bottom bar / ekspor-impor preset).
