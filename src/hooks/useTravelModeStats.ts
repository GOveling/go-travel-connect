import { useCallback, useEffect, useState } from "react";

interface TravelStats {
  totalDistance: number;
  visitedPlaces: number;
  travelTime: number;
  activeSessions: number;
  nearbyPlacesFound: number;
  notificationsSent: number;
}

interface TravelSession {
  id: string;
  startTime: number;
  endTime?: number;
  distance: number;
  placesVisited: string[];
  notifications: number;
}

const STORAGE_KEY = "travel_mode_stats";
const SESSIONS_KEY = "travel_mode_sessions";

export const useTravelModeStats = () => {
  const [stats, setStats] = useState<TravelStats>({
    totalDistance: 0,
    visitedPlaces: 0,
    travelTime: 0,
    activeSessions: 0,
    nearbyPlacesFound: 0,
    notificationsSent: 0,
  });

  const [currentSession, setCurrentSession] = useState<TravelSession | null>(
    null
  );
  const [sessions, setSessions] = useState<TravelSession[]>([]);

  // Load stats from localStorage
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem(STORAGE_KEY);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }

      const savedSessions = localStorage.getItem(SESSIONS_KEY);
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
      }
    } catch (error) {
      console.error("Error loading travel stats:", error);
    }
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((newStats: TravelStats) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error("Error saving travel stats:", error);
    }
  }, []);

  // Save sessions to localStorage
  const saveSessions = useCallback((newSessions: TravelSession[]) => {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
      setSessions(newSessions);
    } catch (error) {
      console.error("Error saving travel sessions:", error);
    }
  }, []);

  // Start a new travel session
  const startSession = useCallback(() => {
    const newSession: TravelSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      distance: 0,
      placesVisited: [],
      notifications: 0,
    };

    setCurrentSession(newSession);

    const updatedStats = {
      ...stats,
      activeSessions: stats.activeSessions + 1,
    };
    saveStats(updatedStats);

    console.log("📊 Travel session started:", newSession.id);
  }, [stats, saveStats]);

  // End current travel session
  const endSession = useCallback(() => {
    if (!currentSession) return;

    const endedSession: TravelSession = {
      ...currentSession,
      endTime: Date.now(),
    };

    const sessionDuration =
      (endedSession.endTime! - endedSession.startTime) / 1000;

    const updatedSessions = [...sessions, endedSession];
    saveSessions(updatedSessions);

    const updatedStats = {
      ...stats,
      totalDistance: stats.totalDistance + endedSession.distance,
      visitedPlaces: stats.visitedPlaces + endedSession.placesVisited.length,
      travelTime: stats.travelTime + sessionDuration,
      notificationsSent: stats.notificationsSent + endedSession.notifications,
    };
    saveStats(updatedStats);

    setCurrentSession(null);
    console.log("📊 Travel session ended:", endedSession.id, {
      duration: sessionDuration,
      distance: endedSession.distance,
      places: endedSession.placesVisited.length,
    });
  }, [currentSession, sessions, stats, saveSessions, saveStats]);

  // Update current session distance
  const updateSessionDistance = useCallback(
    (distance: number) => {
      if (!currentSession) return;

      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              distance: prev.distance + distance,
            }
          : null
      );
    },
    [currentSession]
  );

  // Mark place as visited in current session
  const markPlaceVisited = useCallback(
    (placeId: string) => {
      if (!currentSession) return;

      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              placesVisited: [...new Set([...prev.placesVisited, placeId])],
            }
          : null
      );

      console.log("📍 Place marked as visited:", placeId);
    },
    [currentSession]
  );

  // Increment notification count
  const incrementNotifications = useCallback(() => {
    if (!currentSession) return;

    setCurrentSession((prev) =>
      prev
        ? {
            ...prev,
            notifications: prev.notifications + 1,
          }
        : null
    );

    // Also update global stats immediately
    const updatedStats = {
      ...stats,
      notificationsSent: stats.notificationsSent + 1,
    };
    saveStats(updatedStats);
  }, [currentSession, stats, saveStats]);

  // Update nearby places found
  const updateNearbyPlaces = useCallback(
    (count: number) => {
      const updatedStats = {
        ...stats,
        nearbyPlacesFound: Math.max(stats.nearbyPlacesFound, count),
      };
      saveStats(updatedStats);
    },
    [stats, saveStats]
  );

  // Get session duration
  const getSessionDuration = useCallback(() => {
    if (!currentSession) return 0;
    return (Date.now() - currentSession.startTime) / 1000;
  }, [currentSession]);

  // Get formatted session duration
  const getFormattedSessionDuration = useCallback(() => {
    const duration = getSessionDuration();
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [getSessionDuration]);

  // Get recent sessions (last 7 days)
  const getRecentSessions = useCallback(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return sessions.filter((session) => session.startTime > sevenDaysAgo);
  }, [sessions]);

  // Calculate average session duration
  const getAverageSessionDuration = useCallback(() => {
    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((sum, session) => {
      if (session.endTime) {
        return sum + (session.endTime - session.startTime) / 1000;
      }
      return sum;
    }, 0);

    return totalDuration / sessions.length;
  }, [sessions]);

  // Format distance for display
  const formatDistance = useCallback((distance: number): string => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }
    return `${Math.round(distance)} m`;
  }, []);

  // Format time for display
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  // Reset all stats
  const resetStats = useCallback(() => {
    const emptyStats: TravelStats = {
      totalDistance: 0,
      visitedPlaces: 0,
      travelTime: 0,
      activeSessions: 0,
      nearbyPlacesFound: 0,
      notificationsSent: 0,
    };

    saveStats(emptyStats);
    saveSessions([]);
    setCurrentSession(null);
    console.log("📊 Travel stats reset");
  }, [saveStats, saveSessions]);

  return {
    // State
    stats,
    currentSession,
    sessions,

    // Session management
    startSession,
    endSession,
    getSessionDuration,
    getFormattedSessionDuration,

    // Session updates
    updateSessionDistance,
    markPlaceVisited,
    incrementNotifications,
    updateNearbyPlaces,

    // Data retrieval
    getRecentSessions,
    getAverageSessionDuration,

    // Utilities
    formatDistance,
    formatTime,
    resetStats,
  };
};
