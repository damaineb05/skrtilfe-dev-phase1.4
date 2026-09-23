import React, { useState } from 'react';
import { Sparkles, Wand2, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

export default function AIStylistPanel({ 
  currentWearables = [], 
  onApplySuggestion,
  userStyle = 'casual'
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(userStyle);

  const styleOptions = [
    { id: 'casual', label: 'Casual', icon: '👕' },
    { id: 'streetwear', label: 'Streetwear', icon: '🧢' },
    { id: 'elegant', label: 'Elegant', icon: '👔' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: '🤖' },
    { id: 'sporty', label: 'Sporty', icon: '⚡' },
    { id: 'minimal', label: 'Minimal', icon: '⚪' }
  ];

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const prompt = `You are a fashion AI stylist for digital avatars. Generate 3 trendy outfit combinations for a ${selectedStyle} style avatar.
      
Current wearables equipped: ${currentWearables.map(w => w.name).join(', ') || 'none'}

For each outfit, suggest:
- Top piece (shirt, jacket, hoodie, etc.)
- Bottom piece (pants, shorts, skirt, etc.)
- Footwear
- 1-2 accessories
- Color scheme (3 colors)

Return ONLY valid JSON array of 3 outfit objects with this structure:
[{
  "name": "outfit name",
  "description": "why this works",
  "pieces": ["item1", "item2", "item3", "item4"],
  "colors": ["#hex1", "#hex2", "#hex3"],
  "vibe": "2-3 word vibe"
}]`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            outfits: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  pieces: { type: "array", items: { type: "string" } },
                  colors: { type: "array", items: { type: "string" } },
                  vibe: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.outfits || []);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      setSuggestions([
        {
          name: 'Urban Explorer',
          description: 'Perfect for city adventures with a modern edge',
          pieces: ['Black Bomber Jacket', 'White T-Shirt', 'Slim Fit Jeans', 'High-Top Sneakers'],
          colors: ['#000000', '#FFFFFF', '#4A90E2'],
          vibe: 'Modern & Bold'
        },
        {
          name: 'Tech Minimalist',
          description: 'Clean lines and functional style',
          pieces: ['Gray Hoodie', 'Black Cargo Pants', 'White Sneakers', 'Smart Watch'],
          colors: ['#808080', '#000000', '#FFFFFF'],
          vibe: 'Clean & Tech'
        },
        {
          name: 'Street Elite',
          description: 'Stand out with premium streetwear vibes',
          pieces: ['Oversized Tee', 'Designer Shorts', 'Limited Jordans', 'Chain Necklace'],
          colors: ['#FF6B6B', '#000000', '#FFD700'],
          vibe: 'Bold & Fresh'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-900/10 to-pink-900/10">
      <div className="p-4 border-b border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Wand2 className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="font-bold text-white text-sm">AI STYLIST</h3>
            <p className="text-xs text-gray-400">Get personalized outfit suggestions</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {styleOptions.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                selectedStyle === style.id
                  ? 'bg-purple-500/30 border border-purple-400 text-purple-300'
                  : 'bg-zinc-800/50 border border-zinc-700 text-gray-400 hover:bg-zinc-700/50'
              }`}
            >
              <span className="block mb-1">{style.icon}</span>
              {style.label}
            </button>
          ))}
        </div>

        <Button
          onClick={generateSuggestions}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold"
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Looks
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {suggestions.length === 0 ? (
          <div className="text-center py-12">
            <Wand2 className="w-12 h-12 text-purple-400/30 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Click Generate to get AI-powered outfit suggestions</p>
          </div>
        ) : (
          suggestions.map((outfit, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 hover:border-purple-400/40 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">{outfit.name}</h4>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                    {outfit.vibe}
                  </Badge>
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>

              <p className="text-xs text-gray-400 mb-3">{outfit.description}</p>

              <div className="space-y-2 mb-3">
                {outfit.pieces.map((piece, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span className="text-gray-300">{piece}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-3">
                {outfit.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-zinc-700"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              <Button
                onClick={() => onApplySuggestion(outfit)}
                variant="outline"
                size="sm"
                className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Apply Style
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}