
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Plane } from 'lucide-react';
import { airportMatcher } from '@/utils/airportMatcher';

interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

interface AirportAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const AirportAutocomplete: React.FC<AirportAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Buscar ciudad o aeropuerto...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{ city: string; airports: Airport[] }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const results = airportMatcher.getSuggestions(value, 8);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
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

  const handleSelect = (city: string, airport?: Airport) => {
    const displayValue = airport ? `${airport.city}, ${airport.country}` : city;
    onChange(displayValue);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

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
                  handleSelect(suggestion.city, airport);
                  return;
                }
                currentIndex++;
              }
            } else {
              if (currentIndex === selectedIndex) {
                handleSelect(suggestion.city, suggestion.airports[0]);
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

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, sugIndex) => (
            <div key={suggestion.city}>
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
                        globalIndex === selectedIndex ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelect(suggestion.city, airport)}
                    >
                      <div className="flex items-center space-x-3">
                        <Plane className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {formatCityName(airport.city)} ({airport.iata})
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
                    ) === selectedIndex ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelect(suggestion.city, suggestion.airports[0])}
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {formatCityName(suggestion.airports[0].city)} ({suggestion.airports[0].iata})
                      </div>
                      <div className="text-sm text-gray-500">
                        {suggestion.airports[0].country}
                      </div>
                    </div>
                  </div>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete;
