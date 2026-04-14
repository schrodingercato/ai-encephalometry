import os
import requests

# Mengambil 1 buah gambar contoh dari struktur Aariz Datasets kita
img_dir = "datasets/Aariz/train/Cephalograms"
image_file = next((f for f in os.listdir(img_dir) if f.endswith(('.png', '.jpg', '.jpeg'))), None)

if image_file is None:
    print("❌ Tidak ada contoh gambar di dalam folder datasets/Aariz/train/Cephalograms")
    exit()

image_path = os.path.join(img_dir, image_file)
print(f"Mengirim gambar: {image_file} ke API Backend...")

url = 'http://localhost:5000/predict'

with open(image_path, 'rb') as f:
    files = {'image': f}
    try:
        response = requests.post(url, files=files)
        print("\n\n--- HASIl BALASAN DARI AI ---")
        print(response.json())
        print("\n✅ WORK! API berhasil menganalisis dan membalas.")
    except requests.exceptions.ConnectionError:
        print("❌ Gagal terhubung! Apakah Terminal 1 (app.py) sudah Anda jalankan?")

