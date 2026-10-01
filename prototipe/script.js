/* =========================================================
   TransportX — Prototype (simulasi, tanpa login & backend)
   ========================================================= */

/* ---------- DATA DUMMY ----------
   PENTING — hargaPerKg, susutTanpa, dan susutDengan masih ASUMSI,
   bukan data lapangan. Ganti dengan hasil survei 30 responden
   (entrepreneur corner) sebelum dipakai sebagai klaim di presentasi.
   susutTanpa  = perkiraan susut bila dikirim tanpa standar penanganan
   susutDengan = perkiraan susut bila dikirim lewat TransportX          */
const KOMODITAS = {
  kopi: {
    nama: 'Biji Kopi (Green Bean)',
    suhu: '< 25°C',
    lembab: '50–60% RH',
    coldChain: false,
    handlingPerKg: 1500,
    hargaPerKg: 100000,
    susutTanpa: 0.10,
    susutDengan: 0.02,
    peringatan: 'Jauhkan dari sinar matahari langsung dan barang berbau tajam.',
    packagingManaged: 'Karung goni dengan inner plastic liner (hermetic bag), disimpan di ruang bersuhu terkontrol.',
    bahan: ['Karung goni', 'Hermetic bag / plastic liner', 'Label "Jauhkan dari panas"', 'Lakban'],
    checklist: [
      'Pastikan kadar air biji kopi sudah di bawah 12%',
      'Masukkan biji kopi ke hermetic bag, keluarkan udara sebanyak mungkin',
      'Ikat rapat hermetic bag, lalu masukkan ke karung goni',
      'Jahit atau ikat mulut karung dengan kuat',
      'Tempel label "Jauhkan dari panas" di dua sisi karung'
    ]
  },
  rempah: {
    nama: 'Rempah Kering',
    suhu: 'Suhu ruang (20–28°C)',
    lembab: '< 60% RH',
    coldChain: false,
    handlingPerKg: 1200,
    hargaPerKg: 75000,
    susutTanpa: 0.12,
    susutDengan: 0.03,
    peringatan: 'Rempah mudah menyerap lembab. Pastikan kemasan benar-benar kedap udara.',
    packagingManaged: 'Plastik vacuum seal dengan silica gel, dikemas dalam kardus kedap udara.',
    bahan: ['Plastik vacuum', 'Silica gel', 'Kardus tebal', 'Lakban'],
    checklist: [
      'Pastikan rempah sudah kering sempurna, tidak ada yang lembek',
      'Masukkan rempah ke plastik vacuum bersama 1–2 sachet silica gel',
      'Vacuum dan seal plastik hingga rapat',
      'Susun plastik di dalam kardus, isi rongga kosong agar tidak bergeser',
      'Lakban seluruh sisi kardus dan tulis jenis rempah di luar'
    ]
  },
  segar: {
    nama: 'Hasil Panen Segar',
    suhu: '2–8°C (cold chain)',
    lembab: '85–95% RH',
    coldChain: true,
    handlingPerKg: 3000,
    hargaPerKg: 15000,
    susutTanpa: 0.25,
    susutDengan: 0.05,
    peringatan: 'Wajib memakai ekspedisi cold chain. Kirim di hari yang sama setelah dipacking.',
    packagingManaged: 'Styrofoam box dengan ice gel, disimpan di cold storage 2–8°C sebelum dikirim.',
    bahan: ['Styrofoam box', 'Ice gel', 'Plastik berventilasi', 'Lakban', 'Label "Barang segar"'],
    checklist: [
      'Sortir hasil panen, pisahkan yang memar atau busuk',
      'Bungkus dengan plastik berventilasi per bagian',
      'Letakkan ice gel di dasar dan atas styrofoam box',
      'Susun hasil panen tanpa ditekan, tutup box dengan rapat',
      'Tempel label "Barang segar — jangan ditumpuk"'
    ]
  },
  kakao: {
    nama: 'Biji Kakao',
    suhu: '< 25°C',
    lembab: '< 65% RH',
    coldChain: false,
    handlingPerKg: 1400,
    hargaPerKg: 45000,
    susutTanpa: 0.10,
    susutDengan: 0.02,
    peringatan: 'Jangan letakkan karung langsung di lantai, gunakan alas agar tidak berjamur.',
    packagingManaged: 'Karung goni berlapis dengan sirkulasi udara, disusun di atas pallet kayu.',
    bahan: ['Karung goni berlapis', 'Pallet atau alas kayu', 'Tali pengikat', 'Label identitas'],
    checklist: [
      'Pastikan biji kakao sudah difermentasi dan dijemur kering',
      'Masukkan ke karung goni berlapis, jangan diisi terlalu penuh',
      'Ikat mulut karung dengan kuat',
      'Susun karung di atas pallet atau alas kayu',
      'Tempel label identitas pengirim dan berat per karung'
    ]
  }
};

