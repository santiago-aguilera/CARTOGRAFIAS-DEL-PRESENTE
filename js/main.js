// ---------- HERO PARALLAX (solo existe en index.html) ----------
const heroBg = document.getElementById('heroBg');
if (heroBg) {
  const hero = document.querySelector('.hero');
  hero.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 24;
    const y = (e.clientY / window.innerHeight - 0.5) * 24;
    heroBg.querySelector('svg').style.transform = 'translate(' + x + 'px,' + y + 'px)';
  });
}

// ---------- SCROLL REVEAL ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add('in'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
