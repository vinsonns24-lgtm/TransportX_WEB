/* =========================================================
   TransportX — Toko kopi dan Jual kopi (model bisnis v3)
   - Toko: roastery, kafe, dan restoran membeli green bean yang sudah di-grade.
   - Jual kopi: petani menjual ke TransportX, titip jual di toko, atau titip simpan.
   Data (GRADE_SNI, HARGA_KOPI, PRODUK, KOMISI_TOKO, TITIP_SIMPAN_PER_KG_BULAN) ada di script.js.
   Dimuat setelah script.js, visual.js, dan mitra.js.
   Semua harga, grade, dan nama petani masih CONTOH untuk simulasi.
   ========================================================= */

const produk = (id) => PRODUK.find((p) => p.id === id);
const dariPetani = (p) => p.penjual !== 'TransportX';
const namaPenjual = (p) => (dariPetani(p) ? mitra(p.penjual).nama : 'TransportX');
const desimal = (n) => n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const ruteToko = () => RUTE.find((r) => r.id === 'darat-reg');
const TUJUAN_TOKO = KOTA.filter((k) => k.nama !== TOKO_ASAL);
const CATATAN_KOPI = 'Harga kopi, grade, dan nama petani masih contoh untuk simulasi.';

const IKON_BIJI = '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="6.2" ry="9" transform="rotate(35 12 12)"/><path d="M8.6 6.8c3.2 2.4 3.4 7.6 6.8 10.4"/></svg>';
const IKON_TOKO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9l1-5h14l1 5"/><path d="M4 9h16v11H4z"/><path d="M9 20v-6h6v6"/></svg>';

const badgeGrade = (id) => `<span class="grade-badge g-${id}">${grade(id).nama}</span>`;
const labelPenjual = (p) => (dariPetani(p)
  ? '<span class="penjual petani">Dijual petani</span>'
  : '<span class="penjual tx">Dijual TransportX</span>');

/* Tabel grade SNI 2907:2008, baris grade yang sedang dibahas disorot */
function tabelGradeHTML(sorot) {
  const baris = GRADE_SNI.map((g) => {
    const rentang = g.maks === Infinity ? `> ${g.dari - 1}` : g.dari === 0 ? `≤ ${g.maks}` : `${g.dari}–${g.maks}`;
    return `<tr class="${g.id === sorot ? 'on' : ''}"><td>${g.nama}</td><td>${rentang}</td></tr>`;
  }).join('');
  return `
    <table class="tabel-grade">
      <thead><tr><th>Grade</th><th>Nilai cacat per 300 g</th></tr></thead>
      <tbody>${baris}</tbody>
    </table>
    <p class="hint-kecil">SNI 2907:2008 Biji kopi. Kadar air maksimal ${desimal(KADAR_AIR_MAKS)}%.</p>`;
}

/* ===================== TOKO: KATALOG ===================== */
function kartuProduk(p) {
  return `
    <button type="button" class="produk-card" data-produk="${p.id}">
      <span class="produk-ikon ${p.jenis}">${IKON_BIJI}</span>
      <span class="produk-isi">
        <strong>${p.nama}</strong>
        <span class="produk-asal">${p.desa} · panen ${p.panen}</span>
        <span class="produk-tag">${badgeGrade(p.grade)}<span class="tag-polos">Kadar air ${desimal(p.kadarAir)}%</span>${labelPenjual(p)}</span>
        <span class="produk-bawah">
          <span class="produk-harga">${rupiah(p.harga)}<small>/kg</small></span>
          <span class="produk-stok">Stok ${angka(p.stok)} kg · min. ${p.minKg} kg</span>
        </span>
      </span>
    </button>`;
}

function renderToko() {
  const f = state.toko.filter;
  const daftar = PRODUK.filter((p) => f === 'semua' || p.jenis === f);
  $('#toko-content').innerHTML = `
    <div class="toko-intro">
      <span class="toko-intro-ikon">${IKON_BIJI}</span>
      <div>
        <strong>Kopi Jawa Tengah, sudah disortir dan di-grade</strong>
        <p>Green bean dari petani Temanggung, dicek mutunya mengikuti SNI 2907:2008, lalu dikirim lewat darat dari gudang mitra Semarang ke kota Anda.</p>
      </div>
    </div>
    <div class="chips" role="radiogroup" aria-label="Saring jenis kopi">
      ${[['semua', 'Semua'], ['robusta', 'Robusta'], ['arabika', 'Arabika']].map(([id, nama]) =>
        `<button type="button" class="chip ${f === id ? 'active' : ''}" role="radio" aria-checked="${f === id}" data-filter-toko="${id}">${nama}</button>`).join('')}
    </div>
    <div class="produk-list">${daftar.map(kartuProduk).join('')}</div>
    <p class="value-disclaimer">"Dijual petani" berarti harga ditentukan petani; TransportX menyimpan, mengecek mutu, mengirim, dan mengambil komisi ${KOMISI_TOKO * 100}%. ${CATATAN_KOPI}</p>`;
}

