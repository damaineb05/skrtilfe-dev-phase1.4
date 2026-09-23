import React from 'react';
import { Palette } from 'lucide-react';

export default function NFTUploader({ user }) {
  return (
    <div className="ledger-card p-4 rounded-xl">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 ledger-accent" />
        <h3 className="text-base font-semibold ledger-text-primary">Creator Studio</h3>
      </div>
      <p className="text-xs ledger-text-muted mt-1">Studio coming soon.</p>
    </div>
  );
}