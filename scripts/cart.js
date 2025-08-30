// scripts/cart.js
let cart = {};
let cartLoaded = false;

const cartLoadPromise = fetch('components/cart.html')
  .then(r => r.text())
  .then(html => {
    document.getElementById('cart-container').innerHTML = html;
    cartLoaded = true;
    
    // Always initialize cart display, even if empty
    updateCartDisplay();
    updateMenuInfo();
  })
  .catch(err => {
    console.error('Failed to load cart HTML:', err);
    cartLoaded = true; // Set to true to prevent infinite retries
  });

function toggleCart() {
  const cartSlide = document.getElementById('cartSlide');
  const cartOverlay = document.getElementById('cartOverlay');
  cartSlide.classList.toggle('open');
  cartOverlay.classList.toggle('open');
  document.body.style.overflow = cartSlide.classList.contains('open') ? 'hidden' : 'auto';
}

function showCheckoutForm() {
  const form = document.getElementById('cartCheckoutForm');
  const btn = document.getElementById('checkoutButton');
  form.classList.remove('hidden');
  btn.textContent = 'Hide Order Form';
  btn.onclick = hideCheckoutForm;
}

function hideCheckoutForm() {
  const form = document.getElementById('cartCheckoutForm');
  const btn = document.getElementById('checkoutButton');
  form.classList.add('hidden');
  btn.textContent = 'Continue to Order';
  btn.onclick = showCheckoutForm;
}

function updateCart(product, size, price, change) {
  const key = `${product} - ${size}`;
  if (!cart[key]) {
    cart[key] = { product, size, price, qty: 0 };
  }
  cart[key].qty += change;
  if (cart[key].qty <= 0) {
    delete cart[key];
  } else if (change > 0) {
    showAddToCartConfirmation(product, size, change);
  }
  
  updateCartDisplay();
  updateMenuInfo();
}

function clearCartItem(product, size) {
  const key = `${product} - ${size}`;
  if (cart[key]) {
    delete cart[key];
    updateCartDisplay();
    updateMenuInfo();
  }
}

