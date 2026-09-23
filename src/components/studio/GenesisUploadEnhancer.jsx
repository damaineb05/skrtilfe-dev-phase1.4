import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Crown, Sparkles, TrendingUp, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { promoteGenesisNFT, grantEarlyAccess, applyGenesisDiscount } from '../marketplace/AutoPromotionEngine';

export default function GenesisUploadEnhancer({ currentUser, nftData, onEnhance }) {
  const [autoPromote, setAutoPromote] = useState(true);
  const [earlyAccess, setEarlyAccess] = useState(true);
  const [discount, setDiscount] = useState(10);
  const [makeExclusive, setMakeExclusive] = useState(false);

  const hasGenesisPass = currentUser?.has_genesis_pass;

  const handleApplyEnhancements = () => {
    if (!hasGenesisPass) return;
    const enhancements = {
      uploaded_by_genesis_holder: autoPromote,
      promotion_tier: autoPromote ? 'premium' : 'standard',
      is_featured: autoPromote,
      early_access_until: earlyAccess ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
      genesis_discount_percent: discount,
      is_genesis_exclusive: makeExclusive
    };
    onEnhance(enhancements);
  };

  useEffect(() => {
    handleApplyEnhancements();
  }, [autoPromote, earlyAccess, discount, makeExclusive]);

  if (!hasGenesisPass) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/40 p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Crown className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            Genesis Creator Benefits
            <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px]">
              {currentUser.genesis_tier?.toUpperCase() || 'MEMBER'}
            </Badge>
          </h3>
          <p className="text-white/60 text-sm">Your uploads get premium promotion</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Auto-promotion */}
        <motion.div
          whileHover={{ x: 4 }}
          className="flex items-start gap-3 p-4 bg-black/30 rounded-xl border border-purple-500/20"
        >
          <Checkbox
            id="auto-promote"
            checked={autoPromote}
            onCheckedChange={setAutoPromote}
            className="mt-1 border-purple-400 data-[state=checked]:bg-purple-500"
          />
          <div className="flex-1">
            <Label htmlFor="auto-promote" className="text-white font-semibold cursor-pointer flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Auto-Promote Across Ecosystem
            </Label>
            <p className="text-xs text-white/50 mt-1">
              Featured on dashboards, Genesis Hub, and notifications
            </p>
          </div>
        </motion.div>

        {/* Early Access */}
        <motion.div
          whileHover={{ x: 4 }}
          className="flex items-start gap-3 p-4 bg-black/30 rounded-xl border border-cyan-500/20"
        >
          <Checkbox
            id="early-access"
            checked={earlyAccess}
            onCheckedChange={setEarlyAccess}
            className="mt-1 border-cyan-400 data-[state=checked]:bg-cyan-500"
          />
          <div className="flex-1">
            <Label htmlFor="early-access" className="text-white font-semibold cursor-pointer flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              24h Genesis Early Access
            </Label>
            <p className="text-xs text-white/50 mt-1">
              Genesis holders see your NFT first
            </p>
          </div>
        </motion.div>

        {/* Genesis Discount */}
        <motion.div
          whileHover={{ x: 4 }}
          className="p-4 bg-black/30 rounded-xl border border-green-500/20"
        >
          <Label className="text-white font-semibold flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4 text-green-400" />
            Genesis Holder Discount: {discount}%
          </Label>
          <input
            type="range"
            min="0"
            max="25"
            step="5"
            value={discount}
            onChange={(e) => setDiscount(parseInt(e.target.value))}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-white/50 mt-2">
            <span>0%</span>
            <span>25%</span>
          </div>
        </motion.div>

        {/* Make Exclusive */}
        <motion.div
          whileHover={{ x: 4 }}
          className="flex items-start gap-3 p-4 bg-black/30 rounded-xl border border-yellow-500/20"
        >
          <Checkbox
            id="exclusive"
            checked={makeExclusive}
            onCheckedChange={setMakeExclusive}
            className="mt-1 border-yellow-400 data-[state=checked]:bg-yellow-500"
          />
          <div className="flex-1">
            <Label htmlFor="exclusive" className="text-white font-semibold cursor-pointer flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              Genesis Exclusive
            </Label>
            <p className="text-xs text-white/50 mt-1">
              Only Genesis Pass holders can purchase
            </p>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
        <p className="text-xs text-purple-400 font-semibold mb-2">🎯 Active Benefits:</p>
        <ul className="text-xs text-white/60 space-y-1">
          {autoPromote && <li>✓ Premium ecosystem promotion</li>}
          {earlyAccess && <li>✓ 24-hour early access for Genesis holders</li>}
          {discount > 0 && <li>✓ {discount}% discount for Genesis members</li>}
          {makeExclusive && <li>✓ Genesis-only purchase access</li>}
        </ul>
      </div>
    </Card>
  );
}