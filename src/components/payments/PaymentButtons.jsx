import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, DollarSign, Wallet, Shield, Loader2 } from 'lucide-react';

export default function PaymentButtons({ product, selectedVariant, quantity = 1 }) {
  const [loading, setLoading] = useState({ stripe: false, paypal: false, crypto: false });

  const totalAmount = (selectedVariant?.price || product.price) * quantity;
  const totalCents = Math.round(totalAmount * 100);

  const handleStripeCheckout = async () => {
    setLoading(prev => ({ ...prev, stripe: true }));
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: selectedVariant?.sku || product.id,
            name: product.title,
            price: totalCents,
            quantity: quantity,
            variant_info: selectedVariant ? {
              size: selectedVariant.size,
              color: selectedVariant.color,
              sku: selectedVariant.sku
            } : null
          }]
        })
      });

      const data = await response.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert(data?.error || 'Checkout failed');
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      alert('Payment system temporarily unavailable');
    } finally {
      setLoading(prev => ({ ...prev, stripe: false }));
    }
  };

  const handleCryptoPayment = async () => {
    setLoading(prev => ({ ...prev, crypto: true }));
    
    try {
      const response = await fetch('/api/create-crypto-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.title,
          price: totalCents,
          metadata: {
            product_id: product.id,
            variant_sku: selectedVariant?.sku,
            quantity: quantity
          }
        })
      });

      const data = await response.json();
      if (data?.hosted_url) {
        window.location.href = data.hosted_url;
      } else {
        alert('Crypto payment unavailable');
      }
    } catch (error) {
      console.error('Crypto payment error:', error);
      alert('Crypto payment temporarily unavailable');
    } finally {
      setLoading(prev => ({ ...prev, crypto: false }));
    }
  };

  if (!selectedVariant && product.variants?.length > 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4 text-center">
          <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-white font-medium">Select Size & Color</p>
          <p className="text-gray-400 text-sm">Choose your options to continue</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-white mb-1">
          ${totalAmount.toFixed(2)}
        </div>
        <p className="text-gray-400 text-sm">
          {quantity > 1 && `${quantity} × $${(selectedVariant?.price || product.price).toFixed(2)} each`}
        </p>
      </div>

      {/* Primary Payment - Stripe */}
      <Button
        onClick={handleStripeCheckout}
        disabled={loading.stripe}
        className="w-full bg-gradient-to-r from-cyan-400 to-pink-500 text-black hover:shadow-lg text-lg py-6"
      >
        {loading.stripe ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5 mr-2" />
        )}
        {loading.stripe ? 'Processing...' : 'Buy Now - Card/Apple Pay/Google Pay'}
      </Button>

      {/* Alternative Payment Methods */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="neon-border text-cyan-400 hover:bg-cyan-400/10 py-4"
          disabled={loading.paypal}
          onClick={() => {
            // PayPal integration will be handled by PayPal buttons component
            alert('PayPal integration available - contact support for setup');
          }}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          PayPal
        </Button>

        <Button
          variant="outline"
          onClick={handleCryptoPayment}
          disabled={loading.crypto}
          className="neon-border text-orange-400 hover:bg-orange-400/10 py-4"
        >
          {loading.crypto ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4 mr-2" />
          )}
          Crypto
        </Button>
      </div>

      <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
        <Shield className="w-3 h-3 mr-1" />
        Secure checkout • 256-bit SSL encryption
      </div>
    </div>
  );
}