
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import PlacesAutocompleteInput from "@/components/ui/places-autocomplete-input";
import { PlacePrediction } from "@/hooks/useGooglePlaces";

interface ExploreSearchBarProps {
  onFilterClick: () => void;
  onPlaceSelect?: (place: PlacePrediction) => void;
  onSearchChange?: (value: string) => void;
}

const ExploreSearchBar = ({ onFilterClick, onPlaceSelect, onSearchChange }: ExploreSearchBarProps) => {
  const { t } = useLanguage();
  
  const handlePlaceSelect = (place: PlacePrediction) => {
    console.log('Selected place:', place);
    onPlaceSelect?.(place);
  };

  const handleSearchChange = (value: string) => {
    console.log('Search changed:', value);
    onSearchChange?.(value);
  };

  return (
    <div className="relative">
      <PlacesAutocompleteInput
        placeholder={t("explore.searchPlaceholder")}
        onPlaceSelect={handlePlaceSelect}
        onInputChange={handleSearchChange}
        className="pr-16"
      />
      <Button 
        size="sm" 
        className="absolute right-2 top-2 bg-gradient-to-r from-purple-600 to-orange-500"
        onClick={onFilterClick}
      >
        <Filter size={16} />
      </Button>
    </div>
  );
};

export default ExploreSearchBar;
