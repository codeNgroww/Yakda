/**
 * Yakda Admin Dashboard Controller
 */

let previewImageDataUrl = '';

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupLoginHandler();
  setupImageUploadHandlers();
  setupAddProductForm();
  setupInventorySearch();
});

// Authentication Handling
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem('yakda_admin_logged_in') === 'true';
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');

  if (isLoggedIn) {
    loginView?.classList.add('hidden');
    dashboardView?.classList.remove('hidden');
    renderInventory();
  } else {
    loginView?.classList.remove('hidden');
    dashboardView?.classList.add('hidden');
  }
}

function setupLoginHandler() {
  const form = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('logout-btn');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (email === 'admin@yakda.ae' && password === 'admin123') {
      sessionStorage.setItem('yakda_admin_logged_in', 'true');
      checkAuth();
      showToast('Welcome back, Admin!');
    } else {
      alert('Invalid admin credentials. Please use admin@yakda.ae / admin123');
    }
  });

  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('yakda_admin_logged_in');
    checkAuth();
    showToast('Logged out of Admin Console');
  });
}

// Image File & URL Handler
function setupImageUploadHandlers() {
  const fileInput = document.getElementById('prod-file-input');
  const urlInput = document.getElementById('prod-url-input');
  const dropZone = document.getElementById('drop-zone');
  const previewContainer = document.getElementById('image-preview-container');
  const previewImg = document.getElementById('image-preview');

  function updatePreview(url) {
    if (url) {
      previewImageDataUrl = url;
      previewImg.src = url;
      previewContainer.classList.remove('hidden');
      previewContainer.classList.add('flex');
    } else {
      previewImageDataUrl = '';
      previewContainer.classList.add('hidden');
      previewContainer.classList.remove('flex');
    }
  }

  // Handle File Input
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Strict 200 KB Size Check
      if (file.size > 200 * 1024) {
        alert(`File size (${(file.size / 1024).toFixed(1)} KB) exceeds maximum limit of 200 KB. Please upload a smaller image file.`);
        fileInput.value = '';
        updatePreview('');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        updatePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle URL Input
  urlInput?.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val) {
      updatePreview(val);
    }
  });

  // Drag & Drop effects
  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-primary', 'bg-primary/5');
  });

  dropZone?.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-primary', 'bg-primary/5');
  });

  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-primary', 'bg-primary/5');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      // Strict 200 KB Size Check
      if (file.size > 200 * 1024) {
        alert(`File size (${(file.size / 1024).toFixed(1)} KB) exceeds maximum limit of 200 KB. Please upload a smaller image file.`);
        updatePreview('');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        updatePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  });
}

let editingProductId = null;

// Add / Edit Product Submission
function setupAddProductForm() {
  const form = document.getElementById('add-product-form');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('prod-name').value.trim();
    const sku = document.getElementById('prod-sku').value.trim();
    const category = document.getElementById('prod-category').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const badge = document.getElementById('prod-badge').value;
    const desc = document.getElementById('prod-desc').value.trim();

    if (!previewImageDataUrl) {
      alert('Please provide a product image file or image URL');
      return;
    }

    const productRecord = {
      id: editingProductId || Date.now().toString(),
      sku: sku,
      title: name,
      category: category,
      price: price,
      badge: badge || null,
      description: desc,
      image: previewImageDataUrl
    };

    if (editingProductId) {
      if (typeof updateProductInCloud === 'function') {
        await updateProductInCloud(productRecord);
      } else {
        let customProducts = JSON.parse(localStorage.getItem('yakda_custom_products') || '[]');
        const idx = customProducts.findIndex(p => p.id === editingProductId);
        if (idx !== -1) customProducts[idx] = productRecord;
        localStorage.setItem('yakda_custom_products', JSON.stringify(customProducts));
      }
      showToast(`Product "${name.substring(0, 20)}..." updated successfully!`);
    } else {
      if (typeof saveProductToCloud === 'function') {
        await saveProductToCloud(productRecord);
      } else {
        const customProducts = JSON.parse(localStorage.getItem('yakda_custom_products') || '[]');
        customProducts.unshift(productRecord);
        localStorage.setItem('yakda_custom_products', JSON.stringify(customProducts));
      }
      showToast(`Product "${name.substring(0, 20)}..." saved successfully!`);
    }

    cancelEdit();
    await renderInventory();
  });
}

