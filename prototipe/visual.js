/* =========================================================
   TransportX — visualisasi
   Peta rute Pulau Jawa, grafik pembagian biaya, skala suhu simpan,
   dan penanda langkah pemesanan.
   Dimuat SETELAH script.js (memakai GUDANG, KOTA, KOTA_ASAL, RUANG, RUTE,
   RENDER, rupiah, escapeHTML, komoditas, bacaKota).
   ========================================================= */

/* ---------- PROYEKSI ----------
   Bujur/lintang -> koordinat SVG. Cukup untuk peta skematik Pulau Jawa. */
const PETA = { w: 620, h: 214, lon0: 105.0, lat0: -5.75, skala: 61.86, pad: 8 };
const keXY = ([lon, lat]) => [PETA.pad + (lon - PETA.lon0) * PETA.skala, PETA.pad + (PETA.lat0 - lat) * PETA.skala];

/* Garis pantai Pulau Jawa (disederhanakan), searah jarum jam dari Ujung Kulon */
const PANTAI_JAWA = [
  [105.2, -6.78], [105.55, -6.62], [105.83, -6.38], [105.88, -6.06], [106.02, -5.92], [106.25, -6.0],
  [106.6, -6.02], [106.88, -6.08], [107.02, -5.93], [107.35, -6.0], [107.65, -6.2], [108.0, -6.28],
  [108.35, -6.22], [108.55, -6.68], [109.1, -6.84], [109.65, -6.87], [110.1, -6.9], [110.42, -6.94],
  [110.62, -6.65], [110.85, -6.42], [111.05, -6.55], [111.35, -6.68], [111.7, -6.75], [112.05, -6.88],
  [112.5, -6.88], [112.68, -7.2], [112.8, -7.55], [113.2, -7.72], [113.65, -7.68], [114.05, -7.68],
  [114.42, -7.82], [114.38, -8.2], [114.47, -8.55], [114.6, -8.75], [114.2, -8.72], [113.8, -8.5],
  [113.45, -8.4], [113.0, -8.32], [112.6, -8.42], [112.0, -8.32], [111.55, -8.3], [111.1, -8.25],
  [110.65, -8.15], [110.3, -8.02], [109.8, -7.85], [109.4, -7.75], [109.0, -7.72], [108.65, -7.7],
  [108.3, -7.8], [107.8, -7.72], [107.3, -7.55], [106.75, -7.42], [106.42, -7.38], [106.5, -7.05],
  [106.15, -6.95], [105.75, -6.85], [105.45, -6.85]
];
const PANTAI_MADURA = [
  [112.72, -6.95], [113.2, -6.88], [113.7, -6.87], [114.12, -6.95], [114.05, -7.12], [113.5, -7.22],
  [113.0, -7.23], [112.75, -7.15]
];
/* Batas Provinsi Jawa Tengah (disederhanakan, DIY tidak termasuk) */
const BATAS_JATENG = [
  [108.8, -6.82], [109.1, -6.84], [109.65, -6.87], [110.1, -6.9], [110.42, -6.94], [110.62, -6.65],
  [110.85, -6.42], [111.05, -6.55], [111.35, -6.68], [111.62, -6.74], [111.68, -6.98], [111.45, -7.22],
  [111.2, -7.45], [111.15, -7.75], [111.2, -8.0], [110.95, -8.13], [110.82, -7.95], [110.75, -7.7],
  [110.5, -7.58], [110.2, -7.62], [110.05, -7.88], [109.8, -7.85], [109.4, -7.75], [109.0, -7.72],
  [108.75, -7.68], [108.82, -7.4], [108.6, -7.15], [108.65, -6.95]
];

const KOORDINAT = {
  'Temanggung': [110.18, -7.32], 'Wonosobo (Dieng)': [109.9, -7.36], 'Banjarnegara': [109.69, -7.4],
  'Magelang': [110.22, -7.48], 'Semarang': [110.42, -6.99], 'Surakarta (Solo)': [110.82, -7.57],
  'Jakarta': [106.85, -6.21], 'Bogor': [106.8, -6.6], 'Depok': [106.82, -6.4], 'Bekasi': [107.0, -6.24],
  'Tangerang': [106.63, -6.18], 'Bandung': [107.61, -6.92], 'Cirebon': [108.55, -6.73],
  'Yogyakarta': [110.37, -7.8], 'Surabaya': [112.75, -7.26], 'Malang': [112.63, -7.98]
};
/* Kota yang diberi label di peta cakupan (sisanya muncul saat disentuh) */
const LABEL_CAKUPAN = ['Jakarta', 'Surabaya'];

