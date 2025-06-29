import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";
import { Landmark, Building2, TreePine, Waves, Mountain } from "lucide-react";

interface ExploreFiltersProps {
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onClearFilters: () => void;
}

const mainCategories = [
  { id: 'restaurant', label: 'Restaurants', icon: '🍴', color: 'bg-red-100 text-red-800' },
  { id: 'hotel', label: 'Hotels', icon: '🏨', color: 'bg-blue-100 text-blue-800' },
  { id: 'attraction', label: 'Attractions', icon: '🎭', color: 'bg-purple-100 text-purple-800' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: 'bg-green-100 text-green-800' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎵', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'health', label: 'Health', icon: '🏥', color: 'bg-pink-100 text-pink-800' },
  { id: 'education', label: 'Education', icon: '📚', color: 'bg-cyan-100 text-cyan-800' }
];

const specificCategories = [
  { id: 'landmark', label: 'Landmarks', icon: <Landmark size={18} />, color: 'bg-amber-100 text-amber-800' },
  { id: 'museum', label: 'Museums', icon: <Building2 size={18} />, color: 'bg-slate-100 text-slate-800' },
  { id: 'park', label: 'Parks', icon: <TreePine size={18} />, color: 'bg-emerald-100 text-emerald-800' },
  { id: 'beach', label: 'Beaches', icon: <Waves size={18} />, color: 'bg-sky-100 text-sky-800' },
  { id: 'lake', label: 'Lakes', icon: <Mountain size={18} />, color: 'bg-teal-100 text-teal-800' }
];

const ExploreFilters = ({ selectedCategories, onCategoryToggle, onClearFilters }: ExploreFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">Search Categories</h3>
        </div>
        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={16} className="mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Categories Grid - Two Columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Main Categories Column */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600 mb-2">General</h4>
          <div className="grid grid-cols-1 gap-2">
            {mainCategories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => onCategoryToggle(category.id)}
                  className={`h-12 flex items-center justify-start gap-2 transition-all duration-200 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-purple-600 to-orange-500 border-0 shadow-lg' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <span className="text-base">{category.icon}</span>
                  <span className="text-xs font-medium">{category.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Specific Categories Column */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Specific Places</h4>
          <div className="grid grid-cols-1 gap-2">
            {specificCategories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => onCategoryToggle(category.id)}
                  className={`h-12 flex items-center justify-start gap-2 transition-all duration-200 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-purple-600 to-orange-500 border-0 shadow-lg text-white' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : 'text-gray-600'}>
                    {category.icon}
                  </span>
                  <span className="text-xs font-medium">{category.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Categories Summary */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((categoryId) => {
            const category = [...mainCategories, ...specificCategories].find(c => c.id === categoryId);
            return category ? (
              <Badge
                key={categoryId}
                variant="secondary"
                className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1"
              >
                {typeof category.icon === 'string' ? category.icon : category.icon}
                {category.label}
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default ExploreFilters;