const EKSPEDISI = [
  { id: 'a', nama: 'Ekspedisi A', jenis: 'Reguler', perKg: 4000, hari: '4–6 hari', coldChain: false },
  { id: 'b', nama: 'Ekspedisi B', jenis: 'Express', perKg: 6500, hari: '2–3 hari', coldChain: false },
  { id: 'c', nama: 'Ekspedisi C', jenis: 'Cold chain', perKg: 9500, hari: '2–4 hari', coldChain: true }
];

const BIAYA_GUDANG = 25000;   // flat, khusus Full Managed
const BIAYA_PLATFORM = 5000;  // flat, khusus Self-Packaging

/* Daftar kota. sentra = daerah penghasil komoditas, diprioritaskan di dropdown Kota asal. */
const KOTA = [
  { nama: 'Takengon (Gayo)', prov: 'Aceh', sentra: 'Kopi arabika' },
  { nama: 'Sidikalang', prov: 'Sumatera Utara', sentra: 'Kopi' },
  { nama: 'Kerinci', prov: 'Jambi', sentra: 'Kayu manis' },
  { nama: 'Pagar Alam', prov: 'Sumatera Selatan', sentra: 'Kopi robusta' },
  { nama: 'Lampung Barat', prov: 'Lampung', sentra: 'Kopi robusta' },
  { nama: 'Bangka', prov: 'Kep. Bangka Belitung', sentra: 'Lada' },
  { nama: 'Temanggung', prov: 'Jawa Tengah', sentra: 'Kopi, tembakau' },
  { nama: 'Kintamani', prov: 'Bali', sentra: 'Kopi arabika' },
  { nama: 'Bajawa (Flores)', prov: 'Nusa Tenggara Timur', sentra: 'Kopi arabika' },
  { nama: 'Tana Toraja', prov: 'Sulawesi Selatan', sentra: 'Kopi arabika' },
  { nama: 'Enrekang', prov: 'Sulawesi Selatan', sentra: 'Kopi, rempah' },
  { nama: 'Palu', prov: 'Sulawesi Tengah', sentra: 'Kakao' },
  { nama: 'Banda Neira', prov: 'Maluku', sentra: 'Pala' },
  { nama: 'Jakarta', prov: 'DKI Jakarta' },
  { nama: 'Bandung', prov: 'Jawa Barat' },
  { nama: 'Bogor', prov: 'Jawa Barat' },
  { nama: 'Semarang', prov: 'Jawa Tengah' },
  { nama: 'Yogyakarta', prov: 'DI Yogyakarta' },
  { nama: 'Surakarta (Solo)', prov: 'Jawa Tengah' },
  { nama: 'Surabaya', prov: 'Jawa Timur' },
  { nama: 'Malang', prov: 'Jawa Timur' },
  { nama: 'Denpasar', prov: 'Bali' },
  { nama: 'Medan', prov: 'Sumatera Utara' },
  { nama: 'Palembang', prov: 'Sumatera Selatan' },
  { nama: 'Padang', prov: 'Sumatera Barat' },
  { nama: 'Pekanbaru', prov: 'Riau' },
  { nama: 'Batam', prov: 'Kep. Riau' },
  { nama: 'Balikpapan', prov: 'Kalimantan Timur' },
  { nama: 'Banjarmasin', prov: 'Kalimantan Selatan' },
  { nama: 'Makassar', prov: 'Sulawesi Selatan' },
  { nama: 'Manado', prov: 'Sulawesi Utara' }
];

