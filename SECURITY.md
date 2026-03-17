# Kebijakan Keamanan (Security Policy)

Keamanan infrastruktur agen (terutama pelarian dari Sandbox dan Injeksi Prompt) adalah prioritas tertinggi dalam kerangka kerja **Tentacles**. Kami sangat berterima kasih kepada komunitas keamanan *white-hat* yang membantu kami mengamankan sistem ini.

## Versi yang Didukung
Hanya versi `main` (branch stabil) saat ini yang menerima *patch* keamanan reguler.

## 🚨 Pelaporan Kerentanan

Jika Anda menemukan kerentanan pada proyek Tentacles (misalnya: *Jailbreak* pada *Context Engine*, pelolosan batas eBPF/Iptables, atau eksekusi perintah jarak jauh), **JANGAN** melaporkannya melalui *GitHub Issues* publik.

Silakan laporkan temuan Anda secara pribadi (Private Vulnerability Report) kepada tim keamanan pimpinan:
**Email:** `security@tentacles-dev.com` (Gunakan PGP jika tersedia).

### Apa yang Harus Disertakan:
1. Deskripsi mendetail tentang kerentanan.
2. Langkah-langkah reka ulang (Reproduce Steps) yang konsisten.
3. *Proof of Concept* (Skrip atau Payload *Prompt Injection*).
4. Dampak potensial (misal: kebocoran token memori LMA).

**SLA Kami:**
Kami akan mengakui penerimaan laporan Anda dalam 48 jam dan terus memberikan pembaruan tentang jadwal rilis *patch* keamanan.

Terima kasih atas dedikasi Anda dalam menjaga kecerdasan buatan tetap aman!
