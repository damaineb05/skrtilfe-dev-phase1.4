import React, { useState } from 'react';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RPMAssetBrowser({ onEquip, currentAvatar }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md">
        <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          RPM Asset Store - Coming Soon
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          The Ready Player Me asset store integration requires a backend proxy server. 
          For Base44 apps, this feature will be available in a future update.
        </p>
        <div className="bg-white rounded-lg p-4 text-left text-xs text-gray-700 space-y-2">
          <p className="font-semibold">Current Workarounds:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Upload custom .glb wearables</li>
            <li>Use RPM Creator to customize avatars</li>
            <li>Import assets from external sources</li>
          </ul>
        </div>
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => window.open('https://readyplayer.me/asset-store', '_blank')}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Visit RPM Asset Store
        </Button>
      </div>
    </div>
  );
}