/* ---------- STATE ---------- */
const STORAGE_KEY = 'transportx.history';

const state = {
  shipment: null,     // { key, berat, asal, tujuan }
  checks: [],
  checksFor: null,    // tanda pengiriman milik checklist, agar tidak ter-reset saat Back
  selectedExp: null,
  history: [],
  viewing: null,      // pengiriman yang sedang dilihat di layar Ringkasan
  navStack: ['home']
};

/* ---------- PENYIMPANAN LOKAL ---------- */
function simpanKeStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history));
  } catch (e) {
    // localStorage bisa diblokir (mode penyamaran). Aplikasi tetap jalan, riwayat hanya tidak tersimpan.
  }
}

function muatDariStorage() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // waktu berubah jadi teks setelah JSON round-trip, kembalikan ke objek Date
    state.history = data.map((d) => ({ ...d, waktu: new Date(d.waktu) }));
  } catch (e) {
    state.history = [];
  }
}

/* ---------- HELPER ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const rupiah = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const komoditas = () => KOMODITAS[state.shipment.key];

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2400);
}

function ekspedisiDefault() {
  // Full Managed otomatis memilih ekspedisi paling murah yang sesuai kebutuhan komoditas
  const cocok = EKSPEDISI.filter((e) => !komoditas().coldChain || e.coldChain);
  return cocok.reduce((a, b) => (a.perKg <= b.perKg ? a : b));
}

function hitungManaged() {
  const { berat } = state.shipment;
  const exp = ekspedisiDefault();
  const kirim = exp.perKg * berat;
  const handling = komoditas().handlingPerKg * berat;
  return { exp, kirim, handling, gudang: BIAYA_GUDANG, total: kirim + handling + BIAYA_GUDANG };
}

function hitungSelf(exp) {
  const kirim = exp.perKg * state.shipment.berat;
  return { kirim, platform: BIAYA_PLATFORM, total: kirim + BIAYA_PLATFORM };
}

function hitungSelfTermurah() {
  const cocok = EKSPEDISI.filter((e) => !komoditas().coldChain || e.coldChain);
  return Math.min(...cocok.map((e) => hitungSelf(e).total));
}

/* Perlindungan nilai: berapa kerugian yang dicegah, dibanding berapa yang dibayar.
   premi = selisih biaya TransportX terhadap ongkos kirim polos tanpa layanan apa pun. */
function hitungNilai(total, ongkir) {
  const k = komoditas();
  const nilaiBarang = k.hargaPerKg * state.shipment.berat;
  const rugiTanpa = nilaiBarang * k.susutTanpa;
  const rugiDengan = nilaiBarang * k.susutDengan;
  const premi = total - ongkir;
  return {
    nilaiBarang,
    rugiTanpa,
    rugiDengan,
    terselamatkan: rugiTanpa - rugiDengan,
    premi,
    persenPremi: (premi / nilaiBarang) * 100
  };
}

function kartuNilai(total, ongkir) {
  const n = hitungNilai(total, ongkir);
  return `
    <div class="value-card">
      <h3>Perlindungan nilai barang</h3>
      <div class="value-hero">
        <span>Estimasi kerugian yang dicegah</span>
        <strong>${rupiah(n.terselamatkan)}</strong>
      </div>
      <div class="breakdown">
        <div><span>Nilai barang Anda</span><strong>${rupiah(n.nilaiBarang)}</strong></div>
        <div><span>Perkiraan susut tanpa standar</span><strong>${rupiah(n.rugiTanpa)}</strong></div>
        <div><span>Perkiraan susut lewat TransportX</span><strong>${rupiah(n.rugiDengan)}</strong></div>
      </div>
      <p class="value-note">
        Anda membayar <b>${rupiah(n.premi)}</b> di atas ongkos kirim biasa —
        setara <b>${n.persenPremi.toFixed(1)}%</b> dari nilai barang.
      </p>
      <p class="value-disclaimer">Angka susut masih berupa asumsi, akan divalidasi lewat survei UMKM pengolah.</p>
    </div>`;
}

