'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, Order } from '@/types/database';
import { fetchPaginatedProducts, fetchTotalProductCount, createProduct, updateProduct, deleteProduct } from '@/lib/actions/products';
import { fetchAllOrdersForAdmin, updateOrderStatusInDb } from '@/lib/actions/orders';
import { createClient } from '@/lib/supabase/client';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Active Admin Tab ('inventory' | 'orders')
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');

  // Inventory & Pagination State
  const [products, setProducts] = useState<Product[]>([]);
  const [totalInventoryCount, setTotalInventoryCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('writing');
  const [price, setPrice] = useState('');
  const [badge, setBadge] = useState('none');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const adminSession = sessionStorage.getItem('yakda_admin_logged_in') === 'true';
    if (adminSession) {
      setIsLoggedIn(true);
      loadInventoryData(1, searchQuery);
      loadOrdersData();
    } else {
      setIsLoadingProducts(false);
    }
  }, []);

  const loadInventoryData = async (page: number = currentPage, query: string = searchQuery) => {
    setIsLoadingProducts(true);
    try {
      // 1. Get exact total product count (2910+)
      const count = await fetchTotalProductCount();
      setTotalInventoryCount(count);

      // 2. Fetch paginated products range
      const { products: paginatedData, totalCount: queryCount } = await fetchPaginatedProducts(page, pageSize, query);
      setProducts(paginatedData);
      if (query.trim()) {
        setTotalInventoryCount(queryCount);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadOrdersData = async () => {
    setIsLoadingOrders(true);
    try {
      const data = await fetchAllOrdersForAdmin();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();
    const isExactAdmin = (cleanEmail === 'admin@yakda.ae' || cleanEmail === 'admin') && loginPassword.trim() === 'admin123';

    if (isExactAdmin) {
      sessionStorage.setItem('yakda_admin_logged_in', 'true');
      setIsLoggedIn(true);
      loadInventoryData(1, '');
      loadOrdersData();
    } else {
      alert('Access Denied: Only users with account_type "admin" can access the Admin Panel. (Default admin: admin@yakda.ae / admin123)');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('yakda_admin_logged_in');
    setIsLoggedIn(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadInventoryData(1, searchQuery);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    const maxPages = Math.ceil(totalInventoryCount / pageSize) || 1;
    if (newPage > maxPages) return;
    setCurrentPage(newPage);
    loadInventoryData(newPage, searchQuery);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await updateOrderStatusInDb(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        alert(`Failed to update status: ${res.error}`);
      }
    } catch (e: any) {
      alert(`Error updating order status: ${e.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024) {
        alert(`File size (${(file.size / 1024).toFixed(1)} KB) exceeds maximum limit of 200 KB.`);
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFileToSupabaseStorage = async (file: File): Promise<string> => {
    const supabase = createClient();
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'yakda';
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.warn("Storage upload warning:", error.message);
      return imagePreview;
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || !price) {
      alert('Please fill in Product Name, SKU code, and Price.');
      return;
    }

    setIsSaving(true);
    try {
      let finalImg = imageUrl.trim() || '/images/hero-desk.png';
      if (selectedFile) {
        finalImg = await uploadFileToSupabaseStorage(selectedFile);
      } else if (imagePreview) {
        finalImg = imagePreview;
      }

      const productPayload: Partial<Product> = {
        title: name.trim(),
        sku: sku.trim(),
        category,
        price: parseFloat(price),
        badge: badge === 'none' ? null : badge,
        description: description.trim(),
        image: finalImg,
      };

      if (editingProductId) {
        await updateProduct(editingProductId, productPayload);
        alert('Product updated successfully!');
      } else {
        await createProduct(productPayload);
        alert('Product created successfully!');
      }

      resetForm();
      loadInventoryData(currentPage, searchQuery);
    } catch (err: any) {
      alert(`Error saving product: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.title);
    setSku(product.sku);
    setCategory(product.category || 'writing');
    setPrice(product.price.toString());
    setBadge(product.badge || 'none');
    setDescription(product.description || '');
    setImageUrl(product.image);
    setImagePreview(product.image);
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        alert('Product deleted successfully!');
        loadInventoryData(currentPage, searchQuery);
      } catch (e: any) {
        alert(`Failed to delete product: ${e.message}`);
      }
    }
  };

  const resetForm = () => {
    setEditingProductId(null);
    setName('');
    setSku('');
    setCategory('writing');
    setPrice('');
    setBadge('none');
    setDescription('');
    setImageUrl('');
    setImagePreview('');
    setSelectedFile(null);
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      (o.contact_phone && o.contact_phone.includes(orderSearchQuery))
  );

  const totalPages = Math.ceil(totalInventoryCount / pageSize) || 1;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#1A2A4E] text-[#16A2D4] flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-md">
              <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
            </div>
            <h2 className="text-2xl font-black text-[#1A2A4E]">Yakda Admin Console</h2>
            <p className="text-xs text-gray-500 mt-1">Authorized admin login (account_type: admin)</p>
          </div>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#1A2A4E]">Admin Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@yakda.ae"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#1A2A4E]">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1A2A4E] hover:bg-[#13203c] text-white font-bold text-xs rounded-xl shadow-md transition-all btn-press mt-2"
            >
              Sign In to Admin Dashboard
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <Link href="/" className="text-xs font-semibold text-[#16A2D4] hover:underline">
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-[#1A2A4E] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Yakda Stationery" className="h-9 w-auto object-contain" />
            <span className="text-lg font-black text-white">Admin Panel</span>
            <span className="px-2 py-0.5 bg-[#16A2D4] text-white text-[10px] font-black rounded uppercase">
              ADMIN
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-semibold text-white/80 hover:text-[#16A2D4] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">storefront</span> Storefront
            </Link>
            <div className="h-4 w-px bg-white/20"></div>
            <button
              onClick={handleAdminLogout}
              className="p-2 text-white/80 hover:text-[#D93630] transition-colors rounded-full hover:bg-white/10"
              title="Logout"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Overview Banner & Tab Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1A2A4E] text-white rounded-2xl p-6 shadow-md border border-[#16A2D4]/20">
          <div>
            <h2 className="text-2xl font-bold">Yakda Executive Management Console</h2>
            <p className="text-xs text-white/80 mt-1">Manage catalog inventory, pricing, upload assets, and track customer orders.</p>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl border border-white/20">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'inventory'
                  ? 'bg-[#16A2D4] text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              <span>Catalog ({totalInventoryCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-[#16A2D4] text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>Customer Orders ({orders.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="flex flex-col gap-6">
            {/* Add/Edit Product Form */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#16A2D4] text-[24px]">
                    {editingProductId ? 'edit' : 'add_box'}
                  </span>
                  <h3 className="text-lg font-bold text-[#1A2A4E]">
                    {editingProductId ? 'Edit Product' : 'Add New Product'}
                  </h3>
                </div>
                {editingProductId && (
                  <button onClick={resetForm} className="text-xs font-semibold text-gray-500 hover:text-gray-700">
                    Cancel Editing
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1A2A4E]">Product Title *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Double A Copy Paper A4 80gsm Ream"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                    required
                  />
                </div>

                <div className="md:col-span-3 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1A2A4E]">SKU Code *</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. DBL-A4-80"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                    required
                  />
                </div>

                <div className="md:col-span-3 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1A2A4E]">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                  >
                    <option value="writing">Writing Supplies</option>
                    <option value="paper">Office Paper Products</option>
                    <option value="machines">Office Machines</option>
                    <option value="labels">Labels &amp; Label Makers</option>
                    <option value="binders">Binders &amp; Accessories</option>
                    <option value="crafts">School &amp; Crafts</option>
                    <option value="basics">Office Basics</option>
                    <option value="boards">Boards &amp; Easels</option>
                    <option value="storage">Storage &amp; Organization</option>
                    <option value="shipping">Mailing &amp; Shipping</option>
                    <option value="print-copy">Print &amp; Copy Room</option>
                    <option value="computers">Computers &amp; Tech</option>
                  </select>
                </div>

                <div className="md:col-span-3 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1A2A4E]">Price (AED) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="29.99"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                    required
                  />
                </div>

                <div className="md:col-span-3 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1A2A4E]">Badge</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                  >
                    <option value="none">None</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="Sale">Sale</option>
                    <option value="New Arrival">New Arrival</option>
                  </select>
                </div>

                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1A2A4E]">Image Upload (&lt;200KB) / URL</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#16A2D4]/10 file:text-[#16A2D4] hover:file:bg-[#16A2D4]/20"
                    />
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or paste image URL"
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none text-[#1A2A4E]"
                    />
                  </div>
                </div>

                <div className="md:col-span-12 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1A2A4E]">Product Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed specification..."
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                  ></textarea>
                </div>

                <div className="md:col-span-12 flex justify-end gap-3 mt-2">
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#16A2D4] hover:bg-[#1288b3] text-white font-bold text-xs rounded-xl shadow-md transition-all btn-press flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    {isSaving ? 'Saving...' : editingProductId ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>

            {/* Inventory List Header with Search & Exact Total Count */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1A2A4E] flex items-center gap-2">
                    Current Catalog Inventory
                    <span className="px-2.5 py-0.5 bg-[#16A2D4]/10 text-[#16A2D4] text-xs font-black rounded-full">
                      {totalInventoryCount} Total Items
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Showing Page {currentPage} of {totalPages} ({pageSize} products per page)
                  </p>
                </div>

                {/* Instant Inventory Search Form */}
                <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Title, SKU, Category..."
                    className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                  />
                  <button type="submit" className="absolute right-2 text-gray-400 hover:text-[#16A2D4]">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </button>
                </form>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-[#1A2A4E] font-bold bg-gray-50/50">
                      <th className="p-3">Image</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Badge</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoadingProducts ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400 font-semibold">
                          Loading products from Supabase...
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          No matching products found in inventory.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-3">
                            <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white p-1 flex items-center justify-center">
                              <img src={p.image || '/images/hero-desk.png'} alt={p.title} className="max-h-full max-w-full object-contain" />
                            </div>
                          </td>
                          <td className="p-3 font-mono font-bold text-[#1A2A4E]">{p.sku}</td>
                          <td className="p-3 font-semibold text-[#1A2A4E] max-w-xs truncate">{p.title}</td>
                          <td className="p-3 capitalize font-medium text-gray-600">{p.category}</td>
                          <td className="p-3 font-black text-[#D93630]">AED {Number(p.price).toFixed(2)}</td>
                          <td className="p-3">
                            {p.badge ? (
                              <span className="px-2 py-0.5 bg-[#004d40] text-white text-[10px] font-bold rounded">
                                {p.badge}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditProduct(p)}
                                className="p-1.5 text-[#16A2D4] hover:bg-[#16A2D4]/10 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-[#D93630] hover:bg-[#D93630]/10 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Clean Pagination Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 pt-4">
                <span className="text-xs text-gray-500 font-semibold">
                  Page {currentPage} of {totalPages} ({totalInventoryCount} products)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-[#1A2A4E] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-[#1A2A4E] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span> Previous
                  </button>
                  
                  <span className="px-3 py-1.5 bg-[#16A2D4] text-white text-xs font-black rounded-lg">
                    {currentPage}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-[#1A2A4E] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-[#1A2A4E] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1A2A4E] flex items-center gap-2">
                  Customer Orders Management
                  <span className="px-2.5 py-0.5 bg-[#16A2D4]/10 text-[#16A2D4] text-xs font-black rounded-full">
                    {orders.length} Orders
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  View customer contact numbers, delivery addresses, order items, and update order status.
                </p>
              </div>

              {/* Order Search Bar */}
              <div className="w-full sm:w-80 relative flex items-center">
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Filter by Order ID, Email, Phone..."
                  className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                />
                <span className="material-symbols-outlined text-[20px] text-gray-400 absolute right-3 pointer-events-none">search</span>
              </div>
            </div>

            {isLoadingOrders ? (
              <div className="py-12 text-center text-gray-400 font-semibold">
                Loading orders from database...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No orders match your filter criteria.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 border border-gray-200 rounded-2xl bg-gray-50/50 flex flex-col gap-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-[#1A2A4E]">{ord.id}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {ord.created_at ? new Date(ord.created_at).toLocaleString() : 'Recent'}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-[#16A2D4] mt-0.5">
                          Customer: {ord.customer_email} {ord.contact_phone ? `(${ord.contact_phone})` : ''}
                        </div>
                      </div>

                      {/* Status Update Control */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">Status:</span>
                        <select
                          value={ord.status || 'pending'}
                          disabled={updatingOrderId === ord.id}
                          onChange={(e) => handleStatusUpdate(ord.id, e.target.value)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-300 bg-white text-[#1A2A4E] focus:outline-none focus:border-[#16A2D4]"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer Delivery Details */}
                    {ord.delivery_address && (
                      <div className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200/80">
                        <strong className="text-[#1A2A4E]">Delivery Address:</strong> {ord.delivery_address}
                      </div>
                    )}

                    {/* Order Items Table */}
                    <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
                            <th className="p-2.5">Item Title</th>
                            <th className="p-2.5 text-center">Qty</th>
                            <th className="p-2.5 text-right">Price</th>
                            <th className="p-2.5 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {Array.isArray(ord.items) &&
                            ord.items.map((it: any, idx: number) => (
                              <tr key={idx}>
                                <td className="p-2.5 font-medium text-[#1A2A4E]">{it.title}</td>
                                <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                                <td className="p-2.5 text-right">AED {Number(it.price).toFixed(2)}</td>
                                <td className="p-2.5 text-right font-black">
                                  AED {(Number(it.price) * Number(it.quantity)).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Total Amount Footer */}
                    <div className="flex justify-end items-center gap-2 pt-1">
                      <span className="text-xs font-bold text-gray-600">Total Order Amount:</span>
                      <span className="text-base font-black text-[#D93630]">
                        AED {Number(ord.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
