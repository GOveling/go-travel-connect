import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

interface InvitationHandlerProps {
  token: string;
}

export const InvitationHandler: React.FC<InvitationHandlerProps> = ({ token }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleInvitation = async () => {
      if (!token) return;
      
      try {
        // Verificar si la invitación es válida
        const { data: invitation, error: invError } = await supabase
          .from('trip_invitations')
          .select(`
            *,
            trips:trip_id (
              id,
              name,
              description,
              saved_places,
              trip_info
            ),
            sender:sender_id (
              full_name
            )
          `)
          .eq('token', token)
          .single();

        if (invError || !invitation) {
          throw new Error('Invitación inválida o expirada');
        }

        // Verificar si el usuario ya está autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        // Redirigir directamente al trip
        router.push(`/trips/${invitation.trips.id}`);
        
        // Actualizar estado de la invitación
        await supabase
          .from('trip_invitations')
          .update({ 
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })
          .eq('token', token);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    handleInvitation();
  }, [token, router]);

  if (loading) {
    return <div>Procesando invitación...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return null;
};
