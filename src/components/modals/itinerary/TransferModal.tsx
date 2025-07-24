import { useState } from "react";
import { Car, X, Calendar, MapPin, Clock } from "lucide-react";
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

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  transferType: "arrival" | "departure" | "between";
  fromLocation?: string;
  toLocation?: string;
  travelers: number;
}

const TransferModal = ({
  isOpen,
  onClose,
  destination,
  transferType,
  fromLocation,
  toLocation,
  travelers,
}: TransferModalProps) => {
  const [formData, setFormData] = useState({
    from:
      fromLocation ||
      (transferType === "arrival" ? `${destination} Airport` : ""),
    to:
      toLocation ||
      (transferType === "departure" ? `${destination} Airport` : ""),
    date: "",
    time: "",
    passengers: travelers,
    vehicleType: "standard",
  });
  const { toast } = useToast();

  const getTransferTitle = () => {
    switch (transferType) {
      case "arrival":
        return "Transfer desde Aeropuerto";
      case "departure":
        return "Transfer al Aeropuerto";
      case "between":
        return "Transfer entre Ciudades";
      default:
        return "Reservar Transfer";
    }
  };

  const handleBook = () => {
    toast({
      title: "Reservando Transfer",
      description: `Reservando transfer de ${formData.from} a ${formData.to}...`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <Car size={24} />
            <div>
              <h2 className="text-xl font-bold">{getTransferTitle()}</h2>
              <p className="text-sm opacity-90">Transporte cómodo y seguro</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Trip Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Destino: {destination}
              </span>
            </div>
            <div className="text-sm text-blue-600">
              {transferType === "arrival" &&
                "Transfer desde el aeropuerto a tu alojamiento"}
              {transferType === "departure" &&
                "Transfer desde tu alojamiento al aeropuerto"}
              {transferType === "between" && "Transfer entre destinos"}
            </div>
          </div>

          {/* Vehicle Options */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">
              Opciones de Vehículo
            </h3>
            <div className="space-y-2">
              <div className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Sedán Estándar</h4>
                    <p className="text-xs text-gray-600">
                      1-3 pasajeros • Desde $25
                    </p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    Económico
                  </span>
                </div>
              </div>
              <div className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Van Ejecutiva</h4>
                    <p className="text-xs text-gray-600">
                      4-8 pasajeros • Desde $45
                    </p>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    Popular
                  </span>
                </div>
              </div>
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
                placeholder="Punto de recogida"
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
                placeholder="Punto de destino"
                value={formData.to}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, to: e.target.value }))
                }
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date" className="text-sm font-medium">
                  Fecha
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-sm font-medium">
                  Hora
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
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
                <Label htmlFor="vehicleType" className="text-sm font-medium">
                  Vehículo
                </Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, vehicleType: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Sedán Estándar</SelectItem>
                    <SelectItem value="executive">Van Ejecutiva</SelectItem>
                    <SelectItem value="luxury">Vehículo de Lujo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleBook}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
            >
              <Car size={16} className="mr-2" />
              Reservar Transfer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferModal;
