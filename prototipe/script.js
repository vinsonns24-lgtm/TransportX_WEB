/* =========================================================
   TransportX — Prototype v2 (simulasi, tanpa login & backend)
   Perbaikan dari hasil tes pasar (Google Form, Oktober 2026):
   1. Perlindungan & klaim: tanggungan mitra yang memegang barang
   2. Lacak dengan foto per tahap, notifikasi WhatsApp, tanpa login
   3. Rincian biaya per komponen, metode bayar, batal pesanan
   4. Font lebih besar, layout lebar, tombol Home jelas
   5. Panduan packing bergambar, bahasa sederhana, variasi kemasan
   6. Rute hemat/cepat, daftar kota lebih lengkap, gudang mitra terdekat
   7. Nama calon mitra per tahap + kartu "Siapa yang mengerjakan kiriman Anda"
      (masukan dosen: TransportX tidak punya gudang dan armada sendiri)
   8. Wilayah layanan: asal Jawa Tengah (gudang mitra Semarang), tujuan Pulau Jawa, darat saja
   Semua harga dan nama mitra masih CONTOH untuk simulasi.
   ========================================================= */

/* ---------- MITRA ----------
   Satu sumber untuk semua nama mitra di aplikasi (kartu pelaksana, rute, lacak, halaman Mitra).
   Belum ada perjanjian kerja sama dengan siapa pun.
   namaContoh: true = nama karangan untuk simulasi, ganti dengan mitra asli setelah ada kerja sama.
   MGM Bosco Logistics = calon mitra yang disebut di slide Key Partners BMC. */
const MITRA = [
  {
    id: 'lumbung', nama: 'Gudang Lumbung Agro Semarang', label: 'Gudang', jenis: 'gudang', namaContoh: true,
    kategori: 'Gudang kering ber-AC',
    area: 'Semarang, dekat jalan tol ke Jakarta dan Surabaya',
    peran: 'Titik terima barang. Di sini petugas QC TransportX mengecek mutu, mengemas, lalu barang disimpan sampai berangkat.',
    fasilitas: ['Ruang ber-AC ±20–25°C, kelembapan 50–60%', 'Palet kayu, karung tidak menyentuh lantai', 'Meja cek mutu dan area kemas untuk petugas QC'],
    dipakai: 'Kopi, rempah, dan kakao kering (Full Managed)',
    tarif: 'Sewa Rp100/kg per hari'
  },
  {
    id: 'mgm-bosco', nama: 'MGM Bosco Logistics', label: 'Cold storage', jenis: 'gudang', namaContoh: false,
    kategori: 'Cold storage dan truk berpendingin',
    area: 'Wilayah Semarang (lokasi ruang dicek saat penawaran)',
    peran: 'Menyimpan produk segar di ruang sejuk atau chiller, lalu mengangkutnya dengan truk berpendingin.',
    fasilitas: ['Ruang sejuk 13–15°C untuk buah tropis', 'Chiller 0–2°C untuk sayuran daun', 'Truk berpendingin; data logger suhu dari TransportX ikut di dalam'],
    dipakai: 'Buah tropis, cabai, dan sayur',
    tarif: 'Sewa Rp250–300/kg per hari · angkut Rp8.500/kg'
  },
  {
    id: 'trans-jawa', nama: 'Trans Jawa Kargo', label: 'Ekspedisi', jenis: 'ekspedisi', namaContoh: true,
    kategori: 'Ekspedisi darat',
    area: 'Semarang ke kota-kota di Pulau Jawa',
    peran: 'Mengangkut produk kering lewat jalan tol dan mengantar sampai alamat pembeli.',
    fasilitas: ['Truk boks tertutup, barang tidak kena hujan dan panas langsung', 'Berangkat setiap hari dari Semarang', 'Darat reguler 2–4 hari atau express 1–2 hari'],
    dipakai: 'Kopi, rempah, dan kakao kering',
    tarif: 'Reguler Rp3.500/kg · express Rp6.000/kg'
  },
  {
    id: 'kurir-desa', nama: 'Kurir Desa Jateng', label: 'Kurir', jenis: 'kurir', namaContoh: true,
    kategori: 'Kurir lokal',
    area: 'Temanggung, Wonosobo, Banjarnegara, Magelang, dan Solo',
    peran: 'Menjemput barang dari kebun atau gudang petani, lalu membawanya ke gudang mitra di Semarang.',
    fasilitas: ['Pikap dan motor barang', 'Bisa masuk jalan desa dan kebun'],
    dipakai: 'Pengirim yang tidak bisa mengantar sendiri ke gudang',
    tarif: 'Rp150.000 per penjemputan'
  },
  {
    id: 'kemasan-ungaran', nama: 'Toko Kemasan Tani Ungaran', label: 'Kemasan', jenis: 'kemasan', namaContoh: true,
    kategori: 'Pemasok bahan kemasan',
    area: 'Ungaran, Kabupaten Semarang',
    peran: 'Menyediakan bahan kemasan yang dipakai petugas QC saat mengemas barang Full Managed.',
    fasilitas: ['Karung goni dan hermetic bag untuk kopi', 'Boks styrofoam dan gel pendingin untuk sayur', 'Kardus berventilasi untuk buah'],
    dipakai: 'Semua kiriman Full Managed',
    tarif: 'Sudah termasuk di biaya cek mutu dan pengemasan'
  }
];
const mitra = (id) => MITRA.find((m) => m.id === id);
const CATATAN_MITRA = 'Nama mitra masih contoh untuk simulasi. Belum ada perjanjian kerja sama.';
const KURIR_LOKAL = mitra('kurir-desa').nama;

/* ---------- KATEGORI PENYIMPANAN ---------- */
const RUANG = {
  kering:  { nama: 'Gudang kering ber-AC', sewaPerKgHari: 100, mitraId: 'lumbung' },
  sejuk:   { nama: 'Ruang sejuk 13–15°C',  sewaPerKgHari: 250, mitraId: 'mgm-bosco' },
  chiller: { nama: 'Chiller 0–2°C',        sewaPerKgHari: 300, mitraId: 'mgm-bosco' }
};
/* "Gudang kering ber-AC" -> "gudang kering ber-AC" (toLowerCase merusak singkatan AC) */
const ruangKecil = (simpan) => RUANG[simpan].nama.charAt(0).toLowerCase() + RUANG[simpan].nama.slice(1);
const mitraGudang = (simpan) => mitra(RUANG[simpan].mitraId);
function namaGudang(simpan) { return mitraGudang(simpan).nama; }

/* ---------- KOMODITAS ----------
   simpan = kategori ruang. Langkah kemas: [ikon, langkah, alasan]. */