/* ===================== TOKO: DETAIL & PESAN ===================== */
function hitungToko(p, kg) {
  const r = ruteToko();
  const hargaKopi = p.harga * kg;
  const kirim = ongkir(r, kg);
  const rincian = [
    ['Harga kopi', hargaKopi, `${angka(kg)} kg × ${rupiah(p.harga)}`],
    [`Ongkos kirim ${r.nama.toLowerCase()}`, kirim, `${r.mitra} · ${rumusOngkir(r, kg)}`]
  ];
  let bagi;
  if (dariPetani(p)) {
    const komisi = Math.round(hargaKopi * KOMISI_TOKO);
    bagi = {
      petani: hargaKopi - komisi, mitra: kirim, tx: komisi,
      nama: { petani: 'Diterima petani', tx: 'Komisi TransportX' },
      ket: { petani: `${namaPenjual(p)}, ${100 - KOMISI_TOKO * 100}% harga kopi`, mitra: 'ongkos kirim ke ekspedisi', tx: `komisi toko ${KOMISI_TOKO * 100}%` }
    };
  } else {
    const beli = HARGA_KOPI[p.jenis][p.grade].beli;
    bagi = {
      petani: beli * kg, mitra: kirim, tx: (p.harga - beli) * kg,
      nama: { petani: 'Harga beli dari petani', tx: 'Margin TransportX' },
      ket: { petani: `${rupiah(beli)}/kg, dibayar saat TransportX membeli`, mitra: 'ongkos kirim ke ekspedisi', tx: `selisih harga jual dan beli, ${rupiah(p.harga - beli)}/kg` }
    };
  }
  return { rute: r, rincian, bagi, total: hargaKopi + kirim };
}

function cekJumlah(p, kg) {
  if (!kg || kg < p.minKg) return `Minimal pembelian ${p.minKg} kg.`;
  if (kg > p.stok) return `Stok tersedia ${angka(p.stok)} kg.`;
  return '';
}

function renderProduk() {
  const p = produk(state.toko.produk);
  if (!p) return;
  if (!state.toko.kg) state.toko.kg = Math.min(p.stok, Math.max(p.minKg, 50));
  const g = grade(p.grade);
  const pilihanKg = [p.minKg, 50, 100, 250].filter((v, i, a) => v <= p.stok && a.indexOf(v) === i);
  $('#produk-content').innerHTML = `
    <div class="produk-head">
      <span class="produk-ikon besar ${p.jenis}">${IKON_BIJI}</span>
      <div>
        <h2>${p.nama}</h2>
        <span class="produk-tag">${badgeGrade(p.grade)}${labelPenjual(p)}</span>
      </div>
    </div>
    ${dariPetani(p) ? `<div class="lapak-note">Dijual oleh <b>${namaPenjual(p)}</b>. Harga ditentukan petani; TransportX menyimpan kopi di gudang, mengecek mutu, dan mengirim ke Anda.</div>` : ''}

    <div class="info-card">
      <dl class="ringkas">
        <div><dt>Grade (SNI 2907:2008)</dt><dd>${g.nama}</dd></div>
        <div><dt>Nilai cacat per 300 g</dt><dd>${p.cacat}</dd></div>
        <div><dt>Kadar air</dt><dd>${desimal(p.kadarAir)}%</dd></div>
        <div><dt>Proses</dt><dd>${p.proses}</dd></div>
        <div><dt>Desa asal</dt><dd>${p.desa}, Temanggung</dd></div>
        <div><dt>Panen</dt><dd>${p.panen}</dd></div>
        <div><dt>Stok</dt><dd>${angka(p.stok)} kg</dd></div>
        <div><dt>Harga</dt><dd>${rupiah(p.harga)}/kg</dd></div>
      </dl>
      <button type="button" class="btn btn-ghost btn-wide" data-go="qc">Lihat laporan QC</button>
    </div>

    <section class="form-card">
      <h2 class="form-title"><span>1</span>Pesan kopi</h2>
      <div class="field">
        <label for="toko-kg">Jumlah (kg)</label>
        <input id="toko-kg" type="number" min="${p.minKg}" max="${p.stok}" inputmode="numeric" value="${state.toko.kg}">
        <div class="chips">${pilihanKg.map((v) => `<button type="button" class="chip ${state.toko.kg === v ? 'active' : ''}" data-toko-kg="${v}">${v} kg</button>`).join('')}</div>
        <p class="field-help" id="toko-kg-help">Minimal pembelian ${p.minKg} kg, stok ${angka(p.stok)} kg.</p>
      </div>
      <div class="field">
        <label for="toko-tujuan">Kota tujuan</label>
        <div class="select-wrap">
          <select id="toko-tujuan">${TUJUAN_TOKO.map((k) => `<option ${k.nama === state.toko.tujuan ? 'selected' : ''}>${k.nama}</option>`).join('')}</select>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <p class="field-help">Dikirim dari gudang mitra ${TOKO_ASAL} lewat darat reguler (${hariTeks(ruteToko())}).</p>
      </div>
    </section>

    <div class="route-card" id="toko-peta"></div>
    <div class="cost-card" id="toko-rincian"></div>`;
  perbaruiPesanToko();
}

