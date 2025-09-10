import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Settings, MapPin, Users } from "lucide-react";
import { InviteCollaboratorModal } from "./InviteCollaboratorModal";
import { TripLocationsModal } from "@/components/modals/TripLocationsModal";
import { ManageTeam } from "@/components/teams/ManageTeam";
import { useAuth } from "@/hooks/useAuth";

interface CollaboratorProps {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: string;
  isOwner: boolean;
}

export const TripCollaborators = ({
  collaborators = [],
  tripId,
  userRole,
  onUpdate,
}: {
  collaborators: CollaboratorProps[];
  tripId: string;
  userRole: string;
  onUpdate: () => void;
}) => {
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLocationsModal, setShowLocationsModal] = useState(false);
  const [showManageTeamModal, setShowManageTeamModal] = useState(false);

  const getRoleBadge = (role: string) => {
    if (role === "owner")
      return <Badge className="bg-primary">Propietario</Badge>;
    if (role === "editor") return <Badge className="bg-blue-500">Editor</Badge>;
    return <Badge className="bg-gray-500">Espectador</Badge>;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const canInvite = userRole === "owner" || userRole === "editor";

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Colaboradores ({collaborators.length})
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLocationsModal(true)}
            className="flex items-center gap-1"
          >
            <MapPin className="h-4 w-4" />
            <span>Ubicaciones</span>
          </Button>
          {canInvite && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManageTeamModal(true)}
              className="flex items-center gap-1"
            >
              <Users className="h-4 w-4" />
              <span>Manage Team</span>
            </Button>
          )}
          {canInvite && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Invitar</span>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="flex items-center justify-between p-3 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                {collaborator.avatar_url ? (
                  <AvatarImage
                    src={collaborator.avatar_url}
                    alt={collaborator.full_name}
                  />
                ) : (
                  <AvatarFallback>
                    {getInitials(collaborator.full_name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-medium">{collaborator.full_name}</p>
                <p className="text-sm text-gray-500">{collaborator.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getRoleBadge(collaborator.role)}
              {userRole === "owner" && !collaborator.isOwner && (
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {collaborators.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No hay colaboradores en este viaje.</p>
          </div>
        )}
      </div>

      {showInviteModal && (
        <InviteCollaboratorModal
          tripId={tripId}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => {
            setShowInviteModal(false);
            onUpdate();
          }}
        />
      )}

      {showLocationsModal && (
        <TripLocationsModal
          isOpen={showLocationsModal}
          onClose={() => setShowLocationsModal(false)}
          tripId={tripId}
          collaborators={collaborators}
        />
      )}

      {showManageTeamModal && (
        <ManageTeam
          tripId={tripId}
          isOpen={showManageTeamModal}
          onClose={() => setShowManageTeamModal(false)}
          refreshData={onUpdate}
        />
      )}
    </div>
  );
};
