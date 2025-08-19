import React from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'All', name: 'All', icon: '🌐' },
  { id: 'DeFi', name: 'DeFi', icon: '💰' },
  { id: 'Social', name: 'Social', icon: '👥' },
  { id: 'Games', name: 'Games', icon: '🎮' },
  { id: 'NFTs', name: 'NFTs', icon: '🖼️' },
  { id: 'Tools', name: 'Tools', icon: '🛠️' },
  { id: 'Infrastructure', name: 'Infrastructure', icon: '⚙️' }
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === category.id
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <span>{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
