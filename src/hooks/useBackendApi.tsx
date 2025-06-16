
import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { backendApi, ApiRequestConfig, ApiResponse } from '@/services/backendApi';

export const useBackendApi = () => {
  const { session } = useAuth();

  const apiCall = useCallback(async <T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> => {
    return backendApi.makeRequest<T>(endpoint, session, config);
  }, [session]);

  const get = useCallback(<T = any>(endpoint: string): Promise<ApiResponse<T>> => {
    return apiCall<T>(endpoint, { method: 'GET' });
  }, [apiCall]);

  const post = useCallback(<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    return apiCall<T>(endpoint, { method: 'POST', body: data });
  }, [apiCall]);

  const put = useCallback(<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    return apiCall<T>(endpoint, { method: 'PUT', body: data });
  }, [apiCall]);

  const del = useCallback(<T = any>(endpoint: string): Promise<ApiResponse<T>> => {
    return apiCall<T>(endpoint, { method: 'DELETE' });
  }, [apiCall]);

  const patch = useCallback(<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    return apiCall<T>(endpoint, { method: 'PATCH', body: data });
  }, [apiCall]);

  return {
    get,
    post,
    put,
    delete: del,
    patch,
    apiCall,
    isAuthenticated: !!session,
    accessToken: session?.access_token,
  };
};
