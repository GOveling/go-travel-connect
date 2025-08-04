import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Loader } from '@/components/ui/loader';
import { Check, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TripEditFormProps {
  tripId?: string;
  onSaved?: (trip: any) => void;
}

export function TripEditForm({ tripId: propTripId, onSaved }: TripEditFormProps) {
  const navigate = useNavigate();
  const { tripId: paramTripId } = useParams();
  const { toast } = useToast();
  
  const tripId = propTripId || paramTripId;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [userRole, setUserRole] = useState('viewer');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    start_date: null as Date | null,
    end_date: null as Date | null,
  });

  // Fetch trip and user permissions
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        
        // Get auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Error",
            description: "Debes iniciar sesión para editar un viaje",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        // Get trip details
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single();

        if (tripError) throw tripError;

        // Determine user role
        let role = 'viewer';
        if (tripData.user_id === session.user.id) {
          role = 'owner';
        } else {
          const { data: memberData } = await supabase
            .from('trip_collaborators')
            .select('role')
            .eq('trip_id', tripId)
            .eq('user_id', session.user.id)
            .single();

          if (memberData) {
            role = memberData.role;
          }
        }

        // Set states
        setUserRole(role);
        setTrip(tripData);
        setFormData({
          name: tripData.name || '',
          description: tripData.description || '',
          location: tripData.location || '',
          start_date: tripData.start_date ? new Date(tripData.start_date) : null,
          end_date: tripData.end_date ? new Date(tripData.end_date) : null,
        });

        // Check permissions
        if (role !== 'owner' && role !== 'editor') {
          toast({
            title: "Permisos insuficientes",
            description: "No tienes permiso para editar este viaje",
            variant: "destructive",
          });
          navigate(`/trips/${tripId}`);
        }

      } catch (error) {
        console.error('Error fetching trip details:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del viaje",
          variant: "destructive",
        });
        navigate('/trips');
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId, navigate, toast]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle date changes
  const handleDateChange = (field: 'start_date' | 'end_date', date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date || null,
    }));
  };

  // Save changes to database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del viaje es obligatorio",
        variant: "destructive",
      });
      return;
    }

    // Validate dates
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      toast({
        title: "Error",
        description: "La fecha de inicio no puede ser posterior a la fecha de finalización",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Log antes de guardar para debugging
      console.log('Saving trip data:', {
        ...formData,
        start_date: formData.start_date?.toISOString(),
        end_date: formData.end_date?.toISOString(),
      });
      
      // Actualizar en Supabase
      const { data, error } = await supabase
        .from('trips')
        .update({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          start_date: formData.start_date?.toISOString(),
          end_date: formData.end_date?.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', tripId)
        .select();
      
      if (error) throw error;
      
      // Success message
      toast({
        title: "Cambios guardados",
        description: "Los cambios se han guardado correctamente",
      });
      
      // Execute callback if provided
      if (onSaved && data?.[0]) {
        onSaved(data[0]);
      }
      
      // Redirect back to trip view
      navigate(`/trips/${tripId}`);
      
    } catch (error) {
      console.error('Error saving trip:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Editar Viaje</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nombre del viaje*
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">
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
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium mb-1">
              Fecha de inicio
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.start_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.start_date ? format(formData.start_date, "PPP") : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.start_date || undefined}
                  onSelect={(date) => handleDateChange('start_date', date)}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium mb-1">
              Fecha de finalización
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.end_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.end_date ? format(formData.end_date, "PPP") : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.end_date || undefined}
                  onSelect={(date) => handleDateChange('end_date', date)}
                  disabled={(date) => formData.start_date ? date < formData.start_date : false}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Descripción
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Describe tu viaje..."
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/trips/${tripId}`)}
            disabled={saving}
          >
            <X className="w-4 h-4 mr-2" /> Cancelar
          </Button>
          
          <Button 
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <Loader className="w-4 h-4 mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Guardar cambios
          </Button>
        </div>
      </form>
    </Card>
  );
}