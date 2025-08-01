import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCitiesByCountry } from "@/hooks/useCitiesByCountry";
import { useCountries } from "@/hooks/useCountries";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ProfileData } from "@/types/profile";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

interface PersonalInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: ProfileData;
  onProfileUpdate?: () => void;
}

const PersonalInformationModal = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
}: PersonalInformationModalProps) => {
  const { toast } = useToast();
  const { countries, loading: countriesLoading } = useCountries();
  const {
    cities,
    loadCitiesForCountry,
    loading: citiesLoading,
    clearResults,
  } = useCitiesByCountry();

  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [countryComboOpen, setCountryComboOpen] = useState(false);
  const [cityComboOpen, setCityComboOpen] = useState(false);
  const [birthDateOpen, setBirthDateOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: null as Date | null,
    age: null as number | null,
    address: "",
    country: "",
    city_state: "",
    mobile_phone: "",
    country_code: "",
    gender: "" as "male" | "female" | "prefer_not_to_say" | "",
  });

  // Helper function to normalize phone code (ensure single + prefix)
  const normalizePhoneCode = (phoneCode: string): string => {
    if (!phoneCode) return "";
    // Remove any existing + signs and add exactly one
    const cleanCode = phoneCode.replace(/^\++/, "");
    return `+${cleanCode}`;
  };

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        birth_date: profile.birth_date ? new Date(profile.birth_date) : null,
        age: profile.age || null,
        address: profile.address || "",
        country: profile.country || "",
        city_state: profile.city_state || "",
        mobile_phone: profile.mobile_phone || "",
        country_code: profile.country_code
          ? normalizePhoneCode(profile.country_code)
          : "",
        gender: profile.gender || "",
      });

      // Si el perfil tiene un país seleccionado, cargar las ciudades
      if (profile.country) {
        loadCitiesForCountry(profile.country);
      }

      setIsInitialized(true);
    }
  }, [profile, loadCitiesForCountry]);

  // Calculate age when birth date changes
  useEffect(() => {
    if (formData.birth_date) {
      const today = new Date();
      const birthDate = new Date(formData.birth_date);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      setFormData((prev) => ({ ...prev, age }));
    }
  }, [formData.birth_date]);

  // Update country code when country changes
  useEffect(() => {
    if (formData.country) {
      const country = countries.find(
        (c) => c.country_code === formData.country
      );
      if (country) {
        setFormData((prev) => ({
          ...prev,
          country_code: normalizePhoneCode(country.phone_code),
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, country_code: "" }));
    }
  }, [formData.country, countries]);

  // Load cities when country changes (only if country is selected and after initialization)
  useEffect(() => {
    // Solo ejecutar después de la inicialización para evitar fetch innecesario
    if (!isInitialized) return;

    if (formData.country && formData.country !== "") {
      // Solo limpiar la ciudad si cambiamos de país
      setFormData((prev) => ({ ...prev, city_state: "" }));
      // Hacer fetch de ciudades usando el country_code
      loadCitiesForCountry(formData.country);
    } else {
      // Si no hay país seleccionado, limpiar resultados sin hacer fetch
      clearResults();
    }
  }, [formData.country, loadCitiesForCountry, clearResults, isInitialized]);

  // Reset initialization flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
      clearResults();
    }
  }, [isOpen, clearResults]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          birth_date: formData.birth_date?.toISOString().split("T")[0] || null,
          address: formData.address,
          country: formData.country,
          city_state: formData.city_state,
          mobile_phone: formData.mobile_phone,
          country_code: formData.country_code,
          gender: formData.gender || null,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Información actualizada",
        description: "Tus datos personales han sido guardados correctamente.",
      });

      onProfileUpdate?.();
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description:
          "No se pudo actualizar la información. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Información Personal</DialogTitle>
          <div className="bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-950/20 dark:to-orange-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 mt-4">
            <div className="flex items-start gap-3">
              <div className="text-green-500 text-xl">🎯</div>
              <div className="space-y-1">
                <h3 className="font-medium text-green-800 dark:text-green-300">
                  ¡Último paso para comenzar!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Completa tu información para obtener recomendaciones personalizadas y conectar con otros viajeros.
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-1">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="Ingresa tu nombre completo"
              required
            />
          </div>

          {/* Birth Date and Age */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Nacimiento *</Label>
              <Popover open={birthDateOpen} onOpenChange={setBirthDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birth_date
                      ? format(formData.birth_date, "dd/MM/yyyy")
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="p-4 space-y-4">
                    {/* Year Selector */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Año</Label>
                      <Select
                        value={
                          formData.birth_date?.getFullYear().toString() || ""
                        }
                        onValueChange={(year) => {
                          const currentDate = formData.birth_date || new Date();
                          const newDate = new Date(
                            parseInt(year),
                            currentDate.getMonth(),
                            currentDate.getDate()
                          );
                          setFormData((prev) => ({
                            ...prev,
                            birth_date: newDate,
                          }));
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar año" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {Array.from({ length: 124 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Month and Day Selectors */}
                    {formData.birth_date && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Mes</Label>
                          <Select
                            value={(
                              formData.birth_date.getMonth() + 1
                            ).toString()}
                            onValueChange={(month) => {
                              const currentDate = formData.birth_date!;
                              const year = currentDate.getFullYear();
                              const newMonth = parseInt(month) - 1;
                              const currentDay = currentDate.getDate();

                              // Get max days in the new month
                              const maxDaysInNewMonth = new Date(
                                year,
                                newMonth + 1,
                                0
                              ).getDate();

                              // Adjust day if it doesn't exist in the new month
                              const adjustedDay = Math.min(
                                currentDay,
                                maxDaysInNewMonth
                              );

                              const newDate = new Date(
                                year,
                                newMonth,
                                adjustedDay
                              );
                              setFormData((prev) => ({
                                ...prev,
                                birth_date: newDate,
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "Enero",
                                "Febrero",
                                "Marzo",
                                "Abril",
                                "Mayo",
                                "Junio",
                                "Julio",
                                "Agosto",
                                "Septiembre",
                                "Octubre",
                                "Noviembre",
                                "Diciembre",
                              ].map((monthName, index) => (
                                <SelectItem
                                  key={index + 1}
                                  value={(index + 1).toString()}
                                >
                                  {monthName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Día</Label>
                          <Select
                            value={formData.birth_date.getDate().toString()}
                            onValueChange={(day) => {
                              const currentDate = formData.birth_date!;
                              const newDate = new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                parseInt(day)
                              );
                              setFormData((prev) => ({
                                ...prev,
                                birth_date: newDate,
                              }));
                              // Close the popover after selecting the day
                              setBirthDateOpen(false);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {Array.from(
                                {
                                  length: new Date(
                                    formData.birth_date.getFullYear(),
                                    formData.birth_date.getMonth() + 1,
                                    0
                                  ).getDate(),
                                },
                                (_, i) => {
                                  const day = i + 1;
                                  return (
                                    <SelectItem
                                      key={day}
                                      value={day.toString()}
                                    >
                                      {day}
                                    </SelectItem>
                                  );
                                }
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                value={formData.age || ""}
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Ingresa tu dirección completa"
            />
          </div>

          {/* Country and City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>País</Label>
              <Popover
                open={countryComboOpen}
                onOpenChange={setCountryComboOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryComboOpen}
                    className="w-full justify-between h-10"
                    disabled={countriesLoading}
                  >
                    {formData.country
                      ? countries.find(
                          (country) => country.country_code === formData.country
                        )?.country_name
                      : countriesLoading
                        ? "Cargando países..."
                        : "Seleccionar país"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] sm:w-[400px] p-0 max-h-[350px]">
                  <Command className="h-full">
                    <CommandInput placeholder="Buscar país..." />
                    <CommandList className="max-h-[280px] overflow-y-scroll">
                      <CommandEmpty>No se encontró el país.</CommandEmpty>
                      <CommandGroup>
                        {countries.map((country) => (
                          <CommandItem
                            key={country.country_code}
                            value={country.country_name}
                            onSelect={() => {
                              setFormData((prev) => ({
                                ...prev,
                                country: country.country_code,
                              }));
                              setCountryComboOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.country === country.country_code
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {country.country_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Ciudad/Estado</Label>
              <Popover open={cityComboOpen} onOpenChange={setCityComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={cityComboOpen}
                    className="w-full justify-between h-10"
                    disabled={!formData.country || citiesLoading}
                  >
                    {formData.city_state ||
                      (!formData.country
                        ? "Selecciona un país primero"
                        : citiesLoading
                          ? "Cargando ciudades..."
                          : "Seleccionar ciudad o estado")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] sm:w-[400px] p-0 max-h-[350px]">
                  <Command className="h-full">
                    <CommandInput placeholder="Buscar ciudad..." />
                    <CommandList className="max-h-[280px] overflow-y-scroll">
                      <CommandEmpty>No se encontró la ciudad.</CommandEmpty>
                      <CommandGroup>
                        {cities.map((city, index) => (
                          <CommandItem
                            key={index}
                            value={city.city}
                            onSelect={() => {
                              setFormData((prev) => ({
                                ...prev,
                                city_state: city.city,
                              }));
                              setCityComboOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.city_state === city.city
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {city.city}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mobile_phone: e.target.value,
                  }))
                }
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
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  gender: value as "male" | "female" | "prefer_not_to_say",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Femenino</SelectItem>
                <SelectItem value="prefer_not_to_say">
                  Prefiero no contestar
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Completar después
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "¡Comenzar mi aventura!"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalInformationModal;