function perbaruiPesanToko() {
  const p = produk(state.toko.produk);
  const kg = state.toko.kg;
  const salah = cekJumlah(p, kg);
  $('#toko-kg').classList.toggle('invalid', !!salah);
  $('#toko-kg-help').textContent = salah || `Minimal pembelian ${p.minKg} kg, stok ${angka(p.stok)} kg.`;
  $$('[data-toko-kg]').forEach((c) => c.classList.toggle('active', Number(c.dataset.tokoKg) === kg));
  $('#toko-peta').innerHTML = petaRute({ asal: TOKO_ASAL, tujuan: state.toko.tujuan, layanan: LAYANAN_TOKO });
  if (salah) {
    $('#toko-rincian').innerHTML = `<h3>Rincian biaya</h3><p class="hint-kecil">${salah}</p>`;
    $('#produk-total').textContent = '—';
    $('#btn-toko-lanjut').disabled = true;
    return;
  }
  const h = hitungToko(p, kg);
  $('#toko-rincian').innerHTML = `<h3>Rincian biaya</h3>${rincianHTML(h.rincian, h.total, h.bagi)}<p class="value-disclaimer">${CATATAN_KOPI}</p>`;
  $('#produk-total').textContent = rupiah(h.total);
  $('#btn-toko-lanjut').disabled = false;
}

function lanjutToko() {
  const p = produk(state.toko.produk);
  if (cekJumlah(p, state.toko.kg)) return toast(cekJumlah(p, state.toko.kg));
  const h = hitungToko(p, state.toko.kg);
  state.draft = { jenis: 'toko', layanan: LAYANAN_TOKO, produkId: p.id, kg: state.toko.kg, tujuan: state.toko.tujuan, ...h };
  go('bayar');
}

/* ===================== TOKO: LAPORAN QC ===================== */
function renderQC() {
  const p = produk(state.toko.produk);
  if (!p) return;
  const g = grade(p.grade);
  $('#qc-content').innerHTML = `
    <div class="produk-head">
      <span class="produk-ikon besar ${p.jenis}">${IKON_BIJI}</span>
      <div><h2>${p.nama}</h2><span class="produk-tag">${badgeGrade(p.grade)}<span class="tag-polos">Lolos cek mutu</span></span></div>
    </div>
    <div class="stat-row">
      <div><strong>${g.nama}</strong><span>grade SNI</span></div>
      <div><strong>${p.cacat}</strong><span>nilai cacat per 300 g</span></div>
      <div><strong>${desimal(p.kadarAir)}%</strong><span>kadar air (maks. ${desimal(KADAR_AIR_MAKS)}%)</span></div>
    </div>
    <div class="info-card">
      <h3>Laporan cek mutu</h3>
      <dl class="ringkas">
        <div><dt>Tanggal cek</dt><dd>${p.tglQC}</dd></div>
        <div><dt>Petugas</dt><dd>Petugas QC TransportX</dd></div>
        <div><dt>Lokasi</dt><dd>${namaGudang('kering')}</dd></div>
        <div><dt>Sampel</dt><dd>300 g, diambil acak dari karung</dd></div>
      </dl>
      ${fotoHTML('Foto sampel 300 g sebelum disortir')}
      ${fotoHTML('Biji cacat yang dipisahkan dan dihitung')}
    </div>
    <div class="info-card">
      <h3>Posisi grade</h3>
      ${tabelGradeHTML(p.grade)}
    </div>`;
}

