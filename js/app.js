/**
 * OfficeOne E-Commerce Frontend Interactive Controller
 */

// Application State
const state = {
  cart: [
    {
      id: '8494',
      sku: '8494',
      title: "CARAN d'ACHE 849 Ballpoint Pen with Box, Fluo Green",
      price: 105.00,
      image: "https://lh3.googleusercontent.com/aida/AP1WRLudFMyR7esMcv47JKmGuefiRNQAsGj7ylblt214Xtsq1InvpFG6D9fenxgnyVfv25QvzAcrrrwaisKG7n_Hy8QC-20mERJF-GS1QmL9RZcG5nEHvum-HMBkC2CEQeFAzBl8KJbNxQVCClRRXaR01zBjPZgbqLRPP-Gmn9SG856c0fTXR7EfdWon9xzdAYoKapiIJlOZtipO4umABNQCfhAaoh6QfHSmb-LBz1SQNXDszr8bmtFkIt_Gr50",
      quantity: 1
    },
    {
      id: '10558',
      sku: '10558',
      title: "Durable Idealbox Pen Tray, 240 x 36 x 340 mm, Charcoal",
      price: 32.00,
      image: "https://lh3.googleusercontent.com/aida/AP1WRLsP4BxBYis1NyQH4HmpKJEII5OG52HmSmF18yj0lSwFzw3ritum_BQGrcurmOLgwX_dRFCbygHV4QFxuonOeBg7fif4aoJ6s0xHC_V3uYuVGIEez4PrmT_hFShsVzC79ki8XRnSUnCFMo3vof48IlZsAEcXygYVex8j4opAxcbCAg2AAG7QIoXdlobg2wuzm-u8IjeMbKZG3cCfp-O3_n4j8qXvXFpv3ylTlhqdSQK3xrTZ8VM8IhQcNxqw",
      quantity: 1
    }
  ],
  wishlist: new Set(['8494']),
  currentHeroSlide: 0,
  activeCategory: 'all',
  currentUser: JSON.parse(sessionStorage.getItem('officeone_logged_in_user') || 'null')
};

// Helper to retrieve live catalog from Supabase Database / Local Store
async function getStorefrontProducts() {
  if (typeof getProductsFromCloud === 'function') {
    try {
      const items = await getProductsFromCloud();
      if (items && items.length > 0) return items;
    } catch (e) {
      console.warn("Error fetching products from cloud DB:", e);
    }
  }
  return JSON.parse(localStorage.getItem('officeone_custom_products') || '[]');
}

let products = [];

// Initialize DOM elements & Event listeners
// Admin Header Link Visibility Check
function checkAdminNavVisibility() {
  const adminNavBtn = document.getElementById('nav-admin-link');
  const isAdmin = sessionStorage.getItem('officeone_admin_logged_in') === 'true';
  if (adminNavBtn) {
    if (isAdmin) {
      adminNavBtn.classList.remove('hidden');
      adminNavBtn.classList.add('flex');
    } else {
      adminNavBtn.classList.add('hidden');
      adminNavBtn.classList.remove('flex');
    }
  }
}

