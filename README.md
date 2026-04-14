# OrthoAI - Digital Cephalometric Diagnostics Web App

OrthoAI adalah sebuah web aplikasi analisis Sefalometri Digital tipe *Full-Stack* yang dikembangkan khusus untuk keperluan dokter gigi spesialisi Ortodontis. Sistem ini hadir untuk menggantikan rutinitas cara manual lama (menggambar titik anatomis pasien menggunakan kertas transparan di atas film rontgen) ke dalam sebuah alur klik Web yang super modern, interaktif, dan ditenagai kecerdasan buatan murni.

Sistem ini didesain menggunakan fondasi arsitektur Model Deep Learning teruji (CEPHMark-Net) yang sebelumnya khusus kompetisi 19-titik, dan kini telah dimodifikasi + ditingkatkan besar-besaran untuk mampu **Mendeteksi Secara Dinamis 29 Landmark Anatomis** sesuai standar **Aariz Dataset**.

---

## ✨ Fitur Utama
- **Custom-Trained AI Architecture:** Pengenalan anatomi dua lapis berbasis TensorFlow (ResNet50 *Detection Module* + 29-Branch *Refinement Heads*). Model bisa di-training dari awal (lengkap dengan fitur membatasi iterasi gambar secara aman).
- **RESTful Flask API Backend (`app.py`)**: Jembatan server Python yang selalu *standby* melayani API di port `5000`. Server dibekali kemampuan canggih *Auto-Load Weights* yang langsung me-muat file `.h5` terbaik jika AI telah dilatih penuh, maupun mode "Simulasi" tanpa perlu repot konfigurasi.
- **Smart Image Decoder**: Berapapun resolusi panjang/lembar gambar Rontgen (*Lateral Cephalograms*) yang diunggah, AI akan memproses secara rasional tanpa distorsi dan mengembalikan koordinat 29 titik (`"x"`, `"y"`) persis ke skala ukuran pixel gambar aslinya.
- **React + Vite Frontend (Interactive UI)**: Terletak di dalam folder `cephalometric-frontend/`, sistem antarmuka klinik super responsif yang me-*listen* endpoint `/predict` dari AI secara sinkronus untuk memberikan kepuasan *User Experience* maksimal.

---

## 🚀 Panduan Memulai (*Getting Started*)

Karena sistem ini sudah merupakan gabungan dua teknologi utuh, pastikan Anda menjalankan komponen Server AI sekaligus komponen Website di layar komputer Anda secara beriringan:

**Persyaratan Sistem Dasar:**
- Python 3.9+ 
- Library Deep Learning: `tensorflow`, `opencv-python`, `flask`, `flask-cors`
- Node.JS (untuk Frontend React-nya)

### Fase 1: Menghidupkan Otak Inteligensi Buatan (Terminal 1)
Buka terminal Anda, masuklah ke *root folder* proyek ini dan nyalakan *Python Server*-nya:
```bash
pip install flask flask-cors
python app.py
```
*(Jangan tutup terminal ini. Tunggulah beberapa belas detik hingga TensorFlow selesai melakukan Warming-Up Trace dan memunculkan notifikasi bahwa "Server Backend Terhubung pada Port 5000")*

### Fase 2: Menghidupkan Website UI (Terminal 2)
Biarkan sistem Terminal pertama tadi menyala, buka **Terminal Baru** untuk menghidupkan Visual *Frontend*-nya. Masuklah ke dalam folder Website tersebut:
```bash
cd cephalometric-frontend
npm install
npm run dev
```

### Fase 3: Mulai Praktik Klinis!
Buka Google Chrome / Safari Anda dan ketikkan alamat lokal Web Anda:
👉 `http://localhost:5173`

Silakan *Upload* sembarang gambar dari folder dataset Anda. Form secara otomatis akan di-*intercept* oleh komponen React mengirimkan data ke lokal Flask (mesin AI) Anda, dan letak akurat garis-garis patokan medis pasien akan langsung direpresentasikan di atas *viewport* browser Anda! 

---

## 🛠️ Panduan Pelatihan Ulang Mesin (Training)
Jika Anda memiliki dataset yang diselaraskan dengan spesifikasi *tools* (seperti folder Aariz di struktur ini), dan memiliki GPU (NVIDIA CUDA Toolkit+cuDNN) untuk meracik model dari nol menjadi paramater akurat klinis, mudah sekali:

```bash
# Melatih dengan data penuh sampai pinter:
python train.py --dataset aariz

# Atau melatih dengan 5 gambar saja (Simulasi / Pengejekan Skrip):
python train.py --dataset aariz --max-images 5
```
Di akhir dari pelatihan ini, file pintar berupa `cephmark_final_weights_epoch.h5` akan tercetak ke dalam folder `models/`. Jika API `app.py` men-deteksi keberadaan file ini, **ia akan meload file ini membuang arsitektur bodoh simulasi bawaan ke mode pintar presisi medis!!**

---
*Dikembangkan sepenuhnya sebagai fondasi riset Cephalometric Digital Otomatis.*
