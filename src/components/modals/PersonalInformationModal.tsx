
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, RefreshCw, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileData } from "@/types/profile";
import { useCountries } from "@/hooks/useCountries";
import { useCitiesByCountry } from "@/hooks/useCitiesByCountry";
import { cn } from "@/lib/utils";

interface PersonalInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: ProfileData;
  onProfileUpdate?: () => void;
}

const PersonalInformationModal = ({ isOpen, onClose, profile, onProfileUpdate }: PersonalInformationModalProps) => {
  const { toast } = useToast();
  const { countries, loading: countriesLoading, syncCountries } = useCountries();
  const { cities, searchCities, loading: citiesLoading, clearResults } = useCitiesByCountry();
  
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
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
      const country = countries.find(c => c.iso_code === formData.country);
      if (country) {
        setFormData(prev => ({ ...prev, country_code: country.phone_code }));
      }
    }
  }, [formData.country, countries]);

  // Clear city results when country changes
  useEffect(() => {
    if (formData.country) {
      clearResults();
      setCityQuery('');
      setFormData(prev => ({ ...prev, city_state: '' }));
    }
  }, [formData.country, clearResults]);

  // Handle city search with debounce
  useEffect(() => {
    if (cityQuery.length > 2 && formData.country) {
      const timeoutId = setTimeout(() => {
        searchCities(cityQuery, formData.country);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (cityQuery.length <= 2) {
      clearResults();
    }
  }, [cityQuery, formData.country, searchCities, clearResults]);

  // Handle city search input
  const handleCitySearch = (value: string) => {
    setCityQuery(value);
    setFormData(prev => ({ ...prev, city_state: value }));
  };

  // Handle city selection from dropdown
  const handleCitySelect = (city: string) => {
    setFormData(prev => ({ ...prev, city_state: city }));
    setCityQuery('');
    clearResults();
  };

  // Handle sync countries
  const handleSyncCountries = async () => {
    try {
      setIsSyncing(true);
      await syncCountries();
      toast({
        title: "Base de datos actualizada",
        description: "Los países se han sincronizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo sincronizar la base de datos de países.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

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
              <div className="flex gap-2">
                <Select 
                  value={formData.country} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                  disabled={countriesLoading}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={countriesLoading ? "Cargando países..." : "Seleccionar país"} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.iso_code} value={country.iso_code}>
                        <div className="flex items-center gap-2">
                          {country.flag_url && (
                            <img src={country.flag_url} alt={`${country.name} flag`} className="w-4 h-3 object-cover" />
                          )}
                          {country.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSyncCountries}
                  disabled={isSyncing}
                  title="Sincronizar base de datos de países"
                >
                  <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ciudad/Estado</Label>
              <div className="relative">
                <Input
                  value={cityQuery || formData.city_state}
                  onChange={(e) => handleCitySearch(e.target.value)}
                  placeholder={formData.country ? "Buscar ciudad o estado..." : "Selecciona un país primero"}
                  disabled={!formData.country || citiesLoading}
                />
                {citiesLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
                {cities.length > 0 && cityQuery && (
                  <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {cities.map((city, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={() => handleCitySelect(city.name)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{city.name}</span>
                          <span className="text-sm text-muted-foreground">{city.type === 'locality' ? 'Ciudad' : 'Estado/Provincia'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
