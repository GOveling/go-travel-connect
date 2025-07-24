import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Clock, DollarSign, X } from "lucide-react";

interface ExploreFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  categories: string[];
  rating: number | null;
  priceRange: string[];
  location: string[];
  openNow: boolean;
}

const categories = [
  "All",
  "Restaurants",
  "Tourist Attractions",
  "Hotels",
  "Shopping",
  "Entertainment",
  "Museums",
  "Parks",
  "Bars",
  "Cafes",
];

const priceRanges = ["$", "$$", "$$$", "$$$$"];
const popularLocations = [
  "Downtown",
  "Historic District",
  "Waterfront",
  "Arts Quarter",
  "Business District",
];

const ExploreFilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}: ExploreFilterModalProps) => {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(currentFilters);

  const toggleCategory = (category: string) => {
    if (category === "All") {
      setTempFilters((prev) => ({ ...prev, categories: ["All"] }));
    } else {
      setTempFilters((prev) => {
        const newCategories = prev.categories.includes(category)
          ? prev.categories.filter((c) => c !== category)
          : [...prev.categories.filter((c) => c !== "All"), category];

        return {
          ...prev,
          categories: newCategories.length === 0 ? ["All"] : newCategories,
        };
      });
    }
  };

  const togglePriceRange = (price: string) => {
    setTempFilters((prev) => ({
      ...prev,
      priceRange: prev.priceRange.includes(price)
        ? prev.priceRange.filter((p) => p !== price)
        : [...prev.priceRange, price],
    }));
  };

  const toggleLocation = (location: string) => {
    setTempFilters((prev) => ({
      ...prev,
      location: prev.location.includes(location)
        ? prev.location.filter((l) => l !== location)
        : [...prev.location, location],
    }));
  };

  const setRating = (rating: number) => {
    setTempFilters((prev) => ({
      ...prev,
      rating: prev.rating === rating ? null : rating,
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      categories: ["All"],
      rating: null,
      priceRange: [],
      location: [],
      openNow: false,
    };
    setTempFilters(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (
      tempFilters.categories.length > 0 &&
      !tempFilters.categories.includes("All")
    )
      count++;
    if (tempFilters.rating) count++;
    if (tempFilters.priceRange.length > 0) count++;
    if (tempFilters.location.length > 0) count++;
    if (tempFilters.openNow) count++;
    return count;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle className="text-lg font-semibold">Filters</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X size={20} />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-4 pb-4 overflow-y-auto flex-1">
          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <MapPin size={16} />
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={
                    tempFilters.categories.includes(category)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Rating */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Star size={16} />
              Minimum Rating
            </h3>
            <div className="flex gap-2">
              {[3, 4, 5].map((rating) => (
                <Badge
                  key={rating}
                  variant={
                    tempFilters.rating === rating ? "default" : "outline"
                  }
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => setRating(rating)}
                >
                  {rating} <Star size={12} fill="currentColor" />
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <DollarSign size={16} />
              Price Range
            </h3>
            <div className="flex gap-2">
              {priceRanges.map((price) => (
                <Badge
                  key={price}
                  variant={
                    tempFilters.priceRange.includes(price)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => togglePriceRange(price)}
                >
                  {price}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Location */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <MapPin size={16} />
              Area
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularLocations.map((location) => (
                <Badge
                  key={location}
                  variant={
                    tempFilters.location.includes(location)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleLocation(location)}
                >
                  {location}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Open Now */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Clock size={16} />
              Availability
            </h3>
            <Badge
              variant={tempFilters.openNow ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                setTempFilters((prev) => ({ ...prev, openNow: !prev.openNow }))
              }
            >
              Open Now
            </Badge>
          </div>
        </div>

        <DrawerFooter className="px-4 pb-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500"
            >
              Apply Filters{" "}
              {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ExploreFilterModal;