/* ===================== PEMBAYARAN, LACAK, PELAKSANA (pesanan toko) ===================== */
function renderBayarToko() {
  const d = state.draft;
  const p = produk(d.produkId);
  $('#bayar-content').innerHTML = `
    <div class="route-card">${petaRute({ asal: TOKO_ASAL, tujuan: d.tujuan, layanan: LAYANAN_TOKO })}</div>
    <div class="pay-card">
      <div class="pay-row"><span>Layanan</span><strong>${LAYANAN_TOKO}</strong></div>
      <div class="pay-row"><span>Produk</span><strong>${p.nama}, ${angka(d.kg)} kg</strong></div>
      <div class="pay-row"><span>Penjual</span><strong>${namaPenjual(p)}</strong></div>
      <div class="pay-row"><span>Rute</span><strong>Gudang ${TOKO_ASAL} ke ${escapeHTML(d.tujuan)}</strong></div>
      <div class="pay-row"><span>Pengiriman</span><strong>${d.rute.nama}, ${hariTeks(d.rute)}</strong></div>
    </div>

    <div class="pay-card">
      <h3>Rincian biaya</h3>
      ${rincianHTML(d.rincian, d.total, d.bagi)}
    </div>

    ${kartuPelaksanaToko(d)}

    ${pilihanBayarHTML()}

    ${kartuPerlindunganToko()}

    <p class="hint">Pesanan bisa dibatalkan gratis sebelum dibayar.</p>`;
  $('#bayar-total').textContent = rupiah(d.total);
}

function kartuPerlindunganToko() {
  return `
    <div class="protect-card">
      <div class="protect-head">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>
        <strong>Perlindungan kopi dari toko</strong>
      </div>
      <p>Kopi dari Toko TransportX menjadi tanggungan <b>TransportX</b> sampai diterima, bukan mitra. Kalau kopi rusak, basah, atau beratnya kurang, CS kami mengganti kopi atau mengembalikan uang.</p>
      <button class="link-inline" data-go="perlindungan">Lihat cara klaim</button>
    </div>`;
}

function dataPesananToko(d) {
  const p = produk(d.produkId);
  return {
    key: 'kopi', komoditas: p.nama, simpan: 'kering', produkId: p.id, penjual: namaPenjual(p),
    berat: d.kg, nilai: p.harga * d.kg, asal: TOKO_ASAL, tujuan: d.tujuan,
    layanan: LAYANAN_TOKO, serah: null, hub: GUDANG, kemasan: null,
    rute: { nama: d.rute.nama, moda: d.rute.moda, mitra: d.rute.mitra, mitraId: d.rute.mitraId, dingin: d.rute.dingin, hari: d.rute.hari }
  };
}

function tahapanToko(d) {
  const p = produk(d.produkId) || PRODUK[0];
  const angkut = `${d.rute.mitra} (ekspedisi)`;
  return [
    { judul: 'Pesanan dibayar', oleh: 'TransportX', tanggungan: 'TransportX' },
    { judul: 'Ditimbang, dicek ulang, dan dikemas', oleh: 'Petugas QC TransportX', tanggungan: 'TransportX', lokasi: namaGudang('kering'),
      catatan: `${grade(p.grade).nama} · nilai cacat ${p.cacat} · kadar air ${desimal(p.kadarAir)}%`, grade: true, foto: 'Foto sampel dan kemasan sebelum dikirim' },
    { judul: 'Dalam perjalanan (darat)', oleh: angkut, tanggungan: 'TransportX', lokasi: `Menuju ${d.tujuan}` },
    { judul: 'Tiba di tujuan', oleh: angkut, tanggungan: 'TransportX', lokasi: d.tujuan, foto: 'Foto saat tiba dan diterima' }
  ];
}

function kartuPelaksanaToko(d) {
  const p = produk(d.produkId) || PRODUK[0];
  const gudang = mitra('lumbung');
  const angkut = mitra(d.rute.mitraId) || mitra('trans-jawa');
  const baris = [
    ['Penjual kopi', namaPenjual(p), dariPetani(p) ? 'mitra' : 'tx', dariPetani(p) ? 'Petani' : 'TransportX', dariPetani(p) ? p.penjual : null],
    ['Sortir, grading, dan cek mutu', 'Petugas QC TransportX', 'tx', 'TransportX'],
    ['Simpan stok kopi', gudang.nama, 'mitra', gudang.label, gudang.id],
    [`Angkut sampai ${d.tujuan}`, angkut.nama, 'mitra', 'Ekspedisi', angkut.id],
    ['Ganti rugi kalau kopi rusak atau kurang', 'CS TransportX', 'tx', 'TransportX']
  ];
  return `
    <div class="info-card who-card">
      <h3>Siapa yang mengerjakan pesanan Anda</h3>
      <ul class="who-list">
        ${baris.map(([tugas, siapa, jenis, label, id]) => `
          <li>
            <span class="who-task">${escapeHTML(tugas)}</span>
            <span class="who-name">${id
              ? `<button type="button" class="who-link" data-mitra="${id}">${escapeHTML(siapa)}</button>`
              : escapeHTML(siapa)}<em class="who-tag ${jenis}">${label}</em></span>
          </li>`).join('')}
      </ul>
      <p class="value-disclaimer">Kopi dari toko menjadi tanggungan TransportX sampai diterima pembeli. ${CATATAN_KOPI}</p>
    </div>`;
}

