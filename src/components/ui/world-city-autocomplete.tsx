import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Plane } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WorldCity {
  city: string;
  country: string;
  country_code: string;
  airports: {
    iata: string;
    name: string;
    latitude?: number;
    longitude?: number;
  }[];
}

interface WorldCityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const WorldCityAutocomplete: React.FC<WorldCityAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Buscar ciudad o aeropuerto...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<WorldCity[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('world-cities', {
        body: {
          action: 'search',
          query: query,
          limit: 10
        }
      });

      if (error) {
        console.error('Error searching cities:', error);
        setSuggestions([]);
      } else {
        setSuggestions(data?.suggestions || []);
        setIsOpen((data?.suggestions || []).length > 0);
      }
    } catch (error) {
      console.error('Network error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(value);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: string, country: string, airport?: { iata: string; name: string }) => {
    const displayValue = airport 
      ? `${city}, ${country} (${airport.iata})`
      : `${city}, ${country}`;
    onChange(displayValue);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    const totalItems = suggestions.reduce((total, suggestion) => 
      total + (suggestion.airports.length > 1 ? suggestion.airports.length : 1), 0
    );

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          let currentIndex = 0;
          for (const suggestion of suggestions) {
            if (suggestion.airports.length > 1) {
              for (const airport of suggestion.airports) {
                if (currentIndex === selectedIndex) {
                  handleSelect(suggestion.city, suggestion.country, airport);
                  return;
                }
                currentIndex++;
              }
            } else {
              if (currentIndex === selectedIndex) {
                handleSelect(suggestion.city, suggestion.country, suggestion.airports[0]);
                return;
              }
              currentIndex++;
            }
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const formatCityName = (city: string) => {
    return city.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10"
        />
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            <span className="text-sm">Buscando ciudades...</span>
          </div>
        </div>
      )}

      {isOpen && !isLoading && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, sugIndex) => (
            <div key={`${suggestion.city}-${suggestion.country}`}>
              {suggestion.airports.length > 1 ? (
                // Multiple airports - show each one
                suggestion.airports.map((airport, airIndex) => {
                  const globalIndex = suggestions.slice(0, sugIndex).reduce((total, prev) => 
                    total + (prev.airports.length > 1 ? prev.airports.length : 1), 0
                  ) + airIndex;
                  
                  return (
                    <Button
                      key={airport.iata}
                      variant="ghost"
                      className={`w-full justify-start px-3 py-2 h-auto text-left ${
                        globalIndex === selectedIndex ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelect(suggestion.city, suggestion.country, airport)}
                    >
                      <div className="flex items-center space-x-3">
                        <Plane className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {formatCityName(suggestion.city)}, {suggestion.country} ({airport.iata})
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {airport.name}
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })
              ) : (
                // Single airport
                <Button
                  variant="ghost"
                  className={`w-full justify-start px-3 py-2 h-auto text-left ${
                    suggestions.slice(0, sugIndex).reduce((total, prev) => 
                      total + (prev.airports.length > 1 ? prev.airports.length : 1), 0
                    ) === selectedIndex ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelect(suggestion.city, suggestion.country, suggestion.airports[0])}
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {formatCityName(suggestion.city)}, {suggestion.country} ({suggestion.airports[0].iata})
                      </div>
                      <div className="text-sm text-gray-500">
                        {suggestion.airports[0].name}
                      </div>
                    </div>
                  </div>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && !isLoading && suggestions.length === 0 && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <div className="text-center text-gray-500 text-sm">
            No se encontraron ciudades para "{value}"
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldCityAutocomplete;