import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Heart, ChevronUp, ChevronDown, Sparkles, Truck, RotateCcw } from "lucide-react";
import ProductGallery from "../components/product/ProductGallery";
import VariantSelector from "../components/product/VariantSelector";
import Product3DViewer from "../components/product/Product3DViewer";
import CustomerReviews from "../components/product/CustomerReviews";
import RelatedProducts from "../components/product/RelatedProducts";
import ProductRecommendations, { trackProductView } from "../components/shop/ProductRecommendations";

function DetailsSection({ product }) {
  const [open, setOpen] = useState(true);

  const highlights = [];
  if (product.available_colors?.length > 0) highlights.push(...product.available_colors.map(c => c.name));
  if (product.tags?.length > 0) highlights.push(...product.tags);
  if (product.wearable_slot) highlights.push(product.wearable_slot);

  return (
    <div className="border-t border-[#e8e8e8] px-5 lg:px-8 py-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-5"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-black">The Details</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-black/40" /> : <ChevronDown className="w-3.5 h-3.5 text-black/40" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Highlights */}
              <div>
                <p className="text-xs font-semibold text-black mb-3">Highlights</p>
                <ul className="space-y-1.5">
                  {highlights.length > 0 ? highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-black/60">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-black/25 shrink-0" />
                      {h}
                    </li>
                  )) : (product.description || product.lore) ? (
                    <li className="text-sm text-black/60 leading-relaxed">{product.description || product.lore}</li>
                  ) : <li className="text-sm text-black/40">No details available</li>}
                </ul>
              </div>
              {/* Composition / care */}
              <div>
                {product.fabric && (
                  <>
                    <p className="text-xs font-semibold text-black mb-3">Composition</p>
                    <p className="text-sm text-black/60 leading-relaxed">{product.fabric}</p>
                  </>
                )}
                {product.care && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-black mb-3">Care Instructions</p>
                    <p className="text-sm text-black/60">{product.care}</p>
                  </div>
                )}
                {product.shipping_class && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-black mb-3">Shipping</p>
                    <p className="text-sm text-black/60 capitalize">{product.shipping_class}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      const params = new URLSearchParams(location.search);
      const productId = params.get("id");
      if (!productId) { setError("No product specified."); setIsLoading(false); return; }
      try {
        const products = await base44.entities.Product.filter({ id: productId });
        const p = products[0];
        setProduct(p);
        trackProductView(p);
        if (p.available_colors?.length > 0) setSelectedColor(p.available_colors[0].name);
        if (p.available_sizes?.length > 0) setSelectedSize(p.available_sizes[0]);
      } catch {
        setError("Product not found.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [location.search]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.available_sizes?.length > 0 && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2500);
      return;
    }
    setAddingToCart(true);
    const variant = product.variants?.find(v => v.color === selectedColor && v.size === selectedSize);
    const cartItem = {
      product_id: product.id, title: product.title,
      price: variant?.price || product.price,
      image_url: product.media?.[0]?.url,
      quantity, color: selectedColor, size: selectedSize,
      variant_sku: variant?.sku || product.sku
    };
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const idx = cart.findIndex(i => i.variant_sku === cartItem.variant_sku);
    if (idx > -1) cart[idx].quantity += quantity;
    else cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setAddingToCart(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleTryOn = () => {
    if (!product) return;
    const wearableData = {
      productId: product.id, name: product.title,
      url: product.model_3d_url || '',
      bone: product.wearable_bone || 'Hips',
      position: product.wearable_position || [0,0,0],
      rotation: product.wearable_rotation || [0,0,0],
      scale: product.wearable_scale || 1,
      slot: product.wearable_slot || 'accessory',
      replaces_slots: product.replaces_slots || [],
    };
    navigate(`${createPageUrl('DripSync')}?tryOn=${encodeURIComponent(JSON.stringify(wearableData))}`);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-black/30" />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <p className="text-sm text-black/40">{error || 'Product not found'}</p>
      <Link to={createPageUrl("Shop")} className="text-xs font-semibold uppercase tracking-widest underline text-black">
        Back to Shop
      </Link>
    </div>
  );

  const hasModel = product.model_3d_url || product.product_type === 'wearable' || product.product_type === 'physical_and_nft';
  const isOnSale = product.compare_at_price > product.price;
  const discount = isOnSale ? Math.round((1 - product.price / product.compare_at_price) * 100) : 0;
  const isSoldOut = (product.inventory_qty ?? -1) === 0;
  const sizeCount = product.available_sizes?.length ?? 0;

  // Delivery estimate
  const today = new Date();
  const d1 = new Date(today); d1.setDate(today.getDate() + 3);
  const d2 = new Date(today); d2.setDate(today.getDate() + 8);
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-white">

      {/* Breadcrumb */}
      <div className="hidden lg:flex items-center gap-1.5 px-8 py-3 border-b border-[#e8e8e8]">
        <Link to={createPageUrl("Shop")} className="text-xs text-black/40 hover:text-black transition-colors">Shop</Link>
        {product.collection && <>
          <span className="text-black/20 text-xs">›</span>
          <span className="text-xs text-black/40">{product.collection}</span>
        </>}
        <span className="text-black/20 text-xs">›</span>
        <span className="text-xs text-black truncate max-w-[240px]">{product.title}</span>
      </div>

      {/* Mobile back */}
      <div className="lg:hidden flex items-center px-4 py-3 border-b border-[#e8e8e8]">
        <Link to={createPageUrl("Shop")} className="flex items-center gap-1.5 text-xs text-black/50 hover:text-black">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>
      </div>

      {/* Main: left gallery / right panel */}
      <div className="lg:flex lg:items-start">

        {/* LEFT — Image gallery (scrollable on desktop) */}
        <div className="lg:w-[58%] xl:w-[62%]">
          {show3DViewer && product.model_3d_url ? (
            <div className="aspect-[3/4]">
              <Product3DViewer
                modelUrl={product.model_3d_url}
                productName={product.title}
                isFullscreen={false}
                onToggleFullscreen={() => {}}
                onClose={() => setShow3DViewer(false)}
              />
            </div>
          ) : (
            <ProductGallery media={product.media} title={product.title} />
          )}
        </div>

        {/* RIGHT — Sticky info panel */}
        <div className="lg:w-[42%] xl:w-[38%] lg:sticky lg:top-0 lg:border-l border-[#e8e8e8] lg:max-h-screen lg:overflow-y-auto">
          <div className="px-5 lg:px-8 pt-6 pb-8">

            {/* Brand */}
            <h1 className="text-xl font-semibold text-black tracking-[-0.01em]">SKRTLIFE</h1>
            {/* Product name */}
            <p className="text-sm text-black/50 mt-0.5 mb-5 leading-snug">{product.title}</p>

            {/* Price */}
            <div className="mb-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-xl font-semibold text-black">${product.price?.toFixed(2)}</span>
                {isOnSale && (
                  <>
                    <span className="text-sm text-black/30 line-through">${product.compare_at_price?.toFixed(2)}</span>
                    <span className="text-xs font-bold text-[#d0021b]">-{discount}%</span>
                  </>
                )}
              </div>
              <p className="text-xs text-black/35 mt-0.5">Duties & taxes included</p>
            </div>

            {/* Availability */}
            {sizeCount > 0 ? (
              <p className="text-xs text-black/40 mt-3 mb-5">{sizeCount} size{sizeCount > 1 ? 's' : ''} available</p>
            ) : (
              <p className="text-xs text-black/40 mt-3 mb-5">One size available</p>
            )}

            {/* Variants */}
            <VariantSelector
              product={product}
              selectedColor={selectedColor} setSelectedColor={setSelectedColor}
              selectedSize={selectedSize} setSelectedSize={setSelectedSize}
              quantity={quantity} setQuantity={setQuantity}
            />

            <AnimatePresence>
              {sizeError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-2 text-xs text-[#d0021b] font-medium"
                >Please select a size</motion.p>
              )}
            </AnimatePresence>

            {/* Add To Bag + Wishlist */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddToCart}
                disabled={isSoldOut || addingToCart}
                className="flex-1 h-12 flex items-center justify-center text-xs font-semibold uppercase tracking-[0.1em] transition-all"
                style={{
                  background: addedToCart ? '#22C55E' : isSoldOut ? '#e8e8e8' : '#000',
                  color: isSoldOut ? '#999' : '#fff',
                }}
              >
                {addingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> :
                 addedToCart ? '✓ Added' :
                 isSoldOut ? 'Sold Out' : 'Add To Bag'}
              </button>
              <button
                onClick={() => setIsWishlisted(w => !w)}
                className="h-12 px-3.5 border flex items-center justify-center gap-1.5 text-xs font-medium transition-all shrink-0"
                style={{ borderColor: '#d4d4d4', color: '#000' }}
              >
                <Heart className="w-4 h-4 transition-all"
                  style={{ fill: isWishlisted ? '#000' : 'none', color: '#000' }} />
                <span className="hidden sm:inline">Wishlist</span>
              </button>
            </div>

            {/* Estimated delivery */}
            <div className="mt-5 pt-5 border-t border-[#e8e8e8]">
              <p className="text-xs text-black/40 uppercase tracking-widest mb-0.5">Estimated delivery</p>
              <p className="text-sm font-medium text-black">{fmt(d1)} – {fmt(d2)}</p>
            </div>

            {/* Also available in (color swatches if multiple) */}
            {product.available_colors?.length > 1 && (
              <div className="mt-5 pt-5 border-t border-[#e8e8e8]">
                <p className="text-xs text-black/40 mb-3">Also available in</p>
                <div className="flex gap-2 flex-wrap">
                  {product.available_colors.map(c => (
                    <button
                      key={c.name}
                      title={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className="w-9 h-9 transition-all"
                      style={{
                        background: c.hex || '#ccc',
                        outline: selectedColor === c.name ? '2px solid #000' : '2px solid transparent',
                        outlineOffset: '2px',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Free returns banner — exactly as Farfetch */}
            <div className="mt-5 p-3.5 bg-[#f5f5f3] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-black/40 shrink-0" />
              <p className="text-xs text-black/60">Free returns for 30 days · We can collect from your home</p>
            </div>

            {/* Try on DripSync */}
            {hasModel && (
              <button
                onClick={handleTryOn}
                className="w-full h-10 border border-black flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-black hover:bg-black hover:text-white transition-all mt-3"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Try On in DripSync
              </button>
            )}

            {/* 3D toggle */}
            {product.model_3d_url ? (
              <button
                onClick={() => setShow3DViewer(v => !v)}
                className="w-full h-10 border border-black/20 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-black hover:bg-black hover:text-white transition-all mt-3"
              >
                {show3DViewer ? '← Back to Photos' : '⬡ View in 3D'}
              </button>
            ) : (
              <div className="w-full h-10 border border-black/10 flex items-center justify-center gap-2 text-xs text-black/30 mt-3 cursor-not-allowed">
                ⬡ 3D View — No model available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* THE DETAILS — full width below fold */}
      <DetailsSection product={product} />

      {/* Reviews */}
      <CustomerReviews productId={product.id} />

      {/* You May Also Like */}
      <div className="border-t border-[#e8e8e8] px-5 lg:px-8 py-8">
        <ProductRecommendations
          currentProductId={product.id}
          collection={product.collection}
          tags={product.tags}
          title="You May Also Like"
          onAddToCart={(p) => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const idx = cart.findIndex(i => i.product_id === p.id);
            if (idx > -1) cart[idx].quantity += 1;
            else cart.push({ product_id: p.id, title: p.title, price: p.price, quantity: 1, image_url: p.media?.[0]?.url });
            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));
          }}
        />
        <RelatedProducts currentProductId={product.id} collection={product.collection} tags={product.tags} />
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-[#e8e8e8] px-4 py-3 flex gap-2">
        <button
          onClick={handleAddToCart}
          disabled={isSoldOut || addingToCart}
          className="flex-1 h-12 flex items-center justify-center text-xs font-semibold uppercase tracking-[0.1em] transition-all"
          style={{
            background: addedToCart ? '#22C55E' : isSoldOut ? '#e8e8e8' : '#000',
            color: isSoldOut ? '#999' : '#fff',
          }}
        >
          {addingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> :
           addedToCart ? '✓ Added to Bag' :
           isSoldOut ? 'Sold Out' : `Add To Bag — $${product.price?.toFixed(2)}`}
        </button>
        {hasModel && (
          <button
            onClick={handleTryOn}
            className="h-12 px-3 border border-black flex items-center justify-center flex-shrink-0 gap-1"
            title="Try in DripSync"
          >
            <Sparkles className="w-4 h-4 text-black" />
          </button>
        )}
        <button
          onClick={() => setIsWishlisted(w => !w)}
          className="h-12 w-12 border flex items-center justify-center flex-shrink-0"
          style={{ borderColor: '#d4d4d4' }}
        >
          <Heart className="w-4 h-4" style={{ fill: isWishlisted ? '#000' : 'none', color: '#000' }} />
        </button>
      </div>
    </div>
  );
}