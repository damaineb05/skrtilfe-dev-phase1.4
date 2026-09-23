import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, MapPin, Globe, Instagram, Twitter, Loader2, Check } from 'lucide-react';

export default function ProfileTab({ user, profile, onProfileSaved }) {
  const [form, setForm] = useState({
    username: profile?.username || '',
    display_name: profile?.display_name || user?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    twitter: profile?.social_links?.find(s => s.platform === 'twitter')?.url || '',
    instagram: profile?.social_links?.find(s => s.platform === 'instagram')?.url || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    const socialLinks = [];
    if (form.twitter) socialLinks.push({ platform: 'twitter', url: form.twitter });
    if (form.instagram) socialLinks.push({ platform: 'instagram', url: form.instagram });
    if (form.website) socialLinks.push({ platform: 'website', url: form.website });

    const data = {
      user_email: user.email,
      username: form.username,
      display_name: form.display_name,
      bio: form.bio,
      location: form.location,
      website: form.website,
      social_links: socialLinks,
      membership_tier: profile?.membership_tier || 'basic',
      reputation_score: profile?.reputation_score || 0,
      badges: profile?.badges || [],
      perks: profile?.perks || {},
      forum_stats: profile?.forum_stats || {},
    };

    try {
      if (profile?.id) {
        await base44.entities.Profile.update(profile.id, data);
      } else {
        await base44.entities.Profile.create(data);
      }
      onProfileSaved?.();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#f0f0f0] flex items-center justify-center">
              <span className="text-2xl font-bold text-black/20">
                {(form.display_name || user?.full_name || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-black rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
            <Camera className="w-3 h-3 text-white" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-black">{user?.full_name}</p>
          <p className="text-xs text-black/40">{user?.email}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-5">
        <Field label="Username / Handle" placeholder="@yourhandle" value={form.username} onChange={v => set('username', v)} prefix="@" />
        <Field label="Display Name" placeholder="Your name" value={form.display_name} onChange={v => set('display_name', v)} />
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 mb-2">Bio</label>
          <textarea
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            placeholder="Tell your story..."
            rows={3}
            className="w-full border-b border-[#d4d4d4] py-2 text-sm placeholder:text-black/25 focus:outline-none focus:border-black transition-colors bg-transparent resize-none"
          />
        </div>
        <Field label="Location" placeholder="City, Country" value={form.location} onChange={v => set('location', v)} icon={<MapPin className="w-3.5 h-3.5 text-black/30" />} />
        <Field label="Website" placeholder="https://yoursite.com" value={form.website} onChange={v => set('website', v)} icon={<Globe className="w-3.5 h-3.5 text-black/30" />} />
        <Field label="Twitter / X" placeholder="https://twitter.com/you" value={form.twitter} onChange={v => set('twitter', v)} icon={<Twitter className="w-3.5 h-3.5 text-black/30" />} />
        <Field label="Instagram" placeholder="https://instagram.com/you" value={form.instagram} onChange={v => set('instagram', v)} icon={<Instagram className="w-3.5 h-3.5 text-black/30" />} />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-7 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.12em] hover:bg-black/80 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : null}
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Profile'}
      </button>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, prefix, icon }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 mb-2">{label}</label>
      <div className="flex items-center gap-2 border-b border-[#d4d4d4] focus-within:border-black transition-colors">
        {icon}
        {prefix && <span className="text-sm text-black/30">{prefix}</span>}
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 py-2 text-sm placeholder:text-black/25 focus:outline-none bg-transparent"
        />
      </div>
    </div>
  );
}