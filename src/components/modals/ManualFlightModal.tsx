import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import ManualFlightTypeSelector from "./manual-flight/ManualFlightTypeSelector";
import ManualFlightForm from "./manual-flight/ManualFlightForm";
import ManualFlightSummary from "./manual-flight/ManualFlightSummary";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
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
    setSearchResults([]);
    setShowResults(false);
    setIsSearching(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const extractIATACode = (locationString: string): string => {
    const match = locationString.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : locationString.slice(-3).toUpperCase();
  };

  const handleComplete = async () => {
    setIsSearching(true);
    try {
      console.log('🔍 Starting manual flight search...');
      
      let searchPayload;
      
      if (flightType === 'multi-city') {
        // Buscar vuelos multi-destino
        const flights = multiCityFlights.map(flight => ({
          origin: extractIATACode(flight.from),
          destination: extractIATACode(flight.to),
          departure_date: flight.departDate,
          passengers: flight.passengers,
          cabin_class: flight.class
        }));
        
        searchPayload = {
          type: 'multi-city',
          flights,
          passengers: multiCityFlights[0]?.passengers || 1,
          cabin_class: multiCityFlights[0]?.class || 'economy'
        };
      } else {
        // Buscar vuelos simples (ida y vuelta o solo ida)
        searchPayload = {
          origin: extractIATACode(flightData.from),
          destination: extractIATACode(flightData.to),
          departure_date: flightData.departDate,
          return_date: flightType === 'round-trip' ? flightData.returnDate : undefined,
          passengers: flightData.passengers,
          cabin_class: flightData.class,
          trip_type: flightType
        };
      }

      console.log('📤 Search payload:', searchPayload);

      const { data, error } = await supabase.functions.invoke('aviasales-flights', {
        body: searchPayload
      });

      if (error) {
        console.error('❌ Search error:', error);
        toast({
          title: "Error en la búsqueda",
          description: "No se pudieron buscar vuelos. Intenta nuevamente.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Search results:', data);
      
      if (data && data.results && data.results.length > 0) {
        setSearchResults(data.results);
        setShowResults(true);
        setCurrentStep('results' as any); // Agregar step de resultados
        
        toast({
          title: "¡Vuelos encontrados!",
          description: `Se encontraron ${data.results.length} opciones de vuelo.`,
        });
      } else {
        toast({
          title: "Sin resultados",
          description: "No se encontraron vuelos para esta búsqueda. Intenta con otras fechas o destinos.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('💥 Unexpected search error:', error);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error durante la búsqueda. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
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
    if (showResults) {
      return (
        <div className="p-4 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resultados de Búsqueda</h3>
            <p className="text-sm text-gray-600">
              Se encontraron {searchResults.length} opciones de vuelo
            </p>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div key={index} className="p-3 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {result.origin} → {result.destination}
                    </p>
                    <p className="text-sm text-gray-600">
                      Salida: {result.departure_at}
                    </p>
                    {result.return_at && (
                      <p className="text-sm text-gray-600">
                        Regreso: {result.return_at}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ${result.price} {result.currency}
                    </p>
                    <p className="text-xs text-gray-500">
                      {result.airline}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setShowResults(false);
                setCurrentStep('summary');
              }}
              variant="outline"
              className="flex-1"
            >
              Nueva Búsqueda
            </Button>
            <Button 
              onClick={handleClose}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            >
              Seleccionar
            </Button>
          </div>
        </div>
      );
    }

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
                disabled={isSearching}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium"
              >
                {isSearching ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search size={16} className="mr-2" />
                    Buscar Vuelos
                  </>
                )}
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