/* ---------- NAVIGASI ---------- */
function show(screen) {
  $$('.screen').forEach((s) => s.classList.remove('active'));
  const target = $('#screen-' + screen);
  target.classList.add('active');
  target.querySelector('.screen-body')?.scrollTo(0, 0);

  const pakaiTabbar = target.dataset.tabbar === 'true';
  $('#tabbar').classList.toggle('hidden', !pakaiTabbar);
  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === screen));

  if (screen === 'layanan') renderLayanan();
  if (screen === 'managed') renderManaged();
  if (screen === 'self') renderSelf();
  if (screen === 'riwayat') renderRiwayat();
  if (screen === 'ringkasan' && state.viewing) renderRingkasan(state.viewing);
}

function go(screen) {
  state.navStack.push(screen);
  show(screen);
}

function back() {
  if (state.navStack.length > 1) state.navStack.pop();
  show(state.navStack[state.navStack.length - 1]);
}

function resetTo(screen) {
  state.navStack = [screen];
  show(screen);
}

/* ---------- KOMPONEN: DROPDOWN KOTA YANG BISA DICARI ---------- */
function buatCombo(idWrap, { sentraDulu = false } = {}) {
  const wrap = $('#' + idWrap);
  const input = wrap.querySelector('input');
  const list = wrap.querySelector('.combo-list');
  let hasil = [];
  let sorot = -1;   // indeks item yang sedang disorot lewat panah keyboard

  // Di kolom Kota asal, sentra produksi ditaruh paling atas karena itu yang paling sering dipakai
  const urutan = () => (sentraDulu
    ? [...KOTA].sort((a, b) => (b.sentra ? 1 : 0) - (a.sentra ? 1 : 0))
    : KOTA);

  const saring = (q) => {
    const t = q.trim().toLowerCase();
    if (!t) return urutan();
    return urutan().filter((k) =>
      `${k.nama} ${k.prov} ${k.sentra || ''}`.toLowerCase().includes(t));
  };

  function render() {
    if (!hasil.length) {
      list.innerHTML = '<li class="combo-empty">Kota tidak ditemukan</li>';
      return;
    }
    list.innerHTML = hasil.map((k, i) => `
      <li class="combo-item${i === sorot ? ' active' : ''}" role="option"
          aria-selected="${i === sorot}" data-nama="${escapeHTML(k.nama)}">
        <span class="combo-text">
          <strong>${escapeHTML(k.nama)}</strong>
          <span>${escapeHTML(k.prov)}</span>
        </span>
        ${k.sentra ? `<span class="combo-tag">${escapeHTML(k.sentra)}</span>` : ''}
      </li>`).join('');
  }

  function buka() {
    hasil = saring(input.value);
    sorot = -1;
    render();
    wrap.classList.add('open');
    input.setAttribute('aria-expanded', 'true');
  }

  function tutup() {
    wrap.classList.remove('open');
    input.setAttribute('aria-expanded', 'false');
    sorot = -1;
  }

  function pilih(kota) {
    input.value = kota.nama;
    input.dataset.terpilih = kota.nama;
    input.classList.remove('invalid');
    tutup();
  }

  function geser(arah) {
    if (!wrap.classList.contains('open')) return buka();
    if (!hasil.length) return;
    sorot = (sorot + arah + hasil.length) % hasil.length;
    render();
    list.children[sorot]?.scrollIntoView({ block: 'nearest' });
  }

  input.addEventListener('focus', buka);
  input.addEventListener('input', () => {
    input.dataset.terpilih = '';   // ketikan bebas belum dianggap pilihan sah
    buka();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); geser(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); geser(-1); }
    else if (e.key === 'Enter') {
      if (wrap.classList.contains('open') && hasil.length) {
        e.preventDefault();
        pilih(hasil[sorot >= 0 ? sorot : 0]);
      }
    } else if (e.key === 'Escape') { tutup(); }
  });

  // mousedown, bukan click — supaya jalan lebih dulu daripada blur pada input
  list.addEventListener('mousedown', (e) => {
    const li = e.target.closest('[data-nama]');
    if (!li) return;
    e.preventDefault();
    pilih(KOTA.find((k) => k.nama === li.dataset.nama));
  });

  wrap.querySelector('.combo-chev').addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (wrap.classList.contains('open')) tutup();
    else input.focus();
  });

  document.addEventListener('mousedown', (e) => {
    if (!wrap.contains(e.target)) tutup();
  });

  input.addEventListener('blur', () => setTimeout(tutup, 0));
}

