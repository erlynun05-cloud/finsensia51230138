"""Membuat index.html statis (GitHub Pages) dari SISTEM_UTS_BI.py. Jalankan: python build_pages.py"""
import SISTEM_UTS_BI as a
h = a.HTML.replace("__LOGO__", a.LOGO_B64).replace("__FOTO__", a.FOTO_B64).replace("__BG__", a.BG_B64).replace("__HU__", a.sha(a.USERNAME)).replace("__HP__", a.sha(a.PASSWORD))
h = h.replace("</head>", open("shim.js", encoding="utf-8").read() + "</head>", 1)
open("index.html", "w", encoding="utf-8").write(h)
open(".nojekyll", "w").close()
print("index.html dibuat", len(h) // 1024, "KB")
