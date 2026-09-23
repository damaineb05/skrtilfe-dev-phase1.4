import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const QUICK_SKIN_TONES = [
  { name: 'Light', hex: '#FBD5C5' },
  { name: 'Medium', hex: '#E5AC8F' },
  { name: 'Tan', hex: '#BA7D5F' },
  { name: 'Dark', hex: '#8B5A3C' },
  { name: 'Deep', hex: '#2D1B10' }
];

const QUICK_HAIR_COLORS = [
  { name: 'Blonde', hex: '#F5DEB3' },
  { name: 'Brown', hex: '#6F4E37' },
  { name: 'Black', hex: '#1C0F0A' },
  { name: 'Red', hex: '#C83C28' },
  { name: 'Blue', hex: '#4169E1' }
];

const QUICK_EYE_COLORS = [
  { name: 'Blue', hex: '#4A90E2' },
  { name: 'Green', hex: '#50C878' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Gray', hex: '#708090' }
];

export default function QuickCustomizationBar({ 
  customization, 
  onCustomizationChange,
  onOpenFullPanel 
}) {
  const handleColorChange = (type, color) => {
    onCustomizationChange({ [type]: color });
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-2">
      {/* Skin Tone Quick Picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="rounded-full px-3 hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-5 h-5 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: customization.skinTone }}
              />
              <span className="text-xs font-medium">Skin</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Skin Tone</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="grid grid-cols-5 gap-1 p-2">
            {QUICK_SKIN_TONES.map((tone) => (
              <button
                key={tone.name}
                onClick={() => handleColorChange('skinTone', tone.hex)}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  customization.skinTone === tone.hex 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: tone.hex }}
                title={tone.name}
              />
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hair Color Quick Picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="rounded-full px-3 hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-5 h-5 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: customization.hairColor }}
              />
              <span className="text-xs font-medium">Hair</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Hair Color</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="grid grid-cols-5 gap-1 p-2">
            {QUICK_HAIR_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange('hairColor', color.hex)}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  customization.hairColor === color.hex 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Eye Color Quick Picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="rounded-full px-3 hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-5 h-5 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: customization.eyeColor }}
              />
              <span className="text-xs font-medium">Eyes</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Eye Color</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="grid grid-cols-4 gap-1 p-2">
            {QUICK_EYE_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange('eyeColor', color.hex)}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  customization.eyeColor === color.hex 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Full Panel Button */}
      <Button
        size="sm"
        onClick={onOpenFullPanel}
        className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Full Editor
      </Button>
    </div>
  );
}