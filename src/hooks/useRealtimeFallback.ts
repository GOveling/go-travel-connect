import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para manejar fallback cuando realtime no funciona
 * Implementa polling como respaldo
 */
export const useRealtimeFallback = (
  isRealtimeWorking: boolean,
  fallbackFunction: () => Promise<void>,
  intervalMs: number = 30000 // 30 segundos por defecto
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;
    
    console.log('🔄 Starting fallback polling for realtime');
    isPollingRef.current = true;
    
    intervalRef.current = setInterval(async () => {
      try {
        await fallbackFunction();
      } catch (error) {
        console.error('❌ Fallback polling error:', error);
      }
    }, intervalMs);
  }, [fallbackFunction, intervalMs]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      console.log('⏹️ Stopping fallback polling');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      isPollingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isRealtimeWorking) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [isRealtimeWorking, startPolling, stopPolling]);

  return { startPolling, stopPolling };
};