/* ===================== JUAL KOPI (petani) ===================== */
const CARA_JUAL = {
  jual: { nama: 'Jual ke TransportX', ket: 'Dibayar sesuai grade setelah dicek mutunya.' },
  titip: { nama: 'Titip jual di toko', ket: `Anda tentukan harganya, TransportX ambil komisi ${KOMISI_TOKO * 100}% setelah laku.` },
  simpan: { nama: 'Titip simpan', ket: `Simpan di gudang kering, ${rupiah(TITIP_SIMPAN_PER_KG_BULAN)}/kg per bulan. Jual nanti saat harga bagus.` }
};
const jualBaru = () => ({ jenis: 'robusta', berat: 100, desa: '', kota: 'Temanggung', serah: 'antar', cara: 'jual', harga: 95000, bulan: 3, hasil: null, selesai: false });

function tabelHargaBeliHTML(jenis) {
  const h = HARGA_KOPI[jenis];
  return `
    <table class="tabel-grade">
      <thead><tr><th>Grade</th><th>Harga beli</th><th>Harga di toko</th></tr></thead>
      <tbody>${['M1', 'M2', 'M3', 'AS'].map((id) =>
        `<tr><td>${grade(id).nama}</td><td>${rupiah(h[id].beli)}/kg</td><td>${h[id].jual ? rupiah(h[id].jual) + '/kg' : 'Disortir dulu'}</td></tr>`).join('')}</tbody>
    </table>`;
}