// Update User Auth UI based on active login session
function updateUserAuthUI() {
  const currentUser = state.currentUser || JSON.parse(sessionStorage.getItem('officeone_logged_in_user') || 'null');
  const authButtons = document.querySelectorAll('.toggle-auth');

  if (currentUser) {
    const userInitial = (currentUser.email || 'U')[0].toUpperCase();
    authButtons.forEach(btn => {
      btn.setAttribute('title', `Logged in as: ${currentUser.email} (Click to manage / Sign Out)`);
      if (btn.classList.contains('flex-col')) {
        btn.innerHTML = `
          <div class="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-[11px] flex items-center justify-center shadow-sm">
            ${userInitial}
          </div>
          <span class="text-[11px] text-primary font-bold">Profile</span>
        `;
      } else {
        btn.innerHTML = `<span class="w-6 h-6 rounded-full bg-surface text-primary font-bold text-[11px] flex items-center justify-center border border-primary">${userInitial}</span>`;
      }
    });
  } else {
    authButtons.forEach(btn => {
      btn.setAttribute('title', 'Account / Sign In');
      if (btn.classList.contains('flex-col')) {
        btn.innerHTML = `<span class="material-symbols-outlined text-[24px]">account_circle</span><span class="text-[11px]">Account</span>`;
      } else {
        btn.innerHTML = `<span class="material-symbols-outlined text-[20px]">person</span>`;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  products = await getStorefrontProducts();
  checkAdminNavVisibility();
  updateUserAuthUI();
  initHeroCarousel();
  renderProducts();
  updateCartUI();
  setupEventListeners();
});

// Hero Carousel Slider Controller
function initHeroCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');

  if (!slides.length) return;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.remove('hidden');
        slide.classList.add('flex');
      } else {
        slide.classList.add('hidden');
        slide.classList.remove('flex');
      }
    });

    dots.forEach((dot, i) => {
      if (i === index) {
        dot.className = 'w-6 h-2 rounded-full bg-primary transition-all duration-300';
      } else {
        dot.className = 'w-2 h-2 rounded-full bg-on-primary/50 transition-all duration-300';
      }
    });

    state.currentHeroSlide = index;
  }

  // Auto advance every 5s
  let timer = setInterval(() => {
    const nextIndex = (state.currentHeroSlide + 1) % slides.length;
    showSlide(nextIndex);
  }, 5000);

  // Click handler for dots
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      showSlide(idx);
      timer = setInterval(() => {
        const nextIndex = (state.currentHeroSlide + 1) % slides.length;
        showSlide(nextIndex);
      }, 5000);
    });
  });
}

// Render Products Grid
function renderProducts(filterCategory = 'all') {
  const container = document.getElementById('products-grid');
  if (!container) return;

  const filtered = filterCategory === 'all'
    ? products
    : products.filter(p => p.category === filterCategory);

  container.innerHTML = filtered.map(product => {
    const isWishlisted = state.wishlist.has(product.id);
    return `
      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm flex flex-col relative group card-hover-effect">
        ${product.badge ? `
          <span class="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white font-label-sm text-[10px] uppercase rounded-sm z-10 font-bold shadow-sm">
            ${product.badge}
          </span>
        ` : ''}
        
        <button onclick="toggleWishlist('${product.id}')" 
                class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-surface/80 text-on-surface-variant hover:text-primary transition-colors z-10 shadow-sm backdrop-blur-sm">
          <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' ${isWishlisted ? 1 : 0}; color: ${isWishlisted ? '#006a63' : 'inherit'};">
            favorite
          </span>
        </button>

        <div class="w-full aspect-square p-4 bg-white flex items-center justify-center relative overflow-hidden">
          <img alt="${product.title}" 
               class="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
               src="${product.image}" />
        </div>

        <div class="p-4 flex flex-col flex-1 gap-1">
          <span class="font-label-sm text-label-sm text-on-surface-variant">SKU: ${product.sku}</span>
          <h4 class="font-label-md text-label-md text-on-surface line-clamp-2 leading-tight flex-1" title="${product.title}">
            ${product.title}
          </h4>
          <div class="mt-3 flex items-center justify-between">
            <span class="font-headline-md text-[18px] leading-tight font-bold text-primary">
              AED ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <button onclick="addToCart('${product.id}')" 
                    class="w-9 h-9 rounded bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary transition-all btn-press shadow-sm"
                    title="Add to Cart">
              <span class="material-symbols-outlined text-[20px]">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Shopping Cart Actions
function addToCart(productId) {
  const item = products.find(p => p.id === productId);
  if (!item) return;

  const existing = state.cart.find(c => c.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ ...item, quantity: 1 });
  }

  updateCartUI();
  showToast(`Added "${item.title.substring(0, 24)}..." to cart`);
}

function updateQuantity(productId, delta) {
  const itemIndex = state.cart.findIndex(c => c.id === productId);
  if (itemIndex === -1) return;

  state.cart[itemIndex].quantity += delta;
  if (state.cart[itemIndex].quantity <= 0) {
    state.cart.splice(itemIndex, 1);
  }

  updateCartUI();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(c => c.id !== productId);
  updateCartUI();
  showToast('Item removed from cart');
}

function updateCartUI() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update Header Badge
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.textContent = totalCount;
    b.style.display = totalCount > 0 ? 'flex' : 'none';
  });

  // Update Cart Drawer Contents
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');

  if (subtotalEl) subtotalEl.textContent = `AED ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  if (totalEl) totalEl.textContent = `AED ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  if (container) {
    if (state.cart.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-[64px] text-outline-variant mb-2">shopping_bag</span>
          <p class="font-headline-md text-headline-md mb-1">Your cart is empty</p>
          <p class="font-body-md text-body-md">Explore our office essentials and add items to get started.</p>
        </div>
      `;
    } else {
      container.innerHTML = state.cart.map(item => `
        <div class="flex gap-4 p-3 bg-surface rounded-lg border border-outline-variant items-center">
          <div class="w-16 h-16 bg-white rounded flex items-center justify-center p-1 border border-outline-variant flex-shrink-0">
            <img src="${item.image}" alt="${item.title}" class="max-h-full max-w-full object-contain" />
          </div>
          <div class="flex-1 min-w-0 flex flex-col gap-1">
            <h5 class="font-label-md text-label-md text-on-surface truncate">${item.title}</h5>
            <span class="font-label-sm text-label-sm text-primary font-bold">
              AED ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div class="flex items-center gap-2 mt-1">
              <button onclick="updateQuantity('${item.id}', -1)" class="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-on-surface hover:bg-outline-variant transition-colors">
                <span class="material-symbols-outlined text-[14px]">remove</span>
              </button>
              <span class="font-label-sm text-label-sm px-2 font-semibold">${item.quantity}</span>
              <button onclick="updateQuantity('${item.id}', 1)" class="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-on-surface hover:bg-outline-variant transition-colors">
                <span class="material-symbols-outlined text-[14px]">add</span>
              </button>
            </div>
          </div>
          <button onclick="removeFromCart('${item.id}')" class="text-on-surface-variant hover:text-error transition-colors p-1" title="Remove">
            <span class="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      `).join('');
    }
  }
}

