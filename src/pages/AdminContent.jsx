import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Loader2, Save, Edit2, X } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';

const PLACEMENTS = ['homepage', 'about_page', 'events_page', 'shop_page', 'community_page'];
const CONTENT_TYPES = ['text', 'image', 'video', 'json', 'html'];

const blankItem = () => ({ content_key: '', content_type: 'text', title: '', value: '', placement: 'homepage', is_active: true });

function AdminContentInner() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const [form, setForm] = useState(blankItem());
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.SiteContent.list('-created_date', 100);
    setItems(data);
    setLoading(false);
  };

  const openNew = () => { setForm(blankItem()); setEditing('new'); };
  const openEdit = (item) => { setForm({ ...item }); setEditing(item.id); };
  const closeEdit = () => { setEditing(null); setForm(blankItem()); };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    if (editing === 'new') {
      await base44.entities.SiteContent.create({ ...form, last_published: new Date().toISOString() });
    } else {
      await base44.entities.SiteContent.update(editing, { ...form, last_published: new Date().toISOString() });
    }
    await load();
    setSaving(false);
    closeEdit();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this content block?')) return;
    await base44.entities.SiteContent.delete(id);
    await load();
  };

  const S = {
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 },
    label: { color: 'rgba(255,255,255,0.45)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 6, display: 'block' },
    input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 },
  };

  return (
    <AdminLayout currentPage="content">
      <div className="max-w-4xl space-y-6" style={{ color: '#fff' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Admin</p>
            <h1 className="text-xl font-black uppercase tracking-tight">Site Content</h1>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black bg-white rounded-lg hover:bg-white/90 transition-all">
            <Plus className="w-3.5 h-3.5" /> New Block
          </button>
        </div>

        {/* Edit Form */}
        {editing && (
          <div style={{ ...S.card, padding: 24 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">{editing === 'new' ? 'New Content Block' : 'Edit Block'}</p>
              <button onClick={closeEdit}><X className="w-4 h-4 text-white/30" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={S.label}>Content Key *</label>
                <Input value={form.content_key} onChange={e => set('content_key', e.target.value)} style={S.input} placeholder="homepage_hero_title" />
              </div>
              <div>
                <label style={S.label}>Title</label>
                <Input value={form.title} onChange={e => set('title', e.target.value)} style={S.input} placeholder="Human-readable title" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={S.label}>Content Type</label>
                <Select value={form.content_type} onValueChange={v => set('content_type', v)}>
                  <SelectTrigger style={S.input}><SelectValue /></SelectTrigger>
                  <SelectContent>{CONTENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label style={S.label}>Placement</label>
                <Select value={form.placement} onValueChange={v => set('placement', v)}>
                  <SelectTrigger style={S.input}><SelectValue /></SelectTrigger>
                  <SelectContent>{PLACEMENTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label style={S.label}>Value</label>
              <textarea value={form.value} onChange={e => set('value', e.target.value)} rows={4}
                className="w-full px-3 py-2 text-sm rounded-lg resize-none focus:outline-none"
                style={{ ...S.input, lineHeight: 1.6 }} placeholder="Content value (text, URL, JSON...)" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="rounded" />
                <span className="text-sm text-white/60">Active</span>
              </label>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black bg-white rounded-lg hover:bg-white/90 disabled:opacity-50 transition-all">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
            </div>
          </div>
        )}

        {/* Content List */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
        ) : (
          <div style={S.card} className="overflow-hidden">
            {items.length === 0 ? (
              <p className="text-center py-16 text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>No content blocks yet</p>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-white font-mono">{item.content_key}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                          style={{ background: item.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.07)', color: item.is_active ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                          {item.is_active ? 'active' : 'inactive'}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                          style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}>
                          {item.content_type}
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.title || item.value?.slice(0, 60) || '—'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white/70">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-white/40 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminContent() {
  return (
    <AdminProtectedRoute>
      <AdminContentInner />
    </AdminProtectedRoute>
  );
}