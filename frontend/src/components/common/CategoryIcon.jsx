import React from 'react';
import { Droplet, Zap, Wifi, Sparkles, Armchair, HelpCircle } from 'lucide-react';

export const CategoryIcon = ({ category, size = 18, color }) => {
  const c = (category || 'other').toLowerCase();

  switch (c) {
    case 'water':
      return <Droplet size={size} color={color || '#38bdf8'} />;
    case 'electricity':
      return <Zap size={size} color={color || '#fbbf24'} />;
    case 'wifi':
      return <Wifi size={size} color={color || '#a855f7'} />;
    case 'cleanliness':
      return <Sparkles size={size} color={color || '#34d399'} />;
    case 'furniture':
      return <Armchair size={size} color={color || '#fb923c'} />;
    default:
      return <HelpCircle size={size} color={color || '#94a3b8'} />;
  }
};