// Wishlist Action
function toggleWishlist(productId) {
  if (state.wishlist.has(productId)) {
    state.wishlist.delete(productId);
    showToast('Removed from favorites');
  } else {
    state.wishlist.add(productId);
    showToast('Added to favorites');
  }
  renderProducts(state.activeCategory);
}

// Category Filter Controller
function setCategory(category, btnElement) {
  state.activeCategory = category;

  // Highlight active category button UI
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('border-primary', 'bg-primary-container/20');
    btn.classList.add('border-outline-variant', 'bg-surface-container');
  });

  if (btnElement) {
    btnElement.classList.remove('border-outline-variant', 'bg-surface-container');
    btnElement.classList.add('border-primary', 'bg-primary-container/20');
  }

  renderProducts(category);
}

// Event Listeners setup
function setupEventListeners() {
  // Drawer Toggles
  const cartButtons = document.querySelectorAll('.toggle-cart');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const closeCartBtn = document.getElementById('close-cart');

  function openCart() {
    cartDrawer?.classList.remove('translate-x-full');
    cartOverlay?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer?.classList.add('translate-x-full');
    cartOverlay?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  cartButtons.forEach(btn => btn.addEventListener('click', openCart));
  closeCartBtn?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  // Search Modal Toggles
  const searchButtons = document.querySelectorAll('.toggle-search');
  const searchModal = document.getElementById('search-modal');
  const closeSearchBtn = document.getElementById('close-search');
  const searchInput = document.getElementById('search-input');
  const searchResultsContainer = document.getElementById('search-results');

  function openSearch() {
    searchModal?.classList.remove('hidden');
    searchModal?.classList.add('flex');
    searchInput?.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeSearch() {
    searchModal?.classList.add('hidden');
    searchModal?.classList.remove('flex');
    document.body.style.overflow = '';
  }

  searchButtons.forEach(btn => btn.addEventListener('click', openSearch));
  closeSearchBtn?.addEventListener('click', closeSearch);

  searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      searchResultsContainer.innerHTML = '<p class="text-on-surface-variant text-center py-4">Start typing to search products...</p>';
      return;
    }

    const matches = products.filter(p => p.title.toLowerCase().includes(query) || p.sku.includes(query));
    if (matches.length === 0) {
      searchResultsContainer.innerHTML = `<p class="text-on-surface-variant text-center py-4">No products found for "${query}"</p>`;
    } else {
      searchResultsContainer.innerHTML = matches.map(p => `
        <div class="flex items-center gap-3 p-2 hover:bg-surface-container rounded-lg cursor-pointer transition-colors" onclick="addToCart('${p.id}'); closeSearch();">
          <img src="${p.image}" class="w-12 h-12 object-contain bg-white rounded p-1 border" alt="" />
          <div class="flex-1 min-w-0">
            <p class="font-label-md text-label-md text-on-surface truncate">${p.title}</p>
            <p class="font-label-sm text-label-sm text-primary font-bold">AED ${p.price.toFixed(2)}</p>
          </div>
          <button class="px-3 py-1 bg-primary text-on-primary font-label-sm text-label-sm rounded">Add</button>
        </div>
      `).join('');
    }
  });

  // Auth Modal (Login & Sign Up) Toggles
  const authButtons = document.querySelectorAll('.toggle-auth');
  const authModal = document.getElementById('auth-modal');
  const closeAuthBtn = document.getElementById('close-auth');
  const signinForm = document.getElementById('auth-signin-form');
  const signupForm = document.getElementById('auth-signup-form');

  const profileModal = document.getElementById('user-profile-modal');
  const closeProfileBtn = document.getElementById('close-user-profile');
  const logoutBtn = document.getElementById('profile-logout-btn');

  function openAuth(tab = 'signin') {
    switchAuthTab(tab);
    authModal?.classList.remove('hidden');
    authModal?.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closeAuth() {
    authModal?.classList.add('hidden');
    authModal?.classList.remove('flex');
    document.body.style.overflow = '';
  }

  function openUserProfile() {
    const currentUser = state.currentUser || JSON.parse(sessionStorage.getItem('officeone_logged_in_user') || 'null');
    if (!currentUser) return;

    const profileAvatar = document.getElementById('profile-modal-avatar');
    const profileEmail = document.getElementById('profile-modal-email');
    const profileType = document.getElementById('profile-modal-type');

    if (profileAvatar) profileAvatar.textContent = (currentUser.email || 'U')[0].toUpperCase();
    if (profileEmail) profileEmail.textContent = currentUser.email;
    if (profileType) profileType.textContent = currentUser.account_type === 'corporate' ? 'Corporate Account' : 'Individual Account';

    profileModal?.classList.remove('hidden');
    profileModal?.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closeUserProfile() {
    profileModal?.classList.add('hidden');
    profileModal?.classList.remove('flex');
    document.body.style.overflow = '';
  }

  authButtons.forEach(btn => btn.addEventListener('click', () => {
    const currentUser = state.currentUser || JSON.parse(sessionStorage.getItem('officeone_logged_in_user') || 'null');
    if (currentUser) {
      openUserProfile();
    } else {
      openAuth('signin');
    }
  }));

  closeAuthBtn?.addEventListener('click', closeAuth);
  closeProfileBtn?.addEventListener('click', closeUserProfile);

  // Close modals on clicking backdrop
  authModal?.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuth();
  });

  searchModal?.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearch();
  });

  profileModal?.addEventListener('click', (e) => {
    if (e.target === profileModal) closeUserProfile();
  });

  // Escape key global listener to restore body scroll
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeSearch();
      closeAuth();
      closeUserProfile();
      const checkoutModal = document.getElementById('checkout-modal');
      if (checkoutModal) {
        checkoutModal.classList.add('hidden');
        checkoutModal.classList.remove('flex');
      }
      document.body.style.overflow = '';
    }
  });

  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('officeone_logged_in_user');
    state.currentUser = null;
    closeUserProfile();
    updateUserAuthUI();
    showToast('Signed out successfully');
  });

  // Sign In Submission
  signinForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-signin-email').value.trim().toLowerCase();
    const password = document.getElementById('auth-signin-password').value.trim();

    // Admin Credentials Check -> Redirect to Admin Panel
    if ((email === 'admin@yakda.ae' || email === 'admin') && password === 'admin123') {
      sessionStorage.setItem('officeone_admin_logged_in', 'true');
      showToast('Admin Credentials verified! Redirecting to Admin Panel...');
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 800);
      return;
    }

    // Check User Collection for Registered User
    let registeredUser = null;
    if (typeof findUserInCloud === 'function') {
      registeredUser = await findUserInCloud(email, password);
    }

    const userObj = registeredUser || { id: Date.now().toString(), email: email };
    state.currentUser = userObj;
    sessionStorage.setItem('officeone_logged_in_user', JSON.stringify(userObj));

    closeAuth();
    updateUserAuthUI();
    const displayName = userObj.fullname || userObj.companyname || email.split('@')[0];
    showToast(`Welcome back, ${displayName}!`);
    signinForm.reset();
  });

  // Sign Up Submission
  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('auth-signup-name').value.trim();
    const email = document.getElementById('auth-signup-email').value.trim().toLowerCase();
    const password = document.getElementById('auth-signup-password').value.trim();
    const accType = document.querySelector('input[name="acc_type"]:checked')?.value || 'individual';

    const userRecord = {
      id: Date.now().toString(),
      email: email,
      password: password,
      fullname: accType === 'individual' ? (name || null) : null,
      companyname: accType === 'corporate' ? (name || null) : null,
      account_type: accType,
      created_at: new Date().toISOString()
    };

    if (typeof saveUserToCloud === 'function') {
      await saveUserToCloud(userRecord);
    }

    state.currentUser = userRecord;
    sessionStorage.setItem('officeone_logged_in_user', JSON.stringify(userRecord));

    closeAuth();
    updateUserAuthUI();
    showToast(`Account created successfully for ${email}!`);
    signupForm.reset();
  });

  // Checkout Form Submission
  const checkoutForm = document.getElementById('checkout-form');
  const closeCheckoutBtn = document.getElementById('close-checkout');
  const checkoutModal = document.getElementById('checkout-modal');

  function closeCheckout() {
    checkoutModal?.classList.add('hidden');
    checkoutModal?.classList.remove('flex');
    document.body.style.overflow = '';
  }

  closeCheckoutBtn?.addEventListener('click', closeCheckout);
  checkoutModal?.addEventListener('click', (e) => {
    if (e.target === checkoutModal) closeCheckout();
  });

  checkoutForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentUser = state.currentUser || JSON.parse(sessionStorage.getItem('officeone_logged_in_user') || 'null');
    const phone = document.getElementById('checkout-phone').value.trim();
    const address = document.getElementById('checkout-address').value.trim();
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderRecord = {
      id: `ORD-${Date.now()}`,
      user_id: currentUser?.id || 'customer',
      customer_email: currentUser?.email || 'customer@example.com',
      items: [...state.cart],
      total_amount: totalPrice,
      contact_phone: phone,
      delivery_address: address,
      created_at: new Date().toISOString()
    };

    // Save Order to Supabase DB / Cloud Store
    if (typeof createOrderInCloud === 'function') {
      await createOrderInCloud(orderRecord);
    }

    closeCheckout();

    // Construct Notification Links
    const itemsSummary = state.cart.map(i => `• ${i.title} (x${i.quantity}) - AED ${(i.price * i.quantity).toFixed(2)}`).join('\n');

    // 1. WhatsApp Text Payload for 97145534286
    const waText = encodeURIComponent(
      `*New Order Placed - Yakda*\n` +
      `*Order ID:* ${orderRecord.id}\n` +
      `*Customer:* ${orderRecord.customer_email}\n` +
      `*Phone:* ${phone}\n` +
      `*Address:* ${address}\n\n` +
      `*Items Ordered:*\n${itemsSummary}\n\n` +
      `*Total Amount:* AED ${totalPrice.toFixed(2)}`
    );
    const waUrl = `https://wa.me/97145534286?text=${waText}`;

    // 2. Email Mailto Payload for inquiry@alyakda.com
    const emailSubject = encodeURIComponent(`New Order #${orderRecord.id} - Yakda`);
    const emailBody = encodeURIComponent(
      `New Order Received:\n\n` +
      `Order ID: ${orderRecord.id}\n` +
      `Customer Email: ${orderRecord.customer_email}\n` +
      `Contact Phone: ${phone}\n` +
      `Delivery Address: ${address}\n\n` +
      `Items:\n${itemsSummary}\n\n` +
      `Total Amount: AED ${totalPrice.toFixed(2)}`
    );
    const mailtoUrl = `mailto:inquiry@alyakda.com?subject=${emailSubject}&body=${emailBody}`;

    // Reset Cart
    state.cart = [];
    updateCartUI();

    showToast(`Order #${orderRecord.id} Placed! Dispatching Notifications...`);

    // Trigger WhatsApp & Mailto Dispatch
    window.open(waUrl, '_blank');
    window.location.href = mailtoUrl;
  });
}

