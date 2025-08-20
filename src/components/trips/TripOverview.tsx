import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, Plane, Hotel, CreditCard } from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateTripStatus, getStatusDisplayText } from '@/utils/tripStatusUtils';

export const TripOverview = ({
  trip,
  userRole,
  onUpdate
}: {
  trip: any;
  userRole: string;
  onUpdate: (trip: any) => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const canEdit = userRole === 'owner' || userRole === 'editor';

  // Fetch member count for traveler calculation
  useEffect(() => {
    const fetchMemberCount = async () => {
      if (!trip.id) return;
      
      try {
        const { count } = await supabase
          .from('trip_collaborators')
          .select('id', { count: 'exact', head: true })
          .eq('trip_id', trip.id);
        
        setMemberCount(count || 0);
      } catch (error) {
        console.error('Error fetching member count:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemberCount();
  }, [trip.id]);

  // Get trip status using the same logic as the map
  const getTripStatus = () => {
    const status = calculateTripStatus({
      startDate: trip.start_date ? new Date(trip.start_date) : undefined,
      endDate: trip.end_date ? new Date(trip.end_date) : undefined
    });
    return getStatusDisplayText(status);
  };

  // Get status color to match map view
  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'upcoming':
        return 'bg-green-500';
      case 'planning':
        return 'bg-purple-600';
      case 'traveling':
      case 'in progress':
        return 'bg-blue-500';
      case 'completed':
      case 'complete':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'upcoming':
        return 'default';
      case 'planning':
        return 'secondary';
      case 'traveling':
      case 'in progress':
        return 'outline';
      case 'completed':
      case 'complete':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  // Get traveler count
  const getTravelerCount = () => {
    return trip.type === 'solo' || !trip.is_group_trip ? 1 : memberCount + 1; // +1 for owner
  };
  
  // Get badge color based on role
  const getBadgeProps = () => {
    switch(userRole) {
      case 'owner':
        return { variant: 'default' as const, label: 'Owner' };
      case 'editor':
        return { variant: 'secondary' as const, label: 'Editor' };
      default:
        return { variant: 'outline' as const, label: 'Viewer' };
    }
  };
  
  // Format date range
  const getDateRange = () => {
    if (!trip.start_date) return 'No dates set';
    
    const startDate = format(new Date(trip.start_date), 'MMM d, yyyy');
    if (!trip.end_date) return startDate;
    
    const endDate = format(new Date(trip.end_date), 'MMM d, yyyy');
    return `${startDate} - ${endDate}`;
  };
  
  return (
    <Card className="p-6">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{trip.name}</h2>
            <div className="flex items-center space-x-2">
              <Badge variant={getBadgeProps().variant}>
                {getBadgeProps().label}
              </Badge>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(getTripStatus())}`}></div>
                <Badge variant={getStatusBadgeVariant(getTripStatus())}>
                  {getTripStatus()}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Dates</p>
                <p className="text-sm text-muted-foreground">{getDateRange()}</p>
              </div>
            </div>
            
            {trip.location && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{trip.location}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Travelers</p>
                <p className="text-sm text-muted-foreground">
                  {getTravelerCount()} {getTravelerCount() === 1 ? 'traveler' : 'travelers'}
                </p>
              </div>
            </div>
            
            {trip.budget && (
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Budget</p>
                  <p className="text-sm text-muted-foreground">{trip.budget}</p>
                </div>
              </div>
            )}
            
            {trip.accommodation && (
              <div className="flex items-start space-x-3">
                <Hotel className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Accommodation</p>
                  <p className="text-sm text-muted-foreground">{trip.accommodation}</p>
                </div>
              </div>
            )}
            
            {trip.transportation && (
              <div className="flex items-start space-x-3">
                <Plane className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Transportation</p>
                  <p className="text-sm text-muted-foreground">{trip.transportation}</p>
                </div>
              </div>
            )}
            
            {/* Description section */}
            {trip.description && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {trip.description}
                </p>
              </div>
            )}
            
          </div>
        </>
      )}
    </Card>
  );
};