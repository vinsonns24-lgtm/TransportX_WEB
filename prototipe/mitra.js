/* =========================================================
   TransportX — halaman Mitra
   Daftar mitra yang mengerjakan kiriman (data dari MITRA di script.js),
   alur siapa memegang barang di tiap tahap, dan filter per jenis mitra.
   Dimuat setelah script.js dan visual.js.
   ========================================================= */

const IKON_MITRA = {
  gudang: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/></svg>',
  ekspedisi: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 6h13v10H1z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="5.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/></svg>',
  kurir: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-8h5l3 8M10 9l-1-3H7"/></svg>',
  petani: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V11"/><path d="M12 11c0-4 3-7 7-7 0 4-3 7-7 7z"/><path d="M12 14c0-3-2.5-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5z"/></svg>',
  kemasan: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>',
  kebun: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V11"/><path d="M12 11c0-4 3-7 7-7 0 4-3 7-7 7z"/><path d="M12 14c0-3-2.5-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5z"/></svg>',
  pembeli: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9l1-5h14l1 5"/><path d="M4 9h16v11H4z"/><path d="M9 20v-6h6v6"/></svg>',
  tx: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16.5 9.5"/></svg>'
};

const FILTER_MITRA = [
  { id: 'semua', nama: 'Semua' },
  { id: 'gudang', nama: 'Gudang' },
  { id: 'ekspedisi', nama: 'Ekspedisi' },
  { id: 'kurir', nama: 'Kurir' },
  { id: 'kemasan', nama: 'Kemasan' },
  { id: 'petani', nama: 'Petani pemasok' }
];

/* alur barang: tahap -> mitra yang memegang barang */
const ALUR_MITRA = [
  { ikon: 'kebun', judul: 'Jemput dari kebun', ket: 'Kalau pengirim tidak mengantar sendiri', mitra: ['kurir-desa'] },
  { ikon: 'gudang', judul: 'Simpan di gudang Semarang', ket: 'Produk kering di gudang kering, produk segar di cold storage', mitra: ['lumbung', 'mgm-bosco'], tx: 'Petugas QC TransportX cek mutu dan kemas di sini' },
  { ikon: 'ekspedisi', judul: 'Angkut ke kota tujuan', ket: 'Truk biasa untuk produk kering, truk berpendingin untuk produk segar', mitra: ['trans-jawa', ['mgm-bosco', 'ekspedisi']] },
  { ikon: 'pembeli', judul: 'Sampai di pembeli', ket: 'Penerima memfoto barang, status ditutup', mitra: [] }
];

const TUGAS_TX = [
  'Aplikasi: memilih ruang simpan, rute, mitra, dan menghitung biaya',
  'SOP simpan dan kemas untuk tiap produk',
  'Petugas QC: timbang, ukur kadar air atau suhu, foto',
  'Admin dan CS: booking mitra, pantau status, urus klaim'
];

/* entri alur: 'id' atau ['id', ikon] kalau perannya di tahap itu beda (MGM Bosco: gudang dan truk) */
const chipMitra = (entri) => {
  const [id, ikon] = Array.isArray(entri) ? entri : [entri, mitra(entri).jenis];
  return `<button type="button" class="mitra-chip ${ikon}" data-mitra-ke="${id}">${IKON_MITRA[ikon]}${escapeHTML(mitra(id).nama)}</button>`;
};

function kartuMitra(m) {
  return `
    <article class="mitra-card" id="mitra-${m.id}" tabindex="-1">
      <header class="mitra-head">
        <span class="mitra-ikon ${m.jenis}">${IKON_MITRA[m.jenis]}</span>
        <div class="mitra-judul">
          <h3>${escapeHTML(m.nama)}</h3>
          <span>${escapeHTML(m.kategori)}<em class="mitra-status ${m.namaContoh ? 'contoh' : 'calon'}">${m.namaContoh ? 'Nama contoh' : 'Calon mitra'}</em></span>
        </div>
      </header>
      <p class="mitra-peran">${escapeHTML(m.peran)}</p>
      <dl class="mitra-info">
        <div><dt>Area</dt><dd>${escapeHTML(m.area)}</dd></div>
        <div><dt>Dipakai untuk</dt><dd>${escapeHTML(m.dipakai)}</dd></div>
        <div><dt>Tarif (contoh)</dt><dd>${escapeHTML(m.tarif)}</dd></div>
        ${m.dasarTarif ? `<div><dt>Dasar tarif</dt><dd>${escapeHTML(m.dasarTarif)}</dd></div>` : ''}
      </dl>
      <ul class="mitra-fasilitas">${m.fasilitas.map((f) => `<li>${escapeHTML(f)}</li>`).join('')}</ul>
      <p class="mitra-catatan">Status: belum ada perjanjian kerja sama.${m.namaContoh ? '' : ' Disebut sebagai calon mitra di Business Model Canvas.'}</p>
    </article>`;
}

