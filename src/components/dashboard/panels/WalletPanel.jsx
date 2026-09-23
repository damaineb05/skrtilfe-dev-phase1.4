import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Wallet, Clock, User, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ACTIONS = [
  { label: 'View Transactions', icon: Clock },
  { label: 'Connect Wallet', icon: Wallet },
  { label: 'Settings', icon: User },
];

export default function WalletPanel() {
  return (
    <div className="p-6 space-y-4">
      <div className="rounded-xl p-6 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(37,99,235,0.12))' }}>
        <Wallet className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(6,182,212,0.8)' }} />
        <h3 className="text-2xl font-black text-white mb-1">$0.00</h3>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Available Balance</p>
      </div>

      <div className="space-y-2">
        {ACTIONS.map(action => (
          <Link key={action.label} to={createPageUrl('Wallet')}>
            <div className="p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <action.icon className="w-4 h-4" style={{ color: 'rgba(6,182,212,0.7)' }} />
              <span className="text-sm text-white">{action.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto" style={{ color: 'rgba(255,255,255,0.25)' }} />
            </div>
          </Link>
        ))}
      </div>

      <Link to={createPageUrl('Wallet')}>
        <Button className="w-full font-bold" style={{ background: '#06B6D4', color: '#0A0A0F' }}>
          <ExternalLink className="w-4 h-4 mr-2" /> Open Full Wallet
        </Button>
      </Link>
    </div>
  );
}