const bulat = (n) => Math.round(n * 10) / 10;

/* Bingkai peta: diperbesar ke area titik-titik yang ditampilkan, rasio tetap */
const RASIO = 2.4;
function bingkai(titik, lebarMin = 200, tepi = 42) {
  const xs = titik.map((t) => keXY(t)[0]), ys = titik.map((t) => keXY(t)[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let w = Math.max(x1 - x0 + tepi * 2, lebarMin), h = w / RASIO;
  if (y1 - y0 + tepi * 2 > h) { h = y1 - y0 + tepi * 2; w = h * RASIO; }
  return { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h };
}
const persen = ([x, y], v) => `left:${bulat(((x - v.x) / v.w) * 100)}%;top:${bulat(((y - v.y) / v.h) * 100)}%`;
/* Label digeser ke dalam kalau titiknya dekat tepi peta */
function letakLabel(xy, v, pilihan) {
  const px = ((xy[0] - v.x) / v.w) * 100;
  if (pilihan === 'atas') return px > 68 ? 'atas ujung-kanan' : px < 32 ? 'atas ujung-kiri' : 'atas';
  if (pilihan === 'kiri' && px < 32) return 'kanan';
  if (pilihan === 'kanan' && px > 68) return 'kiri';
  return pilihan;
}
const svgPeta = (v, isi) => `<svg viewBox="${bulat(v.x)} ${bulat(v.y)} ${bulat(v.w)} ${bulat(v.h)}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${DARATAN}${JATENG}${isi}</svg>`;

/* Kurva halus tertutup (Catmull-Rom -> Bezier kubik) */
function jalurHalus(titik) {
  const p = titik.map(keXY);
  const n = p.length;
  let d = `M${bulat(p[0][0])},${bulat(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [p[(i - 1 + n) % n], p[i], p[(i + 1) % n], p[(i + 2) % n]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${bulat(c1[0])},${bulat(c1[1])} ${bulat(c2[0])},${bulat(c2[1])} ${bulat(p2[0])},${bulat(p2[1])}`;
  }
  return d + 'Z';
}
const DARATAN = `<path class="peta-darat" d="${jalurHalus(PANTAI_JAWA)}"/><path class="peta-darat" d="${jalurHalus(PANTAI_MADURA)}"/>`;
const JATENG = `<path class="peta-jateng" d="${jalurHalus(BATAS_JATENG)}"/>`;

/* Satu ruas rute: kurva kuadratik yang melengkung ke utara */
function ruas(a, b) {
  const [ax, ay] = keXY(a), [bx, by] = keXY(b);
  const dx = bx - ax, dy = by - ay, pjg = Math.hypot(dx, dy) || 1;
  let nx = dy / pjg, ny = -dx / pjg;
  if (ny > 0) { nx = -nx; ny = -ny; }
  const lengkung = Math.min(pjg * 0.22, 46);
  const c = [(ax + bx) / 2 + nx * lengkung, (ay + by) / 2 + ny * lengkung];
  const titik = (t) => [
    (1 - t) ** 2 * ax + 2 * (1 - t) * t * c[0] + t ** 2 * bx,
    (1 - t) ** 2 * ay + 2 * (1 - t) * t * c[1] + t ** 2 * by
  ];
  return { d: `M${bulat(ax)},${bulat(ay)}Q${bulat(c[0])},${bulat(c[1])} ${bulat(bx)},${bulat(by)}`, titik };
}

const IKON_GUDANG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/></svg>';
const IKON_TRUK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 6h13v10H1z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="5.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/></svg>';

/* ---------- PETA RUTE ----------
   posisi (opsional): 'asal' | 'ke-gudang' | 'gudang' | 'ke-tujuan' | 'tujuan' -> letak truk */
function petaRute({ asal, tujuan, layanan = 'Full Managed', posisi = null }) {
  const kA = KOORDINAT[asal], kG = KOORDINAT[GUDANG], kT = tujuan ? KOORDINAT[tujuan] : null;
  if (!kA) return '';
  const lewatGudang = layanan === 'Full Managed';

  // ruas-ruas rute
  const ruasList = [];
  if (lewatGudang) {
    if (asal !== GUDANG) ruasList.push(ruas(kA, kG));
    if (kT && tujuan !== GUDANG) ruasList.push(ruas(kG, kT));
  } else if (kT) {
    ruasList.push(ruas(kA, kT));
  }

  // kemajuan truk sepanjang rute (0 .. jumlah ruas)
  let maju = null;
  if (posisi && ruasList.length) {
    const adaRuasGudang = lewatGudang && asal !== GUDANG;
    const akhir = ruasList.length;
    maju = {
      'asal': 0,
      'ke-gudang': adaRuasGudang ? 0.5 : 0,
      'gudang': adaRuasGudang ? 1 : 0,
      'ke-tujuan': akhir - 0.5,
      'tujuan': akhir
    }[posisi] ?? 0;
  }

  const garis = ruasList.map((r, i) => {
    const selesai = maju === null ? 1 : Math.max(0, Math.min(1, maju - i));
    return `<path class="rute-dasar" d="${r.d}"/>${selesai > 0
      ? `<path class="rute-isi" d="${r.d}" pathLength="1" stroke-dasharray="${bulat(selesai)} 1"/>` : ''}`;
  }).join('');

  // bingkai diperbesar ke rute
  const v = bingkai([kA, kG, kT].filter(Boolean).filter((k, i) => lewatGudang || i !== 1));

  // titik dan label (HTML di atas SVG supaya teks tetap tajam di layar kecil)
  const lapis = [];
  const tujuanSama = tujuan === GUDANG;
  // saat truk baru keluar dari gudang, label gudang disembunyikan supaya tidak tertimpa truk
  const labelGudang = posisi !== 'ke-tujuan';
  if (lewatGudang || asal === GUDANG || tujuanSama) {
    const peran = [asal === GUDANG && 'asal', tujuanSama && 'tujuan'].filter(Boolean);
    lapis.push(`<span class="peta-pin" style="${persen(keXY(kG), v)}">${IKON_GUDANG}
      ${labelGudang ? `<em class="lbl ${letakLabel(keXY(kG), v, 'atas')}">Gudang mitra ${GUDANG}${peran.length ? ` · ${peran.join(' & ')}` : ''}</em>` : ''}</span>`);
  }
  if (asal !== GUDANG) {
    lapis.push(`<span class="peta-titik asal" style="${persen(keXY(kA), v)}"><em class="lbl ${letakLabel(keXY(kA), v, 'kiri')}">${escapeHTML(asal)}</em></span>`);
  }
  if (kT && !tujuanSama) {
    const [tx] = keXY(kT), [axx] = keXY(kA);
    const dekat = Math.abs(tx - axx) < 60;
    const truk = posisi === 'tujuan' ? ' ada-truk' : '';
    lapis.push(`<span class="peta-titik tujuan" style="${persen(keXY(kT), v)}"><em class="lbl ${letakLabel(keXY(kT), v, dekat ? 'kanan' : 'atas')}${truk}">${escapeHTML(tujuan)}</em></span>`);
  }
  if (maju !== null) {
    const i = Math.min(Math.floor(maju), ruasList.length - 1);
    lapis.push(`<span class="peta-truk" style="${persen(ruasList[i].titik(maju - i), v)}">${IKON_TRUK}</span>`);
  }

  const teks = `Peta rute: ${asal}${lewatGudang && asal !== GUDANG ? ` ke gudang mitra ${GUDANG}` : ''}${kT ? `, lalu ke ${tujuan}` : ''}.`;
  return `
    <div class="peta" role="img" aria-label="${escapeHTML(teks)}">
      ${svgPeta(v, garis)}
      ${lapis.join('')}
    </div>`;
}

/* ---------- PETA CAKUPAN (beranda) ---------- */
function petaCakupan() {
  const v = bingkai(KOTA.map((k) => KOORDINAT[k.nama]).filter(Boolean), 200, 30);
  const titik = KOTA.filter((k) => KOORDINAT[k.nama] && k.nama !== GUDANG).map((k) => {
    const peran = k.asal ? 'Kota asal, juga bisa jadi tujuan' : 'Kota tujuan';
    const label = LABEL_CAKUPAN.includes(k.nama) ? `<em class="lbl ${letakLabel(keXY(KOORDINAT[k.nama]), v, 'atas')}">${escapeHTML(k.nama)}</em>` : '';
    return `<button type="button" class="peta-titik ${k.asal ? 'asal' : 'tujuan'} kecil" style="${persen(keXY(KOORDINAT[k.nama]), v)}"
      aria-label="${escapeHTML(k.nama)}: ${peran}" data-tip="${escapeHTML(k.nama)} · ${peran}">${label}</button>`;
  }).join('');
  const hariMin = Math.min(...RUTE.map((r) => r.hari[0]));
  const hariMax = Math.max(...RUTE.map((r) => r.hari[1]));
  return `
    <div class="peta" role="img" aria-label="Peta wilayah layanan: barang diambil dari ${KOTA_ASAL.length} kota di ${WILAYAH_ASAL}, dikumpulkan di gudang mitra ${GUDANG}, lalu dikirim ke ${KOTA.length} kota di Pulau Jawa.">
      ${svgPeta(v, '')}
      ${titik}
      <span class="peta-pin" style="${persen(keXY(KOORDINAT[GUDANG]), v)}" data-tip="Gudang mitra ${GUDANG}">${IKON_GUDANG}<em class="lbl atas">Gudang ${GUDANG}</em></span>
    </div>
    <ul class="peta-legenda">
      <li><span class="lg-area"></span>${WILAYAH_ASAL}</li>
      <li><span class="lg-titik asal"></span>Kota asal</li>
      <li><span class="lg-titik tujuan"></span>Kota tujuan</li>
      <li><span class="lg-pin">${IKON_GUDANG}</span>Gudang mitra</li>
    </ul>
    <div class="stat-row">
      <div><strong>${KOTA_ASAL.length}</strong><span>kota asal di ${WILAYAH_ASAL}</span></div>
      <div><strong>${KOTA.length}</strong><span>kota tujuan di Pulau Jawa</span></div>
      <div><strong>${hariMin}–${hariMax} hari</strong><span>lewat darat</span></div>
    </div>`;
}

/* ---------- GRAFIK PEMBAGIAN BIAYA ----------
   Satu batang bertumpuk: bagian yang diteruskan ke mitra vs yang diterima TransportX. */
const BIAYA_TRANSPORTX = ['Jasa cek mutu', 'Fee platform'];
const pihakBiaya = (label) => (BIAYA_TRANSPORTX.some((p) => label.startsWith(p)) ? 'tx' : 'mitra');

function grafikBiaya(rincian) {
  const jumlah = { mitra: 0, tx: 0 };
  rincian.forEach(([label, nilai]) => { jumlah[pihakBiaya(label)] += nilai; });
  const total = jumlah.mitra + jumlah.tx;
  if (!total) return '';
  const pct = (v) => Math.round((v / total) * 100);
  const bagian = [
    { id: 'mitra', nama: 'Diteruskan ke mitra', ket: 'gudang, ekspedisi, kurir, bahan kemasan', nilai: jumlah.mitra },
    { id: 'tx', nama: 'Diterima TransportX', ket: 'fee platform dan jasa cek mutu', nilai: jumlah.tx }
  ].filter((b) => b.nilai > 0);
  return `
    <div class="biaya-viz">
      <div class="biaya-bar" role="img" aria-label="${bagian.map((b) => `${b.nama} ${rupiah(b.nilai)} (${pct(b.nilai)}%)`).join(', ')}">
        ${bagian.map((b) => `<span class="seg ${b.id}" style="flex-grow:${b.nilai}" tabindex="0"
          data-tip="${b.nama}: ${rupiah(b.nilai)} (${pct(b.nilai)}%)"></span>`).join('')}
      </div>
      <ul class="biaya-legenda">
        ${bagian.map((b) => `<li><span class="sw ${b.id}"></span><span class="lg-teks"><strong>${b.nama}</strong><small>${b.ket}</small></span>
          <span class="lg-nilai">${rupiah(b.nilai)}<small>${pct(b.nilai)}%</small></span></li>`).join('')}
      </ul>
    </div>`;
}

/* ---------- SKALA SUHU SIMPAN ---------- */
const PITA_SUHU = [
  { id: 'chiller', nama: 'Chiller', dari: 0, ke: 2 },
  { id: 'sejuk', nama: 'Ruang sejuk', dari: 13, ke: 15 },
  { id: 'kering', nama: 'Gudang kering', dari: 20, ke: 25 }
];
const SUHU_MAKS = 30;

function skalaSuhu(simpan) {
  const pos = (c) => bulat((c / SUHU_MAKS) * 100);
  const terpilih = PITA_SUHU.find((p) => p.id === simpan);
  return `
    <div class="suhu" role="img" aria-label="Suhu simpan ${terpilih.nama.toLowerCase()}: ${terpilih.dari} sampai ${terpilih.ke} derajat Celsius">
      <div class="suhu-track">
        ${PITA_SUHU.map((p) => `<span class="suhu-pita ${p.id === simpan ? 'on' : ''}" style="left:${pos(p.dari)}%;width:${pos(p.ke - p.dari)}%"></span>`).join('')}
      </div>
      <div class="suhu-sumbu"><span>0°C</span><span>10°</span><span>20°</span><span>30°C</span></div>
      <div class="suhu-label">
        ${PITA_SUHU.map((p) => `<span class="${p.id === simpan ? 'on' : ''}" style="left:${pos((p.dari + p.ke) / 2)}%">${p.nama}<small>${p.dari}–${p.ke}°C</small></span>`).join('')}
      </div>
    </div>`;
}

/* ---------- LANGKAH PEMESANAN ---------- */
const LANGKAH = ['Data barang', 'Layanan', 'Bayar', 'Lacak'];
function langkahHTML(aktif) {
  return `
    <ol class="flow" aria-label="Langkah ${aktif} dari ${LANGKAH.length}: ${LANGKAH[aktif - 1]}">
      ${LANGKAH.map((nama, i) => {
        const n = i + 1;
        const kelas = n < aktif ? 'done' : n === aktif ? 'now' : '';
        return `<li class="${kelas}"${n === aktif ? ' aria-current="step"' : ''}><b>${n < aktif ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>' : n}</b><span>${nama}</span></li>`;
      }).join('')}
    </ol>`;
}
/* layar statis: <div data-langkah="n"></div> diganti dengan penanda langkah */
function isiLangkah() {
  $$('[data-langkah]').forEach((el) => { el.outerHTML = langkahHTML(Number(el.dataset.langkah)); });
}

/* ---------- PASANG KE LAYAR ---------- */
function perbaruiPetaInput() {
  const el = $('#input-peta');
  if (!el) return;
  const asal = bacaKota($('#f-asal'), KOTA_ASAL);
  const tujuan = bacaKota($('#f-tujuan'));
  el.innerHTML = asal ? petaRute({ asal, tujuan: tujuan !== asal ? tujuan : null }) : '';
  el.hidden = !asal;
}

function perbaruiSkalaInput() {
  const k = KOMODITAS[$('#f-komoditas').value];
  const el = $('#komoditas-skala');
  if (k && el) el.innerHTML = skalaSuhu(k.simpan);
}

/* posisi truk per tahap lacak */
function posisiTahap(d) {
  const peta = d.layanan === 'Full Managed'
    ? ['asal', 'ke-gudang', 'gudang', 'gudang', 'gudang', 'ke-tujuan', 'tujuan']
    : ['asal', 'asal', 'ke-tujuan', 'tujuan'];
  return peta[Math.min(d.tahap, peta.length) - 1];
}

$('#home-peta').innerHTML = petaCakupan();
isiLangkah();
perbaruiSkalaInput();
$('#f-komoditas').addEventListener('change', perbaruiSkalaInput);
['#f-asal', '#f-tujuan'].forEach((s) => {
  $(s).addEventListener('input', perbaruiPetaInput);
  $(s).addEventListener('blur', () => setTimeout(perbaruiPetaInput, 0));
});
RENDER.input = () => { perbaruiSkalaInput(); perbaruiPetaInput(); };
