
import { Card } from "@/components/ui/card";
import { ArrowRightLeft, Plane, Route } from "lucide-react";

interface ManualFlightTypeSelectorProps {
  flightType: 'round-trip' | 'one-way' | 'multi-city';
  onTypeChange: (type: 'round-trip' | 'one-way' | 'multi-city') => void;
}

const ManualFlightTypeSelector = ({ flightType, onTypeChange }: ManualFlightTypeSelectorProps) => {
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
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">Tipo de Vuelo Manual</h3>
      <div className="space-y-2">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = flightType === option.id;
          
          return (
            <Card
              key={option.id}
              className={`p-4 cursor-pointer transition-all border-2 ${
                isSelected 
                  ? 'border-orange-500 bg-orange-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => onTypeChange(option.id as any)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-orange-500 text-white' : option.color
                }`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className={`font-medium text-sm ${
                    isSelected ? 'text-orange-700' : 'text-gray-900'
                  }`}>
                    {option.title}
                  </div>
                  <div className={`text-xs ${
                    isSelected ? 'text-orange-600' : 'text-gray-500'
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

export default ManualFlightTypeSelector;