// Initiate Checkout Logic (Mandatory User Login Guard)
function initiateCheckout() {
  const currentUser = state.currentUser || JSON.parse(sessionStorage.getItem('officeone_logged_in_user') || 'null');

  if (!currentUser) {
    showToast('Please sign in or create an account to proceed to checkout');
    const authModal = document.getElementById('auth-modal');
    if (typeof switchAuthTab === 'function') switchAuthTab('signin');
    authModal?.classList.remove('hidden');
    authModal?.classList.add('flex');
    document.body.style.overflow = 'hidden';
    return;
  }

  if (state.cart.length === 0) {
    showToast('Your cart is empty');
    return;
  }

  // Close Cart Drawer
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  cartDrawer?.classList.add('translate-x-full');
  cartOverlay?.classList.add('hidden');

  // Populate Checkout Modal
  const checkoutModal = document.getElementById('checkout-modal');
  const emailEl = document.getElementById('checkout-user-email');
  const priceEl = document.getElementById('checkout-total-price');

  const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (emailEl) emailEl.textContent = currentUser.email;
  if (priceEl) priceEl.textContent = `AED ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  checkoutModal?.classList.remove('hidden');
  checkoutModal?.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

// Switch between Sign In and Sign Up tabs
function switchAuthTab(tab) {
  const signinForm = document.getElementById('auth-signin-form');
  const signupForm = document.getElementById('auth-signup-form');
  const tabBtnSignin = document.getElementById('tab-btn-signin');
  const tabBtnSignup = document.getElementById('tab-btn-signup');

  if (tab === 'signin') {
    signinForm?.classList.remove('hidden');
    signupForm?.classList.add('hidden');
    tabBtnSignin?.classList.add('text-primary', 'border-b-2', 'border-primary');
    tabBtnSignin?.classList.remove('text-on-surface-variant');
    tabBtnSignup?.classList.remove('text-primary', 'border-b-2', 'border-primary');
    tabBtnSignup?.classList.add('text-on-surface-variant');
  } else {
    signupForm?.classList.remove('hidden');
    signinForm?.classList.add('hidden');
    tabBtnSignup?.classList.add('text-primary', 'border-b-2', 'border-primary');
    tabBtnSignup?.classList.remove('text-on-surface-variant');
    tabBtnSignin?.classList.remove('text-primary', 'border-b-2', 'border-primary');
    tabBtnSignin?.classList.add('text-on-surface-variant');
  }
}

// Toast Notification Helper
function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'fixed top-20 right-4 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-lg shadow-xl font-label-md text-label-md flex items-center gap-2 transform transition-all duration-300 opacity-0 translate-y-[-10px] pointer-events-none';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="material-symbols-outlined text-[20px] text-primary-fixed">check_circle</span><span>${message}</span>`;
  toast.classList.remove('opacity-0', 'translate-y-[-10px]', 'pointer-events-none');

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-[-10px]', 'pointer-events-none');
  }, 3000);
}
