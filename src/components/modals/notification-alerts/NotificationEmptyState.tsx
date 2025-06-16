
import { Bell } from "lucide-react";

const NotificationEmptyState = () => {
  return (
    <div className="text-center py-8">
      <Bell size={48} className="text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">No notifications yet</p>
    </div>
  );
};

export default NotificationEmptyState;
