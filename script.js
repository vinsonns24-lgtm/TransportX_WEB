/* =========================================================
   TransportX — website
   Menu mobile, highlight menu aktif, animasi scroll, tahun footer
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Menu mobile ---------- */
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.getElementById('nav-links');

  function setMenu(open) {
    navLinks.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  }

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });

    // Tutup menu setelah salah satu link dipilih
    navLinks.addEventListener('click', (e) => {
      if (e.target.closest('a')) setMenu(false);
    });

    // Tutup dengan tombol Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        setMenu(false);
        menuBtn.focus();
      }
    });

    // Kembali ke tampilan desktop: pastikan menu tidak tertinggal terbuka
    window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- Highlight menu sesuai section yang sedang dibaca ---------- */
  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Animasi muncul saat di-scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach((el) => reveal.observe(el));
  } else {
    // Browser lama: tampilkan semua tanpa animasi
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Tahun di footer ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
