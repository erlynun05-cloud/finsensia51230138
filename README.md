# Sistem UTS Business Intelligence
Apriori + K-Means + dashboard BI — Finsensia Erlinda Un (NPM 51230138), Universitas Timor.

## GitHub Pages (statis, Python jalan di browser via Pyodide)
Upload semua file ke repo, lalu Settings -> Pages -> Deploy from branch -> `main` / `(root)`.
`index.html` dibuat dari `SISTEM_UTS_BI.py` dengan `python build_pages.py` (jalankan ulang jika kode diubah).
Pembukaan pertama butuh ±30-60 detik untuk memuat Python; butuh internet. Upload file Excel lewat halaman web.

## Lokal
```
pip install -r requirements.txt
python SISTEM_UTS_BI.py
```

## Hosting server (opsional)
Render/Railway: `render.yaml` dan `Procfile` sudah tersedia.

## Keamanan
Username/password ada di dalam kode/halaman. Di GitHub Pages repo harus public (paket gratis), jadi anggap kredensial ini tidak rahasia.
