import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface BackgroundPreset {
  id: string;
  name: string;
  category: 'gradient' | 'solid' | 'pattern';
  value: string;
  preview: string;
  isDark?: boolean;
}

// World-class curated background presets
export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  // Premium Gradients - Light
  {
    id: 'aurora-light',
    name: 'Aurora',
    category: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    category: 'gradient',
    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    category: 'gradient',
    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    category: 'gradient',
    value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    preview: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    id: 'peach-cream',
    name: 'Peach Cream',
    category: 'gradient',
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    category: 'gradient',
    value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    preview: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'gradient',
    value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    preview: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  },
  {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    category: 'gradient',
    value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    preview: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  },
  
  // Premium Gradients - Dark
  {
    id: 'midnight-city',
    name: 'Midnight City',
    category: 'gradient',
    value: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    preview: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    isDark: true,
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    category: 'gradient',
    value: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
    preview: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
    isDark: true,
  },
  {
    id: 'purple-haze',
    name: 'Purple Haze',
    category: 'gradient',
    value: 'linear-gradient(135deg, #360033 0%, #0b8793 100%)',
    preview: 'linear-gradient(135deg, #360033 0%, #0b8793 100%)',
    isDark: true,
  },
  {
    id: 'dark-ocean',
    name: 'Dark Ocean',
    category: 'gradient',
    value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    preview: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    isDark: true,
  },
  
  // Sophisticated Solids
  {
    id: 'pure-white',
    name: 'Pure White',
    category: 'solid',
    value: '#ffffff',
    preview: '#ffffff',
  },
  {
    id: 'soft-cream',
    name: 'Soft Cream',
    category: 'solid',
    value: '#faf9f6',
    preview: '#faf9f6',
  },
  {
    id: 'warm-beige',
    name: 'Warm Beige',
    category: 'solid',
    value: '#f5f5dc',
    preview: '#f5f5dc',
  },
  {
    id: 'slate-gray',
    name: 'Slate Gray',
    category: 'solid',
    value: '#708090',
    preview: '#708090',
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    category: 'solid',
    value: '#36454f',
    preview: '#36454f',
    isDark: true,
  },
  {
    id: 'midnight-black',
    name: 'Midnight Black',
    category: 'solid',
    value: '#0a0a0a',
    preview: '#0a0a0a',
    isDark: true,
  },
  
  // Refined Patterns (CSS-based)
  {
    id: 'subtle-dots',
    name: 'Subtle Dots',
    category: 'pattern',
    value: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
    preview: '#fafafa',
  },
  {
    id: 'elegant-grid',
    name: 'Elegant Grid',
    category: 'pattern',
    value: 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
    preview: '#ffffff',
  },
  {
    id: 'soft-waves',
    name: 'Soft Waves',
    category: 'pattern',
    value: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  
  // Business Professional Patterns with Icons
  {
    id: 'briefcase-pattern',
    name: 'Briefcase',
    category: 'pattern',
    value: `linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)`,
    preview: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  },
  {
    id: 'network-pattern',
    name: 'Network',
    category: 'pattern',
    value: `radial-gradient(circle, #667eea 10%, transparent 10%), radial-gradient(circle, #764ba2 10%, transparent 10%), linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)`,
    preview: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
  },
  {
    id: 'dots-large',
    name: 'Bold Dots',
    category: 'pattern',
    value: `radial-gradient(circle, rgba(0,0,0,0.15) 2px, transparent 2px)`,
    preview: '#ffffff',
  },
  {
    id: 'stripes-diagonal',
    name: 'Diagonal Stripes',
    category: 'pattern',
    value: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.08) 20px, rgba(0,0,0,0.08) 40px), linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)`,
    preview: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  },
  {
    id: 'checkerboard',
    name: 'Checkerboard',
    category: 'pattern',
    value: `repeating-conic-gradient(rgba(0,0,0,0.06) 0% 25%, transparent 0% 50%) 50% / 40px 40px, #ffffff`,
    preview: '#ffffff',
  },
  {
    id: 'cross-pattern',
    name: 'Cross Grid',
    category: 'pattern',
    value: `linear-gradient(rgba(0,0,0,0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.08) 2px, transparent 2px), linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
    preview: '#f8fafc',
  },
  {
    id: 'circles-pattern',
    name: 'Circles',
    category: 'pattern',
    value: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%), radial-gradient(circle at 25% 75%, rgba(251, 146, 60, 0.1) 0%, transparent 50%), #ffffff`,
    preview: '#ffffff',
  },
  {
    id: 'waves-pattern',
    name: 'Wave Lines',
    category: 'pattern',
    value: `repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(0,0,0,0.05) 50px, rgba(0,0,0,0.05) 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,0.05) 50px, rgba(0,0,0,0.05) 51px), linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)`,
    preview: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
  },
];

interface BackgroundPresetsProps {
  currentBackground?: string;
  onBackgroundSelect: (preset: BackgroundPreset) => void;
}

export const BackgroundPresets: React.FC<BackgroundPresetsProps> = ({
  currentBackground,
  onBackgroundSelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'gradient' | 'solid' | 'pattern'>('all');
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);

  const filteredPresets = selectedCategory === 'all' 
    ? BACKGROUND_PRESETS 
    : BACKGROUND_PRESETS.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-ink-900 mb-3 tracking-tight">Curated Backgrounds</h3>
        <p className="text-sm text-ink-600 leading-relaxed">
          Choose from our collection of premium, hand-crafted backgrounds
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {[
          { value: 'all', label: 'All', icon: '✨' },
          { value: 'gradient', label: 'Gradients', icon: '🎨' },
          { value: 'solid', label: 'Solids', icon: '⬛' },
          { value: 'pattern', label: 'Patterns', icon: '🔷' },
        ].map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value as any)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              selectedCategory === category.value
                ? 'bg-ink-900 text-white shadow-elevation-2'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onBackgroundSelect(preset)}
            onMouseEnter={() => setHoveredPreset(preset.id)}
            onMouseLeave={() => setHoveredPreset(null)}
            className={`group relative aspect-[4/3] rounded-xl overflow-hidden transition-all ${
              currentBackground === preset.value
                ? 'ring-4 ring-gold-500 shadow-elevation-3'
                : 'ring-1 ring-ink-200 hover:ring-2 hover:ring-ink-400 shadow-elevation-1 hover:shadow-elevation-2'
            }`}
          >
            {/* Preview */}
            <div
              className="absolute inset-0"
              style={{
                background: preset.preview,
                backgroundSize: preset.category === 'pattern' ? '20px 20px' : 'cover',
              }}
            />
            
            {/* Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity ${
              hoveredPreset === preset.id || currentBackground === preset.value ? 'opacity-100' : 'opacity-0'
            }`} />
            
            {/* Label */}
            <div className={`absolute bottom-0 left-0 right-0 p-3 transition-transform ${
              hoveredPreset === preset.id || currentBackground === preset.value ? 'translate-y-0' : 'translate-y-full'
            }`}>
              <p className="text-xs font-bold text-white drop-shadow-lg">
                {preset.name}
              </p>
            </div>
            
            {/* Selected Indicator */}
            {currentBackground === preset.value && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center shadow-elevation-2">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gold-50 border border-gold-100 rounded-xl">
        <p className="text-xs text-ink-700 leading-relaxed">
          <span className="font-bold text-ink-900">Pro Tip:</span> Backgrounds are optimized for both mobile and desktop viewing. 
          Choose darker backgrounds for a premium, sophisticated look.
        </p>
      </div>
    </div>
  );
};
