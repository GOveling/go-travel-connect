import { invitationService } from '@/services/invitationService';

interface TripInviteNotificationProps {
  notification: {
    id: string;
    trip_name: string;
    sender_name: string;
    token: string;
  };
  onAccept?: () => void;
  onDecline?: () => void;
}

export const TripInviteNotification: React.FC<TripInviteNotificationProps> = ({ 
  notification,
  onAccept,
  onDecline 
}) => {
  const handleAcceptInvitation = async () => {
    try {
      await invitationService.acceptInvitation(notification.token);
      onAccept?.();
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleDeclineInvitation = async () => {
    try {
      await invitationService.declineInvitation(notification.token);
      onDecline?.();
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex flex-col">
        <p className="font-medium">
          Invitación al viaje: {notification.trip_name}
        </p>
        <p className="text-sm text-gray-500">
          De: {notification.sender_name}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleAcceptInvitation}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Aceptar
        </button>
        <button
          onClick={handleDeclineInvitation}
          className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          Declinar
        </button>
      </div>
    </div>
  );
};
