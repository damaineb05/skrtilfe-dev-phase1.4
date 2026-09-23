import React, { useState, useEffect } from 'react';
import { NFT } from '@/entities/NFT';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Eye, Heart, Diamond, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function TrendingViewport() {
  const [trendingNFTs, setTrendingNFTs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingNFTs();
  }, []);

  const loadTrendingNFTs = async () => {
    try {
      // Get recent and popular NFTs
      const recent = await NFT.list('-created_date', 6);
      const popular = await NFT.list('-view_count', 6);
      
      // Combine and deduplicate
      const combined = [...recent, ...popular];
      const unique = combined.filter((nft, index, self) => 
        index === self.findIndex(n => n.id === nft.id)
      ).slice(0, 8);
      
      setTrendingNFTs(unique);
    } catch (error) {
      console.error('Failed to load trending NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/80 border-cyan-400/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/80 border-cyan-400/30 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Genesis NFT Marketplace
            </h3>
            <Link to={createPageUrl("NFTMarketplace")}>
              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Horizontal Scrollable Viewport */}
        <div className="overflow-x-auto">
          <div className="flex gap-3 p-4 min-w-max">
            {trendingNFTs.length > 0 ? (
              trendingNFTs.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="min-w-[160px] max-w-[160px]"
                >
                  <Link to={createPageUrl(`NFTDetail?id=${nft.id}`)}>
                    <Card className="bg-black/60 border-gray-700 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer group">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={nft.image_url}
                          alt={nft.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        
                        {/* Overlay Badges */}
                        <div className="absolute top-2 left-2">
                          {index < 3 && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              New
                            </Badge>
                          )}
                        </div>

                        <div className="absolute top-2 right-2">
                          <Badge className="bg-black/80 text-white border-gray-600 text-xs">
                            <Diamond className="w-3 h-3 mr-1" />
                            {nft.blockchain || 'ETH'}
                          </Badge>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" className="bg-cyan-400 text-black hover:bg-cyan-300">
                            View
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-3">
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 truncate">{nft.collection_name}</p>
                          <h4 className="text-sm font-bold text-white truncate">{nft.name}</h4>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div>
                            {nft.price ? (
                              <span className="text-cyan-400 font-bold">
                                {nft.price} {nft.currency}
                              </span>
                            ) : (
                              <span className="text-gray-500">Not Listed</span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 text-gray-500">
                            <div className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {nft.view_count || 0}
                            </div>
                            <div className="flex items-center">
                              <Heart className="w-3 h-3 mr-1" />
                              {nft.favorite_count || 0}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="flex items-center justify-center w-full h-40 text-gray-500">
                <div className="text-center">
                  <Diamond className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No NFTs available yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}