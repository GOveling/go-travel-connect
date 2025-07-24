import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  setApiLoading,
  setApiData,
  setApiError,
} from "../store/slices/apiSlice";
import { ApiError } from "../services/types";

interface UseApiOptions {
  key: string;
  autoLoad?: boolean;
  cacheDuration?: number; // in milliseconds
}

export const useApi = <T = any>(options: UseApiOptions) => {
  const { key, autoLoad = false, cacheDuration = 5 * 60 * 1000 } = options;
  const dispatch = useDispatch();
  const apiState = useSelector((state: RootState) => state.api.requests[key]);

  const executeRequest = useCallback(
    async (apiCall: () => Promise<any>) => {
      try {
        dispatch(setApiLoading({ key, loading: true }));
        const response = await apiCall();
        dispatch(setApiData({ key, data: response.data }));
        return response.data;
      } catch (error) {
        const apiError = error as ApiError;
        dispatch(setApiError({ key, error: apiError.message }));
        throw error;
      }
    },
    [dispatch, key]
  );

  const isDataStale = useCallback(() => {
    if (!apiState?.lastUpdated) return true;
    return Date.now() - apiState.lastUpdated > cacheDuration;
  }, [apiState?.lastUpdated, cacheDuration]);

  return {
    data: apiState?.data as T | null,
    isLoading: apiState?.isLoading || false,
    error: apiState?.error || null,
    lastUpdated: apiState?.lastUpdated || null,
    executeRequest,
    isDataStale,
  };
};
