import React, { useEffect, useRef, useState } from 'react';
import { Product, Category, ProductVariant } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

interface AdminProductsPageProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
  onNotify: (msg: string) => void;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({
  products,
  categories,
  onRefresh,
  onNotify,
}) => {
  const { language, t } = useLanguage();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [form, setForm] = useState({
    sku: '',
    nameFr: '',
    nameAr: '',
    descriptionFr: '',
    descriptionAr: '',
    category: 'cat_maquillage',
    price: 3500,
    originalPrice: 0,
    stockQuantity: 20,
    image: '/no-product-image.svg',
    badgeFr: '',
    badgeAr: '',
    featured: false,
    isNewArrival: true,
  });

  const [variantsList, setVariantsList] = useState<ProductVariant[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl(null);
      return;
    }
    const preview = URL.createObjectURL(selectedImage);
    setImagePreviewUrl(preview);
    return () => URL.revokeObjectURL(preview);
  }, [selectedImage]);

  const generateSku = () => {
    const existingSkus = new Set(products.map((product) => product.sku.toUpperCase()));
    let sku = '';
    do {
      sku = `BK-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID()
        .replace(/-/g, '')
        .slice(0, 8)
        .toUpperCase()}`;
    } while (existingSkus.has(sku));
    return sku;
  };

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = ['jpg', 'jpeg', 'jfif', 'png', 'webp'];
    const acceptedTypes = ['image/jpeg', 'image/jfif', 'image/png', 'image/webp'];
    if (!extension || !acceptedExtensions.includes(extension) || (file.type && !acceptedTypes.includes(file.type))) {
      setFormError('Format non pris en charge. Choisissez une image JPG, JPEG, JFIF, PNG ou WEBP.');
      return;
    }
    if (file.size <= 0 || file.size > 5 * 1024 * 1024) {
      setFormError('L’image doit peser moins de 5 Mo.');
      return;
    }

    setFormError('');
    setSelectedImage(file);
  };

  const readImageAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Impossible de lire le fichier image.'));
          return;
        }
        const extension = file.name.split('.').pop()?.toLowerCase();
        const mimeType =
          file.type ||
          (extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg');
        resolve(reader.result.replace(/^data:[^;]*;base64,/, `data:${mimeType};base64,`));
      };
      reader.onerror = () => reject(new Error('Impossible de lire le fichier image.'));
      reader.readAsDataURL(file);
    });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setSelectedImage(null);
    setFormError('');
    if (imageInputRef.current) imageInputRef.current.value = '';
    setForm({
      sku: generateSku(),
      nameFr: '',
      nameAr: '',
      descriptionFr: '',
      descriptionAr: '',
      category: categories[0]?.id || 'cat_maquillage',
      price: 3500,
      originalPrice: 0,
      stockQuantity: 20,
      image: '/no-product-image.svg',
      badgeFr: 'Nouveauté',
      badgeAr: 'جديد',
      featured: true,
      isNewArrival: true,
    });
    setVariantsList([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setSelectedImage(null);
    setFormError('');
    if (imageInputRef.current) imageInputRef.current.value = '';
    setForm({
      sku: p.sku,
      nameFr: p.nameFr,
      nameAr: p.nameAr,
      descriptionFr: p.descriptionFr,
      descriptionAr: p.descriptionAr,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice || 0,
      stockQuantity: p.stockQuantity,
      image: p.image,
      badgeFr: p.badgeFr || '',
      badgeAr: p.badgeAr || '',
      featured: Boolean(p.featured),
      isNewArrival: Boolean(p.isNewArrival),
    });
    setVariantsList(p.variants || []);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      nameFr: 'Nouvelle Teinte',
      nameAr: 'درجة جديدة',
      sku: `${form.sku}-V${variantsList.length + 1}`,
      colorHex: '#C5A46D',
      inStock: true,
      stockQuantity: 10,
    };
    setVariantsList([...variantsList, newVariant]);
  };

  const handleUpdateVariant = (idx: number, updates: Partial<ProductVariant>) => {
    const list = [...variantsList];
    list[idx] = { ...list[idx], ...updates };
    setVariantsList(list);
  };

  const handleRemoveVariant = (idx: number) => {
    setVariantsList(variantsList.filter((_, i) => i !== idx));
  };

  const handleToggleStock = async (p: Product) => {
    try {
      const updatedStatus = !p.inStock;
      const existingProducts = JSON.parse(localStorage.getItem('bk_admin_products') || '[]');
      let updatedList;
      
      if (existingProducts.some((item: any) => item.id === p.id)) {
        updatedList = existingProducts.map((item: any) => 
          item.id === p.id ? { ...item, inStock: updatedStatus, updatedAt: new Date().toISOString() } : item
        );
      } else {
        const allCurrentProducts = products.map((item: any) => 
          item.id === p.id ? { ...item, inStock: updatedStatus } : item
        );
        updatedList = allCurrentProducts;
      }

      localStorage.setItem('bk_admin_products', JSON.stringify(updatedList));
      onNotify(updatedStatus ? 'Produit activé (En stock)' : 'Produit désactivé (Hors stock)');
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (p: Product) => {
    const confirmDelete = window.confirm(
      language === 'ar'
        ? `هل أنت متأكد من حذف المنتج "${p.nameAr}" نهائياً من المتجر؟`
        : `Êtes-vous sûr de vouloir supprimer définitivement "${p.nameFr}" du catalogue ?`
    );
    if (!confirmDelete) return;

    try {
      const existingProducts = JSON.parse(localStorage.getItem('bk_admin_products') || '[]') as Product[];
      let updatedList = existingProducts.filter((item) => item.id !== p.id);
      
      const baseProducts = products.filter((item) => item.id !== p.id);
      
      localStorage.setItem('bk_admin_products', JSON.stringify(updatedList.length > 0 ? updatedList : baseProducts));
      onNotify('Produit supprimé du catalogue.');
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);
    try {
      const image = selectedImage ? await readImageAsDataUrl(selectedImage) : form.image;
      const productPayload = {
        ...(editingProduct || {}),
        ...form,
        image,
        variants: variantsList.length > 0 ? variantsList : undefined,
        id: editingProduct ? editingProduct.id : 'prod_' + Date.now(),
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingProducts = JSON.parse(localStorage.getItem('bk_admin_products') || '[]') as Product[];
      
      let updatedProductsList;
      if (editingProduct) {
        const existsLocally = existingProducts.some((p) => p.id === editingProduct.id);
        if (existsLocally) {
          updatedProductsList = existingProducts.map((p) => (p.id === editingProduct.id ? productPayload : p));
        } else {
          updatedProductsList = [productPayload, ...products.map(p => p.id === editingProduct.id ? productPayload : p)];
        }
      } else {
        updatedProductsList = [productPayload, ...existingProducts];
      }

      localStorage.setItem('bk_admin_products', JSON.stringify(updatedProductsList));

      setIsModalOpen(false);
      setSelectedImage(null);
      onNotify(
        editingProduct
          ? 'Produit mis à jour avec succès !'
          : 'Nouveau produit publié sur la boutique !'
      );
      onRefresh();
    } catch (error) {
      console.error('Product save failed', error);
      setFormError(
        error instanceof Error
          ? `Échec de l’enregistrement : ${error.message}`
          : 'Échec de l’enregistrement. Vérifiez votre connexion et réessayez.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.nameFr.toLowerCase().includes(q) ||
        p.nameAr.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8C9CD] shadow-2xs">
        <div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#292526]">
            {language === 'ar' ? 'إدارة كتالوج المنتجات' : 'Catalogue & Fiches Produits'}
          </h1>
          <p className="text-xs text-[#292526]/65 mt-0.5">
            {language === 'ar'
              ? 'إضافة وتعديل وحذف مستحضرات التجميل والأسعار والخيارات'
              : 'Création, modification, prix en DA, variantes de teintes et disponibilité'}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span>{language === 'ar' ? '+ إضافة منتج جديد' : '+ Nouveau Produit'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E8C9CD] flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[#292526]/60 font-semibold">{language === 'ar' ? 'الفئة :' : 'Catégorie :'}</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg px-3 py-1.5 focus:border-[#642C40] focus:outline-none cursor-pointer"
            >
              <option value="all">{language === 'ar' ? 'جميع الفئات' : 'Toutes les catégories'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === 'ar' ? c.nameAr : c.nameFr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#292526]/40 text-base">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالاسم أو الرمز...' : 'Recherche par nom, réf...'}
            className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#292526] focus:border-[#642C40] focus:outline-none"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8C9CD] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-[#292526]/70 uppercase font-tabular border-b border-[#E8C9CD]">
                <th className="py-3 px-4 font-bold">Produit</th>
                <th className="py-3 px-4 font-bold">Catégorie</th>
                <th className="py-3 px-4 font-bold">Prix de Vente</th>
                <th className="py-3 px-4 font-bold">Stock</th>
                <th className="py-3 px-4 font-bold">Variantes</th>
                <th className="py-3 px-4 font-bold">Disponibilité</th>
                <th className="py-3 px-4 font-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8C9CD]/40">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#292526]/50">
                    {language === 'ar' ? 'لا توجد منتجات مطابقة للبحث.' : 'Aucun produit ne correspond à ces critères.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.nameFr}
                        className="w-11 h-11 rounded-lg object-cover bg-[#FFFFFF] border border-[#E8C9CD] shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-[#292526]">{p.nameFr}</p>
                        <p className="text-[11px] text-[#C5A46D]">{p.nameAr}</p>
                        <span className="font-tabular text-[10px] text-[#292526]/50">
                          SKU: {p.sku}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8C9CD] text-[11px] font-medium">
                        {categories.find((c) => c.id === p.category)?.nameFr || p.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-tabular font-bold text-[#642C40]">
                      <div>{p.price.toLocaleString()} {t.currency}</div>
                      {p.originalPrice != null && p.originalPrice > 0 && p.originalPrice > p.price ? (
                        <span className="text-[10px] text-[#292526]/40 line-through">
                          {p.originalPrice.toLocaleString()} {t.currency}
                        </span>
                      ) : null}
                    </td>

                    <td className="py-3.5 px-4 font-tabular">
                      <span
                        className={`font-bold ${
                          p.stockQuantity <= 5 ? 'text-rose-600' : 'text-[#292526]'
                        }`}
                      >
                        {p.stockQuantity} unités
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {p.variants && p.variants.length > 0 ? (
                        <span className="text-[11px] text-[#C5A46D] font-bold">
                          {p.variants.length} teintes / options
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#292526]/40">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStock(p)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          p.inStock
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.inStock ? 'Actif (En stock)' : 'Désactivé'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-end">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 hover:bg-[#FAF7F2] text-[#292526] rounded-lg border border-[#E8C9CD] transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 hover:bg-rose-50 text-rose-700 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#292526]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E8C9CD] w-full max-w-2xl p-6 sm:p-8 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8C9CD]/60">
              <h3 className="font-serif-luxury text-xl font-bold text-[#292526]">
                {editingProduct ? 'Modifier le Produit' : 'Créer un Produit (BK BEAUTY)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center cursor-pointer hover:bg-[#E8C9CD]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* French and Arabic Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#292526] mb-1">
                    Nom du produit (Français) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nameFr}
                    onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#292526] mb-1">
                    اسم المنتج (العربية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nameAr}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Pricing, Discount & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-[#292526] mb-1">
                    Prix de vente (DA) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2 font-tabular"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#292526] mb-1">
                    Prix barré / Promo (DA)
                  </label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2 font-tabular"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#292526] mb-1">Stock Total</label>
                  <input
                    type="number"
                    required
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2 font-tabular"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#292526] mb-1">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameFr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* French and Arabic Descriptions */}
              <div>
                <label className="block font-bold text-[#292526] mb-1">
                  Description détaillée (Français)
                </label>
                <textarea
                  rows={2}
                  value={form.descriptionFr}
                  onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-[#292526] mb-1">
                  الوصف التفصيلي (العربية)
                </label>
                <textarea
                  rows={2}
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2"
                />
              </div>

              {/* Generated SKU and uploaded product image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#292526] mb-1">Référence SKU</label>
                  <input
                    type="text"
                    readOnly
                    value={form.sku}
                    aria-describedby="sku-generated-help"
                    className="w-full bg-[#FAF7F2] border border-[#E8C9CD] rounded-lg p-2 font-tabular text-[#292526]/70"
                  />
                  <p id="sku-generated-help" className="mt-1 text-[10px] text-[#292526]/55">
                    Généré automatiquement {editingProduct ? '— inchangé lors de la modification.' : '— référence unique.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="block font-bold text-[#292526]">Image du produit</span>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.jfif,.png,.webp,image/jpeg,image/jfif,image/png,image/webp"
                    onChange={handleImageSelection}
                    className="sr-only"
                    aria-label="Choisir une image JPG, PNG ou WEBP"
                  />
                  <div className="flex items-center gap-3">
                    <img
                      src={imagePreviewUrl || form.image || '/no-product-image.svg'}
                      alt="Aperçu de l’image du produit"
                      className="h-20 w-20 rounded-lg border border-[#E8C9CD] bg-[#FAF7F2] object-cover"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="rounded-lg bg-[#642C40] px-3 py-2 font-bold text-[#FAF7F2] hover:bg-[#292526]"
                      >
                        Choisir une image
                      </button>
                      {(selectedImage || (form.image && form.image !== '/no-product-image.svg')) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setForm((current) => ({ ...current, image: '/no-product-image.svg' }));
                            setFormError('');
                          }}
                          className="rounded-lg border border-[#E8C9CD] px-3 py-2 font-semibold text-[#642C40] hover:bg-[#FAF7F2]"
                        >
                          Supprimer l’image
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-[#292526]/55">
                    JPG, JPEG, JFIF, PNG ou WEBP — 5 Mo maximum.
                    {selectedImage ? ` Fichier : ${selectedImage.name}` : ''}
                  </p>
                </div>
              </div>

              {/* Variants Section (Shades, Volumes) */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8C9CD] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#642C40] uppercase text-[11px]">
                    Variantes (Teintes, Contenances, Formats)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-2.5 py-1 bg-[#FFFFFF] border border-[#E8C9CD] rounded text-[11px] font-bold text-[#642C40] hover:bg-[#FAF7F2] cursor-pointer"
                  >
                    + Ajouter une variante
                  </button>
                </div>

                {variantsList.length === 0 ? (
                  <p className="text-[11px] text-[#292526]/50 italic">
                    Aucune variante pour ce produit (optionnel).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {variantsList.map((v, idx) => (
                      <div
                        key={v.id}
                        className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#E8C9CD]/60 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                      >
                        <input
                          type="text"
                          value={v.nameFr}
                          placeholder="Nom FR (ex: 120 Sable)"
                          onChange={(e) => handleUpdateVariant(idx, { nameFr: e.target.value })}
                          className="p-1 border border-[#E8C9CD] rounded text-xs"
                        />
                        <input
                          type="text"
                          value={v.nameAr}
                          placeholder="الاسم العربي"
                          onChange={(e) => handleUpdateVariant(idx, { nameAr: e.target.value })}
                          className="p-1 border border-[#E8C9CD] rounded text-xs"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={v.colorHex || '#C5A46D'}
                            onChange={(e) => handleUpdateVariant(idx, { colorHex: e.target.value })}
                            className="w-6 h-6 border-0 rounded cursor-pointer"
                          />
                          <input
                            type="number"
                            value={v.stockQuantity}
                            placeholder="Stock"
                            onChange={(e) =>
                              handleUpdateVariant(idx, {
                                stockQuantity: Number(e.target.value),
                                inStock: Number(e.target.value) > 0,
                              })
                            }
                            className="w-16 p-1 border border-[#E8C9CD] rounded text-xs font-tabular"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="text-rose-600 hover:underline text-[11px] text-end cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded text-[#642C40] accent-[#642C40]"
                  />
                  <span>Mettre en avant (Bestseller)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isNewArrival}
                    onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                    className="rounded text-[#642C40] accent-[#642C40]"
                  />
                  <span>Marquer comme Nouveauté</span>
                </label>
              </div>

              {/* Action Buttons */}
              {formError && (
                <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
                  {formError}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8C9CD]/50">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedImage(null);
                    setFormError('');
                  }}
                  className="px-4 py-2 bg-[#FAF7F2] rounded-lg font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#642C40] text-[#FAF7F2] hover:bg-[#292526] disabled:opacity-60 rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer & Synchroniser'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};