'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types/database';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '@/lib/actions/products';
import { createClient } from '@/lib/supabase/client';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Inventory State
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
      loadProducts();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.trim() === 'admin@yakda.ae' && loginPassword.trim() === 'admin123') {
      sessionStorage.setItem('yakda_admin_logged_in', 'true');
      setIsLoggedIn(true);
      loadProducts();
    } else {
      alert('Invalid admin credentials. Please use admin@yakda.ae / admin123');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('yakda_admin_logged_in');
    setIsLoggedIn(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024) {
        alert(`File size (${(file.size / 1024).toFixed(1)} KB) exceeds maximum limit of 200 KB. Please upload a smaller image.`);
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
      loadProducts();
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
        loadProducts();
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

  const filteredInventory = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#1A2A4E] text-[#16A2D4] flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-md">
              <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
            </div>
            <h2 className="text-2xl font-black text-[#1A2A4E]">Yakda Admin Console</h2>
            <p className="text-xs text-gray-500 mt-1">Sign in with administrator credentials</p>
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
      <main className="flex-1 max-w-[1280px] w-full mx-auto p-4 md:p-6 flex flex-col gap-8">
        
        {/* Overview Banner in Primary Navy Blue */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1A2A4E] text-white rounded-2xl p-6 shadow-md border border-[#16A2D4]/20">
          <div>
            <h2 className="text-2xl font-bold">Product Catalog Management</h2>
            <p className="text-xs text-white/80 mt-1">Add new products, upload images, set pricing, and manage inventory.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
            <span className="material-symbols-outlined text-[32px] text-[#F4B21B]">inventory_2</span>
            <div>
              <div className="text-xl font-bold text-white">{products.length}</div>
              <div className="text-[11px] text-white/80">Total Active Products</div>
            </div>
          </div>
        </div>

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
              <button
                onClick={resetForm}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#1A2A4E] rounded-lg"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1A2A4E]">Product Name / Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Caran d'Ache 849 Goldball Pen"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1A2A4E]">SKU / Code *</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. 8499"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1A2A4E]">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                >
                  <option value="writing">Writing & Pens</option>
                  <option value="paper">Paper & Envelopes</option>
                  <option value="machines">Office Machines</option>
                  <option value="furniture">Executive Furniture</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1A2A4E]">Price (AED) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="125.00"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1A2A4E]">Promotional Badge</label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                >
                  <option value="none">None</option>
                  <option value="Popular">Popular</option>
                  <option value="Best Seller">Best Seller</option>
                  <option value="New Arrival">New Arrival</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1A2A4E]">Product Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed specifications, dimensions, color, etc."
                  rows={3}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E] resize-none"
                ></textarea>
              </div>
            </div>

            {/* Image Upload Box */}
            <div className="md:col-span-4 flex flex-col gap-3">
              <label className="text-xs font-semibold text-[#1A2A4E]">Product Image (Max 200KB) *</label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative min-h-[160px]">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="material-symbols-outlined text-[32px] text-[#16A2D4]">cloud_upload</span>
                <p className="text-xs font-bold text-[#1A2A4E]">Click or Drag Image</p>
                <p className="text-[10px] text-gray-400">PNG, JPG, WEBP (Max 200 KB)</p>
              </div>

              {imagePreview && (
                <div className="w-full aspect-video bg-white rounded-xl border border-gray-200 p-2 flex items-center justify-center">
                  <img src={imagePreview} alt="Preview" className="max-h-full object-contain" />
                </div>
              )}

              {/* Save Button in Deep Red (#D93630) */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-[#D93630] hover:bg-[#b82a25] text-white font-bold text-xs rounded-xl shadow-md transition-all btn-press flex items-center justify-center gap-2 mt-auto"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                {isSaving ? 'Saving Product...' : editingProductId ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>

        {/* Inventory Table */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <h3 className="text-lg font-bold text-[#1A2A4E]">Current Inventory ({filteredInventory.length})</h3>
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inventory..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-gray-400 text-xs">Loading product inventory from Supabase...</div>
          ) : filteredInventory.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">No products in inventory matching search criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1A2A4E]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="p-3">Image</th>
                    <th className="p-3">Product Title</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Badge</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <img src={item.image || '/images/hero-desk.png'} alt={item.title} className="w-10 h-10 object-contain bg-white rounded-lg border border-gray-200 p-0.5" />
                      </td>
                      <td className="p-3 font-bold text-[#1A2A4E] max-w-xs truncate">{item.title}</td>
                      <td className="p-3 font-mono text-gray-400">{item.sku}</td>
                      <td className="p-3 capitalize">{item.category}</td>
                      <td className="p-3 font-bold text-[#D93630]">AED {Number(item.price).toFixed(2)}</td>
                      <td className="p-3">
                        {item.badge ? (
                          <span className="px-2 py-0.5 bg-[#D93630] text-white text-[9px] font-bold rounded uppercase">
                            {item.badge}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditProduct(item)}
                            className="p-1.5 text-[#16A2D4] hover:bg-[#16A2D4]/10 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item.id)}
                            className="p-1.5 text-[#D93630] hover:bg-[#D93630]/10 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
