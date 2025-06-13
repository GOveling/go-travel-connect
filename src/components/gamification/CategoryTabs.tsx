
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🌟' },
  { id: 'global-exploration', label: 'Global', icon: '🌍' },
  { id: 'local-discoveries', label: 'Culture', icon: '🏙️' },
  { id: 'food-nightlife', label: 'Food', icon: '🍽️' },
  { id: 'family-experience', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'contributions', label: 'Community', icon: '📝' },
  { id: 'special', label: 'Special', icon: '🏅' },
  { id: 'publications', label: 'Content', icon: '✍️' },
  { id: 'social', label: 'Social', icon: '🤝' },
];

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <Tabs value={activeCategory} onValueChange={onCategoryChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-1 h-auto p-1">
        {CATEGORIES.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="flex flex-col items-center space-y-1 px-2 py-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <span className="text-sm">{category.icon}</span>
            <span className="hidden sm:inline">{category.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default CategoryTabs;
