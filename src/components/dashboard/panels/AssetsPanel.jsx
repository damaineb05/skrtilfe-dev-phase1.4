import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, Briefcase, Grid3x3, List, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/ui/EmptyState';

/**
 * AssetsPanel — merges NFTPanel + PortfolioPanel into one.
 * Single data fetch, two view modes (grid / list).
 */
export default function AssetsPanel({ user }) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    base44.entities.NFT.filter({ created_by: user.email }, '-created_date', 20)
      .then(data => setNfts(data || []))
      .finally(() => setLoading(false));
  }, [user?.email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {nfts.length} Asset{nfts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setViewMode('grid')}
            className="w-7 h-7 flex items-center justify-center transition-all"
            style={{
              borderRadius: '6px',
              background: viewMode === 'grid' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: '1px solid',
              borderColor: viewMode === 'grid' ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}>
            <Grid3x3 className="w-3.5 h-3.5" style={{ color: viewMode === 'grid' ? '#fff' : 'rgba(255,255,255,0.3)' }} />
          </button>
          <button onClick={() => setViewMode('list')}
            className="w-7 h-7 flex items-center justify-center transition-all"
            style={{
              borderRadius: '6px',
              background: viewMode === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: '1px solid',
              borderColor: viewMode === 'list' ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}>
            <List className="w-3.5 h-3.5" style={{ color: viewMode === 'list' ? '#fff' : 'rgba(255,255,255,0.3)' }} />
          </button>
          <Link to={createPageUrl('Portfolio')}>
            <button className="ml-1 flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.4)' }}>
              <ExternalLink className="w-3 h-3" /> All
            </button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {nfts.length === 0 ? (
          <EmptyState
            icon={<Sparkles size={20} />}
            eyebrow="Digital Assets"
            title="No assets minted yet"
            description="Create your first NFT or 3D wearable in Creator Studio."
            cta={{ label: 'Open Studio', href: createPageUrl('Studio') }}
            accentColor="#A855F7"
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {nfts.map((nft, idx) => (
              <Link key={nft.id} to={createPageUrl(`Portfolio?nft=${nft.id}`)}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-[#0D0D16] group-hover:ring-1 group-hover:ring-white/15 transition-all">
                    {nft.image_url
                      ? <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                      : <div className="w-full h-full flex items-center justify-center"><Briefcase className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.15)' }} /></div>
                    }
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{nft.name}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{nft.collection_name || '—'}</p>
                    {nft.price && <p className="text-[10px] font-bold" style={{ color: 'rgba(251,146,60,0.9)' }}>{nft.price} {nft.currency || 'ETH'}</p>}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {nfts.map((nft, idx) => (
              <Link key={nft.id} to={createPageUrl(`Portfolio?nft=${nft.id}`)}>
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#0D0D16]">
                    {nft.image_url
                      ? <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover" />
                      : <Briefcase className="w-5 h-5 m-auto mt-3.5" style={{ color: 'rgba(255,255,255,0.15)' }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{nft.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{nft.collection_name || 'Uncategorized'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant="outline" className="text-[10px]"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                      {nft.status || 'not_listed'}
                    </Badge>
                    {nft.price && (
                      <p className="text-xs font-bold" style={{ color: 'rgba(251,146,60,0.9)' }}>
                        {nft.price} {nft.currency || 'ETH'}
                      </p>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}