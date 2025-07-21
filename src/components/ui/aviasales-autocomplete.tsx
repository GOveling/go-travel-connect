
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Plane, Loader2 } from 'lucide-react';

interface AviasalesResult {
  type: 'city' | 'airport';
  code: string;
  name: string;
  city_name?: string;
  country_name: string;
  country_code: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  display_name: string;
}

interface AviasalesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  locale?: string;
}

const AviasalesAutocomplete: React.FC<AviasalesAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Buscar ciudad o aeropuerto...",
  className = "",
  locale = "es"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AviasalesResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 Buscando sugerencias para:', query);
      
      const response = await fetch(
        `https://suhttfxcurgurshlkcpz.supabase.co/functions/v1/aviasales-autocomplete?query=${encodeURIComponent(query)}&limit=8&locale=${locale}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        console.error('❌ Error en la respuesta de la API:', response.status);
        throw new Error(`API Error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📝 Respuesta de la API:', result);

      if (result.success && result.results && Array.isArray(result.results)) {
        setSuggestions(result.results);
        setIsOpen(result.results.length > 0);
        console.log('✅ Encontradas', result.results.length, 'sugerencias');
      } else {
        console.error('❌ Error en la estructura de respuesta:', result);
        setSuggestions([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('💥 Error de red:', error);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchSuggestions(value);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [value, locale]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: AviasalesResult) => {
    console.log('🎯 Seleccionando:', result.display_name);
    onChange(result.display_name);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? suggestions.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
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
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <Button
              key={`${suggestion.type}-${suggestion.code}`}
              variant="ghost"
              className={`w-full justify-start px-3 py-2 h-auto text-left ${
                index === selectedIndex ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelect(suggestion)}
            >
              <div className="flex items-center space-x-3">
                {suggestion.type === 'airport' ? (
                  <Plane className="h-4 w-4 text-gray-400" />
                ) : (
                  <MapPin className="h-4 w-4 text-gray-400" />
                )}
                <div>
                  <div className="font-medium">
                    {suggestion.display_name}
                  </div>
                  {suggestion.type === 'airport' && (
                    <div className="text-sm text-gray-500 truncate">
                      {suggestion.name}
                    </div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}

      {isOpen && !isLoading && suggestions.length === 0 && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <div className="text-center text-gray-500 text-sm">
            No se encontraron resultados para "{value}"
          </div>
        </div>
      )}
    </div>
  );
};

export default AviasalesAutocomplete;
