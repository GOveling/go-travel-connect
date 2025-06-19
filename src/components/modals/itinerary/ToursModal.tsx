
import { useState } from "react";
import { MapPin, X, Calendar, Users, Star } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ToursModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  dates: string;
  travelers: number;
}

const ToursModal = ({ isOpen, onClose, destination, dates, travelers }: ToursModalProps) => {
  const [formData, setFormData] = useState({
    destination: destination,
    date: '',
    travelers: travelers,
    category: '',
    duration: ''
  });
  const { toast } = useToast();

  const handleSearch = () => {
    toast({
      title: "Buscando Tours",
      description: `Buscando actividades en ${formData.destination}...`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <MapPin size={24} />
            <div>
              <h2 className="text-xl font-bold">Tours y Actividades</h2>
              <p className="text-sm opacity-90">Descubre experiencias únicas</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Trip Info */}
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin size={16} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Destino: {destination}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-purple-600" />
              <span className="text-sm text-purple-600">Fechas: {dates}</span>
            </div>
          </div>

          {/* Popular Tours */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Tours Populares</h3>
            <div className="space-y-2">
              <div className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">City Walking Tour</h4>
                    <p className="text-xs text-gray-600">3 horas • Desde $25</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star size={12} className="text-yellow-500 fill-current" />
                    <span className="text-xs">4.8</span>
                  </div>
                </div>
              </div>
              <div className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Food & Culture Tour</h4>
                    <p className="text-xs text-gray-600">4 horas • Desde $45</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star size={12} className="text-yellow-500 fill-current" />
                    <span className="text-xs">4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium">Fecha Preferida</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="travelers" className="text-sm font-medium">Viajeros</Label>
                <Input
                  id="travelers"
                  type="number"
                  min="1"
                  value={formData.travelers}
                  onChange={(e) => setFormData(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-sm font-medium">Duración</Label>
                <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="half-day">Medio día</SelectItem>
                    <SelectItem value="full-day">Día completo</SelectItem>
                    <SelectItem value="multi-day">Varios días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium">Categoría</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tipo de actividad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="adventure">Aventura</SelectItem>
                  <SelectItem value="food">Gastronomía</SelectItem>
                  <SelectItem value="nature">Naturaleza</SelectItem>
                  <SelectItem value="history">Historia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <MapPin size={16} className="mr-2" />
              Buscar Tours
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToursModal;
