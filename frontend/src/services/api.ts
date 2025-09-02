import { LoginCredentials, Round, TapResponse, ApiError } from '../types';

const API_BASE = '/api';

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        statusCode: response.status,
        error: response.statusText,
        message: 'An error occurred',
      }));
      throw error;
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Round endpoints
  async getRounds(): Promise<Round[]> {
    return this.request('/rounds');
  }

  async getRound(id: string): Promise<Round> {
    return this.request(`/rounds/${id}`);
  }

  async createRound(): Promise<{ success: boolean; roundId: string; message: string }> {
    return this.request('/rounds', {
      method: 'POST',
    });
  }

  async tap(roundId: string): Promise<TapResponse> {
    return this.request('/tap', {
      method: 'POST',
      body: JSON.stringify({ roundId }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();