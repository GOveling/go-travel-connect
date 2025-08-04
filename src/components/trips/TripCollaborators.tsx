import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Mail, Crown, Users, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TripCollaboratorsProps {
  collaborators: any[];
  tripId: string;
  userRole: string;
  onUpdate: () => void;
}

export const TripCollaborators = ({ 
  collaborators, 
  tripId, 
  userRole, 
  onUpdate 
}: TripCollaboratorsProps) => {
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const canManageCollaborators = userRole === 'owner';

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('send_trip_invitation', {
        p_trip_id: tripId,
        p_email: inviteEmail,
        p_role: 'editor'
      });

      if (error) throw error;

      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${inviteEmail}`,
      });

      setInviteEmail('');
      setIsInviting(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error al enviar invitación",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'owner': return 'Propietario';
      case 'editor': return 'Editor';
      case 'viewer': return 'Espectador';
      default: return 'Desconocido';
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Colaboradores del viaje</h3>
        {canManageCollaborators && (
          <Button onClick={() => setIsInviting(!isInviting)}>
            <Plus className="h-4 w-4 mr-2" />
            Invitar colaborador
          </Button>
        )}
      </div>

      {isInviting && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invitar nuevo colaborador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Email del colaborador
              </label>
              <Input
                type="email"
                placeholder="colaborador@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleInvite} disabled={loading}>
                <Mail className="h-4 w-4 mr-2" />
                {loading ? 'Enviando...' : 'Enviar invitación'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsInviting(false);
                  setInviteEmail('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {collaborators.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay colaboradores</h3>
              <p className="text-muted-foreground">
                Este viaje aún no tiene colaboradores invitados.
              </p>
            </CardContent>
          </Card>
        ) : (
          collaborators.map((collaborator: any) => (
            <Card key={collaborator.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={collaborator.avatar_url} />
                    <AvatarFallback>
                      {getInitials(collaborator.full_name || collaborator.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {collaborator.full_name || collaborator.email}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {collaborator.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleColor(collaborator.role)}>
                    {collaborator.role === 'owner' && (
                      <Crown className="h-3 w-3 mr-1" />
                    )}
                    {getRoleText(collaborator.role)}
                  </Badge>
                  {canManageCollaborators && collaborator.role !== 'owner' && (
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};