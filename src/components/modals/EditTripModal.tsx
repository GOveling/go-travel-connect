import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format, isPast, isFuture } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
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
  Trash2,
  Users,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Loader } from '@/components/ui/loader';

interface EditTripModalProps {
  trip: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTrip: any) => void;
}

export function EditTripModal({ trip, isOpen, onClose, onUpdate }: EditTripModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
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

  // Fetch trip data and user permissions
  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!trip || !user || !isOpen) return;

      try {
        setLoading(true);
        
        // Get user role
        let role = 'viewer';
        if (trip.user_id === user.id) {
          role = 'owner';
        } else {
          const { data: memberData, error: memberError } = await supabase
            .from('trip_collaborators')
            .select('role')
            .eq('trip_id', trip.id)
            .eq('user_id', user.id)
            .single();
            
          if (!memberError && memberData) {
            role = memberData.role;
          }
        }
        
        // Count members for traveler calculation
        const { count } = await supabase
          .from('trip_collaborators')
          .select('id', { count: 'exact', head: true })
          .eq('trip_id', trip.id);
        
        setUserRole(role);
        setMemberCount(count || 0);
        
        // Populate form data - adapt from existing trip structure
        setFormData({
          name: trip.name || '',
          description: trip.description || '',
          location: trip.location || (Array.isArray(trip.destination) ? trip.destination.join(', ') : trip.destination) || '',
          start_date: trip.start_date ? new Date(trip.start_date) : null,
          end_date: trip.end_date ? new Date(trip.end_date) : null,
          budget: trip.budget || '',
          accommodation: trip.accommodation || '',
          transportation: trip.transportation || '',
        });
        
      } catch (error) {
        console.error("Error fetching trip details:", error);
        toast({
          title: "Error",
          description: "Failed to load trip details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [trip, user, isOpen, toast]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle date changes
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
    return trip?.isGroupTrip ? memberCount + 1 : 1; // +1 for owner
  };

  // Save changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation error",
        description: "Trip name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Create update object with all fields
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
      
      console.log("Saving trip data:", updateData);
      
      // Update in database
      const { error } = await supabase
        .from('trips')
        .update(updateData)
        .eq('id', trip.id);
      
      if (error) throw error;
      
      toast({
        title: "Changes saved",
        description: "Your trip has been updated successfully",
      });

      // Update the trip data and close modal
      const updatedTrip = { ...trip, ...updateData };
      onUpdate(updatedTrip);
      onClose();
      
    } catch (error: any) {
      console.error("Error saving trip:", error);
      toast({
        title: "Save failed",
        description: error.message || "Could not save changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete trip
  const handleDeleteTrip = async () => {
    if (!trip?.id || userRole !== 'owner') return;
    
    try {
      setDeleting(true);
      
      // Delete trip (cascading should handle related records)
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', trip.id);
      
      if (error) throw error;
      
      toast({
        title: "Trip deleted",
        description: "Your trip has been permanently deleted",
      });
      
      // Close all modals and refresh
      setShowDeleteDialog(false);
      onClose();
      // Trigger a page refresh or data refetch
      window.dispatchEvent(new CustomEvent('tripDeleted', { detail: { tripId: trip.id } }));
      
    } catch (error: any) {
      console.error("Error deleting trip:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Could not delete trip",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Trip</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-8 w-8" />
            </div>
          ) : (
            <>
              {/* Status and travelers info */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Status:</span>
                  <Badge variant={
                    getTripStatus() === 'Complete' ? 'default' : 
                    getTripStatus() === 'Upcoming' ? 'secondary' : 'outline'
                  }>
                    {getTripStatus()}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {getTravelerCount()} {getTravelerCount() === 1 ? 'traveler' : 'travelers'}
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
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
                
                {/* Budget field */}
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
                
                {/* Accommodation field */}
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
                
                {/* Transportation field */}
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
                    rows={4}
                  />
                </div>
              </form>
              
              <DialogFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center"
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
                
                {/* Delete button */}
                {userRole === 'owner' && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full sm:w-auto flex items-center justify-center"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Trip
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trip? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
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
    </>
  );
}