// scripts/menu.js
const sheetID = '1apthyh1qQUkLkyqnkSAVVuX6Y5kwS6b2ZWQCNcanYm8';
const sheetURL = `https://opensheet.elk.sh/${sheetID}/Sheet1`;

async function fetchMenu(){
  const res = await fetch(sheetURL);
  const data = await res.json();
  const grouped = {};
  data.forEach(item => {
    (grouped[item.Category || 'Others'] ??= []).push(item);
  });

  const sections = document.getElementById('menu-sections');
  const tabs = document.getElementById('category-tabs');
  const template = await fetch('components/product-card.html').then(r => r.text());

  for(const [cat, items] of Object.entries(grouped)){
    const anchor = cat.replace(/\s+/g, '-').toLowerCase();
    const tabBtn = document.createElement('button');
    tabBtn.className = 'bg-pink-200 hover:bg-pink-300 text-pink-900 px-3 py-1 rounded text-sm';
    tabBtn.textContent = cat;
    tabBtn.onclick = () => document.getElementById(anchor).scrollIntoView({ behavior: 'smooth' });
    tabs.appendChild(tabBtn);

    const section = document.createElement('div');
    section.id = anchor;

    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold text-pink-700 mb-4 sticky-header px-2 py-1';
    title.innerHTML = `
      <button onclick="toggleSection('${anchor}-grid', '${anchor}-icon')" 
              class="flex items-center justify-between w-full text-left hover:bg-pink-50 rounded-lg px-3 py-2 transition-colors duration-200">
        <span>${cat}</span>
        <svg id="${anchor}-icon" class="w-6 h-6 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    `;
    const grid = document.createElement('div');
    grid.id = `${anchor}-grid`;
    grid.className = 'section-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
    section.append(title, grid);
    sections.appendChild(section);

    items.forEach(item => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = template;
      const img = wrapper.querySelector('img');
      img.src = item.ImageURL || '';
      wrapper.querySelector('h4').textContent = item.Product;

      // tags
      const tagsDiv = wrapper.querySelector('.product-tags');
      (item.Tags || '').split(',').map(t=>t.trim()).filter(t=>t.toLowerCase()!='na').forEach(t=>{
        const span = document.createElement('span');
        span.className = 'tag ' + ({ 'best seller':'bg-red-500','premium':'bg-yellow-500','exclusive':'bg-purple-500','gluten free':'bg-cyan-500' }[t.toLowerCase()]||'bg-blue-500')+' text-white';
        span.textContent = t;
        tagsDiv.appendChild(span);
      });

      // size options
      const sel = wrapper.querySelector('select');
      const sizes = (item.Sizes||"250g,500g").split(',');
      const prices = (item.Prices||`${item.Price},${item.Price}`).split(',');
      sizes.forEach((sz,i)=>{
        const pr = prices[i]||prices[0];
        const opt = document.createElement('option');
        opt.value = `${sz}||${pr}`;
        opt.textContent = `${sz} – ₹${pr}`;
        sel.appendChild(opt);
      });

      const cardElement = wrapper.firstElementChild;
      
      // button handler
      cardElement.querySelector('.add-to-cart-btn').addEventListener('click',()=>{
        const cardSelect = cardElement.querySelector('select');
        const [sz, pr] = cardSelect.value.split('||');
        updateCart(item.Product, sz, parseFloat(pr), 1);
      });

      grid.appendChild(cardElement);
    });
  }
  updateMenuInfo();
}

fetchMenu();

function toggleSection(gridId, iconId) {
  const grid = document.getElementById(gridId);
  const icon = document.getElementById(iconId);
  
  if (grid && icon) {
    // Toggle the collapsed class for smooth animation
    grid.classList.toggle('collapsed');
    
    // Rotate the icon based on collapsed state
    if (grid.classList.contains('collapsed')) {
      // Section is collapsed - rotate icon to point right
      icon.style.transform = 'rotate(-90deg)';
    } else {
      // Section is expanded - rotate icon to point down
      icon.style.transform = 'rotate(0deg)';
    }
  }
}
