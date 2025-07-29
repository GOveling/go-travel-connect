import { useState } from "react";
import { Smartphone, X, ExternalLink, Check, Globe } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ESIMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ESIMModal = ({ isOpen, onClose }: ESIMModalProps) => {
  const [step, setStep] = useState<'selection' | 'purchase' | 'confirmation'>('selection');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const { toast } = useToast();

  const esimPlans = [
    {
      id: 'europe',
      name: 'Europa',
      data: '5GB',
      duration: '15 días',
      price: '$19',
      countries: 'España, Francia, Italia, Alemania, Reino Unido y más'
    },
    {
      id: 'usa',
      name: 'Estados Unidos',
      data: '3GB',
      duration: '10 días', 
      price: '$15',
      countries: 'Estados Unidos'
    },
    {
      id: 'asia',
      name: 'Asia',
      data: '8GB',
      duration: '20 días',
      price: '$25',
      countries: 'Japón, Corea del Sur, Tailandia, Singapur y más'
    },
    {
      id: 'global',
      name: 'Mundial',
      data: '10GB',
      duration: '30 días',
      price: '$35',
      countries: 'Más de 150 países'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedRegion(planId);
    setStep('purchase');
  };

  const handlePurchase = () => {
    const affiliateUrl = "https://holafly.com/?ref=TU_AFILIADO";
    window.open(affiliateUrl, '_blank');
    setStep('confirmation');
  };

  const handleFinished = () => {
    // 1) marca estado "eSIM activa" dentro de My Trips
    // 2) guarda proveedor, país/región, fechas, etc.
    // 3) opcional: analytics event
    
    toast({
      title: "eSIM Configurada",
      description: "Tu eSIM ha sido activada correctamente",
    });
    
    onClose();
    setStep('selection');
    setSelectedRegion('');
  };

  const selectedPlan = esimPlans.find(plan => plan.id === selectedRegion);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 text-white hover:bg-white/20 p-2 h-10 w-10"
          >
            <X size={20} />
          </Button>
          <div className="flex items-center space-x-3">
            <Smartphone size={28} />
            <div>
              <h2 className="text-2xl font-bold">Comprar eSIM</h2>
              <p className="text-sm opacity-90 mt-1">
                Mantente conectado en cualquier parte del mundo
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'selection' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Selecciona tu destino</h3>
                <p className="text-muted-foreground">
                  Elige el plan de datos que mejor se adapte a tu viaje
                </p>
              </div>
              
              <div className="grid gap-4">
                {esimPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Globe className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold">{plan.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {plan.countries}
                        </p>
                        <div className="flex space-x-4 text-sm">
                          <span><strong>{plan.data}</strong> de datos</span>
                          <span><strong>{plan.duration}</strong> de duración</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{plan.price}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'purchase' && selectedPlan && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Confirmar compra</h3>
                <p className="text-muted-foreground">
                  Serás redirigido a HolaFly para completar tu compra
                </p>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-2">{selectedPlan.name}</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Datos:</strong> {selectedPlan.data}</p>
                  <p><strong>Duración:</strong> {selectedPlan.duration}</p>
                  <p><strong>Cobertura:</strong> {selectedPlan.countries}</p>
                  <p><strong>Precio:</strong> {selectedPlan.price}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('selection')}
                  className="flex-1"
                >
                  Volver
                </Button>
                <Button
                  onClick={handlePurchase}
                  className="flex-1"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Comprar en HolaFly
                </Button>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">¡eSIM Lista!</h3>
                <p className="text-muted-foreground">
                  Tu eSIM ha sido configurada. Ya puedes usar datos móviles en tu destino.
                </p>
              </div>
              
              <Button onClick={handleFinished} className="w-full">
                Continuar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ESIMModal;