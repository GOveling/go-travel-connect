
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExploreCategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onCategoryClick: (category: string) => void;
}

const ExploreCategoryTabs = ({ categories, selectedCategory, onCategoryClick }: ExploreCategoryTabsProps) => {
  const { t } = useLanguage();
  
  const getTranslatedCategory = (category: string) => {
    const categoryKey = category.toLowerCase().replace(' ', '');
    return t(`explore.categories.${categoryKey}`) || category;
  };
  
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryClick(category)}
          className={`whitespace-nowrap ${
            selectedCategory === category
              ? "bg-gradient-to-r from-purple-600 to-orange-500"
              : "border-gray-300"
          }`}
        >
          {getTranslatedCategory(category)}
        </Button>
      ))}
    </div>
  );
};

export default ExploreCategoryTabs;
