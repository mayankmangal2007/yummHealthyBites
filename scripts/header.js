// scripts/header.js
fetch('components/header.html')
  .then(r => r.text())
  .then(html => {
    document.getElementById('header-container').innerHTML = html;
    const header = document.getElementById('mainHeader');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  });
