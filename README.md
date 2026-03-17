# 🦑 Tentacles LMA Orchestrator

![Tentacles Banner](https://via.placeholder.com/1200x300.png?text=Tentacles+LMA+Orchestrator)

**Tentacles** adalah kerangka kerja *Large Multimodal Agent (LMA)* terdistribusi. Dibangun di atas paradigma "Gurita" — dengan satu Otak Terpusat (Head Orchestrator) dan banyak Lengan Pekerja (Worker Arms), Tentacles memungkinkan orkestrasi paralel, observabilitas *real-time*, dan perlindungan eksekusi Micro-VM secara native.

## ✨ Fitur Utama
- 🧠 **MoMA Semantic Routing:** Rutinasi *intent* multimodal ke agen spesialis dengan presisi tinggi.
- 🔒 **eBPF & Micro-VM Sandboxing:** Eksekusi kode agen terisolasi secara agresif menggunakan Sysbox & profil syscall eBPF.
- 🤝 **Stateful Handoff & Debate:** Perpindahan konteks yang mulus antar-agen dan mekanisme debat untuk *consensus building*.
- 📊 **Real-Time Observability Dashboard:** Antarmuka *Glassmorphism* modern dengan WebSocket untuk mengawasi memori, biaya (TCO), dan latensi.

## 🏗️ Arsitektur Sistem

```text
[ User Interface (Next.js) ] <---> [ WebSocket Stream ]
         |
[ Head Orchestrator (MoMA) ]
         |--- (Context Engine / proper-lockfile) ---> [ MEMORY.md Stream ]
         |
  +------+------+------+
  |             |      |
[Python Arm] [Web Arm] [Critic Arm]  <-- (Sysbox Micro-VMs)
```

## 🚀 Quick Start (Instalasi Sekali Klik)

Untuk menginstal dan menjalankan Ekosistem Agen Tentacles di mesin lokal Anda (Linux/macOS), cukup jalankan perintah berikut di terminal. Proses ini akan mengkloning *repository*, menyiapkan dependensi, menjalankan Setup Wizard interaktif, dan menyalakan kontainer Docker.

```bash
curl -sSL https://raw.githubusercontent.com/afiatana/tentacles/main/install.sh | bash
```

## 📚 Dokumentasi Lebih Lanjut
- Panduan Kontribusi: [CONTRIBUTING.md](CONTRIBUTING.md)
- Kebijakan Keamanan: [SECURITY.md](SECURITY.md)

## ⚖️ Lisensi
Proyek ini dilisensikan di bawah **GNU Affero General Public License v3.0 (AGPLv3)**. Kami percaya pada ekosistem terbuka; modifikasi berbasis cloud *wajib* disertakan sebagai sumber terbuka. Kunjungi file [LICENSE](LICENSE) untuk detail.
