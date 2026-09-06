# Live Room — Mobile UI Clone

## Ringkasan
Aplikasi mobile Expo (portrait) yang mereplikasi tampilan sebuah *live streaming multi-guest room* (mirip Bigo/TikTok Live) sesuai screenshot referensi dari user.

- **Cakupan**: UI mock statis (tanpa video / streaming asli)
- **Bahasa**: Bahasa Indonesia
- **Orientasi**: Portrait terkunci
- **Interaktivitas**: **Kotak Host** dan **Kotak Peserta** (7 slot) bisa di-edit — nama, foto (dari galeri), pesan gelembung (host), jumlah penonton (peserta). Slot ke-8 tetap sebagai tombol "+ Permintaan" (dekoratif). Elemen lain di header & bottom-bar hanya visual.

## Fitur
1. **Header live room**: avatar streamer, jumlah hearts, viewer count, X, chip kategori (Kehidupan Seh…, Liga D3, Jelajahi), event tiles (chest 04:24, gift 03:10 badge 2, mawar progres 359/820, Legends of Match, ikon pelangi).
2. **Grid Host + 7 Peserta** persis seperti foto:
   - Kiri: Host box besar (aspek 1:2) — orange gradient, tag "Host", speech bubble cyan, kursor, nama di bawah.
   - Kanan: grid 2×4 peserta — masing-masing dengan viewer dot cyan, avatar placeholder (initial), nama, ikon mute.
   - Slot terakhir: "+ Permintaan".
3. **Edit Bottom Sheet** saat menekan kotak host atau peserta: pilih foto (expo-image-picker), ubah nama, viewer count / message. Perubahan tersimpan (AsyncStorage), langsung tercermin di UI.
4. **Chat overlay** (statis): 2 baris pesan chat pill + 2 baris system message ("menjadi anggota No. 203", "mengirim Kotak Harta Karun").
5. **Bottom action bar** (statis): input pill "Berk…", Kamera, Mic, Multi-g (badge 22), Mawar, hadiah, share 896.

## Teknologi
- Expo Router (single screen `app/index.tsx`)
- `expo-image`, `expo-image-picker`, `expo-linear-gradient`
- `@react-native-vector-icons/ionicons` & `material-design-icons`
- `@react-native-async-storage/async-storage` untuk persist data slot
- `react-native-safe-area-context` untuk insets

## Struktur file kunci
```
app/
  _layout.tsx           # SafeAreaProvider + GestureHandlerRootView + Stack
  index.tsx             # Layar utama Live Room
src/
  theme.ts              # Dark theme tokens
  components/
    HostBox.tsx
    GuestBox.tsx        # + AddRequestBox
    EditSlotSheet.tsx   # Bottom modal untuk edit
  store/
    slotsStore.ts       # State + AsyncStorage (host + 7 guests)
```

## Data storage
Key AsyncStorage: `@live_room_slots_v1`. Berisi:
```ts
{
  host: { name, message, photoUri, hearts },
  guests: [{ id, name, viewers, photoUri, muted }, ... 7 items]
}
```

## Catatan
- Tidak menggunakan backend (murni client-side, per-device).
- Backend Python FastAPI yang di-provide tetap default, tidak digunakan aplikasi ini.
- Beberapa glyph vector-icon tampil "?" di web preview (font web belum ter-embed), tapi di iOS/Android akan render normal.

## Next enhancements yang mungkin diminta
- Ganti default placeholder host (initial) dengan gambar karakter gingerbread seperti foto.
- Tambah pilihan warna gradient per-slot.
- Fungsikan tombol bottom bar (bottom sheet hadiah, dsb).
- Ekspor konfigurasi grid ke JSON untuk shareable preset.
