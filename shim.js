<script>
(function(){
const PYODIDE="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const bar=document.createElement('div');
bar.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:99999;padding:10px 14px;background:#0f172a;color:#fff;font:14px sans-serif;text-align:center';
bar.textContent='Memuat mesin Python di browser (pertama kali ±30-60 detik)...';
document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(bar));
let py=null;
const ready=(async()=>{
  await new Promise(r=>{const s=document.createElement('script');s.src=PYODIDE+'pyodide.js';s.onload=r;s.onerror=()=>{bar.textContent='Gagal memuat Pyodide (cek koneksi internet).';};document.head.appendChild(s)});
  py=await loadPyodide({indexURL:PYODIDE});
  bar.textContent='Memuat pandas, numpy, matplotlib...';
  await py.loadPackage(['pandas','numpy','openpyxl','matplotlib','pillow','micropip']);
  bar.textContent='Memasang reportlab...';
  await py.runPythonAsync("import micropip\nawait micropip.install('reportlab')");
  const src=await (await origFetch('SISTEM_UTS_BI.py')).text();
  py.FS.writeFile('/home/pyodide/SISTEM_UTS_BI.py',src);
  await py.runPythonAsync(`
import sys, json
sys.path.insert(0,'/home/pyodide')
import SISTEM_UTS_BI as app
def web_run(isi, nama, k, sup, conf):
    try:
        app.jalankan(isi.to_bytes(), nama, k, sup, conf)
        return json.dumps({"ok": True})
    except Exception as e:
        return json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False)
def web_rerun(k, sup, conf):
    try:
        if app.STATE["src"] is None: raise ValueError("Belum ada data untuk dijalankan ulang.")
        app.jalankan(app.STATE["src"], app.STATE["file"], k, sup, conf)
        return json.dumps({"ok": True})
    except Exception as e:
        return json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False)
def web_result():
    return (app.STATE["json"] or b'{"ready": false}').decode("utf-8")
def web_export(kind):
    S = app.STATE
    if kind == "xlsx":
        S["xlsx"] = S["xlsx"] or app.build_excel(S["res"], S["ob"]).getvalue(); return S["xlsx"]
    if kind == "pdf":
        S["pdf"] = S["pdf"] or app.build_pdf(S["res"], S["ob"]).getvalue(); return S["pdf"]
    return app.build_csv(S["ob"])
`);
  bar.remove();
})().catch(e=>{console.error(e);bar.style.background='#b91c1c';bar.textContent='Gagal memuat mesin Python: '+e;});
const origFetch=window.fetch.bind(window);
const J=s=>new Response(s,{headers:{'Content-Type':'application/json; charset=utf-8'}});
const tick=()=>new Promise(r=>setTimeout(r,60));
window.fetch=async function(url,init){
  init=init||{};
  if(url==='/api/result'||url==='/upload'||url==='/rerun'){
    await ready;
    const h=new Headers(init.headers||{});
    const k=h.get('X-K')||'',s=h.get('X-Sup')||'',c=h.get('X-Conf')||'';
    if(url==='/api/result') return J(py.globals.get('web_result')());
    await tick();
    if(url==='/upload'){
      const buf=new Uint8Array(await init.body.arrayBuffer());
      const nama=decodeURIComponent(h.get('X-Filename')||'data.xlsx');
      return J(py.globals.get('web_run')(buf,nama,k,s,c));
    }
    return J(py.globals.get('web_rerun')(k,s,c));
  }
  return origFetch(url,init);
};
const MAP={'/hasil.xlsx':['xlsx','hasil_analisis_UTS_BI.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
 '/laporan.pdf':['pdf','Laporan_UTS_Business_Intelligence.pdf','application/pdf'],
 '/data_bersih.csv':['csv','data_bersih.csv','text/csv']};
document.addEventListener('click',async ev=>{
  const a=ev.target.closest&&ev.target.closest('a[href]'); if(!a) return;
  const m=MAP[a.getAttribute('href')]; if(!m) return;
  ev.preventDefault(); ev.stopPropagation();
  const old=bar.parentNode; document.body.appendChild(bar); bar.style.background='#0f172a'; bar.textContent='Membuat file '+m[1]+'...';
  try{
    await ready; await tick();
    const px=py.globals.get('web_export')(m[0]); const data=px.toJs?px.toJs():px; if(px.destroy) px.destroy();
    const blob=new Blob([data],{type:m[2]});
    const l=document.createElement('a'); l.href=URL.createObjectURL(blob); l.download=m[1]; document.body.appendChild(l); l.click(); l.remove();
    bar.remove();
  }catch(e){bar.style.background='#b91c1c';bar.textContent='Gagal membuat file: '+e;setTimeout(()=>bar.remove(),6000)}
},true);
})();
</script>
