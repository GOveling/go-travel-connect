import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Check, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TripOverview = ({
  trip,
  userRole,
  onUpdate
}: {
  trip: any;
  userRole: string;
  onUpdate: (trip: any) => void;
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: trip.name,
    description: trip.description || '',
    start_date: trip.start_date ? new Date(trip.start_date) : null,
    end_date: trip.end_date ? new Date(trip.end_date) : null,
    location: trip.location || '',
  });
  const [loading, setLoading] = useState(false);
  
  const canEdit = userRole === 'owner' || userRole === 'editor';
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (field: string, date: Date | null) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canEdit) {
      toast({
        title: "Permiso denegado",
        description: "No tienes permisos para editar este viaje",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('trips')
        .update({
          name: formData.name,
          description: formData.description,
          start_date: formData.start_date?.toISOString(),
          end_date: formData.end_date?.toISOString(),
          location: formData.location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', trip.id);
        
      if (error) throw error;
      
      toast({
        title: "Cambios guardados",
        description: "La información del viaje ha sido actualizada"
      });
      
      // Actualizar en el estado padre
      onUpdate({
        ...trip,
        ...formData,
        start_date: formData.start_date?.toISOString(),
        end_date: formData.end_date?.toISOString()
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating trip:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const formatDateRange = () => {
    if (!trip.start_date) return 'Fechas no definidas';
    
    const start = new Date(trip.start_date);
    if (!trip.end_date) return format(start, 'PPP');
    
    const end = new Date(trip.end_date);
    return `${format(start, 'PPP')} - ${format(end, 'PPP')}`;
  };
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">{trip.name}</h2>
          <p className="text-muted-foreground text-sm">{formatDateRange()}</p>
          {trip.location && (
            <p className="text-muted-foreground text-sm mt-1">{trip.location}</p>
          )}
        </div>
        {canEdit && !isEditing && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1"
          >
            <Pencil className="h-4 w-4" />
            <span>Editar</span>
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Ubicación</label>
            <Input 
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ciudad, País"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha inicial</label>
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
                    onSelect={date => handleDateChange('start_date', date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Fecha final</label>
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
                    onSelect={date => handleDateChange('end_date', date)}
                    initialFocus
                    disabled={date => !formData.start_date || date < formData.start_date}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe tu viaje..."
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: trip.name,
                  description: trip.description || '',
                  start_date: trip.start_date ? new Date(trip.start_date) : null,
                  end_date: trip.end_date ? new Date(trip.end_date) : null,
                  location: trip.location || '',
                });
              }}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
            
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>Guardando...</>
              ) : (
                <><Check className="h-4 w-4 mr-1" /> Guardar</>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Acerca de este viaje</h3>
          <p className="text-muted-foreground">
            {trip.description || 'Sin descripción'}
          </p>
        </div>
      )}
    </Card>
  );
};