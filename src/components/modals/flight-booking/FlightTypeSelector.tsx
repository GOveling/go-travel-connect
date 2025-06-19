
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit3, Route } from "lucide-react";

interface FlightTypeSelectorProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city' | 'manual';
  onTypeChange: (type: 'round-trip' | 'one-way' | 'multi-city' | 'manual') => void;
}

const FlightTypeSelector = ({ tripType, onTypeChange }: FlightTypeSelectorProps) => {
  const options = [
    {
      id: 'autofill',
      title: 'Autofill',
      description: 'Desde mis viajes',
      icon: Route,
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    {
      id: 'manual',
      title: 'Manual',
      description: 'Configuración libre',
      icon: Edit3,
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 text-lg">Tipo de Vuelo</h3>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = (option.id === 'autofill' && tripType !== 'manual') || tripType === option.id;
          
          return (
            <Card
              key={option.id}
              className={`p-4 cursor-pointer transition-all border-2 ${
                isSelected 
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-orange-50 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-md hover:scale-102'
              }`}
              onClick={() => onTypeChange(option.id === 'autofill' ? 'round-trip' : option.id as any)}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white' : option.color
                }`}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className={`font-semibold text-sm ${
                    isSelected ? 'text-purple-700' : 'text-gray-900'
                  }`}>
                    {option.title}
                  </div>
                  <div className={`text-xs ${
                    isSelected ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {option.description}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FlightTypeSelector;
