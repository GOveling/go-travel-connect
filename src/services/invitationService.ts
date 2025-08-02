import { supabase } from '@/lib/supabase';

export const invitationService = {
  async sendInvitation({ tripId, email, role, message }) {
    // Obtener detalles del viaje
    const { data: trip } = await supabase
      .from('trips')
      .select('name, description')
      .eq('id', tripId)
      .single();

    // Crear invitación
    const { data: invitation, error } = await supabase
      .from('trip_invitations')
      .insert({
        trip_id: tripId,
        recipient_email: email,
        role,
        message,
        status: 'pending',
        trip_name: trip.name
      })
      .select()
      .single();

    if (error) throw error;

    // Enviar email (usando Edge Function)
    await supabase.functions.invoke('send-invitation-email', {
      body: { 
        invitation,
        tripDetails: trip
      }
    });

    return invitation;
  },

  async acceptInvitation(token: string) {
    const { data, error } = await supabase
      .from('trip_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('token', token)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async declineInvitation(token: string) {
    const { data, error } = await supabase
      .from('trip_invitations')
      .update({
        status: 'declined',
        declined_at: new Date().toISOString()
      })
      .eq('token', token)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