function renderJual() {
  if (!state.jual || state.jual.selesai) state.jual = jualBaru();
  const j = state.jual;
  const pilihan = (attr, nilai, aktif, judul, ket, harga = '') => `
    <button class="choice ${aktif ? 'selected' : ''}" data-${attr}="${nilai}" role="radio" aria-checked="${aktif}">
      <span class="radio"></span>
      <span class="choice-info"><strong>${judul}</strong><span>${ket}</span></span>
      ${harga ? `<span class="choice-price">${harga}</span>` : ''}
    </button>`;
  $('#jual-content').innerHTML = `
    <div class="toko-intro">
      <span class="toko-intro-ikon">${IKON_BIJI}</span>
      <div>
        <strong>Jual kopi ke TransportX</strong>
        <p>Kopi Anda dicek mutunya di gudang mitra ${GUDANG}. Harga mengikuti grade SNI 2907:2008, bukan ditawar per karung.</p>
      </div>
    </div>

    <section class="form-card">
      <h2 class="form-title"><span>1</span>Kopi Anda</h2>
      <div class="field">
        <label>Jenis kopi</label>
        <div class="chips">${[['robusta', 'Robusta'], ['arabika', 'Arabika']].map(([id, nama]) =>
          `<button type="button" class="chip ${j.jenis === id ? 'active' : ''}" data-jual-jenis="${id}">${nama}</button>`).join('')}</div>
      </div>
      <div class="field">
        <label for="jual-berat">Perkiraan berat (kg)</label>
        <input id="jual-berat" type="number" min="10" inputmode="numeric" value="${j.berat || ''}" placeholder="Contoh: 100">
        <div class="chips">${[50, 100, 250, 500].map((v) => `<button type="button" class="chip ${j.berat === v ? 'active' : ''}" data-jual-berat="${v}">${v} kg</button>`).join('')}</div>
        <p class="field-help">Berat pasti ditimbang ulang di gudang.</p>
      </div>
      <div class="field">
        <label for="jual-desa">Desa asal</label>
        <input id="jual-desa" type="text" value="${escapeHTML(j.desa)}" placeholder="Contoh: Desa Wonotirto">
      </div>
      <div class="field">
        <label for="jual-kota">Kabupaten atau kota</label>
        <div class="select-wrap">
          <select id="jual-kota">${KOTA_ASAL.map((k) => `<option ${k.nama === j.kota ? 'selected' : ''}>${k.nama}</option>`).join('')}</select>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>
      <div class="field">
        <label>Kopi diserahkan dengan cara</label>
        <div class="choice-list" role="radiogroup" aria-label="Cara serah kopi">
          ${pilihan('jual-serah', 'antar', j.serah === 'antar', 'Antar sendiri ke gudang', namaGudang('kering'), 'Gratis')}
          ${pilihan('jual-serah', 'jemput', j.serah === 'jemput', 'Dijemput dari kebun', `${KURIR_LOKAL}, per trip`, rupiah(BIAYA_JEMPUT))}
        </div>
      </div>
    </section>

    <section class="form-card">
      <h2 class="form-title"><span>2</span>Pilih cara</h2>
      <div class="choice-list" role="radiogroup" aria-label="Cara jual">
        ${Object.entries(CARA_JUAL).map(([id, c]) => pilihan('jual-cara', id, j.cara === id, c.nama, c.ket)).join('')}
      </div>
      ${j.cara === 'jual' ? `<p class="sub-label">Harga beli ${j.jenis} per grade</p>${tabelHargaBeliHTML(j.jenis)}<p class="hint-kecil">Harga contoh untuk simulasi.</p>` : ''}
      ${j.cara === 'titip' ? `
        <div class="field">
          <label for="jual-harga">Harga jual Anda per kg</label>
          <input id="jual-harga" type="text" inputmode="numeric" value="${j.harga ? angka(j.harga) : ''}" placeholder="Contoh: 95.000">
          <p class="field-help">Sebagai acuan, ${j.jenis} Mutu 2 di toko TransportX ${rupiah(HARGA_KOPI[j.jenis].M2.jual)}/kg. Komisi ${KOMISI_TOKO * 100}% dipotong setelah laku.</p>
        </div>` : ''}
      ${j.cara === 'simpan' ? `
        <div class="field">
          <label>Lama simpan</label>
          <div class="chips">${[1, 2, 3, 4, 5, 6].map((b) => `<button type="button" class="chip ${j.bulan === b ? 'active' : ''}" data-jual-bulan="${b}">${b} bulan</button>`).join('')}</div>
          <p class="field-help">Disimpan di gudang kering ber-AC 20–25°C, kelembapan 50–60%.</p>
        </div>` : ''}
    </section>

    <div class="info-card">
      <h3>Cara mendapat grade lebih tinggi</h3>
      <p>Grade dihitung dari jumlah biji cacat (hitam, pecah, berlubang, berjamur) dalam 300 g sampel, mengikuti SNI 2907:2008. Semakin sedikit cacat, semakin tinggi grade dan harganya.</p>
      <ul class="tips">
        <li><b>Petik merah:</b> hanya petik buah yang sudah merah.</li>
        <li><b>Sortir:</b> buang biji hitam, pecah, dan berlubang sebelum dijual.</li>
        <li><b>Jemur sampai kering:</b> kadar air maksimal ${desimal(KADAR_AIR_MAKS)}% supaya tidak berjamur.</li>
      </ul>
      ${tabelGradeHTML(null)}
    </div>
    <p class="value-disclaimer">${CATATAN_KOPI}</p>`;
}

function bacaFormJual() {
  const j = state.jual;
  if (!j || !$('#jual-berat')) return;
  j.berat = Number($('#jual-berat').value) || 0;
  j.desa = $('#jual-desa').value.trim();
  j.kota = $('#jual-kota').value;
  if ($('#jual-harga')) j.harga = angkaDariTeks($('#jual-harga').value);
}

/* hasil cek mutu simulasi: kebanyakan Mutu 2, kadang Mutu 1 atau 3 */
function simulasiCekMutu() {
  const r = Math.random();
  const cacat = r < 0.25 ? 6 + Math.floor(Math.random() * 6) : r < 0.85 ? 12 + Math.floor(Math.random() * 14) : 26 + Math.floor(Math.random() * 15);
  const kadarAir = Math.round((11.2 + Math.random() * 1.2) * 10) / 10;
  return { cacat, kadarAir };
}

function kirimJual() {
  bacaFormJual();
  const j = state.jual;
  if (!j.berat || j.berat < 10) { $('#jual-berat').classList.add('invalid'); return toast('Isi perkiraan berat minimal 10 kg.'); }
  if (!j.desa) { $('#jual-desa').classList.add('invalid'); return toast('Isi desa asal kopi.'); }
  if (j.cara === 'titip' && (!j.harga || j.harga < 10000)) { $('#jual-harga').classList.add('invalid'); return toast('Isi harga jual per kg.'); }
  j.hasil = simulasiCekMutu();
  j.selesai = false;
  go('hasilqc');
}

