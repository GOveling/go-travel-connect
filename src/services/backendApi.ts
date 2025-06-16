
import { Session } from '@supabase/supabase-js';

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class BackendApiService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(session: Session | null): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  async makeRequest<T = any>(
    endpoint: string,
    session: Session | null,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers: customHeaders = {},
      body
    } = config;

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.getAuthHeaders(session),
      ...customHeaders
    };

    try {
      const requestOptions: RequestInit = {
        method,
        headers,
      };

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      console.log(`Making ${method} request to:`, url);
      console.log('With headers:', headers);

      const response = await fetch(url, requestOptions);
      
      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          error: data?.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }
}

export const backendApi = new BackendApiService();
