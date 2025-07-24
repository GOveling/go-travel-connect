import { useState } from "react";
import { Plane, X, Calendar, Users, MapPin } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface FlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromDestination?: string;
  toDestination: string;
  tripDates: string;
  travelers: number;
}

const FlightSearchModal = ({
  isOpen,
  onClose,
  fromDestination,
  toDestination,
  tripDates,
  travelers,
}: FlightSearchModalProps) => {
  const [formData, setFormData] = useState({
    from: fromDestination || "",
    to: toDestination,
    departDate: "",
    returnDate: "",
    passengers: travelers,
    class: "economy",
  });
  const { toast } = useToast();

  const handleSearch = () => {
    toast({
      title: "Buscando Vuelos",
      description: `Buscando vuelos de ${formData.from} a ${formData.to}...`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <Plane size={24} />
            <div>
              <h2 className="text-xl font-bold">Buscar Vuelos</h2>
              <p className="text-sm opacity-90">
                Encuentra las mejores ofertas
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Trip Info */}
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin size={16} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                Destino: {toDestination}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-purple-600" />
              <span className="text-sm text-purple-600">
                Fechas: {tripDates}
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="from" className="text-sm font-medium">
                Origen
              </Label>
              <Input
                id="from"
                placeholder="Ciudad de origen"
                value={formData.from}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, from: e.target.value }))
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="to" className="text-sm font-medium">
                Destino
              </Label>
              <Input
                id="to"
                value={formData.to}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, to: e.target.value }))
                }
                className="mt-1"
                readOnly
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="departDate" className="text-sm font-medium">
                  Fecha Ida
                </Label>
                <Input
                  id="departDate"
                  type="date"
                  value={formData.departDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      departDate: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="returnDate" className="text-sm font-medium">
                  Fecha Vuelta
                </Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      returnDate: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="passengers" className="text-sm font-medium">
                  Pasajeros
                </Label>
                <Input
                  id="passengers"
                  type="number"
                  min="1"
                  value={formData.passengers}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      passengers: parseInt(e.target.value),
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="class" className="text-sm font-medium">
                  Clase
                </Label>
                <Select
                  value={formData.class}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, class: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Económica</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="business">Ejecutiva</SelectItem>
                    <SelectItem value="first">Primera</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600"
            >
              <Plane size={16} className="mr-2" />
              Buscar Vuelos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlightSearchModal;