const KOMODITAS = {
  kopi: {
    nama: 'Biji kopi (green bean)',
    simpan: 'kering',
    suhu: '±20–25°C', lembab: '50–60%',
    handlingPerKg: 1500,
    peringatan: 'Jangan masuk kulkas atau ruang dingin. Saat dikeluarkan, biji bisa berembun lalu berjamur.',
    kemasan: [
      { id: 'goni', nama: 'Karung goni + kantong kedap udara', ket: 'Paling umum, 30–60 kg per karung',
        bahan: ['Karung goni', 'Kantong kedap udara (hermetic bag)', 'Tali atau jahitan karung', 'Label "Jauhkan dari panas"'] },
      { id: 'kardus', nama: 'Kardus tebal + kantong kedap udara', ket: 'Untuk kiriman kecil, di bawah 30 kg',
        bahan: ['Kardus tebal', 'Kantong kedap udara (hermetic bag)', 'Lakban', 'Label "Jauhkan dari panas"'] }
    ],
    langkah: [
      ['ukur', 'Cek kadar air kopi, maksimal 12%', 'Kopi yang masih basah bisa berjamur di jalan.'],
      ['kantong', 'Masukkan kopi ke kantong kedap udara, tekan supaya udaranya keluar', 'Udara lembap dari luar tidak bisa masuk.'],
      ['segel', 'Ikat atau segel kantong sampai rapat', 'Supaya tidak bocor saat ditumpuk.'],
      ['wadah', 'Masukkan kantong ke karung atau kardus, lalu tutup rapat', 'Melindungi kantong dari sobek.'],
      ['label', 'Tempel label "Jauhkan dari panas" di dua sisi', 'Petugas tahu cara menaruhnya.']
    ]
  },
  rempah: {
    nama: 'Rempah kering',
    simpan: 'kering',
    suhu: '±20–25°C', lembab: 'di bawah 60%',
    handlingPerKg: 1200,
    peringatan: 'Rempah cepat menyerap lembap dan bau. Pisahkan dari barang berbau tajam.',
    kemasan: [
      { id: 'vakum', nama: 'Plastik vakum + kardus', ket: 'Paling rapat, untuk rempah bernilai tinggi',
        bahan: ['Plastik vakum', 'Silica gel', 'Kardus tebal', 'Lakban'] },
      { id: 'karung', nama: 'Karung plastik berlapis + silica gel', ket: 'Untuk jumlah besar',
        bahan: ['Karung plastik berlapis', 'Kantong plastik dalam', 'Silica gel', 'Tali pengikat'] }
    ],
    langkah: [
      ['cek', 'Pastikan rempah benar-benar kering, tidak ada yang lembek', 'Rempah lembek tanda masih basah dan mudah berjamur.'],
      ['kantong', 'Masukkan ke plastik bersama 1–2 bungkus silica gel', 'Silica gel menyerap sisa lembap.'],
      ['segel', 'Vakum atau ikat plastik sampai rapat', 'Bau dan lembap dari luar tidak masuk.'],
      ['wadah', 'Susun di kardus atau karung, isi celah kosong', 'Supaya tidak bergeser dan sobek.'],
      ['label', 'Tulis jenis rempah dan berat di luar kemasan', 'Memudahkan cek saat diterima.']
    ]
  },
  kakao: {
    nama: 'Biji kakao',
    simpan: 'kering',
    suhu: '±20–25°C', lembab: 'di bawah 65%',
    handlingPerKg: 1400,
    peringatan: 'Jangan taruh karung langsung di lantai. Pakai alas kayu supaya tidak lembap.',
    kemasan: [
      { id: 'goni', nama: 'Karung goni berlapis', ket: 'Standar untuk biji kakao',
        bahan: ['Karung goni berlapis', 'Pallet atau alas kayu', 'Tali pengikat', 'Label identitas'] },
      { id: 'kardus', nama: 'Kardus + kantong kedap udara', ket: 'Untuk sampel atau kiriman kecil',
        bahan: ['Kardus tebal', 'Kantong kedap udara', 'Lakban', 'Label identitas'] }
    ],
    langkah: [
      ['cek', 'Pastikan biji sudah difermentasi dan dijemur kering', 'Biji basah cepat berjamur.'],
      ['wadah', 'Masukkan ke karung, jangan diisi terlalu penuh', 'Supaya udara masih bisa mengalir.'],
      ['segel', 'Ikat mulut karung dengan kuat', 'Biji tidak tumpah saat diangkat.'],
      ['alas', 'Susun karung di atas alas kayu', 'Lantai yang lembap membuat karung berjamur.'],
      ['label', 'Tempel label nama pengirim dan berat per karung', 'Memudahkan cek saat diterima.']
    ]
  },
  buah: {
    nama: 'Buah tropis (pisang, mangga, pepaya)',
    simpan: 'sejuk',
    suhu: '13–15°C', lembab: '85–95%',
    handlingPerKg: 2500,
    peringatan: 'Jangan disimpan di bawah 12°C atau di kulkas biasa. Kulit bisa menghitam dan buah gagal matang.',
    kemasan: [
      { id: 'kardus', nama: 'Kardus berlubang + sekat', ket: 'Untuk ekspedisi darat',
        bahan: ['Kardus berlubang ventilasi', 'Sekat kardus', 'Kertas atau jaring busa', 'Label "Buah segar"'] },
      { id: 'krat', nama: 'Krat plastik + alas kertas', ket: 'Untuk truk atau kontainer berpendingin',
        bahan: ['Krat plastik', 'Kertas alas', 'Jaring busa', 'Label "Buah segar"'] }
    ],
    langkah: [
      ['sortir', 'Pilih buah yang tidak memar atau busuk, pisahkan yang terlalu matang', 'Buah busuk mempercepat busuknya buah lain.'],
      ['bungkus', 'Bungkus per buah atau per sisir dengan kertas atau jaring busa', 'Mencegah memar karena bergesekan.'],
      ['wadah', 'Susun dalam kardus atau krat berventilasi, jangan ditekan', 'Udara harus bisa mengalir.'],
      ['suhu', 'Pastikan ruang atau kendaraan bersuhu 13–15°C, bukan lebih dingin', 'Terlalu dingin justru merusak buah tropis.'],
      ['label', 'Tempel label "Buah segar, jangan ditumpuk"', 'Petugas tahu cara menaruhnya.']
    ]
  },
  sayur: {
    nama: 'Sayuran daun (sawi, selada, bayam)',
    simpan: 'chiller',
    suhu: '0–2°C', lembab: '90–95%',
    handlingPerKg: 3000,
    peringatan: 'Harus tetap dingin sejak dipanen. Kirim di hari yang sama setelah dikemas.',
    kemasan: [
      { id: 'styro', nama: 'Boks styrofoam + gel pendingin', ket: 'Untuk ekspedisi darat',
        bahan: ['Boks styrofoam', 'Gel pendingin', 'Plastik berlubang', 'Lakban', 'Label "Simpan dingin"'] },
      { id: 'krat', nama: 'Krat plastik + plastik berlubang', ket: 'Untuk truk berpendingin',
        bahan: ['Krat plastik', 'Plastik berlubang', 'Label "Simpan dingin"'] }
    ],
    langkah: [
      ['sortir', 'Buang daun yang layu, kuning, atau busuk', 'Daun rusak cepat menular busuk.'],
      ['suhu', 'Dinginkan sayur dulu sebelum dikemas', 'Panas dari kebun harus turun supaya sayur tahan lebih lama.'],
      ['bungkus', 'Masukkan ke plastik berlubang per ikat', 'Sayur tetap segar tapi tidak berair.'],
      ['wadah', 'Taruh gel pendingin di dasar dan atas boks, susun sayur tanpa ditekan', 'Dingin merata dan daun tidak patah.'],
      ['label', 'Tempel label "Sayur segar, simpan dingin"', 'Petugas tahu harus disimpan dingin.']
    ]
  }
};

/* ---------- RUTE (harga contoh) ----------
   Wilayah layanan: dari Jawa Tengah ke kota-kota di Pulau Jawa, semuanya lewat darat.
   dingin: bisa bawa produk sejuk/chiller. */
const RUTE = [
  { id: 'darat-reg',  nama: 'Darat reguler',     moda: 'Darat', perKg: 3500, hari: [2, 4], dingin: false, mitraId: 'trans-jawa' },
  { id: 'darat-exp',  nama: 'Darat express',     moda: 'Darat', perKg: 6000, hari: [1, 2], dingin: false, mitraId: 'trans-jawa' },
  { id: 'darat-dgn',  nama: 'Truk berpendingin', moda: 'Darat', perKg: 8500, hari: [1, 2], dingin: true,  mitraId: 'mgm-bosco' }
].map((r) => ({ ...r, mitra: mitra(r.mitraId).nama }));

const BIAYA_PLATFORM = 5000;   // fee platform per transaksi (Full Managed & Self-Packaging)
const BIAYA_JEMPUT = 150000;   // kurir lokal menjemput dari kebun atau gudang pengirim
const HARI_SIMPAN = 2;         // perkiraan lama barang di gudang mitra sebelum berangkat

/* ---------- KOTA ----------
   asal: true = kota asal yang dilayani (Jawa Tengah), semua masuk ke gudang mitra Semarang.
   sentra = komoditas yang dihasilkan daerah itu (label oranye di daftar kota asal).
   Kota tujuan: semua kota di daftar ini (Pulau Jawa). */
const GUDANG = 'Semarang';
const WILAYAH_ASAL = 'Jawa Tengah';
const KOTA = [
  { nama: 'Temanggung', prov: 'Jawa Tengah', asal: true, sentra: 'Kopi' },
  { nama: 'Wonosobo (Dieng)', prov: 'Jawa Tengah', asal: true, sentra: 'Sayur' },
  { nama: 'Banjarnegara', prov: 'Jawa Tengah', asal: true, sentra: 'Sayur, kentang' },
  { nama: 'Magelang', prov: 'Jawa Tengah', asal: true, sentra: 'Sayur' },
  { nama: 'Semarang', prov: 'Jawa Tengah', asal: true },
  { nama: 'Surakarta (Solo)', prov: 'Jawa Tengah', asal: true },
  { nama: 'Jakarta', prov: 'DKI Jakarta' },
  { nama: 'Bogor', prov: 'Jawa Barat' },
  { nama: 'Depok', prov: 'Jawa Barat' },
  { nama: 'Bekasi', prov: 'Jawa Barat' },
  { nama: 'Tangerang', prov: 'Banten' },
  { nama: 'Bandung', prov: 'Jawa Barat' },
  { nama: 'Cirebon', prov: 'Jawa Barat' },
  { nama: 'Yogyakarta', prov: 'DI Yogyakarta' },
  { nama: 'Surabaya', prov: 'Jawa Timur' },
  { nama: 'Malang', prov: 'Jawa Timur' }
];
const KOTA_ASAL = KOTA.filter((k) => k.asal);

/* ---------- STATE ---------- */
const STORAGE_KEY = 'transportx.v2.history';

const state = {
  shipment: null,          // { key, berat, nilai, asal, tujuan }
  managed: { prioritas: 'hemat', serah: 'antar' },
  checks: [],
  checksFor: null,
  kemasan: null,
  selectedExp: null,
  draft: null,             // pesanan yang belum dibayar
  bayar: { metode: 'va', wa: true, nomor: '' },
  history: [],
  viewing: null,
  klaimJenis: null,
  navStack: ['home']
};

