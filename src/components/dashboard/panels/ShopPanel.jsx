import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, ShoppingBag, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/EmptyState';

export default function ShopPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Product.filter({ status: 'active' }, '-created_date', 4)
      .then(data => setProducts(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Latest Products</h3>
        <Link to={createPageUrl('Shop')}>
          <Button size="sm" variant="outline" className="border-white/10 text-white/50 hover:bg-white/5 text-xs">
            <ExternalLink className="w-3 h-3 mr-1" /> View All
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={20} />}
          eyebrow="Shop"
          title="No products live yet"
          description="The next drop is coming. Get on the list and be first to know."
          cta={{ label: 'Browse the Shop', href: createPageUrl('Shop') }}
          accentColor="#FFD700"
        />
      ) : (
        <div className="space-y-2">
          {products.map(product => {
            const image = product.media?.find(m => m.is_primary)?.url || product.media?.[0]?.url;
            return (
              <Link key={product.id} to={createPageUrl(`ProductDetail?id=${product.id}`)}>
                <div className="flex gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[#111]">
                    {image ? <img src={image} alt={product.title} className="w-full h-full object-cover" />
                      : <ShoppingBag className="w-6 h-6 m-auto mt-4" style={{ color: 'rgba(255,255,255,0.2)' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">{product.title}</h4>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{product.collection}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-sm text-white">${product.price}</span>
                      <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}