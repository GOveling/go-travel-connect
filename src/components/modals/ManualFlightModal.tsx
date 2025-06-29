
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, Search } from "lucide-react";
import ManualFlightTypeSelector from "./manual-flight/ManualFlightTypeSelector";
import ManualFlightForm from "./manual-flight/ManualFlightForm";
import ManualFlightSummary from "./manual-flight/ManualFlightSummary";
import { useToast } from "@/hooks/use-toast";

interface ManualFlightData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface MultiCityFlight {
  from: string;
  to: string;
  departDate: string;
  passengers: number;
  class: string;
}

interface ManualFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManualFlightModal = ({ isOpen, onClose }: ManualFlightModalProps) => {
  const [currentStep, setCurrentStep] = useState<'type' | 'details' | 'summary'>('type');
  const [flightType, setFlightType] = useState<'round-trip' | 'one-way' | 'multi-city'>('round-trip');
  const [flightData, setFlightData] = useState<ManualFlightData>({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy'
  });
  const [multiCityFlights, setMultiCityFlights] = useState<MultiCityFlight[]>([
    { from: '', to: '', departDate: '', passengers: 1, class: 'economy' },
    { from: '', to: '', departDate: '', passengers: 1, class: 'economy' }
  ]);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isDepartDateOpen, setIsDepartDateOpen] = useState(false);
  const { toast } = useToast();

  const handleReset = () => {
    setCurrentStep('type');
    setFlightType('round-trip');
    setFlightData({
      from: '',
      to: '',
      departDate: '',
      returnDate: '',
      passengers: 1,
      class: 'economy'
    });
    setMultiCityFlights([
      { from: '', to: '', departDate: '', passengers: 1, class: 'economy' },
      { from: '', to: '', departDate: '', passengers: 1, class: 'economy' }
    ]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleComplete = () => {
    toast({
      title: "Búsqueda de vuelos iniciada",
      description: "Buscando los mejores vuelos para tu configuración manual...",
    });
    handleClose();
  };

  const canProceedToDetails = () => {
    return true; // Siempre se puede proceder desde la selección de tipo
  };

  const canProceedToSummary = () => {
    if (flightType === 'multi-city') {
      return multiCityFlights.length >= 2 && 
             multiCityFlights.every(flight => flight.from && flight.to && flight.departDate);
    }
    return flightData.from && flightData.to && flightData.departDate && 
           (flightType === 'one-way' || flightData.returnDate);
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-amber-50">
      <div className="flex items-center space-x-3">
        {currentStep !== 'type' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (currentStep === 'summary') setCurrentStep('details');
              else if (currentStep === 'details') setCurrentStep('type');
            }}
          >
            <ArrowLeft size={16} />
          </Button>
        )}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Vuelo Manual</h2>
          <p className="text-xs text-gray-500">
            {currentStep === 'type' && 'Selecciona el tipo de vuelo'}
            {currentStep === 'details' && 'Configura los detalles'}
            {currentStep === 'summary' && 'Confirma tu búsqueda'}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={handleClose}>
        <X size={16} />
      </Button>
    </div>
  );

  const renderProgress = () => (
    <div className="px-4 py-2 bg-gray-50">
      <div className="flex items-center justify-center space-x-2">
        {['type', 'details', 'summary'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${
              currentStep === step ? 'bg-orange-500' : 
              ['type', 'details', 'summary'].indexOf(currentStep) > index ? 'bg-orange-300' : 'bg-gray-300'
            }`} />
            {index < 2 && <div className="w-6 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <div className="p-4 space-y-4">
            <ManualFlightTypeSelector 
              flightType={flightType} 
              onTypeChange={setFlightType}
            />
            
            <Button 
              onClick={() => setCurrentStep('details')}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 text-white"
              disabled={!canProceedToDetails()}
            >
              Continuar
            </Button>
          </div>
        );
        
      case 'details':
        return (
          <div className="p-4 space-y-4">
            <ManualFlightForm
              flightType={flightType}
              flightData={flightData}
              setFlightData={setFlightData}
              multiCityFlights={multiCityFlights}
              setMultiCityFlights={setMultiCityFlights}
              isDateRangeOpen={isDateRangeOpen}
              setIsDateRangeOpen={setIsDateRangeOpen}
              isDepartDateOpen={isDepartDateOpen}
              setIsDepartDateOpen={setIsDepartDateOpen}
            />
            
            <Button 
              onClick={() => setCurrentStep('summary')}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 text-white"
              disabled={!canProceedToSummary()}
            >
              Revisar Vuelo
            </Button>
          </div>
        );
        
      case 'summary':
        return (
          <div className="p-4 space-y-4">
            <ManualFlightSummary
              flightType={flightType}
              flightData={flightData}
              multiCityFlights={multiCityFlights}
            />
            
            <div className="space-y-2">
              <Button 
                onClick={handleComplete}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium"
              >
                <Search size={16} className="mr-2" />
                Buscar Vuelos
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[95vh] overflow-hidden p-0 rounded-xl">
        <div className="h-full max-h-[95vh] flex flex-col">
          {renderHeader()}
          {renderProgress()}
          <div className="flex-1 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualFlightModal;
