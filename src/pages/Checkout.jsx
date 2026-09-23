import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { createCheckout } from '@/functions/createCheckout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Lock, Truck, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { getShippingOptions, calculateShipping, calculateTax } from '../components/checkout/shippingTaxUtils';

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '', lastName: '', address1: '', address2: '',
    city: '', state: '', postalCode: '', country: 'US', phone: ''
  });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) { navigate(createPageUrl('Cart')); return; }
    setCartItems(cart);

    base44.auth.me().then(user => {
      if (!user) {
        base44.auth.redirectToLogin(window.location.pathname + window.location.search);
        return;
      }
      setCurrentUser(user);
      setEmail(user.email || '');
      if (user.shipping_address) {
        setShippingAddress({
          firstName: user.shipping_address.first_name || '',
          lastName: user.shipping_address.last_name || '',
          address1: user.shipping_address.street_address || '',
          address2: user.shipping_address.apartment || '',
          city: user.shipping_address.city || '',
          state: user.shipping_address.state || '',
          postalCode: user.shipping_address.zip_code || '',
          country: user.shipping_address.country || 'US',
          phone: user.phone || ''
        });
      }
    }).catch(() => {
      base44.auth.redirectToLogin(window.location.pathname + window.location.search);
    });
  }, [navigate]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingOptions = getShippingOptions(shippingAddress.country, subtotal);
  const shippingCost = calculateShipping(shippingMethod, shippingAddress.country, subtotal);
  const tax = calculateTax(subtotal, shippingAddress.state, shippingAddress.country);
  const total = subtotal + shippingCost + tax;

  const validate = () => {
    const e = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = 'Valid email required';
    if (!shippingAddress.firstName.trim()) e.firstName = 'Required';
    if (!shippingAddress.lastName.trim()) e.lastName = 'Required';
    if (!shippingAddress.address1.trim()) e.address1 = 'Required';
    if (!shippingAddress.city.trim()) e.city = 'Required';
    if (!shippingAddress.state.trim()) e.state = 'Required';
    if (!shippingAddress.postalCode.trim()) e.postalCode = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCheckout = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setPaymentError('');
    try {
      const origin = window.location.origin;
      const res = await createCheckout({
        items: cartItems,
        shippingAddress,
        shippingMethod,
        successUrl: `${origin}/CheckoutSuccess?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/Checkout`,
      });
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        setPaymentError(res?.data?.error || 'Failed to start checkout. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setPaymentError('Something went wrong. Please try again or contact support.');
      setIsSubmitting(false);
    }
  };

  const Field = ({ id, label, value, onChange, error, type = 'text', disabled = false, className = '' }) => (
    <div className={className}>
      <Input
        type={type} placeholder={label} value={value} onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`h-11 rounded-lg text-sm ${error ? 'border-red-400 focus-visible:ring-red-400' : 'border-gray-200'}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate(createPageUrl('Cart'))}
            className="flex items-center text-sm text-gray-500 hover:text-black transition-colors mb-4 gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </button>
          <h1 className="text-2xl font-bold text-black">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
          {/* LEFT — Forms */}
          <div className="space-y-6">
            {/* Contact */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-black mb-4">Contact</h2>
              <Field id="email" label="Email address" value={email} onChange={setEmail}
                error={errors.email} type="email" disabled={!!currentUser} />
            </section>

            {/* Shipping */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-black mb-4">Shipping Address</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name" value={shippingAddress.firstName}
                    onChange={v => setShippingAddress(s => ({...s, firstName: v}))} error={errors.firstName} />
                  <Field label="Last name" value={shippingAddress.lastName}
                    onChange={v => setShippingAddress(s => ({...s, lastName: v}))} error={errors.lastName} />
                </div>
                <Field label="Address" value={shippingAddress.address1}
                  onChange={v => setShippingAddress(s => ({...s, address1: v}))} error={errors.address1} />
                <Input placeholder="Apartment, suite, etc. (optional)" value={shippingAddress.address2}
                  onChange={e => setShippingAddress(s => ({...s, address2: e.target.value}))}
                  className="h-11 rounded-lg text-sm border-gray-200" />
                <div className="grid grid-cols-3 gap-3">
                  <Field label="City" value={shippingAddress.city}
                    onChange={v => setShippingAddress(s => ({...s, city: v}))} error={errors.city} />
                  <Field label="State" value={shippingAddress.state}
                    onChange={v => setShippingAddress(s => ({...s, state: v}))} error={errors.state} />
                  <Field label="ZIP" value={shippingAddress.postalCode}
                    onChange={v => setShippingAddress(s => ({...s, postalCode: v}))} error={errors.postalCode} />
                </div>
                <select value={shippingAddress.country}
                  onChange={e => { setShippingAddress(s => ({...s, country: e.target.value})); setShippingMethod('standard'); }}
                  className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                </select>
                <Input placeholder="Phone number" value={shippingAddress.phone}
                  onChange={e => setShippingAddress(s => ({...s, phone: e.target.value}))}
                  className="h-11 rounded-lg text-sm border-gray-200" />
              </div>
            </section>

            {/* Shipping Method */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-black mb-4">Shipping Method</h2>
              <div className="space-y-2">
                {shippingOptions.map(method => (
                  <button key={method.id} onClick={() => setShippingMethod(method.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      shippingMethod === method.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        shippingMethod === method.id ? 'border-black' : 'border-gray-300'
                      }`}>
                        {shippingMethod === method.id && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black">{method.name}</p>
                        <p className="text-xs text-gray-500">{method.time}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-black">
                      {method.price === 0 ? 'FREE' : `$${method.price.toFixed(2)}`}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT — Summary + Pay */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-black mb-5">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">{[item.color, item.size].filter(Boolean).join(' · ')}</p>
                    </div>
                    <span className="text-sm font-semibold text-black shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span className="font-medium text-black">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-black">{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span><span className="font-medium text-black">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-200">
                  <span className="text-black">Total</span>
                  <span className="text-black">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Error */}
              {paymentError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700">{paymentError}</p>
                </div>
              )}

              {/* CTA */}
              <Button onClick={handleCheckout} disabled={isSubmitting}
                className="w-full mt-5 bg-black hover:bg-gray-900 text-white h-12 text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to payment…</>
                ) : (
                  <><Lock className="w-4 h-4" /> Pay ${total.toFixed(2)} Securely</>
                )}
              </Button>

              {/* Trust */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secured by Stripe · SSL encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}