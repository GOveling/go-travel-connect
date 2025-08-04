import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface InvitationProps {
  token: string;
  tripName: string;
  inviterName: string;
  role: string;
}

export const ActiveInvitations = ({ 
  invitations = [],
  onAccepted,
  onDeclined,
  className
}: { 
  invitations: InvitationProps[],
  onAccepted?: (tripId: string) => void,
  onDeclined?: () => void,
  className?: string
}) => {
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAccept = async (token: string, tripName: string) => {
    if (!user) return;
    
    setProcessing(token);
    try {
      console.log('Accepting invitation', { token, userEmail: user.email });

      // Paso 1: Verificar que la invitación existe y corresponde al usuario
      const { data: invitation, error: fetchError } = await supabase
        .from('trip_invitations')
        .select(`
          id, 
          trip_id,
          role,
          email,
          status,
          expires_at,
          trips:trip_id (
            id,
            name
          )
        `)
        .eq('token', token)
        .single();

      console.log('Invitation data:', invitation);
      console.log('Fetch error:', fetchError);

      // Validación exhaustiva
      if (fetchError || !invitation) {
        throw new Error('No se encontró la invitación');
      }

      if (invitation.status !== 'pending') {
        throw new Error('La invitación ya fue respondida');
      }

      // Verificar que no haya expirado
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('La invitación ha expirado');
      }

      if (invitation.email?.toLowerCase() !== user.email?.toLowerCase()) {
        throw new Error('Esta invitación no corresponde a tu cuenta');
      }

      // Paso 2: Actualizar el estado de la invitación
      const { error: updateError } = await supabase
        .from('trip_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: user.id
        })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
        throw new Error('Error al actualizar la invitación');
      }

      // Paso 3: Obtener el nombre del perfil del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Agregar el usuario como colaborador del trip
      const { error: collaboratorError } = await supabase
        .from('trip_collaborators')
        .insert({
          trip_id: invitation.trip_id,
          user_id: user.id,
          role: invitation.role,
          email: user.email,
          name: profile?.full_name || user.email || 'Usuario'
        });

      if (collaboratorError) {
        console.error('Error adding collaborator:', collaboratorError);
        throw new Error('Error al agregarte como colaborador');
      }

      // Paso 4: Actualizar el tipo de viaje a "group"
      await supabase
        .from('trips')
        .update({ is_group_trip: true })
        .eq('id', invitation.trip_id);

      // Éxito
      toast({
        title: "¡Te has unido al viaje!",
        description: `Ahora eres colaborador de "${tripName}"`,
      });

      if (onAccepted) onAccepted(invitation.trip_id);
      
      // Redireccionar al usuario al viaje
      navigate(`/?tab=trips`);

    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error al aceptar invitación",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (token: string) => {
    if (!user) return;
    
    setProcessing(token);
    try {
      const { data: invitation, error: fetchError } = await supabase
        .from('trip_invitations')
        .select('id, email, status')
        .eq('token', token)
        .single();

      if (fetchError || !invitation) {
        throw new Error('No se encontró la invitación');
      }

      if (invitation.status !== 'pending') {
        throw new Error('La invitación ya fue respondida');
      }

      if (invitation.email?.toLowerCase() !== user.email?.toLowerCase()) {
        throw new Error('Esta invitación no corresponde a tu cuenta');
      }

      const { error: updateError } = await supabase
        .from('trip_invitations')
        .update({ 
          status: 'declined'
        })
        .eq('id', invitation.id);

      if (updateError) {
        throw new Error('Error al declinar la invitación');
      }

      toast({
        title: "Invitación declinada",
        description: "Has rechazado la invitación al viaje",
      });

      if (onDeclined) onDeclined();

    } catch (error: any) {
      console.error('Error declining invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  if (!invitations.length) {
    return null;
  }

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="font-medium mb-3">Invitaciones activas</h3>
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <div key={invitation.token} className="border-b pb-4 last:border-0 last:pb-0">
            <h4 className="font-medium">{invitation.tripName}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              {invitation.inviterName} te ha invitado como {invitation.role === 'editor' ? 'editor' : 'espectador'}
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={() => handleAccept(invitation.token, invitation.tripName)}
                disabled={!!processing}
                className="bg-primary hover:bg-primary/90"
              >
                {processing === invitation.token ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aceptando...</>
                ) : (
                  'Aceptar'
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(invitation.token)}
                disabled={!!processing}
              >
                {processing === invitation.token ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Declinando...</>
                ) : (
                  'Declinar'
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActiveInvitations;