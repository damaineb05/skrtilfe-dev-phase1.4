import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Trash2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DraftsList({ drafts, onDraftsChange, onEditDraft }) {
  const handleDeleteDraft = async (draftId) => {
    try {
      const { NFTDraft } = await import('@/entities/NFTDraft');
      await NFTDraft.delete(draftId);
      if (onDraftsChange) {
        onDraftsChange();
      }
    } catch (error) {
      console.warn('Failed to delete draft:', error);
      // Show user-friendly error or continue silently
    }
  };

  if (!drafts || drafts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Drafts Yet</h3>
        <p className="text-gray-500">
          Create your first NFT draft using the Create tab.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drafts.map((draft, index) => (
        <motion.div
          key={draft.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader className="p-4">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
                {draft.asset_url ? (
                  <>
                    {draft.asset_type === 'image' ? (
                      <img 
                        src={draft.asset_url} 
                        alt={draft.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <FileText className="w-8 h-8 mb-2" />
                        <span className="text-xs uppercase font-semibold">{draft.asset_type}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                
                <div className="absolute top-2 right-2">
                  <Badge 
                    variant={draft.status === 'minted' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {draft.status || 'draft'}
                  </Badge>
                </div>
              </div>
              
              <CardTitle className="text-lg font-semibold truncate">
                {draft.title || 'Untitled'}
              </CardTitle>
              
              {draft.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {draft.description}
                </p>
              )}
              
              {draft.price_eth && (
                <p className="text-sm font-medium text-green-600">
                  {draft.price_eth} ETH
                </p>
              )}
            </CardHeader>
            
            <CardContent className="p-4 pt-0">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onEditDraft(draft)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                
                {draft.status === 'minted' && draft.mint_tx_hash && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://etherscan.io/tx/${draft.mint_tx_hash}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteDraft(draft.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}