/* Ketikan bebas tetap diterima asal sama persis dengan salah satu nama kota. */
function bacaKota(input) {
  if (input.dataset.terpilih) return input.dataset.terpilih;
  const t = input.value.trim().toLowerCase();
  const k = KOTA.find((k) => k.nama.toLowerCase() === t);
  return k ? k.nama : null;
}

/* ---------- LAYAR: INPUT ---------- */
function isiDropdownKomoditas() {
  const select = $('#f-komoditas');
  select.innerHTML = Object.entries(KOMODITAS)
    .map(([key, k]) => `<option value="${key}">${k.nama}</option>`)
    .join('');
}

function validasiInput() {
  const berat = Number($('#f-berat').value);
  const asal = bacaKota($('#f-asal'));
  const tujuan = bacaKota($('#f-tujuan'));

  $$('#screen-input input').forEach((i) => i.classList.remove('invalid'));

  if (!berat || berat < 1) {
    $('#f-berat').classList.add('invalid');
    return toast('Isi berat minimal 1 kg.');
  }
  if (!asal) {
    $('#f-asal').classList.add('invalid');
    return toast('Pilih kota asal dari daftar.');
  }
  if (!tujuan) {
    $('#f-tujuan').classList.add('invalid');
    return toast('Pilih kota tujuan dari daftar.');
  }
  if (asal === tujuan) {
    $('#f-tujuan').classList.add('invalid');
    return toast('Kota asal dan tujuan tidak boleh sama.');
  }

  state.shipment = { key: $('#f-komoditas').value, berat, asal, tujuan };
  go('layanan');
}

/* ---------- LAYAR: PILIH LAYANAN ---------- */
function renderLayanan() {
  const s = state.shipment;
  $('#layanan-summary').innerHTML = `
    <div><span>Komoditas</span><strong>${komoditas().nama}</strong></div>
    <div><span>Berat</span><strong>${s.berat.toLocaleString('id-ID')} kg</strong></div>
    <div><span>Dari</span><strong>${escapeHTML(s.asal)}</strong></div>
    <div><span>Ke</span><strong>${escapeHTML(s.tujuan)}</strong></div>
    <div class="span2"><span>Perkiraan nilai barang</span><strong>${rupiah(komoditas().hargaPerKg * s.berat)}</strong></div>
  `;
  $('#price-managed').textContent = 'Estimasi ' + rupiah(hitungManaged().total);
  $('#price-self').textContent = 'Mulai ' + rupiah(hitungSelfTermurah());
}

/* ---------- LAYAR: FULL MANAGED ---------- */
function renderManaged() {
  const k = komoditas();
  const c = hitungManaged();
  const berat = state.shipment.berat.toLocaleString('id-ID');

  $('#managed-content').innerHTML = `
    <div class="info-card">
      <h3>Packaging yang kami siapkan</h3>
      <p>${k.packagingManaged}</p>
    </div>

    <div class="info-card">
      <h3>Alur layanan</h3>
      <ol class="steps">
        <li><b>1</b>Antar barang ke gudang TransportX terdekat dari ${escapeHTML(state.shipment.asal)}</li>
        <li><b>2</b>Tim kami packing sesuai standar ${k.nama.toLowerCase()}</li>
        <li><b>3</b>Barang disimpan di suhu ${k.suhu}</li>
        <li><b>4</b>Dikirim dengan ${c.exp.nama} (${c.exp.jenis}), ${c.exp.hari}</li>
      </ol>
    </div>

    <div class="info-card">
      <h3>Rincian biaya</h3>
      <div class="breakdown">
        <div><span>Packaging &amp; handling (${berat} kg)</span><strong>${rupiah(c.handling)}</strong></div>
        <div><span>Penyimpanan gudang</span><strong>${rupiah(c.gudang)}</strong></div>
        <div><span>Ongkos kirim ${c.exp.nama}</span><strong>${rupiah(c.kirim)}</strong></div>
      </div>
    </div>

    ${kartuNilai(c.total, c.kirim)}
  `;
  $('#managed-total').textContent = rupiah(c.total);
}

