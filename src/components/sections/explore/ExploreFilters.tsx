import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Filter,
  Landmark,
  Mountain,
  TreePine,
  Waves,
  X,
} from "lucide-react";
import { useState } from "react";

interface ExploreFiltersProps {
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onClearFilters: () => void;
}

const mainCategories = [
  {
    id: "restaurant",
    label: "Restaurants",
    icon: "🍴",
    color: "bg-red-100 text-red-800",
  },
  {
    id: "hotel",
    label: "Hotels",
    icon: "🏨",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "attraction",
    label: "Attractions",
    icon: "🎭",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: "🛍️",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: "🎵",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "transport",
    label: "Transport",
    icon: "🚗",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    id: "health",
    label: "Health",
    icon: "🏥",
    color: "bg-pink-100 text-pink-800",
  },
  {
    id: "education",
    label: "Education",
    icon: "📚",
    color: "bg-cyan-100 text-cyan-800",
  },
];

const specificCategories = [
  {
    id: "landmark",
    label: "Landmarks",
    icon: <Landmark size={18} />,
    color: "bg-amber-100 text-amber-800",
  },
  {
    id: "museum",
    label: "Museums",
    icon: <Building2 size={18} />,
    color: "bg-slate-100 text-slate-800",
  },
  {
    id: "park",
    label: "Parks",
    icon: <TreePine size={18} />,
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "beach",
    label: "Beaches",
    icon: <Waves size={18} />,
    color: "bg-sky-100 text-sky-800",
  },
  {
    id: "lake",
    label: "Lakes",
    icon: <Mountain size={18} />,
    color: "bg-teal-100 text-teal-800",
  },
];

const ExploreFilters = ({
  selectedCategories,
  onCategoryToggle,
  onClearFilters,
}: ExploreFiltersProps) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const getMainCategories = () => [
    {
      id: "restaurant",
      label: t("explore.categories.restaurants"),
      icon: "🍴",
      color: "bg-red-100 text-red-800",
    },
    {
      id: "hotel",
      label: t("explore.categories.hotels"),
      icon: "🏨",
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "attraction",
      label: t("explore.categories.attractions"),
      icon: "🎭",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "shopping",
      label: t("explore.categories.shopping"),
      icon: "🛍️",
      color: "bg-green-100 text-green-800",
    },
    {
      id: "entertainment",
      label: t("explore.categories.nightlife"),
      icon: "🎵",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      id: "activities",
      label: t("explore.categories.activities"),
      icon: "⚽",
      color: "bg-indigo-100 text-indigo-800",
    },
  ];

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-4">
      {/* Collapsible Filter Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={toggleExpanded}
          className="flex items-center gap-3 pl-3 pr-3 py-3 border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-xl flex-1 justify-start transition-all duration-200 shadow-sm hover:shadow-md h-12"
        >
          <Filter size={20} className="text-purple-600" />
          <h3 className="font-semibold text-gray-800 text-base pl-1">
            {t("explore.searchCategories")}
          </h3>
          {isExpanded ? (
            <ChevronUp size={20} className="text-purple-600 ml-auto" />
          ) : (
            <ChevronDown size={20} className="text-purple-600 ml-auto" />
          )}
          {selectedCategories.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 bg-purple-100 text-purple-800"
            >
              {selectedCategories.length}
            </Badge>
          )}
        </Button>

        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700 ml-2"
          >
            <X size={16} className="mr-1" />
            <span className="hidden sm:inline">Clear All</span>
          </Button>
        )}
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="space-y-4 animate-fade-in">
          {/* Categories Grid - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Categories Column */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                General
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {getMainCategories().map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <Button
                      key={category.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => onCategoryToggle(category.id)}
                      className={`h-12 flex items-center justify-start gap-2 transition-all duration-200 ${
                        isSelected
                          ? "bg-gradient-to-r from-purple-600 to-orange-500 border-0 shadow-lg"
                          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                    >
                      <span className="text-base">{category.icon}</span>
                      <span className="text-xs font-medium">
                        {category.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Specific Categories Column */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Specific Places
              </h4>
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
                          ? "bg-gradient-to-r from-purple-600 to-orange-500 border-0 shadow-lg text-white"
                          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                    >
                      <span
                        className={isSelected ? "text-white" : "text-gray-600"}
                      >
                        {category.icon}
                      </span>
                      <span className="text-xs font-medium">
                        {category.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Categories Summary - Always visible when there are selections */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((categoryId) => {
            const category = [...mainCategories, ...specificCategories].find(
              (c) => c.id === categoryId
            );
            return category ? (
              <Badge
                key={categoryId}
                variant="secondary"
                className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1"
              >
                {typeof category.icon === "string"
                  ? category.icon
                  : category.icon}
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
