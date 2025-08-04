import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isPast, isFuture } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  CalendarIcon, 
  Save, 
  ArrowLeft, 
  Trash2,
  Users,
  AlertTriangle
} from 'lucide-react';
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
  const [memberCount, setMemberCount] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    start_date: null as Date | null,
    end_date: null as Date | null,
    budget: '',
    accommodation: '',
    transportation: '',
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
        
        // Count members for traveler calculation
        const { count } = await supabase
          .from('trip_collaborators')
          .select('id', { count: 'exact', head: true })
          .eq('trip_id', tripId);
        
        setUserRole(role);
        setTrip(tripData);
        setMemberCount(count || 0);
        
        // 3. Inicializar formulario con datos existentes
        setFormData({
          name: tripData.name || '',
          description: tripData.description || '',
          location: tripData.location || '',
          start_date: tripData.start_date ? new Date(tripData.start_date) : null,
          end_date: tripData.end_date ? new Date(tripData.end_date) : null,
          budget: tripData.budget || '',
          accommodation: tripData.accommodation || '',
          transportation: tripData.transportation || '',
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

  // Get trip status based on dates
  const getTripStatus = () => {
    if (!formData.start_date) return 'Planning';
    
    if (formData.end_date && isPast(formData.end_date)) return 'Complete';
    if (isFuture(formData.start_date)) return 'Upcoming';
    return 'In Progress';
  };
  
  // Get traveler count
  const getTravelerCount = () => {
    return trip?.type === 'solo' || !trip?.is_group_trip ? 1 : memberCount + 1; // +1 for owner
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
      
      // Preparar datos para actualización con todos los campos
      const updateData = {
        name: formData.name,
        description: formData.description || '',
        location: formData.location || '',
        start_date: formData.start_date?.toISOString(),
        end_date: formData.end_date?.toISOString(),
        budget: formData.budget || '',
        accommodation: formData.accommodation || '',
        transportation: formData.transportation || '',
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

  // Delete trip
  const handleDeleteTrip = async () => {
    if (!tripId || userRole !== 'owner') return;
    
    try {
      setDeleting(true);
      
      // Delete trip (cascading should handle related records)
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);
      
      if (error) throw error;
      
      toast({
        title: "Trip deleted",
        description: "Your trip has been permanently deleted",
      });
      
      // Return to trips list
      navigate('/trips');
      
    } catch (error: any) {
      console.error("Error deleting trip:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Could not delete trip",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
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
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/trips/${tripId}`)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to trip
        </Button>
        
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Trip</h1>
          
          {/* Status and travelers info */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={
                getTripStatus() === 'Complete' ? 'default' : 
                getTripStatus() === 'Upcoming' ? 'secondary' : 'outline'
              }>
                {getTripStatus()}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {getTravelerCount()} {getTravelerCount() === 1 ? 'traveler' : 'travelers'}
              </span>
            </div>
          </div>
        
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Trip Name*
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
                Location
              </label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Start Date
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
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date || undefined}
                      onSelect={(date) => handleDateChange("start_date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  End Date
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
                        <span>Select date</span>
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
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Budget field - Now properly saved */}
            <div className="space-y-2">
              <label htmlFor="budget" className="text-sm font-medium">
                Budget
              </label>
              <Input
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. $1000"
              />
            </div>
            
            {/* Accommodation field - Now properly saved */}
            <div className="space-y-2">
              <label htmlFor="accommodation" className="text-sm font-medium">
                Accommodation
              </label>
              <Input
                id="accommodation"
                name="accommodation"
                value={formData.accommodation}
                onChange={handleChange}
                placeholder="e.g. Hotel, Airbnb"
              />
            </div>
            
            {/* Transportation field - Now properly saved */}
            <div className="space-y-2">
              <label htmlFor="transportation" className="text-sm font-medium">
                Transportation
              </label>
              <Input
                id="transportation"
                name="transportation"
                value={formData.transportation}
                onChange={handleChange}
                placeholder="e.g. Flight, Train, Car"
              />
            </div>
            
            {/* Description field */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your trip..."
                rows={5}
              />
            </div>
          
            {/* Action buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/trips/${tripId}`)}
                disabled={saving}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit"
                disabled={saving}
                className="flex items-center"
              >
                {saving ? (
                  <>
                    <Loader className="mr-2 h-4 w-4" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Delete button moved to bottom */}
            {userRole === 'owner' && (
              <div className="pt-8 border-t mt-8">
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full sm:w-auto flex items-center justify-center"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Trip
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trip? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTrip}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader className="mr-2 h-4 w-4" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Delete Trip"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}