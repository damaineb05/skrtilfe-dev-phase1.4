import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';

const COLLECTIONS = ['Light', 'Dark', 'Limited/Collab', 'Genesis'];
const STATUSES = ['draft', 'active', 'archived'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function AdminProductEditContent() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  const [product, setProduct] = useState({
    title: '', slug: '', description: '', sku: '', price: '', compare_at_price: '',
    inventory_qty: 0, status: 'draft', collection: 'Light', product_type: 'physical',
    tags: [], available_sizes: [], lore: '', fabric: '', care: '', is_featured: false,
    media: [], variants: [],
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!productId);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!productId) return;
    base44.entities.Product.filter({ id: productId }).then(([p]) => {
      if (p) setProduct({ ...product, ...p });
    }).finally(() => setLoading(false));
  }, [productId]);

  const set = (key, val) => setProduct(p => ({ ...p, [key]: val }));

  const toggleSize = (size) => {
    set('available_sizes', product.available_sizes?.includes(size)
      ? product.available_sizes.filter(s => s !== size)
      : [...(product.available_sizes || []), size]);
  };

  const addMediaUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) set('media', [...(product.media || []), { url, type: 'image', is_primary: product.media?.length === 0 }]);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...product, price: parseFloat(product.price) || 0, inventory_qty: parseInt(product.inventory_qty) || 0 };
    if (!data.slug && data.title) data.slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (productId) {
      await base44.entities.Product.update(productId, data);
    } else {
      const created = await base44.entities.Product.create(data);
      navigate(createPageUrl(`AdminProductEdit?id=${created.id}`));
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const S = {
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 },
    label: { color: 'rgba(255,255,255,0.45)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 6, display: 'block' },
    input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 },
  };

  if (loading) return <AdminLayout currentPage="products"><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-white/30" /></div></AdminLayout>;

  return (
    <AdminLayout currentPage="products">
      <div className="max-w-4xl space-y-6" style={{ color: '#fff' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('AdminInventory')}><button className="p-2 rounded-lg hover:bg-white/5 transition-colors"><ArrowLeft className="w-4 h-4 text-white/50" /></button></Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Products</p>
              <h1 className="text-xl font-black uppercase tracking-tight">{productId ? 'Edit Product' : 'New Product'}</h1>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black bg-white rounded-lg hover:bg-white/90 transition-all disabled:opacity-50">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>

        {/* Core Info */}
        <div style={S.card} className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Core Info</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={S.label}>Title *</label>
              <Input value={product.title} onChange={e => set('title', e.target.value)} style={S.input} placeholder="Product name" />
            </div>
            <div>
              <label style={S.label}>Slug</label>
              <Input value={product.slug} onChange={e => set('slug', e.target.value)} style={S.input} placeholder="auto-generated" />
            </div>
          </div>
          <div>
            <label style={S.label}>Description</label>
            <textarea value={product.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Product description"
              className="w-full px-3 py-2 text-sm rounded-lg resize-none focus:outline-none"
              style={{ ...S.input, lineHeight: 1.6 }} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label style={S.label}>Price ($) *</label>
              <Input type="number" value={product.price} onChange={e => set('price', e.target.value)} style={S.input} placeholder="0.00" />
            </div>
            <div>
              <label style={S.label}>Compare At ($)</label>
              <Input type="number" value={product.compare_at_price} onChange={e => set('compare_at_price', e.target.value)} style={S.input} placeholder="0.00" />
            </div>
            <div>
              <label style={S.label}>Inventory</label>
              <Input type="number" value={product.inventory_qty} onChange={e => set('inventory_qty', e.target.value)} style={S.input} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label style={S.label}>Status</label>
              <Select value={product.status} onValueChange={v => set('status', v)}>
                <SelectTrigger style={S.input}><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label style={S.label}>Collection</label>
              <Select value={product.collection} onValueChange={v => set('collection', v)}>
                <SelectTrigger style={S.input}><SelectValue /></SelectTrigger>
                <SelectContent>{COLLECTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label style={S.label}>SKU</label>
              <Input value={product.sku} onChange={e => set('sku', e.target.value)} style={S.input} placeholder="SKU-001" />
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div style={S.card}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Available Sizes</p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map(size => (
              <button key={size} onClick={() => toggleSize(size)}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
                style={{
                  background: product.available_sizes?.includes(size) ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${product.available_sizes?.includes(size) ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: product.available_sizes?.includes(size) ? '#fff' : 'rgba(255,255,255,0.4)',
                }}>
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Media */}
        <div style={S.card}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Media</p>
            <button onClick={addMediaUrl} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Plus className="w-3 h-3" /> Add URL
            </button>
          </div>
          {product.media?.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {product.media.map((m, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => set('media', product.media.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.2)' }}>No media added</p>
          )}
        </div>

        {/* Details */}
        <div style={S.card} className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Product Details</p>
          <div>
            <label style={S.label}>Lore / Story</label>
            <textarea value={product.lore} onChange={e => set('lore', e.target.value)} rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg resize-none focus:outline-none"
              style={{ ...S.input, lineHeight: 1.6 }} placeholder="Brand story for this piece..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={S.label}>Fabric</label>
              <Input value={product.fabric} onChange={e => set('fabric', e.target.value)} style={S.input} placeholder="100% Cotton" />
            </div>
            <div>
              <label style={S.label}>Care Instructions</label>
              <Input value={product.care} onChange={e => set('care', e.target.value)} style={S.input} placeholder="Machine wash cold" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={product.is_featured} onChange={e => set('is_featured', e.target.checked)} className="rounded" />
            <span className="text-sm text-white/60">Feature this product on homepage</span>
          </label>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminProductEdit() {
  return (
    <AdminProtectedRoute>
      <AdminProductEditContent />
    </AdminProtectedRoute>
  );
}