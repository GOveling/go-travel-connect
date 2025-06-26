
import { Button } from "@/components/ui/button";

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  const categories = [
    { id: 'all', label: 'All', icon: '🏆' },
    { id: 'global-exploration', label: 'Global', icon: '🌍' },
    { id: 'local-discoveries', label: 'Culture', icon: '🏛️' },
    { id: 'food-nightlife', label: 'Food', icon: '🍽️' },
    { id: 'family-experience', label: 'Nature', icon: '🌲' },
    { id: 'contributions', label: 'Reviews', icon: '⭐' },
    { id: 'special', label: 'Special', icon: '🌟' }
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className={`flex items-center space-x-2 ${
            activeCategory === category.id 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'hover:bg-purple-50'
          }`}
        >
          <span>{category.icon}</span>
          <span>{category.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default CategoryTabs;