/* ---------- PENYIMPANAN LOKAL ---------- */
function simpanKeStorage() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history)); } catch (e) { /* mode penyamaran: tetap jalan */ }
}
function muatDariStorage() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    state.history = data.map((d) => ({ ...d, waktu: new Date(d.waktu) }));
  } catch (e) { state.history = []; }
}

/* ---------- HELPER ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const rupiah = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const komoditas = () => KOMODITAS[state.shipment.key];
const kota = (nama) => KOTA.find((k) => k.nama === nama);
const hariTeks = (r) => `${r.hari[0]}–${r.hari[1]} hari`;

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function angkaDariTeks(t) { return Number(String(t).replace(/[^\d]/g, '')) || 0; }

/* ---------- ILUSTRASI LANGKAH KEMAS ---------- */
const ILUS = {
  ukur:    '<path d="M12 3s5 6 5 10a5 5 0 0 1-10 0c0-4 5-10 5-10z"/><path d="M10 14h4"/>',
  cek:     '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/><path d="M8.5 11l2 2 3-3"/>',
  kantong: '<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  segel:   '<path d="M6 8h12l-1 12H7z"/><path d="M5 8h14"/><path d="M10 5l2 3 2-3"/>',
  wadah:   '<path d="M3 8l9-4 9 4-9 4z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/>',
  label:   '<path d="M4 4h8l8 8-8 8-8-8z"/><circle cx="8.5" cy="8.5" r="1.5"/>',
  sortir:  '<path d="M5 12l4 4 10-10"/><circle cx="6" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/>',
  bungkus: '<circle cx="12" cy="12" r="6"/><path d="M6 12h12"/><path d="M12 6c2 2 2 10 0 12"/><path d="M12 6c-2 2-2 10 0 12"/>',
  suhu:    '<path d="M12 3v18"/><path d="M5 7.5l14 9"/><path d="M19 7.5l-14 9"/><path d="M9 4l3 2 3-2"/><path d="M9 20l3-2 3 2"/>',
  alas:    '<path d="M3 17h18"/><path d="M5 17v3M12 17v3M19 17v3"/><path d="M6 9h12v8H6z"/>'
};
const ilustrasi = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ILUS[k] || ILUS.wadah}</svg>`;

/* semua rute dengan status bisa / alasan tidak bisa */
function semuaRute() {
  const k = komoditas();
  return RUTE.map((r) => {
    const alasan = k.simpan !== 'kering' && !r.dingin ? 'Tanpa pendingin, tidak cocok untuk produk ini' : '';
    return { ...r, bisa: !alasan, alasan };
  });
}
const ruteCocok = () => semuaRute().filter((r) => r.bisa);
const ruteHemat = () => ruteCocok().reduce((a, b) => (a.perKg <= b.perKg ? a : b));
const ruteCepat = () => ruteCocok().reduce((a, b) => (a.hari[1] < b.hari[1] || (a.hari[1] === b.hari[1] && a.perKg <= b.perKg) ? a : b));

function ruteManaged() {
  return state.managed.prioritas === 'cepat' ? ruteCepat() : ruteHemat();
}

/* ---------- BIAYA ---------- */
function hitungManaged() {
  const { berat } = state.shipment;
  const k = komoditas();
  const r = ruteManaged();
  const ruang = RUANG[k.simpan];
  const rincian = [];
  if (state.managed.serah === 'jemput') rincian.push([`Jemput dari lokasi Anda (${KURIR_LOKAL})`, BIAYA_JEMPUT]);
  rincian.push([`Cek mutu dan pengemasan (${berat.toLocaleString('id-ID')} kg)`, k.handlingPerKg * berat]);
  rincian.push([`Sewa ${ruangKecil(k.simpan)} (${namaGudang(k.simpan)}), ${HARI_SIMPAN} hari`, ruang.sewaPerKgHari * berat * HARI_SIMPAN]);
  rincian.push([`Ongkos kirim: ${r.nama} (${r.mitra})`, r.perKg * berat]);
  rincian.push(['Fee platform', BIAYA_PLATFORM]);
  return { rute: r, rincian, total: rincian.reduce((t, [, v]) => t + v, 0) };
}

function hitungSelf(r) {
  const rincian = [[`Ongkos kirim: ${r.nama} (${r.mitra})`, r.perKg * state.shipment.berat], ['Fee platform', BIAYA_PLATFORM]];
  return { rute: r, rincian, total: rincian.reduce((t, [, v]) => t + v, 0) };
}

function rincianHTML(rincian, total) {
  return `
    ${grafikBiaya(rincian)}
    <div class="breakdown">
      ${rincian.map(([l, v]) => `<div><span>${escapeHTML(l)}</span><strong>${rupiah(v)}</strong></div>`).join('')}
      <div class="breakdown-total"><span>Total</span><strong>${rupiah(total)}</strong></div>
    </div>`;
}

function kartuPerlindungan() {
  const nilai = state.shipment.nilai;
  return `
    <div class="protect-card">
      <div class="protect-head">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>
        <strong>Perlindungan barang</strong>
      </div>
      <p>Kalau rusak atau hilang, yang mengganti adalah mitra yang sedang memegang barang: gudang saat disimpan, ekspedisi saat diangkut. Besarnya mengikuti ketentuan mitra tersebut${nilai ? `, dihitung dari nilai barang <b>${rupiah(nilai)}</b>` : ''}.</p>
      <button class="link-inline" data-go="perlindungan">Lihat cara klaim</button>
    </div>`;
}

/* Siapa yang mengerjakan tiap bagian kiriman: TransportX mengatur, fasilitas dan armada milik mitra.
   d: { layanan, serah, hub, simpan, rute } */
/* mitra pengangkut sebuah rute (riwayat lama hanya menyimpan nama) */
const mitraRute = (rute) => mitra(rute.mitraId) || MITRA.find((m) => m.nama === rute.mitra);

function kartuPelaksana(d) {
  // baris: [tugas, nama, jenis warna (tx | mitra | anda), label jenis, id mitra]
  const angkut = mitraRute(d.rute);
  const labelAngkut = d.rute.dingin ? 'Truk dingin' : 'Ekspedisi';
  const baris = d.layanan === 'Full Managed'
    ? [
        ['Atur rute, jadwal, dan status', 'Aplikasi dan admin TransportX', 'tx', 'TransportX'],
        d.serah === 'jemput'
          ? ['Jemput dari lokasi Anda', KURIR_LOKAL, 'mitra', 'Kurir', 'kurir-desa']
          : ['Antar ke gudang mitra', 'Anda', 'anda', 'Anda'],
        ['Cek mutu dan foto', 'Petugas QC TransportX', 'tx', 'TransportX'],
        [`Simpan di ${ruangKecil(d.simpan)}`, namaGudang(d.simpan), 'mitra', mitraGudang(d.simpan).label, mitraGudang(d.simpan).id],
        [`Angkut sampai ${d.tujuan || 'tujuan'}`, d.rute.mitra, 'mitra', labelAngkut, angkut?.id],
        ['Urus klaim kalau ada kerusakan', 'CS TransportX', 'tx', 'TransportX']
      ]
    : [
        ['Panduan kemas dan pilihan ekspedisi', 'Aplikasi TransportX', 'tx', 'TransportX'],
        ['Kemas barang sesuai panduan', 'Anda', 'anda', 'Anda'],
        [`Jemput dan angkut sampai ${d.tujuan || 'tujuan'}`, d.rute.mitra, 'mitra', labelAngkut, angkut?.id],
        ['Pantau status dan urus klaim', 'Admin dan CS TransportX', 'tx', 'TransportX']
      ];
  return `
    <div class="info-card who-card">
      <h3>Siapa yang mengerjakan kiriman Anda</h3>
      <ul class="who-list">
        ${baris.map(([tugas, siapa, jenis, label, id]) => `
          <li>
            <span class="who-task">${escapeHTML(tugas)}</span>
            <span class="who-name">${id
              ? `<button type="button" class="who-link" data-mitra="${id}">${escapeHTML(siapa)}</button>`
              : escapeHTML(siapa)}<em class="who-tag ${jenis}">${label}</em></span>
          </li>`).join('')}
      </ul>
      <p class="value-disclaimer">${d.layanan === 'Full Managed'
        ? 'TransportX tidak punya gudang dan armada sendiri. Fasilitas mitra disewa per kiriman, TransportX mengatur dan mengecek mutunya.'
        : 'TransportX tidak punya armada sendiri. Ekspedisi mitra dibayar per kiriman, TransportX memberi panduan dan memantau statusnya.'} ${CATATAN_MITRA}</p>
      <button type="button" class="link-inline" data-mitra="">Lihat semua mitra</button>
    </div>`;
}

/* ---------- NAVIGASI ---------- */
const RENDER = {
  layanan: () => renderLayanan(),
  managed: () => renderManaged(),
  self: () => renderSelf(),
  bayar: () => renderBayar(),
  riwayat: () => renderRiwayat(),
  lacak: () => renderLacakList(),
  ringkasan: () => state.viewing && renderRingkasan(state.viewing),
  klaim: () => renderKlaim()
};

function show(screen) {
  $$('.screen').forEach((s) => s.classList.remove('active'));
  const target = $('#screen-' + screen);
  target.classList.add('active');
  target.querySelector('.screen-body')?.scrollTo(0, 0);
  const pakaiTabbar = target.dataset.tabbar === 'true';
  $('#tabbar').classList.toggle('hidden', !pakaiTabbar);
  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === screen));
  RENDER[screen]?.();
}
function go(screen) { state.navStack.push(screen); show(screen); }
function back() { if (state.navStack.length > 1) state.navStack.pop(); show(state.navStack[state.navStack.length - 1]); }
function resetTo(screen) { state.navStack = [screen]; show(screen); }

/* ---------- DROPDOWN KOTA YANG BISA DICARI ---------- */
function buatCombo(idWrap, { daftar = KOTA, sentraDulu = false, onPilih, kosong = 'Kota tidak ditemukan. Pilih kota terdekat.' } = {}) {
  const wrap = $('#' + idWrap);
  const input = wrap.querySelector('input');
  const list = wrap.querySelector('.combo-list');
  let hasil = [];
  let sorot = -1;

  const urutan = () => (sentraDulu ? [...daftar].sort((a, b) => (b.sentra ? 1 : 0) - (a.sentra ? 1 : 0)) : daftar);
  const saring = (q) => {
    const t = q.trim().toLowerCase();
    if (!t) return urutan();
    return urutan().filter((k) => `${k.nama} ${k.prov} ${k.sentra || ''}`.toLowerCase().includes(t));
  };

  function render() {
    if (!hasil.length) { list.innerHTML = `<li class="combo-empty">${kosong}</li>`; return; }
    list.innerHTML = hasil.map((k, i) => `
      <li class="combo-item${i === sorot ? ' active' : ''}" role="option" aria-selected="${i === sorot}" data-nama="${escapeHTML(k.nama)}">
        <span class="combo-text"><strong>${escapeHTML(k.nama)}</strong><span>${escapeHTML(k.prov)}</span></span>
        ${k.sentra ? `<span class="combo-tag">${escapeHTML(k.sentra)}</span>` : ''}
      </li>`).join('');
  }
  function buka() { hasil = saring(input.value); sorot = -1; render(); wrap.classList.add('open'); input.setAttribute('aria-expanded', 'true'); }
  function tutup() { wrap.classList.remove('open'); input.setAttribute('aria-expanded', 'false'); sorot = -1; }
  function pilih(k) {
    input.value = k.nama; input.dataset.terpilih = k.nama; input.classList.remove('invalid'); tutup();
    onPilih?.(k);
  }
  function geser(arah) {
    if (!wrap.classList.contains('open')) return buka();
    if (!hasil.length) return;
    sorot = (sorot + arah + hasil.length) % hasil.length;
    render();
    list.children[sorot]?.scrollIntoView({ block: 'nearest' });
  }

  input.addEventListener('focus', buka);
  input.addEventListener('input', () => { input.dataset.terpilih = ''; buka(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); geser(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); geser(-1); }
    else if (e.key === 'Enter') {
      if (wrap.classList.contains('open') && hasil.length) { e.preventDefault(); pilih(hasil[sorot >= 0 ? sorot : 0]); }
    } else if (e.key === 'Escape') { tutup(); }
  });
  list.addEventListener('mousedown', (e) => {
    const li = e.target.closest('[data-nama]');
    if (!li) return;
    e.preventDefault();
    pilih(kota(li.dataset.nama));
  });
  wrap.querySelector('.combo-chev').addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (wrap.classList.contains('open')) tutup(); else input.focus();
  });
  document.addEventListener('mousedown', (e) => { if (!wrap.contains(e.target)) tutup(); });
  input.addEventListener('blur', () => setTimeout(tutup, 0));
}

function bacaKota(input, daftar = KOTA) {
  const t = (input.dataset.terpilih || input.value).trim().toLowerCase();
  const k = daftar.find((k) => k.nama.toLowerCase() === t);
  return k ? k.nama : null;
}

/* ---------- LAYAR: INPUT ---------- */
function isiDropdownKomoditas() {
  $('#f-komoditas').innerHTML = Object.entries(KOMODITAS)
    .map(([key, k]) => `<option value="${key}">${k.nama}</option>`).join('');
  updateKomoditasHelp();
}
function updateKomoditasHelp() {
  const k = KOMODITAS[$('#f-komoditas').value];
  $('#komoditas-help').innerHTML = `Disimpan di <b>${ruangKecil(k.simpan)}</b>, kelembapan ${k.lembab}.`;
}
function tampilkanHub(k) {
  const el = $('#hub-card');
  if (!k) { el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/></svg>
    <div><strong>Gudang mitra: ${GUDANG}</strong>
    <span>Bisa antar sendiri, atau dijemput kurir lokal dari ${escapeHTML(k.nama)}. Lokasi mitra masih contoh.</span></div>`;
}