function updateCartDisplay() {
  // If cart isn't loaded yet, wait for it
  if (!cartLoaded) {
    cartLoadPromise.then(() => updateCartDisplay());
    return;
  }

  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');
  const checkoutButton = document.getElementById('checkoutButton');

  // If cart elements still aren't found after loading, something is wrong
  if (!cartItems) {
    console.error('Cart elements not found even after loading cart HTML');
    return;
  }

  let total = 0;
  let itemCount = 0;
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    cartItems.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.07 5.36A2 2 0 0 0 7.86 21h8.28a2 2 0 0 0 1.93-2.64L16 13M7 13v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6" />
        </svg>
        <p>Your cart is empty</p>
        <p class="text-sm">Add some delicious items to get started!</p>
      </div>`;
    if (cartCount) {
      cartCount.classList.add('hidden');
      cartCount.textContent = '0';
      cartCount.style.display = 'none';
    }
    if (checkoutButton) checkoutButton.disabled = true;
    return;
  }

  const html = entries.map(([, item]) => {
    const lineTotal = item.qty * item.price;
    total += lineTotal;
    itemCount += item.qty;

    return `
      <div class="flex items-center justify-between bg-pink-50 p-3 rounded-lg">
        <div class="flex-1">
          <h4 class="font-semibold text-sm text-pink-800">${item.product}</h4>
          <p class="text-xs text-gray-600">${item.size}</p>
          <p class="text-sm font-semibold text-pink-600">₹${item.price} × ${item.qty} = ₹${lineTotal.toFixed(2)}</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="updateCart('${item.product}', '${item.size}', ${item.price}, -1)" class="bg-pink-300 hover:bg-pink-400 w-8 h-8 rounded-full text-sm">-</button>
          <span class="w-8 text-center font-semibold">${item.qty}</span>
          <button onclick="updateCart('${item.product}', '${item.size}', ${item.price}, 1)" class="bg-pink-300 hover:bg-pink-400 w-8 h-8 rounded-full text-sm">+</button>
        </div>
      </div>`;
  }).join('');

  cartItems.innerHTML = html;
  cartTotal.textContent = `₹${total.toFixed(2)}`;
  
  // Update cart count badge
  if (cartCount) {
    cartCount.textContent = itemCount;
    if (itemCount > 0) {
      cartCount.classList.remove('hidden');
      cartCount.style.display = 'flex'; // Force display
    } else {
      cartCount.classList.add('hidden');
      cartCount.style.display = 'none';
    }
  }
  
  if (checkoutButton) checkoutButton.disabled = false;
}

function updateMenuInfo() {
  const cards = document.querySelectorAll('.item-card');

  if (cards.length === 0) {
    // Menu not loaded yet, try again later
    setTimeout(updateMenuInfo, 300);
    return;
  }

  cards.forEach(card => {
    const productName = card.querySelector('h4')?.textContent?.trim();
    const infoDiv = card.querySelector('.card-cart-info');

    if (!productName || !infoDiv) return;

    // Find all cart items that match this product
    const productItems = Object.values(cart).filter(item =>
      item.product === productName && item.qty > 0
    );

    if (productItems.length === 0) {
      infoDiv.innerHTML = '';
      return;
    }

    // Create badges for each size/variant in cart
    const badges = productItems.map(item => `
      <div class="inline-flex items-center bg-pink-100 text-pink-800 text-xs px-3 py-1 rounded-full mr-2 mb-1 border">
        <span class="font-semibold">${item.product} (${item.size}) × ${item.qty}</span>
        <button 
          onclick="clearCartItem('${item.product}','${item.size}')"
          class="ml-2 w-4 h-4 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold transition-all duration-200 hover:scale-110"
          title="Remove from cart"
        >×</button>
      </div>
    `).join('');

    infoDiv.innerHTML = badges;
  });
}

function generateOrderID(len = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateSummary(showModal = false) {
  const name = document.getElementById("cartCustName").value.trim();
  const phone = document.getElementById("cartCustPhone").value.trim();
  const email = document.getElementById("cartCustEmail").value.trim();
  const address = document.getElementById("cartCustAddress").value.trim();
  const notes = document.getElementById("cartSpecialNotes").value.trim();
  const errorDiv = document.getElementById("cartValidationErrors");

  const errors = [];
  if (!name) errors.push("Name is required");
  if (!/^[0-9]{10}$/.test(phone)) errors.push("Enter a valid 10-digit phone number");
  if (!email) errors.push("Email is required");
  if (!address) errors.push("Address is required");

  if (errors.length) {
    errorDiv.innerHTML = errors.map(e => `<div>⚠️ ${e}</div>`).join('');
    return null;
  } else {
    errorDiv.innerHTML = '';
  }

  const entries = Object.values(cart).filter(i => i.qty > 0);
  if (!entries.length) {
    alert("Please add at least one item to your order.");
    return null;
  }

  const orderID = generateOrderID();
  let total = 0;
  const lines = entries.map(item => {
    const lineTotal = item.qty * item.price;
    total += lineTotal;
    return `${item.product} - ${item.size} ×${item.qty} – ₹${lineTotal.toFixed(2)}`;
  });

  const summary = `--- Yumm Healthy Bites Order ---\n\n` +
    `Customer Name: ${name}\nPhone Number: ${phone}\nEmail: ${email}\nAddress: ${address}\nSpecial Instructions: ${notes || "-"}\n\n` +
    `--- Order Items ---\n${lines.join('\n')}\n\nTotal Amount: ₹${total.toFixed(2)}\n\nPayment on delivery\nOrder ID: ${orderID}`;

  if (showModal) {
    document.getElementById("orderPreview").innerText = summary;
    const modal = document.getElementById("previewModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  return summary;
}

function closeModal() {
  const modal = document.getElementById("previewModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function sendOrderFromCart() {
  const summary = generateSummary(false);
  if (!summary) return;

  const msg = encodeURIComponent(summary);
  const whatsappNumber = "9079622686";
  window.open(`https://wa.me/91${whatsappNumber}?text=${msg}`, '_blank');
}

function showAddToCartConfirmation(product, size, qty) {
  const confirmation = document.getElementById('addToCartConfirmation');
  const confirmationText = document.getElementById('confirmationText');
  
  confirmationText.textContent = `${product} (${size}) x${qty} added to cart!`;
  
  confirmation.classList.remove('translate-x-full');
  confirmation.classList.add('translate-x-0');
  
  setTimeout(() => {
    confirmation.classList.remove('translate-x-0');
    confirmation.classList.add('translate-x-full');
  }, 2500);
}
