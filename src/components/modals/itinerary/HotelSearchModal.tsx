import { useState } from "react";
import { Building, X, Calendar, Users, MapPin } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface HotelSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  dates: string;
  travelers: number;
}

const HotelSearchModal = ({
  isOpen,
  onClose,
  destination,
  dates,
  travelers,
}: HotelSearchModalProps) => {
  const [formData, setFormData] = useState({
    destination: destination,
    checkIn: "",
    checkOut: "",
    guests: travelers,
    rooms: 1,
  });
  const { toast } = useToast();

  const handleSearch = () => {
    toast({
      title: "Buscando Hoteles",
      description: `Buscando hoteles en ${formData.destination}...`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <Building size={24} />
            <div>
              <h2 className="text-xl font-bold">Buscar Hoteles</h2>
              <p className="text-sm opacity-90">
                Encuentra tu alojamiento ideal
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Trip Info */}
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Destino: {destination}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-green-600" />
              <span className="text-sm text-green-600">Fechas: {dates}</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="destination" className="text-sm font-medium">
                Destino
              </Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    destination: e.target.value,
                  }))
                }
                className="mt-1"
                readOnly
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="checkIn" className="text-sm font-medium">
                  Check-in
                </Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      checkIn: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="checkOut" className="text-sm font-medium">
                  Check-out
                </Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      checkOut: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="guests" className="text-sm font-medium">
                  Huéspedes
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  value={formData.guests}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      guests: parseInt(e.target.value),
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="rooms" className="text-sm font-medium">
                  Habitaciones
                </Label>
                <Input
                  id="rooms"
                  type="number"
                  min="1"
                  value={formData.rooms}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rooms: parseInt(e.target.value),
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-green-500 to-green-600"
            >
              <Building size={16} className="mr-2" />
              Buscar Hoteles
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HotelSearchModal;