function validasiInput() {
  const berat = Number($('#f-berat').value);
  const nilai = angkaDariTeks($('#f-nilai').value);
  const asal = bacaKota($('#f-asal'), KOTA_ASAL);
  const tujuan = bacaKota($('#f-tujuan'));
  $$('#screen-input input').forEach((i) => i.classList.remove('invalid'));

  if (!berat || berat < 1) { $('#f-berat').classList.add('invalid'); return toast('Isi berat minimal 1 kg.'); }
  if (!nilai) { $('#f-nilai').classList.add('invalid'); return toast('Isi nilai barang. Ini dipakai sebagai dasar klaim.'); }
  if (!asal) { $('#f-asal').classList.add('invalid'); return toast(`Pilih kota asal di ${WILAYAH_ASAL} dari daftar.`); }
  if (!tujuan) { $('#f-tujuan').classList.add('invalid'); return toast('Pilih kota tujuan dari daftar.'); }
  if (asal === tujuan) { $('#f-tujuan').classList.add('invalid'); return toast('Kota asal dan tujuan tidak boleh sama.'); }

  state.shipment = { key: $('#f-komoditas').value, berat, nilai, asal, tujuan };
  go('layanan');
}

/* ---------- LAYAR: PILIH LAYANAN ---------- */
function renderLayanan() {
  const s = state.shipment;
  const k = komoditas();
  $('#layanan-peta').innerHTML = `${petaRute({ asal: s.asal, tujuan: s.tujuan })}
    <p class="route-note">Full Managed lewat gudang mitra ${GUDANG}. Self-Packaging dijemput ekspedisi langsung dari ${escapeHTML(s.asal)}.</p>`;
  $('#layanan-summary').innerHTML = `
    <div><span>Komoditas</span><strong>${k.nama}</strong></div>
    <div><span>Berat</span><strong>${s.berat.toLocaleString('id-ID')} kg</strong></div>
    <div><span>Dari</span><strong>${escapeHTML(s.asal)}</strong></div>
    <div><span>Ke</span><strong>${escapeHTML(s.tujuan)}</strong></div>
    <div><span>Disimpan di</span><strong>${RUANG[k.simpan].nama}</strong></div>
    <div><span>Nilai barang</span><strong>${rupiah(s.nilai)}</strong></div>`;
  const simpan = state.managed.prioritas;
  state.managed.prioritas = 'hemat';
  $('#price-managed').textContent = 'Mulai ' + rupiah(hitungManaged().total);
  state.managed.prioritas = simpan;
  $('#price-self').textContent = 'Mulai ' + rupiah(Math.min(...ruteCocok().map((r) => hitungSelf(r).total)));
}

