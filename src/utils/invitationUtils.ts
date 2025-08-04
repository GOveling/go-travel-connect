import { supabase } from '@/integrations/supabase/client';

export interface InvitationData {
  id: string;
  trip_id: string;
  inviter_id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  created_at: string;
  expires_at: string;
}

export interface FormattedInvitation {
  id: string;
  trip_id: string;
  trip_name: string;
  inviter_name: string;
  role: string;
  created_at: string;
  expires_at: string;
  token: string;
}

export async function formatInvitationWithDetails(invitation: InvitationData): Promise<FormattedInvitation> {
  // Fetch trip details
  const { data: tripData } = await supabase
    .from('trips')
    .select('name')
    .eq('id', invitation.trip_id)
    .single();
    
  // Fetch inviter details
  const { data: inviterData } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', invitation.inviter_id)
    .single();

  return {
    id: invitation.id,
    trip_id: invitation.trip_id,
    trip_name: tripData?.name || 'Unknown Trip',
    inviter_name: inviterData?.full_name || 'Unknown User',
    role: invitation.role,
    created_at: invitation.created_at,
    expires_at: invitation.expires_at,
    token: invitation.token
  };
}

export async function formatInvitationsWithDetails(invitations: InvitationData[]): Promise<FormattedInvitation[]> {
  const formattedInvitations: FormattedInvitation[] = [];
  
  for (const invitation of invitations) {
    const formatted = await formatInvitationWithDetails(invitation);
    formattedInvitations.push(formatted);
  }
  
  return formattedInvitations;
}