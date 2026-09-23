import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Loader2, Mail, Instagram, Twitter } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: 'support@skrtlife.com',
      subject: `[Contact] ${form.subject || 'General Inquiry'} — from ${form.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`,
    });
    setSending(false);
    setSent(true);
  };

  return (
    <div style={{ background: 'var(--bg-1)' }} className="min-h-screen relative overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-10" style={{ background: 'var(--skrt-cyan)' }} />
        <div className="absolute bottom-32 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-10" style={{ background: 'var(--skrt-red)' }} />
      </div>

      <div className="relative z-10 py-20 px-4 section-container">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <p className="label-sm mb-3" style={{ color: 'var(--skrt-cyan)' }}>GET IN TOUCH</p>
            <h1 className="text-5xl md:text-6xl font-bold font-harvest mb-4" style={{ color: 'var(--text-100)' }}>
              Contact Us
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-60)' }} className="max-w-2xl mx-auto">
              Have questions or want to collaborate? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Info sidebar */}
            <div className="space-y-4">
              {[
                { icon: Mail, label: 'Email', value: 'support@skrtlife.com', href: 'mailto:support@skrtlife.com' },
                { icon: Instagram, label: 'Instagram', value: '@skrtlife', href: 'https://instagram.com/skrtlife' },
                { icon: Twitter, label: 'Twitter / X', value: '@skrtlife', href: 'https://twitter.com/skrtlife' },
              ].map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card group flex items-center gap-4 p-4"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)' }}>
                    <Icon className="w-5 h-5" style={{ color: 'var(--skrt-cyan)' }} />
                  </div>
                  <div>
                    <p className="label-xs mb-0.5">
                      {label}
                    </p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-100)' }}>
                      {value}
                    </p>
                  </div>
                </a>
              ))}
              <div className="glass-card p-4 text-sm" style={{ color: 'var(--text-60)' }}>
                Response time: <span style={{ color: 'var(--text-100)' }} className="font-medium">within 1 business day</span>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2 glass-panel p-6 md:p-8">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="w-16 h-16 mb-4" style={{ color: 'var(--skrt-cyan)' }} />
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-100)' }}>Message Sent!</h3>
                  <p style={{ color: 'var(--text-60)' }}>We'll get back to you within 1 business day.</p>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-80)' }}>Name *</label>
                      <Input
                        required
                        placeholder="Your name"
                        value={form.name}
                        onChange={e => setForm(f => ({...f, name: e.target.value}))}
                        className="glass-card border-0 h-11 px-4"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-80)' }}>Email *</label>
                      <Input
                        required
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={e => setForm(f => ({...f, email: e.target.value}))}
                        className="glass-card border-0 h-11 px-4"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-80)' }}>Topic</label>
                    <Select onValueChange={v => setForm(f => ({...f, subject: v}))}>
                      <SelectTrigger className="glass-card border-0 h-11 px-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent style={{ background: 'var(--bg-3)', borderColor: 'var(--glass-border)' }}>
                        <SelectItem value="Orders & Shipping">Orders & Shipping</SelectItem>
                        <SelectItem value="Collaborations">Collaborations</SelectItem>
                        <SelectItem value="Press Inquiries">Press Inquiries</SelectItem>
                        <SelectItem value="Technical Support">Technical Support</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-80)' }}>Message *</label>
                    <Textarea
                      required
                      placeholder="Tell us what's on your mind..."
                      rows={6}
                      value={form.message}
                      onChange={e => setForm(f => ({...f, message: e.target.value}))}
                      className="glass-card border-0 p-4"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full text-black font-bold uppercase tracking-wider py-6 h-auto"
                    style={{ background: 'var(--skrt-cyan)' }}
                  >
                    {sending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}