/* ---------- LAYAR: FULL MANAGED ---------- */
function renderManaged() {
  const k = komoditas();
  const s = state.shipment;
  const hub = GUDANG;
  const h = ruteHemat(), c = ruteCepat();
  const sama = h.id === c.id;
  if (sama) state.managed.prioritas = 'hemat';
  const hasil = hitungManaged();
  const r = hasil.rute;
  const ruang = RUANG[k.simpan];

  const opsiRute = (id, judul, rute) => `
    <button class="choice ${state.managed.prioritas === id ? 'selected' : ''}" data-prioritas="${id}" role="radio" aria-checked="${state.managed.prioritas === id}">
      <span class="radio"></span>
      <span class="choice-info"><strong>${judul}</strong><span>${rute.nama} oleh ${rute.mitra}, ${hariTeks(rute)}</span></span>
      <span class="choice-price">${rupiah(rute.perKg * s.berat)}</span>
    </button>`;

  $('#managed-content').innerHTML = `
    ${langkahHTML(2)}
    <h2 class="section-label">Barang diserahkan dengan cara</h2>
    <div class="choice-list" role="radiogroup" aria-label="Cara serah barang">
      <button class="choice ${state.managed.serah === 'antar' ? 'selected' : ''}" data-serah="antar" role="radio" aria-checked="${state.managed.serah === 'antar'}">
        <span class="radio"></span>
        <span class="choice-info"><strong>Antar sendiri ke gudang mitra</strong><span>${escapeHTML(namaGudang(k.simpan, hub))}</span></span>
        <span class="choice-price">Gratis</span>
      </button>
      <button class="choice ${state.managed.serah === 'jemput' ? 'selected' : ''}" data-serah="jemput" role="radio" aria-checked="${state.managed.serah === 'jemput'}">
        <span class="radio"></span>
        <span class="choice-info"><strong>Dijemput dari kebun atau gudang Anda</strong><span>Oleh kurir lokal setempat di ${escapeHTML(s.asal)}</span></span>
        <span class="choice-price">${rupiah(BIAYA_JEMPUT)}</span>
      </button>
    </div>

    <h2 class="section-label">Pilih rute</h2>
    <div class="choice-list" role="radiogroup" aria-label="Prioritas rute">
      ${opsiRute('hemat', sama ? 'Rute yang tersedia' : 'Hemat', h)}
      ${sama ? '' : opsiRute('cepat', 'Cepat', c)}
    </div>
    ${sama ? `<p class="hint">Untuk produk dan tujuan ini hanya ada satu rute yang sesuai.</p>` : ''}

    <div class="info-card">
      <h3>Yang kami kerjakan</h3>
      <ol class="steps">
        <li><b>1</b>${state.managed.serah === 'jemput' ? 'Kurir lokal menjemput barang' : 'Anda antar barang'} ke gudang mitra ${escapeHTML(hub)}</li>
        <li><b>2</b>Petugas QC kami cek mutu: timbang, ukur kadar air atau suhu, lalu foto</li>
        <li><b>3</b>Dikemas sesuai panduan ${k.nama.toLowerCase()}, difoto lagi</li>
        <li><b>4</b>Disimpan di ${ruangKecil(k.simpan)} sampai berangkat</li>
        <li><b>5</b>Dikirim lewat ${r.nama.toLowerCase()}, ${hariTeks(r)}</li>
      </ol>
    </div>

    ${kartuPelaksana({ layanan: 'Full Managed', serah: state.managed.serah, hub, simpan: k.simpan, rute: r, tujuan: s.tujuan })}

    <div class="info-card">
      <h3>Rincian biaya</h3>
      ${rincianHTML(hasil.rincian, hasil.total)}
      <p class="value-disclaimer">Harga masih contoh untuk simulasi.</p>
    </div>

    ${kartuPerlindungan()}`;
  $('#managed-total').textContent = rupiah(hasil.total);
}

function lanjutManaged() {
  const h = hitungManaged();
  state.draft = {
    layanan: 'Full Managed', serah: state.managed.serah, rute: h.rute,
    rincian: h.rincian, total: h.total, hub: GUDANG
  };
  go('bayar');
}

/* ---------- LAYAR: SELF-PACKAGING ---------- */
function renderSelf() {
  const k = komoditas();
  const tanda = JSON.stringify(state.shipment);
  if (state.checksFor !== tanda) {
    state.checks = k.langkah.map(() => false);
    state.selectedExp = null;
    state.kemasan = k.kemasan[0].id;
    state.checksFor = tanda;
  }
  $('#self-komoditas-name').textContent = k.nama.toLowerCase();
  $('#self-spec').innerHTML = `
    <div class="spec"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4v10.5a4 4 0 1 1-4 0V4a2 2 0 1 1 4 0z"/></svg><span>Suhu</span><strong>${k.suhu}</strong></div>
    <div class="spec"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2s6 7.5 6 12a6 6 0 0 1-12 0c0-4.5 6-12 6-12z"/></svg><span>Kelembapan</span><strong>${k.lembab}</strong></div>
    <div class="spec wide warn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 16H3z"/><path d="M12 10v4"/><path d="M12 17h.01"/></svg><p>${k.peringatan}</p></div>`;
  renderKemasan();
  $('#self-checklist').innerHTML = k.langkah.map(([ikon, teks, alasan], i) => `
    <li>
      <label class="check-item" data-index="${i}">
        <input type="checkbox" data-index="${i}" ${state.checks[i] ? 'checked' : ''}>
        <span class="check-illus">${ilustrasi(ikon)}<em>${i + 1}</em></span>
        <span class="check-body"><span class="check-text">${teks}</span><span class="check-why">${alasan}</span></span>
        <span class="check-box"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>
      </label>
    </li>`).join('');
  $('#self-exp-hint').textContent = (k.simpan === 'kering'
    ? 'Harga sudah dihitung dari berat barang Anda. '
    : 'Produk ini harus memakai ekspedisi berpendingin. ') + CATATAN_MITRA;
  renderEkspedisi();
  updateSelfUI();
}

function renderKemasan() {
  const k = komoditas();
  $('#self-kemasan').innerHTML = k.kemasan.map((m) => `
    <button class="choice ${state.kemasan === m.id ? 'selected' : ''}" data-kemasan="${m.id}" role="radio" aria-checked="${state.kemasan === m.id}">
      <span class="radio"></span>
      <span class="choice-info"><strong>${m.nama}</strong><span>${m.ket}</span></span>
    </button>`).join('');
  const pilihan = k.kemasan.find((m) => m.id === state.kemasan);
  $('#self-materials').innerHTML = pilihan.bahan.map((b) => `<li>${b}</li>`).join('');
}

function renderEkspedisi() {
  $('#self-expedisi').innerHTML = semuaRute().map((r) => {
    const dipilih = state.selectedExp === r.id;
    return `
      <button class="choice ${dipilih ? 'selected' : ''}" data-exp="${r.id}" role="radio" aria-checked="${dipilih}" ${r.bisa ? '' : 'disabled'}>
        <span class="radio"></span>
        <span class="choice-info">
          <strong>${r.nama}${r.dingin ? '<span class="tag">Berpendingin</span>' : ''}</strong>
          <span>${r.bisa ? `${r.mitra}, ${hariTeks(r)}` : r.alasan}</span>
        </span>
        <span class="choice-price">${r.bisa ? rupiah(hitungSelf(r).rincian[0][1]) : ''}</span>
      </button>`;
  }).join('');
}

function updateSelfUI() {
  const selesai = state.checks.filter(Boolean).length;
  const total = state.checks.length;
  const semua = selesai === total;
  $('#self-progress').style.width = (selesai / total) * 100 + '%';
  $$('#self-checklist .check-item').forEach((el) => el.classList.toggle('checked', state.checks[Number(el.dataset.index)]));
  setStep(1, 'done');
  setStep(2, semua ? 'done' : 'current');
  setStep(3, state.selectedExp ? 'done' : semua ? 'current' : '');

  const r = RUTE.find((x) => x.id === state.selectedExp);
  $('#self-cost').innerHTML = r ? `<h3>Rincian biaya</h3>${rincianHTML(hitungSelf(r).rincian, hitungSelf(r).total)}${kartuPerlindungan()}${kartuPelaksana({ layanan: 'Self-Packaging', rute: r, tujuan: state.shipment.tujuan })}` : '';

  $('#btn-confirm-self').disabled = !(semua && r);
  $('#self-footer-note').textContent = !semua ? `Selesaikan langkah mengemas (${selesai}/${total}).` : !r ? 'Pilih ekspedisi untuk melanjutkan.' : '';
}

function setStep(n, status) {
  const el = $(`.step[data-step="${n}"]`);
  el.classList.remove('done', 'current');
  if (status) el.classList.add(status);
}

function lanjutSelf() {
  const r = RUTE.find((x) => x.id === state.selectedExp);
  const h = hitungSelf(r);
  const kem = komoditas().kemasan.find((m) => m.id === state.kemasan);
  state.draft = { layanan: 'Self-Packaging', rute: r, rincian: h.rincian, total: h.total, kemasan: kem.nama };
  go('bayar');
}

/* ---------- LAYAR: PEMBAYARAN ---------- */
const METODE = [
  { id: 'va', nama: 'Transfer virtual account', ket: 'Bank BCA, BNI, BRI, Mandiri' },
  { id: 'qris', nama: 'QRIS', ket: 'Scan dari aplikasi bank atau e-wallet mana pun' },
  { id: 'ewallet', nama: 'E-wallet', ket: 'GoPay, OVO, DANA, ShopeePay' }
];