function konfirmasiManaged() {
  const c = hitungManaged();
  const n = hitungNilai(c.total, c.kirim);
  simpanPengiriman({
    layanan: 'Full Managed',
    ekspedisi: `${c.exp.nama} (${c.exp.jenis})`,
    estimasi: c.exp.hari,
    total: c.total,
    nilaiBarang: n.nilaiBarang,
    terselamatkan: n.terselamatkan
  });
}

/* ---------- LAYAR: SELF-PACKAGING ---------- */
function renderSelf() {
  const k = komoditas();

  // Checklist hanya di-reset kalau pengirimannya memang berganti,
  // supaya progres tidak hilang saat pengguna menekan Back lalu masuk lagi.
  const tanda = JSON.stringify(state.shipment);
  if (state.checksFor !== tanda) {
    state.checks = k.checklist.map(() => false);
    state.selectedExp = null;
    state.checksFor = tanda;
  }

  $('#self-komoditas-name').textContent = k.nama.toLowerCase();

  $('#self-spec').innerHTML = `
    <div class="spec">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4v10.5a4 4 0 1 1-4 0V4a2 2 0 1 1 4 0z"/></svg>
      <span>Suhu</span><strong>${k.suhu}</strong>
    </div>
    <div class="spec">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2s6 7.5 6 12a6 6 0 0 1-12 0c0-4.5 6-12 6-12z"/></svg>
      <span>Kelembaban</span><strong>${k.lembab}</strong>
    </div>
    <div class="spec wide warn">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 16H3z"/><path d="M12 10v4"/><path d="M12 17h.01"/></svg>
      <strong style="font-size:12.5px;font-weight:500;line-height:1.45">${k.peringatan}</strong>
    </div>
  `;

  $('#self-materials').innerHTML = k.bahan.map((b) => `<li>${b}</li>`).join('');

  $('#self-checklist').innerHTML = k.checklist
    .map((teks, i) => `
      <li>
        <label class="check-item" data-index="${i}">
          <input type="checkbox" data-index="${i}" ${state.checks[i] ? 'checked' : ''}>
          <span class="check-box"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>
          <span class="check-text">${teks}</span>
        </label>
      </li>`)
    .join('');

  $('#self-exp-hint').textContent = k.coldChain
    ? 'Komoditas ini wajib memakai ekspedisi cold chain.'
    : 'Harga sudah dihitung dari berat barang Anda.';

  renderEkspedisi();
  updateSelfUI();
}

function renderEkspedisi() {
  const k = komoditas();
  $('#self-expedisi').innerHTML = EKSPEDISI.map((e) => {
    const bisa = !k.coldChain || e.coldChain;
    const dipilih = state.selectedExp === e.id;
    return `
      <button class="exp ${dipilih ? 'selected' : ''}" data-exp="${e.id}"
              role="radio" aria-checked="${dipilih}" ${bisa ? '' : 'disabled'}>
        <span class="radio"></span>
        <span class="exp-info">
          <strong>${e.nama}${e.coldChain ? '<span class="tag">Cold chain</span>' : ''}</strong>
          <span>${e.jenis}, ${e.hari}${bisa ? '' : ' — tidak sesuai komoditas ini'}</span>
        </span>
        <span class="exp-price">${rupiah(hitungSelf(e).kirim)}</span>
      </button>`;
  }).join('');
}

