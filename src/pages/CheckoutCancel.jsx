import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#050810] flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">
        <div className="glass-card p-8 rounded-2xl soft-glow-red">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/50 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Checkout Cancelled</h1>
            <p className="text-white/60 text-sm">Your payment was not processed</p>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-8">
            <p className="text-sm text-white">Your cart has been saved. You can continue shopping or retry checkout whenever you're ready.</p>
          </div>

          <div className="space-y-3">
            <Link to={createPageUrl('Cart')} className="block">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-6 text-base font-semibold rounded-xl">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <Link to={createPageUrl('Shop')} className="block">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5 py-6 text-base font-semibold rounded-xl">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .glass-card {
          background: rgba(15,20,35,0.6);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(100,150,255,0.15);
        }
        .soft-glow-red {
          box-shadow: 0 4px 24px rgba(200,100,100,0.15);
        }
      `}</style>
    </div>
  );
}