function renderBayar() {
  const d = state.draft;
  const s = state.shipment;
  $('#bayar-content').innerHTML = `
    ${langkahHTML(3)}
    <div class="route-card">${petaRute({ asal: s.asal, tujuan: s.tujuan, layanan: d.layanan })}</div>
    <div class="pay-card">
      <div class="pay-row"><span>Layanan</span><strong>${d.layanan}</strong></div>
      <div class="pay-row"><span>Barang</span><strong>${komoditas().nama}, ${s.berat.toLocaleString('id-ID')} kg</strong></div>
      <div class="pay-row"><span>Rute</span><strong>${escapeHTML(s.asal)} ke ${escapeHTML(s.tujuan)}</strong></div>
      <div class="pay-row"><span>Pengiriman</span><strong>${d.rute.nama}, ${hariTeks(d.rute)}</strong></div>
    </div>

    <div class="pay-card">
      <h3>Rincian biaya</h3>
      ${rincianHTML(d.rincian, d.total)}
    </div>

    ${kartuPelaksana({ ...d, simpan: komoditas().simpan, tujuan: s.tujuan })}

    <h2 class="section-label">Metode pembayaran</h2>
    <div class="choice-list" role="radiogroup" aria-label="Metode pembayaran">
      ${METODE.map((m) => `
        <button class="choice ${state.bayar.metode === m.id ? 'selected' : ''}" data-metode="${m.id}" role="radio" aria-checked="${state.bayar.metode === m.id}">
          <span class="radio"></span>
          <span class="choice-info"><strong>${m.nama}</strong><span>${m.ket}</span></span>
        </button>`).join('')}
    </div>

    <div class="wa-card">
      <label class="wa-toggle">
        <input type="checkbox" id="wa-on" ${state.bayar.wa ? 'checked' : ''}>
        <span><strong>Kirim update ke WhatsApp</strong><small>Foto dan status setiap tahap dikirim ke nomor Anda</small></span>
      </label>
      <input type="tel" id="wa-nomor" placeholder="Contoh: 0812 3456 7890" value="${escapeHTML(state.bayar.nomor)}" ${state.bayar.wa ? '' : 'hidden'}>
    </div>

    ${kartuPerlindungan()}

    <p class="hint">Pesanan bisa dibatalkan gratis sebelum dibayar. Setelah dibayar, pembatalan masih bisa selama barang belum diserahkan ke gudang atau ekspedisi.</p>`;
  $('#bayar-total').textContent = rupiah(d.total);
}

function bayar() {
  if (state.bayar.wa) {
    state.bayar.nomor = $('#wa-nomor').value.trim();
    if (state.bayar.nomor.replace(/\D/g, '').length < 9) {
      $('#wa-nomor').classList.add('invalid');
      return toast('Isi nomor WhatsApp, atau matikan update WhatsApp.');
    }
  }
  const d = state.draft;
  const data = {
    resi: 'TX-' + String(Math.floor(100000 + Math.random() * 900000)),
    komoditas: komoditas().nama,
    simpan: komoditas().simpan,
    ...state.shipment,
    layanan: d.layanan,
    serah: d.serah || null,
    hub: d.hub || null,
    kemasan: d.kemasan || null,
    rute: { nama: d.rute.nama, moda: d.rute.moda, mitra: d.rute.mitra, mitraId: d.rute.mitraId, dingin: d.rute.dingin, hari: d.rute.hari },
    total: d.total,
    metode: METODE.find((m) => m.id === state.bayar.metode).nama,
    wa: state.bayar.wa ? state.bayar.nomor : null,
    tahap: 1,
    waktu: new Date()
  };
  state.history.unshift(data);
  simpanKeStorage();
  state.viewing = data;
  state.draft = null;
  state.checksFor = null;
  state.navStack = ['home', 'ringkasan'];
  show('ringkasan');
  toast('Pembayaran berhasil.');
}

function batalPesanan() {
  state.draft = null;
  toast('Pesanan dibatalkan. Tidak ada biaya.');
  resetTo('home');
}

/* ---------- LACAK: TAHAPAN, FOTO, PENANGGUNG JAWAB ---------- */
function tahapan(d) {
  const ruang = ruangKecil(d.simpan);
  // nama mitra + perannya, supaya jelas mana gudang dan mana ekspedisi
  const gudang = `${namaGudang(d.simpan)}${d.simpan === 'kering' ? '' : ' (cold storage)'}`;
  const angkut = `${d.rute.mitra} (${d.rute.dingin ? 'truk berpendingin' : 'ekspedisi'})`;
  const kurir = `${KURIR_LOKAL} (kurir lokal)`;
  const belumDiserahkan = 'Anda (barang belum diserahkan)';
  if (d.layanan === 'Full Managed') {
    return [
      { judul: 'Pesanan dibayar', oleh: 'TransportX', tanggungan: belumDiserahkan },
      d.serah === 'jemput'
        ? { judul: 'Dijemput kurir lokal', oleh: kurir, lokasi: d.asal }
        : { judul: 'Diantar ke gudang mitra', oleh: 'Pengirim', lokasi: `Menuju ${namaGudang(d.simpan)}` },
      { judul: 'Diterima dan dicek mutunya', oleh: 'Petugas QC TransportX', tanggungan: gudang, lokasi: namaGudang(d.simpan), foto: 'Foto saat diterima: timbang dan cek kondisi' },
      { judul: 'Dikemas sesuai panduan', oleh: 'Petugas QC TransportX', tanggungan: gudang, lokasi: namaGudang(d.simpan), foto: 'Foto setelah dikemas' },
      { judul: `Disimpan di ${ruang}`, oleh: gudang, lokasi: namaGudang(d.simpan), catatan: 'Suhu dicatat alat pencatat suhu' },
      { judul: `Dalam perjalanan (${d.rute.moda.toLowerCase()})`, oleh: angkut, lokasi: `Menuju ${d.tujuan}` },
      { judul: 'Tiba di tujuan', oleh: angkut, lokasi: d.tujuan, foto: 'Foto saat tiba dan diterima' }
    ];
  }
  return [
    { judul: 'Pesanan dibayar', oleh: 'TransportX', tanggungan: belumDiserahkan },
    { judul: 'Dijemput ekspedisi', oleh: angkut, lokasi: d.asal, foto: 'Foto kemasan saat dijemput' },
    { judul: `Dalam perjalanan (${d.rute.moda.toLowerCase()})`, oleh: angkut, lokasi: `Menuju ${d.tujuan}` },
    { judul: 'Tiba di tujuan', oleh: angkut, lokasi: d.tujuan, foto: 'Foto saat tiba dan diterima' }
  ];
}

function fotoHTML(teks) {
  return `
    <figure class="photo">
      <div class="photo-img">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></svg>
      </div>
      <figcaption>${teks}</figcaption>
    </figure>`;
}

function renderRingkasan(d) {
  const t = tahapan(d);
  const selesai = d.tahap >= t.length;
  const sekarang = t[Math.min(d.tahap, t.length) - 1];
  const jam = d.waktu.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  $('#ringkasan-content').innerHTML = `
    <div class="track-head">
      <div>
        <span>No. resi</span>
        <div class="resi-row"><strong id="resi-text">${d.resi}</strong>
          <button class="copy-btn" id="btn-copy-resi" aria-label="Salin nomor resi">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg><span>Salin</span>
          </button>
        </div>
      </div>
      <span class="status-badge ${selesai ? 'ok' : ''}">${selesai ? 'Tiba' : 'Diproses'}</span>
    </div>

    <div class="track-now">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
      <div><strong>${sekarang.judul}</strong><span>${sekarang.lokasi ? escapeHTML(sekarang.lokasi) + ' · ' : ''}Penanggung jawab: ${sekarang.oleh}</span></div>
    </div>

    <div class="route-card">${petaRute({ asal: d.asal, tujuan: d.tujuan, layanan: d.layanan, posisi: posisiTahap(d) })}</div>

    <div class="btn-row">
      <button class="btn btn-ghost" id="btn-share">Bagikan link lacak</button>
      ${selesai ? '' : '<button class="btn btn-ghost" id="btn-next-stage">Simulasikan tahap berikutnya</button>'}
    </div>
    ${d.wa ? `<p class="hint">Update dikirim ke WhatsApp ${escapeHTML(d.wa)}.</p>` : ''}

    <h2 class="section-label">Status pengiriman</h2>
    <ul class="timeline">
      ${t.map((s, i) => {
        const n = i + 1;
        const kelas = n < d.tahap || (selesai && n === t.length) ? 'done' : n === d.tahap ? 'now' : 'todo';
        const tampil = kelas !== 'todo';
        return `
          <li class="${kelas}">
            <span class="dot">${kelas === 'done' ? '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>' : ''}</span>
            <div class="tl-body">
              <strong>${s.judul}</strong>
              <small>${n === 1 ? jam + ' · ' : ''}${s.oleh}${s.lokasi && tampil ? ' · ' + escapeHTML(s.lokasi) : ''}</small>
              ${tampil && s.catatan ? `<small>${s.catatan}</small>` : ''}
              ${tampil && s.foto ? fotoHTML(s.foto) : ''}
            </div>
          </li>`;
      }).join('')}
    </ul>

    <div class="detail-card">
      <div class="detail-row"><span>Layanan</span><strong>${d.layanan}</strong></div>
      <div class="detail-row"><span>Barang</span><strong>${d.komoditas}, ${d.berat.toLocaleString('id-ID')} kg</strong></div>
      <div class="detail-row"><span>Rute</span><strong>${escapeHTML(d.asal)} ke ${escapeHTML(d.tujuan)}</strong></div>
      <div class="detail-row"><span>Pengiriman</span><strong>${d.rute.nama}, ${d.rute.hari[0]}–${d.rute.hari[1]} hari</strong></div>
      <div class="detail-row"><span>Nilai barang</span><strong>${rupiah(d.nilai)}</strong></div>
      <div class="detail-row"><span>Dibayar</span><strong>${rupiah(d.total)} · ${d.metode}</strong></div>
    </div>

    ${kartuPelaksana(d)}

    <div class="protect-card">
      <div class="protect-head">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>
        <strong>Ada masalah dengan barang?</strong>
      </div>
      <p>Saat ini barang menjadi tanggungan <b>${escapeHTML(sekarang.tanggungan || sekarang.oleh)}</b>. Ajukan klaim, CS kami bandingkan dengan foto cek mutu.</p>
      <div class="btn-row">
        <button class="btn btn-ghost" data-go="klaim">Ajukan klaim</button>
        <button class="link-inline" data-go="perlindungan">Aturan klaim</button>
      </div>
    </div>`;

  $('#btn-copy-resi').addEventListener('click', () => salinTeks(d.resi, `No. resi ${d.resi} disalin.`));
  $('#btn-share').addEventListener('click', () => toast(`Link lacak ${d.resi} disalin (simulasi).`));
  $('#btn-next-stage')?.addEventListener('click', () => {
    d.tahap += 1;
    simpanKeStorage();
    renderRingkasan(d);
    const baru = tahapan(d)[d.tahap - 1];
    toast(d.wa ? `WhatsApp terkirim: "${baru.judul}" (simulasi)` : baru.judul);
  });
}

