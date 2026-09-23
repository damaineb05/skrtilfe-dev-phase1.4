import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  RefreshCw,
  Package,
  Loader2,
  Clock
} from 'lucide-react';
import moment from 'moment';

const TRANSACTION_ICONS = {
  purchase: ArrowUpRight,
  sale: ArrowDownLeft,
  reward: Gift,
  refund: RefreshCw,
  topup: Coins
};

const TRANSACTION_COLORS = {
  purchase: 'text-red-400',
  sale: 'text-green-400',
  reward: 'text-yellow-400',
  refund: 'text-blue-400',
  topup: 'text-purple-400'
};

export default function TransactionHistory({ currentUser }) {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      
      // Get transactions where user is buyer or seller
      const asBuyer = await base44.entities.Transaction.filter({ buyer_email: currentUser.email }, '-created_date', 50);
      const asSeller = await base44.entities.Transaction.filter({ seller_email: currentUser.email }, '-created_date', 50);
      
      // Merge and sort
      const all = [...asBuyer, ...asSeller];
      all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      
      // Remove duplicates
      const seen = new Set();
      return all.filter(t => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
    },
    enabled: !!currentUser?.email
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <Clock className="w-12 h-12 text-gray-600 mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">No Transactions Yet</h3>
        <p className="text-gray-400 text-sm">Your purchase and sale history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
        Transaction History
      </h3>
      
      {transactions.map((tx) => {
        const isSale = tx.seller_email === currentUser?.email && tx.transaction_type !== 'purchase';
        const effectiveType = isSale ? 'sale' : tx.transaction_type;
        const Icon = TRANSACTION_ICONS[effectiveType] || Package;
        const colorClass = TRANSACTION_COLORS[effectiveType] || 'text-gray-400';
        const isPositive = effectiveType === 'sale' || effectiveType === 'reward' || effectiveType === 'refund' || effectiveType === 'topup';

        return (
          <Card key={tx.id} className="bg-gray-900/80 border-gray-700/50 p-3">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate">
                    {tx.asset_snapshot?.title || 'Transaction'}
                  </h4>
                  <Badge className="text-[10px] bg-gray-700 text-gray-300 capitalize">
                    {effectiveType}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">
                    {moment(tx.created_date).fromNow()}
                  </span>
                  {tx.status !== 'completed' && (
                    <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400">
                      {tx.status}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className={`text-right ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                <div className="flex items-center gap-1 font-bold">
                  <Coins className="w-4 h-4" />
                  <span>{isPositive ? '+' : '-'}{tx.amount}</span>
                </div>
              </div>
            </div>

            {/* Asset preview if available */}
            {tx.asset_snapshot?.thumbnail_url && (
              <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden">
                  <img 
                    src={tx.asset_snapshot.thumbnail_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-gray-400">
                  <p>{tx.asset_snapshot.asset_type} • {tx.asset_snapshot.category}</p>
                  <p className="capitalize">{tx.asset_snapshot.rarity}</p>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}