function rincianJualHTML(j, g) {
  const baris = [];
  const jemput = j.serah === 'jemput' ? BIAYA_JEMPUT : 0;
  const harga = HARGA_KOPI[j.jenis][g.id] || HARGA_KOPI[j.jenis].AS;
  let total, labelTotal, catatan;
  if (j.cara === 'jual') {
    const nilai = harga.beli * j.berat;
    baris.push([`Harga beli ${g.nama}`, `${rupiah(harga.beli)}/kg`], ['Berat ditimbang', `${angka(j.berat)} kg`], ['Nilai kopi', rupiah(nilai)]);
    if (jemput) baris.push(['Biaya jemput', `−${rupiah(jemput)}`]);
    total = nilai - jemput; labelTotal = 'Diterima petani';
    catatan = 'Dibayar ke rekening setelah kopi ditimbang ulang di gudang (simulasi).';
  } else if (j.cara === 'titip') {
    const nilai = j.harga * j.berat;
    const komisi = Math.round(nilai * KOMISI_TOKO);
    baris.push(['Harga jual Anda', `${rupiah(j.harga)}/kg`], ['Perkiraan nilai jual', rupiah(nilai)], [`Komisi TransportX ${KOMISI_TOKO * 100}%`, `−${rupiah(komisi)}`]);
    if (jemput) baris.push(['Biaya jemput', `−${rupiah(jemput)}`]);
    total = nilai - komisi - jemput; labelTotal = 'Perkiraan diterima petani';
    catatan = `Kopi tampil di Toko dengan label "Dijual petani" dan grade ${g.nama}. Uang dibayar setelah kopi laku. Harga toko TransportX untuk ${g.nama}: ${harga.jual ? rupiah(harga.jual) + '/kg' : 'disortir dulu'}.`;
  } else {
    const biaya = TITIP_SIMPAN_PER_KG_BULAN * j.berat * j.bulan;
    baris.push(['Berat disimpan', `${angka(j.berat)} kg`], ['Lama simpan', `${j.bulan} bulan`], ['Tarif', `${rupiah(TITIP_SIMPAN_PER_KG_BULAN)}/kg per bulan`], ['Biaya simpan', rupiah(biaya)]);
    if (jemput) baris.push(['Biaya jemput', rupiah(jemput)]);
    total = biaya + jemput; labelTotal = 'Total biaya titip simpan';
    catatan = `Selama disimpan, kopi bisa dijual ke TransportX atau dititip jual kapan saja. Kalau dijual sekarang ke TransportX: ${rupiah(harga.beli * j.berat)}.`;
  }
  return `
    <div class="pay-card">
      <h3>${CARA_JUAL[j.cara].nama}</h3>
      ${baris.map(([l, v]) => `<div class="pay-row"><span>${l}</span><strong>${v}</strong></div>`).join('')}
      <div class="breakdown-total"><span>${labelTotal}</span><strong>${rupiah(total)}</strong></div>
      <p class="hint-kecil">${catatan}</p>
    </div>`;
}

function renderHasilQC() {
  const j = state.jual;
  if (!j?.hasil) return;
  const g = gradeDariCacat(j.hasil.cacat);
  $('#hasil-content').innerHTML = `
    ${j.selesai ? `
      <div class="hasil-selesai">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16.5 9.5"/></svg>
        <div><strong>${j.cara === 'simpan' ? 'Kopi dititip simpan' : 'Penawaran diterima'}</strong>
        <p>${j.cara === 'jual' ? 'Uang dikirim ke rekening Anda setelah kopi ditimbang ulang.' : j.cara === 'titip' ? 'Kopi Anda sekarang tampil di Toko TransportX.' : `Kopi disimpan di ${namaGudang('kering')} selama ${j.bulan} bulan.`} (simulasi)</p></div>
      </div>` : ''}
    <div class="hasil-head">
      <span class="grade-besar g-${g.id}">${g.nama}</span>
      <div>
        <strong>Hasil cek mutu</strong>
        <span>${j.jenis === 'robusta' ? 'Robusta' : 'Arabika'} · ${angka(j.berat)} kg · ${escapeHTML(j.desa)}, ${j.kota}</span>
      </div>
    </div>
    <div class="stat-row">
      <div><strong>${g.nama}</strong><span>grade SNI</span></div>
      <div><strong>${j.hasil.cacat}</strong><span>nilai cacat per 300 g</span></div>
      <div><strong>${desimal(j.hasil.kadarAir)}%</strong><span>kadar air (maks. ${desimal(KADAR_AIR_MAKS)}%)</span></div>
    </div>
    <div class="info-card">
      <h3>Foto sampel</h3>
      ${fotoHTML('Sampel 300 g dari karung Anda')}
      ${fotoHTML('Biji cacat yang dipisahkan dan dihitung')}
      <p class="hint-kecil">Dicek oleh Petugas QC TransportX di ${namaGudang('kering')}.</p>
    </div>
    ${rincianJualHTML(j, g)}
    <div class="info-card">
      <h3>Posisi grade</h3>
      ${tabelGradeHTML(g.id)}
      ${g.id !== 'M1' ? '<p class="hint-kecil">Untuk naik grade: petik merah, sortir biji hitam dan pecah, dan jemur sampai kadar air di bawah 12,5%.</p>' : ''}
    </div>
    <p class="value-disclaimer">Hasil cek mutu ini simulasi. ${CATATAN_KOPI}</p>`;
  $('#hasil-footer').innerHTML = j.selesai
    ? '<button class="btn btn-primary btn-wide" data-home>Kembali ke beranda</button>'
    : j.cara === 'simpan'
      ? `<button class="btn btn-primary btn-wide" data-hasil="setuju">Setuju titip simpan</button>
         <button class="btn btn-ghost btn-wide" data-hasil="jual">Jual sekarang ke TransportX</button>
         <button class="btn-text" data-home>Kembali ke beranda</button>`
      : `<button class="btn btn-primary btn-wide" data-hasil="setuju">Terima &amp; jual</button>
         <button class="btn btn-ghost btn-wide" data-hasil="simpan">Titip simpan dulu</button>
         <button class="btn-text" data-home>Kembali ke beranda</button>`;
  $('#hasilqc-body').scrollTo(0, 0);
}

