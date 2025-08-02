import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Invitation {
  id: string;
  recipient_email: string;
  status: 'pending' | 'accepted' | 'declined';
  role: 'editor' | 'viewer';
}

export const ActiveInvitations: React.FC<{ tripId: string }> = ({ tripId }) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    // Cargar invitaciones iniciales
    const loadInvitations = async () => {
      const { data } = await supabase
        .from('trip_invitations')
        .select('*, recipient:recipient_email (full_name)')
        .eq('trip_id', tripId);
      
      setInvitations(data || []);
    };

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel(`trip-invitations-${tripId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'trip_invitations',
        filter: `trip_id=eq.${tripId}`
      }, (payload) => {
        setInvitations(current => 
          current.map(inv => 
            inv.id === payload.new.id ? payload.new : inv
          )
        );
      })
      .subscribe();

    loadInvitations();

    return () => {
      subscription.unsubscribe();
    };
  }, [tripId]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-gray-500', text: 'Pendiente' },
      accepted: { color: 'bg-green-500', text: 'Aceptada' },
      declined: { color: 'bg-orange-500', text: 'Declinada' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <div className={`${config.color} text-white px-2 py-1 rounded-full text-sm`}>
        {config.text}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {invitations.map(invitation => (
        <div key={invitation.id} 
             className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
          <div className="flex flex-col">
            <span className="font-medium">{invitation.recipient_email}</span>
            <span className="text-sm text-gray-500">
              {invitation.role === 'editor' ? 'Editor' : 'Viewer'}
            </span>
          </div>
          {getStatusBadge(invitation.status)}
        </div>
      ))}
    </div>
  );
};
