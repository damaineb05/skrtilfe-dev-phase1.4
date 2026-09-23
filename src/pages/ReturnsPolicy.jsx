import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, RotateCcw, Clock, AlertCircle, CheckCircle2, Mail } from 'lucide-react';

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#050810] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to={createPageUrl('Shop')} className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Returns & Refund Policy</h1>
          <p className="text-white/50 text-sm">Last updated: February 2026</p>
        </div>

        {/* Quick summary cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <div className="glass-card p-5 rounded-2xl text-center">
            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-semibold text-sm">30-Day Window</p>
            <p className="text-white/50 text-xs mt-1">For eligible returns</p>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center">
            <RotateCcw className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-white font-semibold text-sm">Free Returns</p>
            <p className="text-white/50 text-xs mt-1">On US domestic orders</p>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center">
            <CheckCircle2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-white font-semibold text-sm">Original Condition</p>
            <p className="text-white/50 text-xs mt-1">Unworn, tags attached</p>
          </div>
        </div>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Eligibility</h2>
            <p className="mb-3">We accept returns within <strong className="text-white">30 days</strong> of the delivery date for physical items that are:</p>
            <ul className="space-y-2 ml-4">
              {['Unworn and unwashed', 'In original condition with all tags attached', 'In original packaging', 'Not marked as Final Sale or Limited Edition'].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Non-Returnable Items</h2>
            <div className="space-y-2">
              {[
                'Limited Edition and collaboration drops (marked "Final Sale")',
                'Digital items, NFTs, and virtual wearables — all sales final',
                'Genesis Pass memberships',
                'Items damaged through normal wear or misuse',
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">How to Return</h2>
            <ol className="space-y-4">
              {[
                { step: '1', title: 'Contact Us', desc: 'Email returns@skrtlife.com with your order number and reason for return. We\'ll respond within 1-2 business days.' },
                { step: '2', title: 'Receive Label', desc: 'For US orders, we\'ll send a prepaid return shipping label. International customers are responsible for return shipping costs.' },
                { step: '3', title: 'Ship It Back', desc: 'Pack your item securely and drop it off within 7 days of receiving your return label.' },
                { step: '4', title: 'Refund Processed', desc: 'Once received and inspected, your refund will be issued to your original payment method within 5-7 business days.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold text-sm">
                    {step}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{title}</p>
                    <p className="text-white/60 text-sm mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Exchanges</h2>
            <p>We don't process direct exchanges. Return your item and place a new order for the correct size or item. This ensures you get the item before it sells out.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Damaged or Wrong Items</h2>
            <p>If you received a damaged, defective, or incorrect item, please contact us within <strong className="text-white">7 days of delivery</strong> with photos. We'll make it right immediately at no cost to you.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Order Cancellations</h2>
            <p>Orders can be cancelled within <strong className="text-white">1 hour of placement</strong> if they haven't entered fulfillment. Go to <Link to={createPageUrl('MyOrders')} className="text-blue-400 hover:underline">My Orders</Link> to request a cancellation.</p>
          </section>

          <section className="glass-card p-6 rounded-2xl">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-white font-semibold">Questions?</p>
                <p className="text-white/60 text-sm mt-1">Email us at <a href="mailto:returns@skrtlife.com" className="text-blue-400 hover:underline">returns@skrtlife.com</a> or visit our <Link to={createPageUrl('Contact')} className="text-blue-400 hover:underline">Contact page</Link>.</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .glass-card {
          background: rgba(15,20,35,0.6);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(100,150,255,0.15);
        }
      `}</style>
    </div>
  );
}