/* ===================== PASANG ===================== */
RENDER.toko = renderToko;
RENDER.produk = renderProduk;
RENDER.qc = renderQC;
RENDER.jual = renderJual;
RENDER.hasilqc = renderHasilQC;
RENDER.bayar = () => (state.draft?.jenis === 'toko' ? renderBayarToko() : renderBayar());

document.addEventListener('click', (e) => {
  const f = e.target.closest('[data-filter-toko]');
  if (f) { state.toko.filter = f.dataset.filterToko; return renderToko(); }
  const pr = e.target.closest('[data-produk]');
  if (pr) {
    state.toko.produk = pr.dataset.produk;
    state.toko.kg = null;
    return go('produk');
  }
  const kg = e.target.closest('[data-toko-kg]');
  if (kg) { state.toko.kg = Number(kg.dataset.tokoKg); $('#toko-kg').value = state.toko.kg; return perbaruiPesanToko(); }

  const jj = e.target.closest('[data-jual-jenis]');
  if (jj) { bacaFormJual(); state.jual.jenis = jj.dataset.jualJenis; return renderJual(); }
  const jb = e.target.closest('[data-jual-berat]');
  if (jb) { bacaFormJual(); state.jual.berat = Number(jb.dataset.jualBerat); return renderJual(); }
  const js = e.target.closest('[data-jual-serah]');
  if (js) { bacaFormJual(); state.jual.serah = js.dataset.jualSerah; return renderJual(); }
  const jc = e.target.closest('[data-jual-cara]');
  if (jc) { bacaFormJual(); state.jual.cara = jc.dataset.jualCara; return renderJual(); }
  const jbl = e.target.closest('[data-jual-bulan]');
  if (jbl) { bacaFormJual(); state.jual.bulan = Number(jbl.dataset.jualBulan); return renderJual(); }

  const h = e.target.closest('[data-hasil]');
  if (h) {
    const aksi = h.dataset.hasil;
    if (aksi === 'setuju') { state.jual.selesai = true; toast(state.jual.cara === 'simpan' ? 'Kopi dititip simpan (simulasi).' : 'Penawaran diterima (simulasi).'); }
    if (aksi === 'simpan') { state.jual.cara = 'simpan'; state.jual.bulan = state.jual.bulan || 3; }
    if (aksi === 'jual') state.jual.cara = 'jual';
    renderHasilQC();
  }
});

document.addEventListener('input', (e) => {
  if (e.target.matches('#toko-kg')) { state.toko.kg = Number(e.target.value) || 0; perbaruiPesanToko(); }
  if (e.target.matches('#jual-berat, #jual-desa, #jual-harga')) e.target.classList.remove('invalid');
  if (e.target.matches('#jual-harga')) {
    const n = angkaDariTeks(e.target.value);
    e.target.value = n ? angka(n) : '';
  }
  if (e.target.matches('#jual-berat')) $$('[data-jual-berat]').forEach((c) => c.classList.toggle('active', Number(c.dataset.jualBerat) === Number(e.target.value)));
});
document.addEventListener('change', (e) => {
  if (e.target.matches('#toko-tujuan')) { state.toko.tujuan = e.target.value; perbaruiPesanToko(); }
});

$('#btn-toko-lanjut').addEventListener('click', lanjutToko);
$('#btn-jual-kirim').addEventListener('click', kirimJual);