// Edit Product Handler
async function editProduct(id) {
  const all = await getAllProducts();
  const prod = all.find(p => p.id === id);
  if (!prod) return;

  editingProductId = id;

  document.getElementById('prod-name').value = prod.title || '';
  document.getElementById('prod-sku').value = prod.sku || '';
  document.getElementById('prod-category').value = prod.category || 'writing';
  document.getElementById('prod-price').value = prod.price || 0;
  document.getElementById('prod-badge').value = prod.badge || '';
  document.getElementById('prod-desc').value = prod.description || '';

  if (prod.image) {
    previewImageDataUrl = prod.image;
    document.getElementById('image-preview').src = prod.image;
    document.getElementById('image-preview-container').classList.remove('hidden');
    document.getElementById('image-preview-container').classList.add('flex');
    document.getElementById('prod-url-input').value = prod.image.startsWith('data:') ? '' : prod.image;
  }

  // Update Form Labels to Edit Mode
  const titleEl = document.getElementById('form-card-title');
  const submitText = document.getElementById('prod-submit-text');
  const submitIcon = document.getElementById('prod-submit-icon');
  const cancelBtn = document.getElementById('cancel-edit-btn');

  if (titleEl) titleEl.textContent = `Edit Product: ${prod.title.substring(0, 25)}...`;
  if (submitText) submitText.textContent = 'Update Product';
  if (submitIcon) submitIcon.textContent = 'sync';
  if (cancelBtn) cancelBtn.classList.remove('hidden');

  document.getElementById('add-product-form')?.scrollIntoView({ behavior: 'smooth' });
}

// Cancel Edit Handler
function cancelEdit() {
  editingProductId = null;
  previewImageDataUrl = '';
  const form = document.getElementById('add-product-form');
  if (form) form.reset();

  document.getElementById('prod-url-input').value = '';
  document.getElementById('image-preview-container').classList.add('hidden');

  const titleEl = document.getElementById('form-card-title');
  const submitText = document.getElementById('prod-submit-text');
  const submitIcon = document.getElementById('prod-submit-icon');
  const cancelBtn = document.getElementById('cancel-edit-btn');

  if (titleEl) titleEl.textContent = 'Add New Product';
  if (submitText) submitText.textContent = 'Save Product';
  if (submitIcon) submitIcon.textContent = 'add_circle';
  if (cancelBtn) cancelBtn.classList.add('hidden');
}

// Get Products List from Database
async function getAllProducts() {
  if (typeof getProductsFromCloud === 'function') {
    return await getProductsFromCloud();
  }
  return JSON.parse(localStorage.getItem('yakda_custom_products') || '[]');
}

// Render Inventory Table
async function renderInventory(searchQuery = '') {
  const tbody = document.getElementById('inventory-tbody');
  const statEl = document.getElementById('stat-total-products');
  if (!tbody) return;

  const all = await getAllProducts();
  if (statEl) statEl.textContent = all.length;

  const filtered = searchQuery
    ? all.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    : all;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="p-6 text-center text-on-surface-variant">No products found in inventory</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => `
    <tr class="hover:bg-surface-container/50 transition-colors">
      <td class="p-3">
        <div class="flex items-center gap-3">
          <img src="${item.image}" alt="" class="w-10 h-10 object-contain bg-white rounded border border-outline-variant p-1 flex-shrink-0" />
          <span class="font-semibold text-on-surface line-clamp-1">${item.title}</span>
        </div>
      </td>
      <td class="p-3 font-mono text-on-surface-variant">${item.sku}</td>
      <td class="p-3 uppercase font-bold text-[10px] text-primary">${item.category}</td>
      <td class="p-3 font-bold text-on-surface">AED ${item.price.toFixed(2)}</td>
      <td class="p-3">
        ${item.badge ? `<span class="px-2 py-0.5 bg-primary/10 text-primary rounded font-bold text-[10px]">${item.badge}</span>` : '-'}
      </td>
      <td class="p-3 text-right">
        <div class="flex items-center justify-end gap-1">
          <button onclick="editProduct('${item.id}')" class="p-1 text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-surface-container" title="Edit Product">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onclick="deleteProduct('${item.id}')" class="p-1 text-on-surface-variant hover:text-error transition-colors rounded hover:bg-surface-container" title="Delete Product">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Search Filter
function setupInventorySearch() {
  const searchInput = document.getElementById('inventory-search');
  searchInput?.addEventListener('input', (e) => {
    renderInventory(e.target.value.trim());
  });
}

// Delete Product
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  if (typeof deleteProductFromCloud === 'function') {
    await deleteProductFromCloud(id);
  } else {
    let customProducts = JSON.parse(localStorage.getItem('yakda_custom_products') || '[]');
    customProducts = customProducts.filter(p => p.id !== id);
    localStorage.setItem('yakda_custom_products', JSON.stringify(customProducts));
  }

  if (editingProductId === id) {
    cancelEdit();
  }

  await renderInventory();
  showToast('Product deleted from inventory catalog');
}

// Toast Helper
function showToast(message) {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.className = 'fixed top-4 right-4 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 opacity-0 translate-y-[-10px] pointer-events-none';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="material-symbols-outlined text-[18px] text-primary-fixed">check_circle</span><span>${message}</span>`;
  toast.classList.remove('opacity-0', 'translate-y-[-10px]', 'pointer-events-none');

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-[-10px]', 'pointer-events-none');
  }, 3000);
}