function updateSelfUI() {
  const selesai = state.checks.filter(Boolean).length;
  const total = state.checks.length;
  const semuaDicentang = selesai === total;

  // progress bar
  $('#self-progress').style.width = (selesai / total) * 100 + '%';

  // centang visual
  $$('#self-checklist .check-item').forEach((el) => {
    el.classList.toggle('checked', state.checks[Number(el.dataset.index)]);
  });

  // stepper: 1 panduan (selalu selesai dibaca), 2 checklist, 3 ekspedisi
  setStep(1, 'done');
  setStep(2, semuaDicentang ? 'done' : 'current');
  setStep(3, state.selectedExp ? 'done' : semuaDicentang ? 'current' : '');

  // rincian biaya
  const exp = EKSPEDISI.find((e) => e.id === state.selectedExp);
  if (exp) {
    const c = hitungSelf(exp);
    $('#self-cost').innerHTML = `
      <div class="breakdown">
        <div><span>Ongkos kirim ${exp.nama}</span><strong>${rupiah(c.kirim)}</strong></div>
        <div><span>Biaya layanan platform</span><strong>${rupiah(c.platform)}</strong></div>
        <div style="border-top:1px solid var(--border);padding-top:8px;color:var(--ink)"><span>Total</span><strong>${rupiah(c.total)}</strong></div>
      </div>`;
    $('#self-value').innerHTML = kartuNilai(c.total, c.kirim);
  } else {
    $('#self-cost').innerHTML = '';
    $('#self-value').innerHTML = '';
  }

  // tombol konfirmasi + catatan
  const btn = $('#btn-confirm-self');
  btn.disabled = !(semuaDicentang && exp);
  if (!semuaDicentang) {
    $('#self-footer-note').textContent = `Selesaikan checklist packing (${selesai}/${total}).`;
  } else if (!exp) {
    $('#self-footer-note').textContent = 'Pilih ekspedisi untuk melanjutkan.';
  } else {
    $('#self-footer-note').textContent = '';
  }
}

function setStep(n, status) {
  const el = $(`.step[data-step="${n}"]`);
  el.classList.remove('done', 'current');
  if (status) el.classList.add(status);
}

function konfirmasiSelf() {
  const exp = EKSPEDISI.find((e) => e.id === state.selectedExp);
  const c = hitungSelf(exp);
  const n = hitungNilai(c.total, c.kirim);
  simpanPengiriman({
    layanan: 'Self-Packaging',
    ekspedisi: `${exp.nama} (${exp.jenis})`,
    estimasi: exp.hari,
    total: c.total,
    nilaiBarang: n.nilaiBarang,
    terselamatkan: n.terselamatkan
  });
}

/* ---------- SIMPAN & RINGKASAN ---------- */
function buatResi() {
  return 'TX-' + String(Math.floor(100000 + Math.random() * 900000));
}

function simpanPengiriman(detail) {
  const data = {
    resi: buatResi(),
    komoditas: komoditas().nama,
    ...state.shipment,
    ...detail,
    waktu: new Date()
  };
  state.history.unshift(data);
  simpanKeStorage();
  state.viewing = data;
  state.checksFor = null;          // pengiriman selesai, checklist boleh mulai dari nol lagi
  state.navStack = ['home', 'ringkasan'];
  show('ringkasan');
  toast('Pengiriman dikonfirmasi.');
}

function renderRingkasan(d) {
  const jam = d.waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const hariIni = d.waktu.toDateString() === new Date().toDateString();
  const kapan = hariIni
    ? `Hari ini, ${jam}`
    : `${d.waktu.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, ${jam}`;
  const langkahKedua = d.layanan === 'Full Managed' ? 'Dipacking di gudang' : 'Menunggu dijemput ekspedisi';
  const langkahPertama = d.layanan === 'Full Managed' ? 'Menunggu barang tiba di gudang' : 'Packing selesai oleh pengirim';

  $('#ringkasan-content').innerHTML = `
    <div class="success">
      <div class="success-badge"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div>
      <h2>Pengiriman dikonfirmasi</h2>
      <p>Simulasi, belum terhubung ke ekspedisi asli.</p>
    </div>

    <div class="detail-card">
      <div class="detail-row"><span>No. resi</span><strong>${d.resi}</strong></div>
      <div class="detail-row"><span>Status</span><span class="status-badge">Diproses</span></div>
      <div class="detail-row"><span>Layanan</span><strong>${d.layanan}</strong></div>
      <div class="detail-row"><span>Komoditas</span><strong>${d.komoditas}, ${d.berat.toLocaleString('id-ID')} kg</strong></div>
      <div class="detail-row"><span>Rute</span><strong>${escapeHTML(d.asal)} ke ${escapeHTML(d.tujuan)}</strong></div>
      <div class="detail-row"><span>Ekspedisi</span><strong>${d.ekspedisi}</strong></div>
      <div class="detail-row"><span>Estimasi tiba</span><strong>${d.estimasi}</strong></div>
      <div class="detail-row"><span>Total biaya</span><strong>${rupiah(d.total)}</strong></div>
    </div>

    ${d.terselamatkan ? `
      <div class="value-card compact">
        <div class="value-hero">
          <span>Estimasi kerugian yang dicegah</span>
          <strong>${rupiah(d.terselamatkan)}</strong>
        </div>
        <p class="value-note">Dari nilai barang <b>${rupiah(d.nilaiBarang)}</b> yang dikirim.</p>
      </div>` : ''}

    <h2 class="section-label">Status pengiriman</h2>
    <ul class="timeline">
      <li class="done"><span class="dot"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>
        <div><strong>Pesanan dibuat</strong><small>${kapan}</small></div></li>
      <li class="now"><span class="dot"></span>
        <div><strong>${langkahPertama}</strong><small>Sedang berlangsung</small></div></li>
      <li class="todo"><span class="dot"></span><div><strong>${langkahKedua}</strong></div></li>
      <li class="todo"><span class="dot"></span><div><strong>Dalam perjalanan</strong></div></li>
      <li class="todo"><span class="dot"></span><div><strong>Tiba di tujuan</strong></div></li>
    </ul>
  `;
}

