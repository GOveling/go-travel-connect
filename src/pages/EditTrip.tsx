import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Loader } from '@/components/ui/loader';

export default function EditTrip() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    start_date: null as Date | null,
    end_date: null as Date | null,
  });

  // Verificar permisos y cargar datos del trip
  useEffect(() => {
    const fetchTripAndPermissions = async () => {
      if (!tripId || !user) return;

      try {
        setLoading(true);
        
        // 1. Verificar si el usuario es el propietario
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single();
          
        if (tripError) throw tripError;
        
        let role = 'viewer';
        if (tripData.user_id === user.id) {
          role = 'owner';
        } else {
          // 2. Verificar si el usuario es un colaborador usando la función existente
          const { data: canEdit } = await supabase.rpc('can_edit_trip', {
            p_trip_id: tripId,
            p_user_id: user.id
          });
          
          if (canEdit) {
            // Obtener el rol específico del colaborador
            const { data: memberData, error: memberError } = await supabase
              .from('trip_collaborators')
              .select('role')
              .eq('trip_id', tripId)
              .eq('user_id', user.id)
              .single();
              
            if (!memberError && memberData) {
              role = memberData.role;
            }
          }
        }
        
        setUserRole(role);
        setTrip(tripData);
        
        // 3. Inicializar formulario con datos existentes
        setFormData({
          name: tripData.name || '',
          description: tripData.description || '',
          location: tripData.location || '',
          start_date: tripData.start_date ? new Date(tripData.start_date) : null,
          end_date: tripData.end_date ? new Date(tripData.end_date) : null,
        });
        
        // 4. Verificar permisos de edición
        if (role !== 'owner' && role !== 'editor') {
          toast({
            title: "Acceso denegado",
            description: "No tienes permisos para editar este viaje",
            variant: "destructive",
          });
          navigate(`/trips/${tripId}`);
        }
        
        console.log("Rol del usuario:", role);
        console.log("Datos del viaje:", tripData);
        
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del viaje",
          variant: "destructive",
        });
        navigate('/trips');
      } finally {
        setLoading(false);
      }
    };

    fetchTripAndPermissions();
  }, [tripId, user, navigate, toast]);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejar cambios de fecha
  const handleDateChange = (field: string, date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  // Guardar cambios en la base de datos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.name?.trim()) {
      toast({
        title: "Error",
        description: "El nombre del viaje es obligatorio",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Preparar datos para actualización
      const updateData = {
        name: formData.name,
        description: formData.description || '',
        location: formData.location || '',
        start_date: formData.start_date?.toISOString(),
        end_date: formData.end_date?.toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log("Guardando datos:", updateData);
      
      // Actualizar en Supabase
      const { data, error } = await supabase
        .from('trips')
        .update(updateData)
        .eq('id', tripId)
        .select();
      
      if (error) {
        console.error("Error al guardar:", error);
        throw error;
      }
      
      console.log("Respuesta de Supabase:", data);
      
      // Notificación de éxito
      toast({
        title: "Cambios guardados",
        description: "Los cambios se han guardado correctamente",
      });
      
      // Regresar a la vista detallada
      navigate(`/trips/${tripId}`);
      
    } catch (error: any) {
      console.error("Error al guardar cambios:", error);
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(`/trips/${tripId}`)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al viaje
      </Button>
      
      <Card className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Editar viaje</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre del viaje *
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Ubicación
            </label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ciudad, País"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Fecha de inicio
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? (
                      format(formData.start_date, "PPP")
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date || undefined}
                    onSelect={(date) => handleDateChange("start_date", date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Fecha de fin
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? (
                      format(formData.end_date, "PPP")
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date || undefined}
                    onSelect={(date) => handleDateChange("end_date", date)}
                    initialFocus
                    disabled={(date) => 
                      !formData.start_date || date < formData.start_date
                    }
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descripción
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe tu viaje..."
              rows={6}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/trips/${tripId}`)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={saving}
              className="flex items-center"
            >
              {saving ? (
                <>
                  <Loader className="mr-2" size={16} />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  <span>Guardar cambios</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}