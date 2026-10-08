'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { Product, Order, Category, Blog } from '@/types/database';
import { fetchPaginatedProducts, fetchTotalProductCount, createProduct, updateProduct, deleteProduct, fetchCategories, createCategory, fetchAllProductsForExport } from '@/lib/actions/products';
import { normalizeCategorySlug } from '@/lib/utils/categories';
import { fetchBlogs, createBlog, updateBlog, deleteBlog } from '@/lib/actions/blogs';
import { fetchAllOrdersForAdmin, updateOrderStatusInDb } from '@/lib/actions/orders';
import { createClient } from '@/lib/supabase/client';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Active Admin Tab ('inventory' | 'orders' | 'blogs')
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'blogs'>('inventory');

  // Inventory & Pagination State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalInventoryCount, setTotalInventoryCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isExportingCatalogue, setIsExportingCatalogue] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
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

  // SEO Override State (all optional)
  const [showSeoFields, setShowSeoFields] = useState(false);
  const [seoCanonical, setSeoCanonical] = useState('');
  const [seoH1, setSeoH1] = useState('');
  const [seoImageAlt, setSeoImageAlt] = useState('');
  const [seoOgTitle, setSeoOgTitle] = useState('');
  const [seoOgDescription, setSeoOgDescription] = useState('');
  const [seoOgImage, setSeoOgImage] = useState('');
  // Track which SEO fields the user has manually edited (don't auto-overwrite those)
  const [seoManualEdits, setSeoManualEdits] = useState<Record<string, boolean>>({});

  // Auto-generate SEO values from product fields
  useEffect(() => {
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const catLabel = categories.find(c => c.slug === category)?.name || category || '';

    if (!seoManualEdits.canonical) {
      setSeoCanonical(slug ? `https://yakdastationery.com/products/${slug}` : '');
    }
    if (!seoManualEdits.h1) {
      setSeoH1(name.trim());
    }
    if (!seoManualEdits.imageAlt) {
      setSeoImageAlt(name.trim() ? `${name.trim()} - ${catLabel}` : '');
    }
    if (!seoManualEdits.ogTitle) {
      setSeoOgTitle(name.trim() ? `${name.trim()} | Yakda UAE` : '');
    }
    if (!seoManualEdits.ogDescription) {
      setSeoOgDescription(description.trim() || '');
    }
    if (!seoManualEdits.ogImage) {
      setSeoOgImage(imagePreview || imageUrl || '');
    }
  }, [name, sku, category, description, imageUrl, imagePreview, categories, seoManualEdits]);

  // Blogs State
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState('');
  const [blogPublished, setBlogPublished] = useState(false);
  const [isSavingBlog, setIsSavingBlog] = useState(false);

  const loadCategoriesData = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadBlogsData = async () => {
    try {
      const data = await fetchBlogs();
      setBlogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const adminSession = sessionStorage.getItem('yakda_admin_logged_in') === 'true';
    if (adminSession) {
      setIsLoggedIn(true);
      loadInventoryData(1, searchQuery, inventoryCategoryFilter);
      loadCategoriesData();
      loadBlogsData();
      loadOrdersData();
    } else {
      setIsLoadingProducts(false);
    }
  }, []);

  const loadInventoryData = async (
    page: number = currentPage,
    query: string = searchQuery,
    catFilter: string = inventoryCategoryFilter
  ) => {
    setIsLoadingProducts(true);
    try {
      // 1. Get exact total product count
      const count = await fetchTotalProductCount();
      setTotalInventoryCount(count);

      // 2. Fetch paginated products range with optional category filter
      const { products: paginatedData, totalCount: queryCount } = await fetchPaginatedProducts(page, pageSize, query, catFilter);
      setProducts(paginatedData);
      if (query.trim() || (catFilter && catFilter !== 'all')) {
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

  const generateAutoSku = (categorySlug: string, titleName: string): string => {
    const catPrefix = (categorySlug || 'GEN').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'GEN';
    const cleanTitle = (titleName || 'YAK').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'YAK';
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `YAK-${catPrefix}-${cleanTitle}-${randomSuffix}`;
  };

  const handleExportCatalogueToExcel = async () => {
    setIsExportingCatalogue(true);
    try {
      const allProducts = await fetchAllProductsForExport();
      if (!allProducts || allProducts.length === 0) {
        alert('No products available to export.');
        return;
      }

      const exportData = allProducts.map((p, idx) => ({
        'S.No': idx + 1,
        'SKU Code': p.sku || 'N/A',
        'Product Name': p.title || '',
        'Category': p.category || '',
        'Price (AED)': Number(p.price || 0).toFixed(2),
        'Badge': p.badge || 'None',
        'Image URL': p.image || '',
        'Description': p.description || '',
        'Created Date': p.created_at ? new Date(p.created_at).toLocaleDateString() : ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      worksheet['!cols'] = [
        { wch: 6 },
        { wch: 22 },
        { wch: 45 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 35 },
        { wch: 50 },
        { wch: 15 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Catalogue');

      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `Yakda_Catalogue_${dateStr}.xlsx`);
    } catch (err: any) {
      alert(`Failed to export catalogue: ${err.message}`);
    } finally {
      setIsExportingCatalogue(false);
    }
  };

  const handleExportOrdersToExcel = () => {
    try {
      if (!filteredOrders || filteredOrders.length === 0) {
        alert('No orders available to export.');
        return;
      }

      const exportData = filteredOrders.map((ord, idx) => {
        let itemsSummary = '';
        if (Array.isArray(ord.items)) {
          itemsSummary = ord.items
            .map((it: any) => `${it.title} (Qty: ${it.quantity}, Price: AED ${Number(it.price || 0).toFixed(2)})`)
            .join(' | ');
        }

        return {
          'S.No': idx + 1,
          'Order ID': ord.id,
          'Order Date': ord.created_at ? new Date(ord.created_at).toLocaleString() : 'N/A',
          'Customer Email': ord.customer_email || 'N/A',
          'Customer Phone': ord.contact_phone || 'N/A',
          'Order Status': (ord.status || 'pending').toUpperCase(),
          'Delivery Address': ord.delivery_address || 'N/A',
          'Items Purchased': itemsSummary,
          'Total Amount (AED)': Number(ord.total_amount || 0).toFixed(2)
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      worksheet['!cols'] = [
        { wch: 6 },
        { wch: 28 },
        { wch: 22 },
        { wch: 30 },
        { wch: 20 },
        { wch: 15 },
        { wch: 45 },
        { wch: 60 },
        { wch: 18 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Orders');

      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `Yakda_Customer_Orders_${dateStr}.xlsx`);
    } catch (err: any) {
      alert(`Failed to export customer orders: ${err.message}`);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();
    const isExactAdmin = (cleanEmail === 'admin@yakda.ae' || cleanEmail === 'admin') && loginPassword.trim() === 'admin123';

    if (isExactAdmin) {
      sessionStorage.setItem('yakda_admin_logged_in', 'true');
      setIsLoggedIn(true);
      loadInventoryData(1, '', 'all');
      loadCategoriesData();
      loadBlogsData();
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
    loadInventoryData(1, searchQuery, inventoryCategoryFilter);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    const maxPages = Math.ceil(totalInventoryCount / pageSize) || 1;
    if (newPage > maxPages) return;
    setCurrentPage(newPage);
    loadInventoryData(newPage, searchQuery, inventoryCategoryFilter);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!window.confirm("Are you sure you want to change this order's status?")) return;
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
    if (!name.trim() || !price) {
      alert('Please fill in Product Name and Price.');
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

      let finalSku = sku.trim();
      if (!editingProductId || !finalSku) {
        finalSku = generateAutoSku(category, name);
      }

      const productPayload: Partial<Product> = {
        title: name.trim(),
        sku: finalSku,
        category: normalizeCategorySlug(category),
        price: parseFloat(price),
        badge: badge === 'none' ? null : badge,
        description: description.trim(),
        image: finalImg,
        // SEO Overrides (only include if filled)
        seo_canonical: seoCanonical.trim() || null,
        seo_h1: seoH1.trim() || null,
        seo_image_alt: seoImageAlt.trim() || null,
        seo_og_title: seoOgTitle.trim() || null,
        seo_og_description: seoOgDescription.trim() || null,
        seo_og_image: seoOgImage.trim() || null,
      };

      if (editingProductId) {
        await updateProduct(editingProductId, productPayload);
        alert('Product updated successfully!');
      } else {
        await createProduct(productPayload);
        alert(`Product created successfully with Auto SKU: ${finalSku}`);
      }

      resetForm();
      loadInventoryData(currentPage, searchQuery, inventoryCategoryFilter);
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
    setCategory(normalizeCategorySlug(product.category || 'writing'));
    setPrice(product.price.toString());
    setBadge(product.badge || 'none');
    setDescription(product.description || '');
    setImageUrl(product.image);
    setImagePreview(product.image);
    setSelectedFile(null);
    // SEO fields
    setSeoCanonical(product.seo_canonical || '');
    setSeoH1(product.seo_h1 || '');
    setSeoImageAlt(product.seo_image_alt || '');
    setSeoOgTitle(product.seo_og_title || '');
    setSeoOgDescription(product.seo_og_description || '');
    setSeoOgImage(product.seo_og_image || '');
    const hasSeo = !!(product.seo_canonical || product.seo_h1 || product.seo_image_alt || product.seo_og_title || product.seo_og_description || product.seo_og_image);
    setShowSeoFields(hasSeo);
    // Mark fields that have saved values as manually edited so auto-gen doesn't overwrite
    setSeoManualEdits({
      canonical: !!product.seo_canonical,
      h1: !!product.seo_h1,
      imageAlt: !!product.seo_image_alt,
      ogTitle: !!product.seo_og_title,
      ogDescription: !!product.seo_og_description,
      ogImage: !!product.seo_og_image,
    });
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
    // SEO fields
    setSeoCanonical('');
    setSeoH1('');
    setSeoImageAlt('');
    setSeoOgTitle('');
    setSeoOgDescription('');
    setSeoOgImage('');
    setShowSeoFields(false);
    setSeoManualEdits({});
  };

  const resetBlogForm = () => {
    setEditingBlogId(null);
    setBlogTitle('');
    setBlogContent('');
    setBlogImage('');
    setBlogPublished(false);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogContent.trim()) {
      alert('Please fill in Title and Content.');
      return;
    }
    setIsSavingBlog(true);
    try {
      const slug = blogTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const payload = {
        title: blogTitle.trim(),
        slug,
        content: blogContent.trim(),
        image: blogImage.trim() || null,
        published: blogPublished,
      };
      if (editingBlogId) {
        await updateBlog(editingBlogId, payload);
        alert('Blog updated successfully!');
      } else {
        await createBlog(payload);
        alert('Blog created successfully!');
      }
      resetBlogForm();
      loadBlogsData();
    } catch (err: any) {
      alert(`Error saving blog: ${err.message}`);
    } finally {
      setIsSavingBlog(false);
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlogId(blog.id);
    setBlogTitle(blog.title);
    setBlogContent(blog.content);
    setBlogImage(blog.image || '');
    setBlogPublished(!!blog.published);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBlog = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteBlog(id);
        alert('Blog deleted successfully!');
        loadBlogsData();
      } catch (e: any) {
        alert(`Failed to delete blog: ${e.message}`);
      }
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      (o.contact_phone && o.contact_phone.includes(orderSearchQuery));
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

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

            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'blogs'
                  ? 'bg-[#16A2D4] text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">article</span>
              <span>Blogs</span>
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
                <div className={editingProductId ? "md:col-span-6 flex flex-col gap-1" : "md:col-span-6 flex flex-col gap-1"}>
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

                {editingProductId ? (
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1A2A4E]">SKU Code (Auto-generated)</label>
                    <input
                      type="text"
                      value={sku}
                      readOnly
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-100 border border-gray-200 font-mono font-bold text-gray-600 cursor-not-allowed"
                    />
                  </div>
                ) : null}

                <div className="md:col-span-3 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1A2A4E]">Category *</label>
                  <select
                    value={category}
                    onChange={async (e) => {
                      const val = e.target.value;
                      if (val === 'new_category') {
                        const newName = window.prompt("Enter new category name:");
                        if (newName && newName.trim()) {
                          const slug = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                          try {
                            await createCategory({ name: newName.trim(), slug, icon: 'category', is_active: true });
                            await loadCategoriesData();
                            setCategory(slug);
                          } catch(err: any) {
                            alert("Failed to create category: " + err.message);
                          }
                        }
                      } else {
                        setCategory(val);
                      }
                    }}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                  >
                    {categories.filter(c => c.slug !== 'all').map((c) => (
                      <option key={c.id || c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                    <option value="new_category" className="font-bold text-[#16A2D4]">+ Add New Category</option>
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

                <div className={editingProductId ? "md:col-span-6 flex flex-col gap-1" : "md:col-span-6 flex flex-col gap-1"}>
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

                {/* SEO Overrides — Collapsible */}
                <div className="md:col-span-12">
                  <button
                    type="button"
                    onClick={() => setShowSeoFields(!showSeoFields)}
                    className="flex items-center gap-2 text-xs font-bold text-[#1A2A4E]/70 hover:text-[#16A2D4] transition-colors py-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">{showSeoFields ? 'expand_less' : 'expand_more'}</span>
                    <span className="material-symbols-outlined text-[16px]">search</span>
                    SEO Overrides (Optional)
                    <span className="text-[10px] font-normal text-gray-400 ml-1">— leave blank for auto-generated values</span>
                  </button>

                  {showSeoFields && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                      <div className="md:col-span-6 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Canonical URL</label>
                        <input
                          type="text"
                          value={seoCanonical}
                          onChange={(e) => { setSeoCanonical(e.target.value); setSeoManualEdits(p => ({...p, canonical: true})); }}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                        />
                      </div>

                      <div className="md:col-span-6 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">H1 Override</label>
                        <input
                          type="text"
                          value={seoH1}
                          onChange={(e) => { setSeoH1(e.target.value); setSeoManualEdits(p => ({...p, h1: true})); }}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                        />
                      </div>

                      <div className="md:col-span-6 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image ALT Text</label>
                        <input
                          type="text"
                          value={seoImageAlt}
                          onChange={(e) => { setSeoImageAlt(e.target.value); setSeoManualEdits(p => ({...p, imageAlt: true})); }}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                        />
                      </div>

                      <div className="md:col-span-6 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Open Graph Title</label>
                        <input
                          type="text"
                          value={seoOgTitle}
                          onChange={(e) => { setSeoOgTitle(e.target.value); setSeoManualEdits(p => ({...p, ogTitle: true})); }}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                        />
                      </div>

                      <div className="md:col-span-6 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Open Graph Description</label>
                        <textarea
                          value={seoOgDescription}
                          onChange={(e) => { setSeoOgDescription(e.target.value); setSeoManualEdits(p => ({...p, ogDescription: true})); }}
                          rows={2}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                        />
                      </div>

                      <div className="md:col-span-6 flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Open Graph Image URL</label>
                        <input
                          type="text"
                          value={seoOgImage}
                          onChange={(e) => { setSeoOgImage(e.target.value); setSeoManualEdits(p => ({...p, ogImage: true})); }}
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                        />
                      </div>

                      <div className="md:col-span-12">
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          <strong>Auto-generated:</strong> Canonical URL from product slug • H1 from Product Name • Image ALT as &quot;Product Name - Brand&quot; • Product Schema from Name, SKU, Price, Availability • OG Title as &quot;Product Name | Yakda UAE&quot; • OG Description from Product Description • OG Image from Main Image • Breadcrumbs as Home → Category → Product
                        </p>
                      </div>
                    </div>
                  )}
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

                {/* Controls: Category Filter, Search, Excel Export */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Category Filter Dropdown */}
                  <select
                    value={inventoryCategoryFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInventoryCategoryFilter(val);
                      setCurrentPage(1);
                      loadInventoryData(1, searchQuery, val);
                    }}
                    className="px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                  >
                    <option value="all">All Categories</option>
                    {categories.filter(c => c.slug !== 'all').map((c) => (
                      <option key={c.id || c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Search Form */}
                  <form onSubmit={handleSearchSubmit} className="w-full sm:w-60 relative flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Title, SKU, Category..."
                      className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                    />
                    <button type="submit" className="absolute right-2 text-gray-400 hover:text-[#16A2D4]">
                      <span className="material-symbols-outlined text-[20px]">search</span>
                    </button>
                  </form>

                  {/* Excel Export Catalogue Button */}
                  <button
                    type="button"
                    onClick={handleExportCatalogueToExcel}
                    disabled={isExportingCatalogue}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Export Catalogue to Excel (.xlsx)"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>{isExportingCatalogue ? 'Exporting...' : 'Export Catalogue Excel'}</span>
                  </button>
                </div>
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

        {/* TAB 3: BLOGS MANAGEMENT */}
        {activeTab === 'blogs' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#16A2D4] text-[24px]">
                    {editingBlogId ? 'edit' : 'add_box'}
                  </span>
                  <h3 className="text-lg font-bold text-[#1A2A4E]">
                    {editingBlogId ? 'Edit Blog' : 'Add New Blog'}
                  </h3>
                </div>
                {editingBlogId && (
                  <button onClick={resetBlogForm} className="text-xs font-semibold text-gray-500 hover:text-gray-700">
                    Cancel Editing
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveBlog} className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1A2A4E]">Blog Title *</label>
                  <input
                    type="text"
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    placeholder="e.g. Best 5 office pens..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1A2A4E]">Cover Image URL</label>
                  <input
                    type="text"
                    value={blogImage}
                    onChange={(e) => setBlogImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1A2A4E]">Content (Markdown/HTML supported) *</label>
                  <textarea
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    placeholder="Write your blog content here..."
                    rows={8}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                    required
                  ></textarea>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="blogPublished"
                    checked={blogPublished}
                    onChange={(e) => setBlogPublished(e.target.checked)}
                    className="w-4 h-4 text-[#16A2D4] rounded border-gray-300 focus:ring-[#16A2D4]"
                  />
                  <label htmlFor="blogPublished" className="text-xs font-semibold text-[#1A2A4E]">Publish immediately?</label>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  {editingBlogId && (
                    <button
                      type="button"
                      onClick={resetBlogForm}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSavingBlog}
                    className="px-6 py-2.5 bg-[#16A2D4] hover:bg-[#1288b3] text-white font-bold text-xs rounded-xl shadow-md transition-all btn-press flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    {isSavingBlog ? 'Saving...' : editingBlogId ? 'Update Blog' : 'Create Blog'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <h3 className="text-lg font-bold text-[#1A2A4E] border-b border-gray-200 pb-4">
                All Blogs ({blogs.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-[#1A2A4E] font-bold bg-gray-50/50">
                      <th className="p-3">Title</th>
                      <th className="p-3">Slug</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {blogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">No blogs found.</td>
                      </tr>
                    ) : (
                      blogs.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-3 font-semibold text-[#1A2A4E]">{b.title}</td>
                          <td className="p-3 text-gray-500 font-mono">{b.slug}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${b.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {b.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleEditBlog(b)}
                              className="p-1.5 text-[#16A2D4] hover:bg-[#16A2D4]/10 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(b.id)}
                              className="p-1.5 text-[#D93630] hover:bg-[#D93630]/10 rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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

              {/* Order Controls: Status Filter, Search, Excel Export */}
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full sm:w-36 px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="w-full sm:w-56 relative flex items-center">
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Filter by Order ID, Email, Phone..."
                    className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                  />
                  <span className="material-symbols-outlined text-[20px] text-gray-400 absolute right-3 pointer-events-none">search</span>
                </div>

                {/* Export Orders Excel Button */}
                <button
                  type="button"
                  onClick={handleExportOrdersToExcel}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Export Customer Orders to Excel (.xlsx)"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Export Orders Excel</span>
                </button>
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
