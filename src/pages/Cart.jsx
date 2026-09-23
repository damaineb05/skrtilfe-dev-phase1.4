import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const styles = `
  .glass-card {
    background: rgba(15,20,35,0.6);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(100,150,255,0.15);
  }
  .soft-glow-blue {
    box-shadow: 0 4px 24px rgba(100,150,255,0.15);
  }
`;

export default function CartPage() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [removingItem, setRemovingItem] = useState(null);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(storedCart);
    }, []);

    const updateCart = (newCart) => {
        setCartItems(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated')); // Notify layout
    };

    const getItemKey = (item) => item.variant_sku || `${item.product_id}-${item.size}-${item.color}`;

    const handleQuantityChange = (key, newQuantity) => {
        if (newQuantity < 1) return;
        const newCart = cartItems.map(item =>
            getItemKey(item) === key ? { ...item, quantity: newQuantity } : item
        );
        updateCart(newCart);
    };

    const handleRemoveItem = (key) => {
        setRemovingItem(key);
        setTimeout(() => {
            const newCart = cartItems.filter(item => getItemKey(item) !== key);
            updateCart(newCart);
            setRemovingItem(null);
        }, 200);
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subtotal > 150 ? 0 : 15; // Free shipping over $150
    const tax = subtotal * 0.0875; // 8.75% tax
    const total = subtotal + shipping + tax;

    const handleCheckout = () => {
      window.location.href = createPageUrl('Checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#050810] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-center soft-glow-blue">
                        <ShoppingCart className="w-12 h-12 text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold mb-3 text-white">Your Cart is Empty</h1>
                    <p className="text-white/50 mb-8 text-sm">Start adding items to bring your vision to life.</p>
                    <Link to={createPageUrl("Shop")}>
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 rounded-xl font-semibold">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{styles}</style>
            <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#050810] py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Shopping Cart</h1>
                            <p className="text-white/50 text-sm">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
                        </div>
                        <Link to={createPageUrl('Shop')} className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
                            ← Continue Shopping
                        </Link>
                    </div>
                    
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map(item => {
                            const key = getItemKey(item);
                            return (
                                <Card key={key} className={`glass-card p-4 transition-all duration-200 ${removingItem === key ? 'opacity-50 scale-95' : ''}`}>
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white text-lg mb-1">{item.title}</h3>
                                            <p className="text-white/40 text-sm mb-2">{item.color} • {item.size}</p>
                                            <p className="text-blue-400 font-bold text-lg">${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-white/40 hover:text-red-400 h-8 w-8" 
                                                onClick={() => handleRemoveItem(key)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <div className="flex items-center gap-2 bg-white/5 rounded-lg border border-white/10 p-1">
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-white/10" onClick={() => handleQuantityChange(key, item.quantity - 1)}>-</Button>
                                                <span className="w-8 text-center text-white text-sm font-medium">{item.quantity}</span>
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-white/10" onClick={() => handleQuantityChange(key, item.quantity + 1)}>+</Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="glass-card p-6 sticky top-24 soft-glow-blue">
                                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-white/70">
                                        <span>Subtotal</span>
                                        <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-white/70">
                                        <span>Shipping</span>
                                        <span className="text-white font-medium">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                                    </div>
                                    <div className="flex justify-between text-white/70">
                                        <span>Tax</span>
                                        <span className="text-white font-medium">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-3 mt-3" />
                                    <div className="flex justify-between text-xl font-bold">
                                        <span className="text-white">Total</span>
                                        <span className="text-blue-400">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                {shipping > 0 && (
                                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                        <p className="text-xs text-blue-300">
                                            Add ${(150 - subtotal).toFixed(2)} more for free shipping
                                        </p>
                                    </div>
                                )}
                                
                                <Button 
                                  onClick={handleCheckout}
                                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-6 text-base font-semibold rounded-xl"
                                >
                                  Proceed to Checkout
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}