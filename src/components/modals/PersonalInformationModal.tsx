import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileData } from "@/types/profile";

interface PersonalInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: ProfileData;
  onProfileUpdate?: () => void;
}

// Country and city data
const countries = [
  { code: 'AR', name: 'Argentina', phone: '+54' },
  { code: 'BR', name: 'Brasil', phone: '+55' },
  { code: 'CL', name: 'Chile', phone: '+56' },
  { code: 'CO', name: 'Colombia', phone: '+57' },
  { code: 'EC', name: 'Ecuador', phone: '+593' },
  { code: 'PE', name: 'Perú', phone: '+51' },
  { code: 'UY', name: 'Uruguay', phone: '+598' },
  { code: 'VE', name: 'Venezuela', phone: '+58' },
  { code: 'MX', name: 'México', phone: '+52' },
  { code: 'ES', name: 'España', phone: '+34' },
  { code: 'US', name: 'Estados Unidos', phone: '+1' },
];

const citiesByCountry: Record<string, string[]> = {
  'AR': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'San Miguel de Tucumán'],
  'BR': ['São Paulo', 'Rio de Janeiro', 'Salvador', 'Brasília', 'Fortaleza', 'Belo Horizonte'],
  'CL': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco'],
  'CO': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'],
  'EC': ['Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala', 'Manta'],
  'PE': ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Huancayo', 'Piura'],
  'UY': ['Montevideo', 'Salto', 'Paysandú', 'Las Piedras', 'Rivera', 'Maldonado'],
  'VE': ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana'],
  'MX': ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León'],
  'ES': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga'],
  'US': ['Nueva York', 'Los Ángeles', 'Chicago', 'Houston', 'Phoenix', 'Filadelfia'],
};

const PersonalInformationModal = ({ isOpen, onClose, profile, onProfileUpdate }: PersonalInformationModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: null as Date | null,
    age: null as number | null,
    address: '',
    country: '',
    city_state: '',
    mobile_phone: '',
    country_code: '',
    gender: '' as 'male' | 'female' | 'prefer_not_to_say' | '',
  });

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        birth_date: profile.birth_date ? new Date(profile.birth_date) : null,
        age: profile.age || null,
        address: profile.address || '',
        country: profile.country || '',
        city_state: profile.city_state || '',
        mobile_phone: profile.mobile_phone || '',
        country_code: profile.country_code || '',
        gender: profile.gender || '',
      });
    }
  }, [profile]);

  // Calculate age when birth date changes
  useEffect(() => {
    if (formData.birth_date) {
      const today = new Date();
      const birthDate = new Date(formData.birth_date);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prev => ({ ...prev, age }));
    }
  }, [formData.birth_date]);

  // Update country code when country changes
  useEffect(() => {
    if (formData.country) {
      const country = countries.find(c => c.name === formData.country);
      if (country) {
        setFormData(prev => ({ ...prev, country_code: country.phone }));
      }
    }
  }, [formData.country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          birth_date: formData.birth_date?.toISOString().split('T')[0] || null,
          address: formData.address,
          country: formData.country,
          city_state: formData.city_state,
          mobile_phone: formData.mobile_phone,
          country_code: formData.country_code,
          gender: formData.gender || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Información actualizada",
        description: "Tus datos personales han sido guardados correctamente.",
      });

      onProfileUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const availableCities = formData.country ? citiesByCountry[countries.find(c => c.name === formData.country)?.code || ''] || [] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Información Personal
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Ingresa tu nombre completo"
              required
            />
          </div>

          {/* Birth Date and Age */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Nacimiento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birth_date ? format(formData.birth_date, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.birth_date || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, birth_date: date || null }))}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                value={formData.age || ''}
                readOnly
                placeholder="Se calcula automáticamente"
                className="bg-muted"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección de Residencia</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Ingresa tu dirección completa"
            />
          </div>

          {/* Country and City */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>País</Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, country: value, city_state: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar país" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ciudad/Estado</Label>
              <Select 
                value={formData.city_state} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, city_state: value }))}
                disabled={!formData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile Phone */}
          <div className="space-y-2">
            <Label htmlFor="mobile_phone">Teléfono Móvil</Label>
            <div className="flex gap-2">
              <Input
                value={formData.country_code}
                readOnly
                className="w-20 bg-muted"
                placeholder="+XX"
              />
              <Input
                id="mobile_phone"
                value={formData.mobile_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile_phone: e.target.value }))}
                placeholder="Número de teléfono"
                className="flex-1"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Género</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Femenino</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefiero no contestar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Información"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalInformationModal;