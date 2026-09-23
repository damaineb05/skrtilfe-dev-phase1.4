import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, Trash2, Package } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';

const SLOTS = ['top', 'bottom', 'shoes', 'headwear', 'accessory', 'full_body', 'gloves', 'eyewear', 'jewelry', 'bag'];

function AdminAssetUploadContent() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', slot: 'accessory', bone: 'Hips' });
  const [file, setFile] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.AssetBundle.list('-created_date', 50).catch(() => []);
    setBundles(data);
    setLoading(false);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleUpload = async () => {
    if (!file || !form.name) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.AssetBundle.create({
      name: form.name,
      slot: form.slot,
      bone: form.bone,
      asset_url: file_url,
      file_name: file.name,
      file_size: file.size,
      status: 'active',
    });
    await load();
    setFile(null);
    setForm({ name: '', slot: 'accessory', bone: 'Hips' });
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return;
    await base44.entities.AssetBundle.delete(id);
    await load();
  };

  const S = {
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 },
    label: { color: 'rgba(255,255,255,0.45)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 6, display: 'block' },
    input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 },
  };

  return (
    <AdminLayout currentPage="assets">
      <div className="max-w-4xl space-y-6" style={{ color: '#fff' }}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Admin</p>
          <h1 className="text-xl font-black uppercase tracking-tight">Asset Upload</h1>
        </div>

        {/* Upload Form */}
        <div style={{ ...S.card, padding: 24 }} className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Upload GLB Asset</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={S.label}>Asset Name *</label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} style={S.input} placeholder="SKRTLIFE Cap" />
            </div>
            <div>
              <label style={S.label}>Wearable Slot</label>
              <Select value={form.slot} onValueChange={v => set('slot', v)}>
                <SelectTrigger style={S.input}><SelectValue /></SelectTrigger>
                <SelectContent>{SLOTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label style={S.label}>GLB File *</label>
            <div
              className="relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
              style={{ borderColor: file ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)', background: file ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.02)' }}
              onClick={() => document.getElementById('glb-input').click()}
            >
              <input id="glb-input" type="file" accept=".glb" className="hidden"
                onChange={e => setFile(e.target.files[0])} />
              <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: file ? '#00D4FF' : 'rgba(255,255,255,0.2)' }} />
              {file ? (
                <p className="text-sm font-medium" style={{ color: '#00D4FF' }}>{file.name}</p>
              ) : (
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Click to select .glb file</p>
              )}
            </div>
          </div>

          <button onClick={handleUpload} disabled={!file || !form.name || uploading}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-black bg-white rounded-lg hover:bg-white/90 disabled:opacity-40 transition-all">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? 'Uploading…' : 'Upload Asset'}
          </button>
        </div>

        {/* Asset List */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
        ) : (
          <div style={S.card} className="overflow-hidden">
            <p className="px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white/40" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              Uploaded Assets ({bundles.length})
            </p>
            {bundles.length === 0 ? (
              <p className="text-center py-16 text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>No assets uploaded yet</p>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {bundles.map(bundle => (
                  <div key={bundle.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(0,212,255,0.1)' }}>
                      <Package className="w-5 h-5 text-skrt-cyan" style={{ color: '#00D4FF' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{bundle.name}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {bundle.slot} · {bundle.file_name}
                      </p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                      style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}>
                      {bundle.slot}
                    </span>
                    <button onClick={() => handleDelete(bundle.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-white/30 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

export default function AdminAssetUpload() {
  return (
    <AdminProtectedRoute>
      <AdminAssetUploadContent />
    </AdminProtectedRoute>
  );
}