
import { MapPin, Calendar, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ManualBookingTabProps {
  formData: {
    destination: string;
    date: string;
    participants: number;
    tourType: string;
    duration: string;
  };
  onFormDataChange: (data: any) => void;
  onSearch: () => void;
}

const ManualBookingTab = ({ formData, onFormDataChange, onSearch }: ManualBookingTabProps) => {
  const updateFormData = (field: string, value: any) => {
    onFormDataChange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="destination">Destino</Label>
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
          <Input
            id="destination"
            placeholder="¿Dónde quieres explorar?"
            value={formData.destination}
            onChange={(e) => updateFormData('destination', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Fecha del Tour</Label>
        <div className="relative">
          <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => updateFormData('date', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="participants">Participantes</Label>
        <div className="relative">
          <Users size={16} className="absolute left-3 top-3 text-gray-400" />
          <Input
            id="participants"
            type="number"
            min="1"
            max="20"
            value={formData.participants}
            onChange={(e) => updateFormData('participants', parseInt(e.target.value))}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tourType">Tipo de Tour</Label>
        <Select value={formData.tourType} onValueChange={(value) => updateFormData('tourType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tipo de tour" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="city">🏙️ Tours de Ciudad</SelectItem>
            <SelectItem value="cultural">🏛️ Tours Culturales</SelectItem>
            <SelectItem value="food">🍽️ Tours Gastronómicos</SelectItem>
            <SelectItem value="adventure">🏔️ Tours de Aventura</SelectItem>
            <SelectItem value="historical">📜 Tours Históricos</SelectItem>
            <SelectItem value="nature">🌿 Tours de Naturaleza</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duración</Label>
        <Select value={formData.duration} onValueChange={(value) => updateFormData('duration', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona duración" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="half-day">Medio Día (2-4 horas)</SelectItem>
            <SelectItem value="full-day">Día Completo (6-8 horas)</SelectItem>
            <SelectItem value="multi-day">Múltiples días (2+ días)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={onSearch}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600"
        disabled={!formData.destination || !formData.date}
      >
        <MapPin size={16} className="mr-2" />
        Buscar Tours
      </Button>
    </div>
  );
};

export default ManualBookingTab;