function renderMitra() {
  const filter = state.filterMitra || 'semua';
  const daftar = MITRA.filter((m) => filter === 'semua' || m.jenis === filter);
  $('#mitra-back').hidden = state.navStack.length <= 1;
  $('#mitra-content').innerHTML = `
    <div class="mitra-intro">
      <strong>TransportX tidak punya gudang dan truk sendiri.</strong>
      <p>Fasilitas disewa per kiriman dari mitra di bawah. TransportX yang mengatur rute, membuat SOP simpan, dan mengecek mutu barang.</p>
    </div>

    <h2 class="section-label">Siapa yang memegang barang Anda</h2>
    <ol class="alur-mitra">
      ${ALUR_MITRA.map((a, i) => `
        <li>
          <span class="alur-ikon">${IKON_MITRA[a.ikon]}<b>${i + 1}</b></span>
          <div class="alur-isi">
            <strong>${a.judul}</strong>
            <span>${a.ket}</span>
            ${a.mitra.length ? `<div class="alur-chips">${a.mitra.map(chipMitra).join('')}</div>` : ''}
            ${a.tx ? `<span class="alur-tx">${IKON_MITRA.tx}${a.tx}</span>` : ''}
          </div>
        </li>`).join('')}
    </ol>

    <h2 class="section-label">Daftar mitra</h2>
    <div class="chips" role="radiogroup" aria-label="Saring jenis mitra">
      ${FILTER_MITRA.map((f) => `<button type="button" class="chip ${f.id === filter ? 'active' : ''}" role="radio" aria-checked="${f.id === filter}" data-filter-mitra="${f.id}">${f.nama}</button>`).join('')}
    </div>
    <div class="mitra-list">${daftar.map(kartuMitra).join('')}</div>

    <div class="info-card mitra-tx">
      <h3>${IKON_MITRA.tx}Yang dikerjakan TransportX sendiri</h3>
      <ul>${TUGAS_TX.map((t) => `<li>${t}</li>`).join('')}</ul>
    </div>

    <p class="value-disclaimer">${CATATAN_MITRA} MGM Bosco Logistics adalah calon mitra yang disebut di Business Model Canvas. Nama lain adalah nama karangan untuk simulasi dan akan diganti dengan mitra asli setelah ada kerja sama.</p>`;

  // sorot mitra yang dibuka dari kartu "Siapa yang mengerjakan"
  if (state.sorotMitra) {
    const kartu = $(`#mitra-${state.sorotMitra}`);
    state.sorotMitra = null;
    if (kartu) {
      requestAnimationFrame(() => {
        kartu.scrollIntoView({ block: 'center' });
        kartu.classList.add('sorot');
        kartu.focus({ preventScroll: true });
        setTimeout(() => kartu.classList.remove('sorot'), 1800);
      });
    }
  }
}

function bukaMitra(id) {
  state.sorotMitra = id || null;
  if (id) state.filterMitra = 'semua';
  if ($('#screen-mitra').classList.contains('active')) renderMitra();
  else go('mitra');
}

RENDER.mitra = renderMitra;

document.addEventListener('click', (e) => {
  const buka = e.target.closest('[data-mitra]');
  if (buka) return bukaMitra(buka.dataset.mitra);
  const ke = e.target.closest('[data-mitra-ke]');
  if (ke) { state.sorotMitra = ke.dataset.mitraKe; state.filterMitra = 'semua'; return renderMitra(); }
  const f = e.target.closest('[data-filter-mitra]');
  if (f) { state.filterMitra = f.dataset.filterMitra; renderMitra(); }
});
