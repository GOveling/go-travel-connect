import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock, Trophy, Camera, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";

interface PlaceArrivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: {
    id: string;
    name: string;
    category?: string;
    image?: string;
    distance: number;
    address?: string;
    rating?: number;
  };
  onConfirmVisit: () => Promise<void>;
  loading?: boolean;
}

const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'restaurant':
      return '🍽️';
    case 'museum':
      return '🏛️';
    case 'tourist_attraction':
      return '🎯';
    case 'park':
      return '🌳';
    case 'lodging':
      return '🏨';
    case 'store':
      return '🛍️';
    default:
      return '📍';
  }
};

const getCategoryMessage = (category?: string, placeName: string) => {
  const messages = {
    restaurant: `¡Perfecto! Has llegado a ${placeName}. ¡Hora de disfrutar una deliciosa comida! 🍽️`,
    museum: `¡Excelente! Llegaste a ${placeName}. ¡Prepárate para sumergirte en cultura e historia! 🏛️`,
    tourist_attraction: `¡Fantástico! Has alcanzado ${placeName}. ¡Disfruta esta increíble atracción! 🎯`,
    park: `¡Genial! Llegaste a ${placeName}. ¡Es momento de relajarte y conectar con la naturaleza! 🌳`,
    lodging: `¡Bienvenido! Has llegado a ${placeName}. ¡Hora de descansar y recargar energías! 🏨`,
    store: `¡Perfecto! Llegaste a ${placeName}. ¡Tiempo de explorar y tal vez encontrar algo especial! 🛍️`,
    default: `¡Increíble! Has llegado a ${placeName}. ¡Disfruta al máximo tu visita! 🎉`
  };
  
  return messages[category?.toLowerCase() as keyof typeof messages] || messages.default;
};

export const PlaceArrivalModal = ({ 
  isOpen, 
  onClose, 
  place,
  onConfirmVisit, 
  loading = false 
}: PlaceArrivalModalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();

  const handleConfirmVisit = async () => {
    setIsConfirming(true);
    try {
      await onConfirmVisit();
      
      // Trigger celebration animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444']
      });
      
      // Show success toast
      toast({
        title: "¡Lugar visitado! 🎉",
        description: `${place.name} ha sido marcado como visitado. ¡Excelente trabajo explorando!`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error confirming visit:', error);
      toast({
        title: "Error",
        description: "No se pudo confirmar la visita. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const categoryIcon = getCategoryIcon(place.category);
  const message = getCategoryMessage(place.category, place.name);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-xl bg-gradient-to-br from-background via-background to-accent/5">
        <div className="flex flex-col items-center text-center p-2">
          {/* Header with celebration */}
          <div className="relative mb-4">
            <div className="text-6xl mb-2 animate-bounce">
              {categoryIcon}
            </div>
            <div className="absolute -top-2 -right-2 text-2xl animate-pulse">
              🎉
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-foreground mb-2">
            ¡Has llegado a tu destino!
          </h3>

          {/* Place info card */}
          <div className="w-full bg-card rounded-lg p-4 mb-4 border border-border/50">
            {place.image && (
              <div className="w-full h-32 bg-muted rounded-lg mb-3 overflow-hidden">
                <img 
                  src={place.image} 
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground text-lg">{place.name}</h4>
              
              {place.category && (
                <Badge variant="secondary" className="text-xs">
                  {place.category.replace('_', ' ')}
                </Badge>
              )}
              
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{place.distance}m</span>
                </div>
                
                {place.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{place.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message */}
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            {message}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={handleConfirmVisit}
              disabled={isConfirming || loading}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium py-3"
              size="lg"
            >
              {isConfirming ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  Confirmando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Confirmar Visita
                </div>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  // Future: Add photo capture functionality
                  toast({
                    title: "Próximamente",
                    description: "La función de cámara estará disponible pronto.",
                  });
                }}
              >
                <Camera className="w-4 h-4 mr-1" />
                Foto
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  // Future: Add sharing functionality
                  toast({
                    title: "Próximamente",
                    description: "La función de compartir estará disponible pronto.",
                  });
                }}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Compartir
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-muted-foreground"
              size="sm"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};