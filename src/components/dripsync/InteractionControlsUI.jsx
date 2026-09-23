import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Package, Zap, Eye, Target, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

function getInteractionIcon(type) {
  if (type === 'pickup') return '📦';
  if (type === 'toggle') return '⚡';
  if (type === 'sit') return '🪑';
  if (type === 'button') return '🎯';
  return '✋';
}

export default function InteractionControlsUI({ 
  nearestInteractable, 
  heldObjectLeft, 
  heldObjectRight,
  isMobile 
}) {
  const hasHeldObject = heldObjectLeft || heldObjectRight;

  return (
    <>
      {/* Nearest Interactable Prompt */}
      <AnimatePresence>
        {nearestInteractable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30"
          >
            <div className="bg-black/95 backdrop-blur-2xl border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(0,255,255,0.6)] rounded-2xl px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                  {nearestInteractable.type === 'pickup' && <Package className="w-5 h-5 text-cyan-400" />}
                  {nearestInteractable.type === 'toggle' && <Zap className="w-5 h-5 text-cyan-400" />}
                  {nearestInteractable.type === 'button' && <Target className="w-5 h-5 text-cyan-400" />}
                  {nearestInteractable.type === 'sit' && <span className="text-cyan-400">🪑</span>}
                  {!['pickup', 'toggle', 'button', 'sit'].includes(nearestInteractable.type) && <Hand className="w-5 h-5 text-cyan-400" />}
                </div>
                
                <div>
                  <p className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                    {nearestInteractable.name || 'Object'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Press <kbd className="px-2 py-0.5 bg-cyan-500/20 rounded border border-cyan-500/40 text-cyan-400 font-bold text-[10px]">
                      {isMobile ? 'TAP' : 'E'}
                    </kbd> to{' '}
                    {nearestInteractable.type === 'pickup' ? 'grab' :
                     nearestInteractable.type === 'toggle' ? 'toggle' :
                     nearestInteractable.type === 'sit' ? 'sit' :
                     nearestInteractable.type === 'button' ? 'press' :
                     'interact'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Held Object Indicator */}
      <AnimatePresence>
        {hasHeldObject && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-6 right-6 z-30"
          >
            <div className="bg-black/95 backdrop-blur-2xl border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-purple-400" />
                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  HOLDING
                </p>
              </div>
              
              {heldObjectRight && (
                <div className="mb-2">
                  <p className="text-xs text-white font-semibold">
                    {heldObjectRight.userData?.objectName || 'Object'}
                  </p>
                  <Badge className="text-[9px] bg-purple-500/20 text-purple-400 border-purple-500/30 mt-1">
                    Right Hand
                  </Badge>
                </div>
              )}
              
              {heldObjectLeft && (
                <div className="mb-2">
                  <p className="text-xs text-white font-semibold">
                    {heldObjectLeft.userData?.objectName || 'Object'}
                  </p>
                  <Badge className="text-[9px] bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mt-1">
                    Left Hand
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-purple-500/20">
                <div className="text-center">
                  <kbd className="px-2 py-1 bg-gray-900 rounded border border-purple-500/40 text-purple-400 font-bold text-[10px] block">
                    {isMobile ? '🗑️' : 'Q'}
                  </kbd>
                  <p className="text-[9px] text-gray-500 mt-1">Drop</p>
                </div>
                <div className="text-center">
                  <kbd className="px-2 py-1 bg-gray-900 rounded border border-purple-500/40 text-purple-400 font-bold text-[10px] block">
                    {isMobile ? '🚀' : 'F'}
                  </kbd>
                  <p className="text-[9px] text-gray-500 mt-1">Throw</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Interaction Button */}
      {isMobile && nearestInteractable && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="fixed bottom-32 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold shadow-[0_0_30px_rgba(0,255,255,0.6)] z-40 flex items-center justify-center text-2xl"
          onClick={() => {
            // Trigger interaction - would need to connect to InteractionManager
            console.log('Mobile interaction tap');
          }}
        >
          {getInteractionIcon(nearestInteractable.type)}
        </motion.button>
      )}
    </>
  );
}

function ObjectPropertiesEditor({ object, onUpdate, onRemove }) {
  return (
    <div className="space-y-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
          Object Properties
        </h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="h-6 px-2 text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Transform controls */}
      <div>
        <Label className="text-xs text-gray-400">Position</Label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {['X', 'Y', 'Z'].map((axis, idx) => (
            <Input
              key={axis}
              type="number"
              step="0.1"
              value={object.position[idx].toFixed(2)}
              onChange={(e) => {
                const newPos = [...object.position];
                newPos[idx] = parseFloat(e.target.value) || 0;
                onUpdate({ position: newPos });
              }}
              className="h-7 text-xs bg-gray-800"
            />
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-400">Scale: {object.scale.toFixed(2)}x</Label>
        <Slider
          value={[object.scale]}
          onValueChange={([value]) => onUpdate({ scale: value })}
          min={0.1}
          max={5}
          step={0.1}
          className="mt-2"
        />
      </div>
    </div>
  );
}

export { ObjectPropertiesEditor };