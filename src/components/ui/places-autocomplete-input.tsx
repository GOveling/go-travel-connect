
import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGooglePlaces, PlacePrediction } from "@/hooks/useGooglePlaces";
import { cn } from "@/lib/utils";

interface PlacesAutocompleteInputProps {
  placeholder?: string;
  onPlaceSelect?: (place: PlacePrediction) => void;
  onInputChange?: (value: string) => void;
  className?: string;
  value?: string;
}

const PlacesAutocompleteInput = ({ 
  placeholder = "Search places...", 
  onPlaceSelect,
  onInputChange,
  className,
  value: controlledValue
}: PlacesAutocompleteInputProps) => {
  const [inputValue, setInputValue] = useState(controlledValue || "");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { predictions, loading, searchPlaces, clearResults } = useGooglePlaces();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.trim()) {
        searchPlaces(inputValue);
        setShowResults(true);
      } else {
        clearResults();
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, searchPlaces, clearResults]);

  // Update controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInputValue(controlledValue);
    }
  }, [controlledValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    onInputChange?.(newValue);
  };

  const handlePlaceSelect = (place: PlacePrediction) => {
    setInputValue(place.description);
    setShowResults(false);
    clearResults();
    onPlaceSelect?.(place);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : predictions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < predictions.length) {
          handlePlaceSelect(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleBlur = () => {
    // Delay hiding results to allow click events on results
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => {
            if (predictions.length > 0) {
              setShowResults(true);
            }
          }}
          placeholder={placeholder}
          className={cn("pl-10 h-12 border-2 border-gray-200 focus:border-purple-500", className)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-3 text-gray-400 animate-spin" size={20} />
        )}
      </div>

      {showResults && predictions.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {predictions.map((place, index) => (
            <div
              key={place.place_id}
              className={cn(
                "flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0",
                selectedIndex === index && "bg-purple-50"
              )}
              onClick={() => handlePlaceSelect(place)}
            >
              <MapPin size={16} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {place.structured_formatting.main_text}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {place.structured_formatting.secondary_text}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacesAutocompleteInput;
