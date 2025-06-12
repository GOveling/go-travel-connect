
import { useState } from "react";

export const useNotifications = () => {
  const [notificationCount, setNotificationCount] = useState(5);

  return {
    notificationCount,
    setNotificationCount,
  };
};