/* Salin ke clipboard; kalau browser menolak, teks resi diseleksi supaya bisa disalin manual */
function salinTeks(teks, pesan) {
  const cadangan = () => {
    const el = $('#resi-text');
    if (el) { const r = document.createRange(); r.selectNodeContents(el); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
    toast('Tekan Ctrl+C atau tahan untuk menyalin.');
  };
  try {
    navigator.clipboard.writeText(teks).then(() => toast(pesan), cadangan);
  } catch (e) { cadangan(); }
}

/* ---------- LACAK (tab) & RIWAYAT ---------- */
function cariResi(teks) {
  const r = teks.trim().toUpperCase();
  if (!r) return toast('Masukkan nomor resi.');
  const d = state.history.find((x) => x.resi.toUpperCase() === r);
  if (!d) return toast('Resi tidak ditemukan di simulasi ini.');
  state.viewing = d;
  go('ringkasan');
}

function itemHTML(d) {
  const t = tahapan(d);
  const s = t[Math.min(d.tahap, t.length) - 1];
  const tiba = d.tahap >= t.length;
  return `
    <button class="history-item" data-resi="${d.resi}">
      <div class="history-top"><strong>${d.resi}</strong><span class="status-badge ${tiba ? 'ok' : ''}">${tiba ? 'Tiba' : 'Diproses'}</span></div>
      <p>${d.komoditas}, ${d.berat.toLocaleString('id-ID')} kg · ${escapeHTML(d.asal)} ke ${escapeHTML(d.tujuan)}</p>
      <div class="history-meta"><span>${s.judul}</span><span>${rupiah(d.total)}</span></div>
    </button>`;
}

function kosongHTML(teks) {
  return `
    <div class="empty">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/></svg>
      <p>${teks}</p>
      <button class="btn btn-primary" data-go-reset="input">Kirim barang baru</button>
    </div>`;
}

function renderRiwayat() {
  $('#riwayat-list').innerHTML = state.history.length
    ? state.history.map(itemHTML).join('')
    : kosongHTML('Belum ada pengiriman. Buat pengiriman pertama dari halaman Home.');
}
function renderLacakList() {
  $('#lacak-list').innerHTML = state.history.length
    ? state.history.slice(0, 5).map(itemHTML).join('')
    : '<p class="hint">Belum ada kiriman di perangkat ini.</p>';
}

/* ---------- KLAIM ---------- */
function renderKlaim() {
  const d = state.viewing;
  if (!d) return;
  const t = tahapan(d);
  const s = t[Math.min(d.tahap, t.length) - 1];
  $('#klaim-summary').innerHTML = `
    <div><span>No. resi</span><strong>${d.resi}</strong></div>
    <div><span>Nilai barang</span><strong>${rupiah(d.nilai)}</strong></div>
    <div class="span2"><span>Tahap sekarang dan penanggung jawab</span><strong>${s.judul} · ${s.oleh}</strong></div>`;
  $('#klaim-hint').textContent = 'Ganti rugi mengikuti ketentuan mitra yang bertanggung jawab di tahap kejadian.';
  state.klaimJenis = null;
  $$('#klaim-jenis .opt').forEach((b) => b.classList.remove('active'));
  $('#klaim-desk').value = '';
  $('#klaim-foto').value = '';
}

function kirimKlaim() {
  if (!state.klaimJenis) return toast('Pilih masalahnya dulu.');
  if (!$('#klaim-desk').value.trim()) return toast('Ceritakan singkat masalahnya.');
  toast('Klaim terkirim. CS akan menghubungi Anda (simulasi).');
  back();
}

/* ---------- EVENT LISTENER ---------- */
document.addEventListener('click', (e) => {
  const goBtn = e.target.closest('[data-go]');
  if (goBtn) return go(goBtn.dataset.go);

  const resetBtn = e.target.closest('[data-go-reset]');
  if (resetBtn) { state.navStack = ['home']; return go(resetBtn.dataset.goReset); }

  if (e.target.closest('[data-back]')) return back();
  if (e.target.closest('[data-home]')) return resetTo('home');

  const tab = e.target.closest('[data-tab]');
  if (tab) return resetTo(tab.dataset.tab);

  const chip = e.target.closest('[data-berat]');
  if (chip) {
    $('#f-berat').value = chip.dataset.berat;
    $('#f-berat').classList.remove('invalid');
    $$('#berat-chips .chip').forEach((c) => c.classList.toggle('active', c === chip));
    return;
  }

  const histBtn = e.target.closest('[data-resi]');
  if (histBtn) { state.viewing = state.history.find((d) => d.resi === histBtn.dataset.resi); return go('ringkasan'); }

  const serah = e.target.closest('[data-serah]');
  if (serah) { state.managed.serah = serah.dataset.serah; return renderManaged(); }

  const prio = e.target.closest('[data-prioritas]');
  if (prio) { state.managed.prioritas = prio.dataset.prioritas; return renderManaged(); }

  const kem = e.target.closest('[data-kemasan]');
  if (kem) { state.kemasan = kem.dataset.kemasan; return renderKemasan(); }

  const expBtn = e.target.closest('[data-exp]');
  if (expBtn && !expBtn.disabled) { state.selectedExp = expBtn.dataset.exp; renderEkspedisi(); return updateSelfUI(); }

  const met = e.target.closest('[data-metode]');
  if (met) {
    state.bayar.metode = met.dataset.metode;
    $$('[data-metode]').forEach((b) => {
      const on = b === met;
      b.classList.toggle('selected', on);
      b.setAttribute('aria-checked', on);
    });
    return;
  }

  const jenis = e.target.closest('#klaim-jenis .opt');
  if (jenis) {
    state.klaimJenis = jenis.dataset.val;
    $$('#klaim-jenis .opt').forEach((b) => b.classList.toggle('active', b === jenis));
  }
});

document.addEventListener('change', (e) => {
  if (e.target.matches('#self-checklist input[type="checkbox"]')) {
    state.checks[Number(e.target.dataset.index)] = e.target.checked;
    updateSelfUI();
  }
  if (e.target.matches('#wa-on')) {
    state.bayar.wa = e.target.checked;
    $('#wa-nomor').hidden = !e.target.checked;
  }
  if (e.target.matches('#f-komoditas')) updateKomoditasHelp();
});

$('#btn-input-next').addEventListener('click', validasiInput);
$('#btn-confirm-managed').addEventListener('click', lanjutManaged);
$('#btn-confirm-self').addEventListener('click', lanjutSelf);
$('#btn-bayar').addEventListener('click', bayar);
$('#btn-batal').addEventListener('click', batalPesanan);
$('#btn-kirim-klaim').addEventListener('click', kirimKlaim);

$('#home-track').addEventListener('submit', (e) => { e.preventDefault(); cariResi($('#home-resi').value); });
$('#tab-track').addEventListener('submit', (e) => { e.preventDefault(); cariResi($('#tab-resi').value); });

$('#f-berat').addEventListener('input', () => $$('#berat-chips .chip').forEach((c) => c.classList.remove('active')));
// nilai barang otomatis diberi titik ribuan saat diketik
$('#f-nilai').addEventListener('input', (e) => {
  const n = angkaDariTeks(e.target.value);
  e.target.value = n ? n.toLocaleString('id-ID') : '';
});
document.addEventListener('input', (e) => { if (e.target.matches('#wa-nomor')) e.target.classList.remove('invalid'); });

/* =========================================================
   MODUL TES PASAR — feedback responden & panel moderator
   ========================================================= */
const FB_KEY = 'transportx.v2.feedback';
const fb = { list: [], jawaban: {}, layananDipakai: null };

function muatFeedback() {
  try { fb.list = JSON.parse(localStorage.getItem(FB_KEY) || '[]'); } catch (e) { fb.list = []; }
}
function simpanFeedback() {
  try { localStorage.setItem(FB_KEY, JSON.stringify(fb.list)); } catch (e) { toast('Data tidak bisa disimpan di browser ini.'); }
}

function resetFormFeedback() {
  fb.jawaban = {};
  $$('#screen-feedback .opt, #screen-feedback .star').forEach((b) => b.classList.remove('active'));
  ['#fb-suka', '#fb-kritik', '#fb-tanya', '#fb-ide', '#fb-nama', '#fb-usia'].forEach((s) => { $(s).value = ''; });
  $('#fb-note').textContent = '';
}

function kirimFeedback() {
  const wajib = ['peran', 'gender', 'pernahRusak', 'mudah', 'membantu', 'minat', 'harga'];
  const kurang = wajib.filter((k) => !fb.jawaban[k]);
  if (kurang.length) {
    $('#fb-note').textContent = `Masih ada ${kurang.length} pertanyaan pilihan yang belum dijawab.`;
    $(`[data-q="${kurang[0]}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  fb.list.unshift({
    id: Date.now(), waktu: new Date().toISOString(),
    nama: $('#fb-nama').value.trim() || 'Anonim', usia: $('#fb-usia').value.trim(),
    ...fb.jawaban, layanan: fb.layananDipakai || '-',
    suka: $('#fb-suka').value.trim(), kritik: $('#fb-kritik').value.trim(),
    tanya: $('#fb-tanya').value.trim(), ide: $('#fb-ide').value.trim()
  });
  simpanFeedback();
  resetFormFeedback();
  state.navStack = ['terimakasih'];
  show('terimakasih');
}

function respondenBaru() {
  state.history = []; state.shipment = null; state.checks = []; state.checksFor = null;
  state.selectedExp = null; state.viewing = null; state.draft = null;
  state.managed = { prioritas: 'hemat', serah: 'antar' };
  state.bayar = { metode: 'va', wa: true, nomor: '' };
  simpanKeStorage();
  ['#f-berat', '#f-nilai', '#home-resi', '#tab-resi'].forEach((s) => { $(s).value = ''; });
  $$('#berat-chips .chip').forEach((c) => c.classList.remove('active'));
  ['#f-asal', '#f-tujuan'].forEach((s) => { $(s).value = ''; $(s).dataset.terpilih = ''; $(s).classList.remove('invalid'); });
  $('#f-komoditas').selectedIndex = 0;
  updateKomoditasHelp();
  tampilkanHub(null);
  state.navStack = ['home'];
  show('home');
}

function renderPanel() {
  $('#stat-total').textContent = fb.list.length;
  if (fb.list.length) {
    const rata = fb.list.reduce((t, r) => t + Number(r.mudah), 0) / fb.list.length;
    const mau = fb.list.filter((r) => r.minat === 'Ya, pasti pakai').length;
    $('#stat-mudah').textContent = rata.toFixed(1);
    $('#stat-minat').textContent = Math.round((mau / fb.list.length) * 100) + '%';
  } else {
    $('#stat-mudah').textContent = '—';
    $('#stat-minat').textContent = '—';
  }
  const el = $('#panel-list');
  if (!fb.list.length) {
    el.innerHTML = '<div class="empty"><p>Belum ada masukan. Data muncul di sini setelah responden mengisi form.</p></div>';
    return;
  }
  el.innerHTML = fb.list.map((r, i) => {
    const waktu = new Date(r.waktu).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const q = [
      r.suka && `<p class="fb-quote"><b>Disukai:</b> ${escapeHTML(r.suka)}</p>`,
      r.kritik && `<p class="fb-quote"><b>Ingin diperbaiki:</b> ${escapeHTML(r.kritik)}</p>`,
      r.tanya && `<p class="fb-quote"><b>Pertanyaan:</b> ${escapeHTML(r.tanya)}</p>`,
      r.ide && `<p class="fb-quote"><b>Ide:</b> ${escapeHTML(r.ide)}</p>`
    ].filter(Boolean).join('');
    return `
      <div class="fb-item">
        <div class="fb-head"><strong>${fb.list.length - i}. ${escapeHTML(r.nama)}</strong><span>${waktu}</span></div>
        <div class="fb-tags">
          <span class="fb-tag">${escapeHTML(r.peran)}</span><span class="fb-tag">Mudah ${r.mudah}/5</span>
          <span class="fb-tag">Membantu ${r.membantu}/5</span><span class="fb-tag">${escapeHTML(r.minat)}</span>
          <span class="fb-tag">Harga: ${escapeHTML(r.harga)}</span>
        </div>${q}
      </div>`;
  }).join('');
}

const selCSV = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
function unduhCSV(namaFile, baris) {
  const isi = baris.map((r) => r.map(selCSV).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + isi], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = namaFile;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function exportData() {
  if (!fb.list.length) return toast('Belum ada data untuk diunduh.');
  const baris = [['No', 'Waktu', 'Inisial', 'Usia', 'Jenis kelamin', 'Peran', 'Pernah barang rusak', 'Layanan dicoba',
    'Kemudahan (1-5)', 'Kebermanfaatan (1-5)', 'Minat pakai', 'Persepsi harga', 'I like', 'I wish', 'Questions', 'Ideas']];
  fb.list.slice().reverse().forEach((r, i) => baris.push([i + 1, new Date(r.waktu).toLocaleString('id-ID'), r.nama, r.usia,
    r.gender, r.peran, r.pernahRusak, r.layanan, r.mudah, r.membantu, r.minat, r.harga, r.suka, r.kritik, r.tanya, r.ide]));
  unduhCSV(`TransportX_v2_TesPasar_${fb.list.length}responden.csv`, baris);
  toast('Data diunduh.');
}
function exportGrid() {
  if (!fb.list.length) return toast('Belum ada data untuk diunduh.');
  const baris = [['Kuadran', 'Responden', 'Isi masukan']];
  [['I like', 'suka'], ['I wish', 'kritik'], ['Questions', 'tanya'], ['Ideas', 'ide']].forEach(([label, f]) => {
    fb.list.slice().reverse().forEach((r) => { if (r[f]) baris.push([label, r.nama, r[f]]); });
  });
  if (baris.length === 1) return toast('Belum ada jawaban isian untuk Feedback Grid.');
  unduhCSV('TransportX_v2_FeedbackGrid.csv', baris);
  toast('Feedback Grid diunduh.');
}
function hapusSemua() {
  if (!fb.list.length) return toast('Tidak ada data untuk dihapus.');
  if (!confirm(`Hapus ${fb.list.length} masukan? Tindakan ini tidak bisa dibatalkan.`)) return;
  fb.list = []; simpanFeedback(); renderPanel(); toast('Semua data dihapus.');
}

$('#btn-panel-open').addEventListener('click', () => { renderPanel(); go('panel'); });
$('#btn-panel-close').addEventListener('click', back);
$('#btn-ke-beranda').addEventListener('click', () => resetTo('home'));
$('#btn-kirim-feedback').addEventListener('click', kirimFeedback);
$('#btn-responden-baru').addEventListener('click', respondenBaru);
$('#btn-export').addEventListener('click', exportData);
$('#btn-export-grid').addEventListener('click', exportGrid);
$('#btn-hapus').addEventListener('click', hapusSemua);

$('#screen-feedback').addEventListener('click', (e) => {
  const t = e.target.closest('.opt, .star');
  if (!t) return;
  const grup = t.parentElement;
  const kunci = grup.dataset.q;
  if (!kunci) return;
  grup.querySelectorAll('.opt, .star').forEach((b) => b.classList.remove('active'));
  t.classList.add('active');
  fb.jawaban[kunci] = t.dataset.val;
  $('#fb-note').textContent = '';
});

/* ---------- INIT ---------- */
// Panel moderator hanya tampil jika link dibuka dengan ?moderator
if (!new URLSearchParams(location.search).has('moderator')) $('#btn-panel-open').hidden = true;
muatDariStorage();
muatFeedback();
isiDropdownKomoditas();
buatCombo('combo-asal', {
  daftar: KOTA_ASAL, sentraDulu: true, onPilih: (k) => { tampilkanHub(k); perbaruiPetaInput(); },
  kosong: `Belum dilayani. Saat ini barang hanya diambil dari ${WILAYAH_ASAL}.`
});
buatCombo('combo-tujuan', { daftar: [...KOTA.filter((k) => !k.asal), ...KOTA_ASAL], onPilih: () => perbaruiPetaInput(), kosong:'Belum dilayani. Tujuan pengiriman saat ini kota-kota di Pulau Jawa.' });
show('home');
