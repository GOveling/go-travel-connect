import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useCitiesByCountry } from "@/hooks/useCitiesByCountry";
import { useCountries } from "@/hooks/useCountries";
import { useLanguage } from "@/hooks/useLanguage";
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
  showIntroMessage?: boolean;
}

const PersonalInformationModal = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
  showIntroMessage = false,
}: PersonalInformationModalProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
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
    console.log(
      "PersonalInformationModal: Initializing form with profile:",
      profile
    );
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

      console.log(
        "PersonalInformationModal: Form initialized with full_name:",
        profile.full_name
      );

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

  // Update country code and phone code when country changes
  useEffect(() => {
    if (formData.country) {
      const country = countries.find(
        (c) => c.country_code === formData.country
      );
      if (country) {
        const phoneCode = normalizePhoneCode(country.phone_code);
        setFormData((prev) => ({
          ...prev,
          country_code: phoneCode,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        country_code: "",
        mobile_phone: "",
      }));
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
          onboarding_completed: true, // Mark onboarding as completed
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
      <DialogContent
        className="sm:max-w-2xl w-full h-full sm:h-auto sm:w-[95vw] sm:max-h-[90vh] p-0 rounded-none sm:rounded-2xl flex flex-col"
        style={{ touchAction: "manipulation" }}
      >
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Información Personal</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted rounded-full"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>

          {/* Progress indicator for mobile */}
          {/** Only show on first-time onboarding */}
          {showIntroMessage && (
            <div className="mt-3 bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-950/20 dark:to-orange-950/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎯</div>
                <div className="space-y-1">
                  <h3 className="font-medium text-green-800 dark:text-green-300 text-sm">
                    ¡Último paso para comenzar!
                  </h3>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Completa tu información para obtener recomendaciones
                    personalizadas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto min-h-0"
          style={{ touchAction: "pan-y", scrollBehavior: "smooth" }}
        >
          <div className="p-6 pb-24">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Full Name */}
              <div className="space-y-3">
                <Label htmlFor="full_name" className="text-base font-medium">
                  Nombre Completo *
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  placeholder="Ingresa tu nombre completo"
                  required
                  className="h-12 text-base rounded-2xl border-2 focus:border-primary"
                />
              </div>

              {/* Birth Date and Age */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Fecha de Nacimiento *
                  </Label>
                  <Popover open={birthDateOpen} onOpenChange={setBirthDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-12 text-base rounded-2xl border-2"
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {formData.birth_date
                          ? format(formData.birth_date, "dd/MM/yyyy")
                          : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl">
                      <div className="p-6 space-y-6">
                        {/* Year Selector */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Año</Label>
                          <Select
                            value={
                              formData.birth_date?.getFullYear().toString() ||
                              ""
                            }
                            onValueChange={(year) => {
                              const currentDate =
                                formData.birth_date || new Date();
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
                            <SelectTrigger className="w-full h-12 rounded-xl">
                              <SelectValue placeholder="Seleccionar año" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 rounded-xl">
                              {Array.from({ length: 124 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                  <SelectItem
                                    key={year}
                                    value={year.toString()}
                                  >
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Month and Day Selectors */}
                        {formData.birth_date && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
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

                                  const maxDaysInNewMonth = new Date(
                                    year,
                                    newMonth + 1,
                                    0
                                  ).getDate();

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
                                <SelectTrigger className="h-12 rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
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

                            <div className="space-y-3">
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
                                  setBirthDateOpen(false);
                                }}
                              >
                                <SelectTrigger className="h-12 rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 rounded-xl">
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

                <div className="space-y-3">
                  <Label htmlFor="age" className="text-base font-medium">
                    Edad
                  </Label>
                  <Input
                    id="age"
                    value={formData.age || ""}
                    readOnly
                    placeholder="Se calcula automáticamente"
                    className="h-12 text-base rounded-2xl bg-muted/50 border-2"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-3">
                <Label htmlFor="address" className="text-base font-medium">
                  Dirección de Residencia
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Ingresa tu dirección completa"
                  className="h-12 text-base rounded-2xl border-2 focus:border-primary"
                />
              </div>

              {/* Country and City */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">País</Label>
                  <Popover
                    open={countryComboOpen}
                    onOpenChange={setCountryComboOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={countryComboOpen}
                        className="w-full justify-between h-12 text-base rounded-2xl border-2"
                        disabled={countriesLoading}
                      >
                        {formData.country
                          ? countries.find(
                              (country) =>
                                country.country_code === formData.country
                            )?.country_name
                          : countriesLoading
                            ? "Cargando países..."
                            : "Seleccionar país"}
                        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[400px] p-0 z-50 bg-background border rounded-2xl shadow-lg">
                      <Command className="w-full">
                        <CommandInput
                          placeholder="Buscar país..."
                          className="border-none h-12 text-base"
                        />
                        <CommandList
                          className="max-h-[300px] overflow-y-auto overflow-x-hidden overscroll-contain"
                          style={{ WebkitOverflowScrolling: "touch" }}
                        >
                          <CommandEmpty className="py-6 text-center text-sm">
                            No se encontró el país.
                          </CommandEmpty>
                          <CommandGroup>
                            {countries.map((country) => (
                              <CommandItem
                                key={country.country_code}
                                value={country.country_name}
                                onSelect={() => {
                                  console.log(
                                    "Selected country:",
                                    country.country_name,
                                    "Code:",
                                    country.country_code
                                  );
                                  setFormData((prev) => ({
                                    ...prev,
                                    country: country.country_code,
                                  }));
                                  setCountryComboOpen(false);
                                }}
                                className="cursor-pointer text-base py-3 px-2 hover:bg-accent rounded-lg"
                              >
                                <Check
                                  className={cn(
                                    "mr-3 h-5 w-5",
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

                <div className="space-y-3">
                  <Label className="text-base font-medium">Ciudad/Estado</Label>
                  <Popover open={cityComboOpen} onOpenChange={setCityComboOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={cityComboOpen}
                        className="w-full justify-between h-12 text-base rounded-2xl border-2"
                        disabled={!formData.country || citiesLoading}
                      >
                        {formData.city_state ||
                          (!formData.country
                            ? "Selecciona un país primero"
                            : citiesLoading
                              ? "Cargando ciudades..."
                              : "Seleccionar ciudad o estado")}
                        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[400px] p-0 z-50 bg-popover border rounded-2xl">
                      <Command className="w-full">
                        <CommandInput
                          placeholder="Buscar ciudad..."
                          className="border-none h-12 text-base"
                        />
                        <CommandList
                          className="max-h-[300px] overflow-y-auto overflow-x-hidden overscroll-contain"
                          style={{ WebkitOverflowScrolling: "touch" }}
                        >
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
                                className="cursor-pointer text-base py-3"
                              >
                                <Check
                                  className={cn(
                                    "mr-3 h-5 w-5",
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
              <div className="space-y-3">
                <Label htmlFor="mobile_phone" className="text-base font-medium">
                  Teléfono Móvil
                </Label>
                <div className="flex gap-3">
                  <Input
                    value={formData.country_code}
                    readOnly
                    className="w-20 h-12 text-base rounded-2xl bg-muted/50 border-2 text-center"
                    placeholder="+XX"
                  />
                  <Input
                    id="mobile_phone"
                    type="tel"
                    value={formData.mobile_phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9\s]/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        mobile_phone: value,
                      }));
                    }}
                    placeholder="123 456 7890"
                    className="flex-1 h-12 text-base rounded-2xl border-2 focus:border-primary"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Género</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger className="w-full h-12 text-base rounded-2xl border-2">
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                    <SelectItem value="prefer_not_to_say">
                      Prefiero no decir
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="bg-background border-t p-6">
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 text-base font-medium rounded-2xl bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 shadow-lg"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                "¡Comenzar mi aventura!"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="w-full h-12 text-base rounded-2xl"
            >
              Completar después
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalInformationModal;
