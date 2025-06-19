
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plane, ArrowRightLeft, Route, Edit3 } from "lucide-react";

interface FlightTypeSelectorProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city' | 'manual';
  onTypeChange: (type: 'round-trip' | 'one-way' | 'multi-city' | 'manual') => void;
}

const FlightTypeSelector = ({ tripType, onTypeChange }: FlightTypeSelectorProps) => {
  const options = [
    {
      id: 'round-trip',
      title: 'Ida y Vuelta',
      description: 'Viaje redondo',
      icon: ArrowRightLeft,
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      id: 'one-way',
      title: 'Solo Ida',
      description: 'Un solo trayecto',
      icon: Plane,
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      id: 'multi-city',
      title: 'Multi-destino',
      description: 'Múltiples ciudades',
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
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">Tipo de Vuelo</h3>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = tripType === option.id;
          
          return (
            <Card
              key={option.id}
              className={`p-3 cursor-pointer transition-all border-2 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => onTypeChange(option.id as any)}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-blue-500 text-white' : option.color
                }`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className={`font-medium text-sm ${
                    isSelected ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    {option.title}
                  </div>
                  <div className={`text-xs ${
                    isSelected ? 'text-blue-600' : 'text-gray-500'
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
