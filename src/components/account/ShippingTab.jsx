import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Plus, Trash2, Check, Star, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const BLANK = { id: '', label: '', full_name: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '', country: 'US', is_default: false };

export default function ShippingTab({ profile, onProfileSaved }) {
  const [addresses, setAddresses] = useState(profile?.shipping_addresses || []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const startEdit = (addr = null) => {
    setForm(addr ? { ...addr } : { ...BLANK, id: crypto.randomUUID() });
    setEditing(addr?.id || 'new');
  };

  const save = async () => {
    setSaving(true);
    let updated;
    if (editing === 'new') {
      const newAddr = { ...form, id: form.id || crypto.randomUUID() };
      if (newAddr.is_default) updated = [...addresses.map(a => ({ ...a, is_default: false })), newAddr];
      else updated = [...addresses, newAddr];
    } else {
      updated = addresses.map(a => {
        if (a.id === editing) return { ...form };
        return form.is_default ? { ...a, is_default: false } : a;
      });
    }
    setAddresses(updated);
    await base44.entities.Profile.update(profile.id, { shipping_addresses: updated });
    onProfileSaved?.();
    setSaving(false);
    setEditing(null);
  };

  const remove = async (id) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    await base44.entities.Profile.update(profile.id, { shipping_addresses: updated });
  };

  const setDefault = async (id) => {
    const updated = addresses.map(a => ({ ...a, is_default: a.id === id }));
    setAddresses(updated);
    await base44.entities.Profile.update(profile.id, { shipping_addresses: updated });
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {addresses.map(addr => (
          <div key={addr.id} className={`border p-5 relative group ${addr.is_default ? 'border-black' : 'border-[#e8e8e8]'}`}>
            {addr.is_default && (
              <span className="absolute top-3 right-3 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-black">
                <Star className="w-3 h-3 fill-black" /> Default
              </span>
            )}
            {addr.label && <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-1">{addr.label}</p>}
            <p className="text-sm font-medium text-black">{addr.full_name}</p>
            {addr.phone && <p className="text-sm text-black/40">{addr.phone}</p>}
            <p className="text-sm text-black/50">{addr.line1}</p>
            {addr.line2 && <p className="text-sm text-black/50">{addr.line2}</p>}
            <p className="text-sm text-black/50">{[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}</p>
            <p className="text-sm text-black/50">{addr.country}</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => startEdit(addr)} className="text-[10px] font-bold uppercase tracking-wider text-black underline underline-offset-2 hover:opacity-50 transition-opacity">Edit</button>
              {!addr.is_default && (
                <button onClick={() => setDefault(addr.id)} className="text-[10px] font-bold uppercase tracking-wider text-black/40 hover:text-black transition-colors">Set Default</button>
              )}
              <button onClick={() => remove(addr.id)} className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors">Remove</button>
            </div>
          </div>
        ))}

        <button
          onClick={() => startEdit()}
          className="border border-dashed border-[#d4d4d4] p-5 flex flex-col items-center justify-center gap-2 min-h-[140px] text-black/30 hover:border-black/40 hover:text-black/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Add Address</span>
        </button>
      </div>

      <AnimatePresence>
        {editing !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border border-[#e8e8e8] p-6"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-black mb-5">
              {editing === 'new' ? 'New Address' : 'Edit Address'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'label', ph: 'Label (e.g. Home, Work)', span: 2 },
                { k: 'full_name', ph: 'Full Name', span: 2 },
                { k: 'phone', ph: 'Phone Number', span: 2 },
                { k: 'line1', ph: 'Address Line 1', span: 2 },
                { k: 'line2', ph: 'Address Line 2 (optional)', span: 2 },
                { k: 'city', ph: 'City' },
                { k: 'state', ph: 'State / Province' },
                { k: 'zip', ph: 'ZIP / Postal Code' },
                { k: 'country', ph: 'Country' },
              ].map(f => (
                <input
                  key={f.k}
                  placeholder={f.ph}
                  value={form[f.k]}
                  onChange={e => set(f.k, e.target.value)}
                  className={`border-b border-[#d4d4d4] py-2.5 text-sm placeholder:text-black/25 focus:outline-none focus:border-black transition-colors bg-transparent ${f.span === 2 ? 'col-span-2' : ''}`}
                />
              ))}
              <label className="col-span-2 flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={form.is_default} onChange={e => set('is_default', e.target.checked)} className="w-3.5 h-3.5 accent-black" />
                <span className="text-xs text-black/50">Set as default shipping address</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-[0.1em] hover:bg-black/80 transition-colors disabled:opacity-50">
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                Save Address
              </button>
              <button onClick={() => setEditing(null)} className="px-6 py-2.5 border border-[#d4d4d4] text-xs font-bold uppercase tracking-[0.1em] text-black/50 hover:text-black transition-colors">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}