
import { Button } from "@/components/ui/button";
import { Plane, ArrowLeft } from "lucide-react";

interface FlightBookingHeaderProps {
  currentStep: 'type' | 'details' | 'summary' | 'results';
  onStepBack: () => void;
}

const FlightBookingHeader = ({ currentStep, onStepBack }: FlightBookingHeaderProps) => {
  const getStepTitle = () => {
    switch (currentStep) {
      case 'type': return 'Selecciona tipo de viaje';
      case 'details': return 'Completa los detalles';
      case 'summary': return 'Confirma tu búsqueda';
      case 'results': return 'Elige tu vuelo';
      default: return '';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-center space-x-3">
        {currentStep !== 'type' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onStepBack}
          >
            <ArrowLeft size={16} />
          </Button>
        )}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Plane size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Buscar Vuelos</h2>
            <p className="text-xs text-gray-500">
              {getStepTitle()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightBookingHeader;