/* ---------- LAYAR: RIWAYAT ---------- */
function renderRiwayat() {
  const el = $('#riwayat-list');
  if (!state.history.length) {
    el.innerHTML = `
      <div class="empty">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/></svg>
        <p>Belum ada pengiriman. Buat pengiriman pertama dari halaman Home.</p>
        <button class="btn btn-primary" data-go-reset="input">Cek pengiriman baru</button>
      </div>`;
    return;
  }
  el.innerHTML = state.history.map((d) => `
    <button class="history-item" data-resi="${d.resi}">
      <div class="history-top"><strong>${d.resi}</strong><span class="status-badge">Diproses</span></div>
      <p>${d.komoditas}, ${d.berat.toLocaleString('id-ID')} kg — ${escapeHTML(d.asal)} ke ${escapeHTML(d.tujuan)}</p>
      <div class="history-meta"><span>${d.layanan}</span><span>${rupiah(d.total)}</span></div>
    </button>`).join('');
}

/* ---------- KEAMANAN INPUT ---------- */
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ---------- EVENT LISTENER ---------- */
document.addEventListener('click', (e) => {
  const goBtn = e.target.closest('[data-go]');
  if (goBtn) return go(goBtn.dataset.go);

  const resetBtn = e.target.closest('[data-go-reset]');
  if (resetBtn) { state.navStack = ['home']; return go(resetBtn.dataset.goReset); }

  if (e.target.closest('[data-back]')) return back();

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
  if (histBtn) {
    state.viewing = state.history.find((d) => d.resi === histBtn.dataset.resi);
    return go('ringkasan');
  }

  const expBtn = e.target.closest('[data-exp]');
  if (expBtn && !expBtn.disabled) {
    state.selectedExp = expBtn.dataset.exp;
    renderEkspedisi();
    updateSelfUI();
  }
});

document.addEventListener('change', (e) => {
  if (e.target.matches('#self-checklist input[type="checkbox"]')) {
    state.checks[Number(e.target.dataset.index)] = e.target.checked;
    updateSelfUI();
  }
});

$('#btn-input-next').addEventListener('click', validasiInput);
$('#btn-confirm-managed').addEventListener('click', konfirmasiManaged);
$('#btn-confirm-self').addEventListener('click', konfirmasiSelf);
$('#btn-home').addEventListener('click', () => resetTo('home'));

// ketik manual di kolom berat membatalkan pilihan tombol cepat
$('#f-berat').addEventListener('input', () => {
  $$('#berat-chips .chip').forEach((c) => c.classList.remove('active'));
});

/* ---------- INIT ---------- */
muatDariStorage();
isiDropdownKomoditas();
buatCombo('combo-asal', { sentraDulu: true });
buatCombo('combo-tujuan');
show('home');
