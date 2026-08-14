/**
 * ARTIC Marketplace — Axios API client
 * Handles auth headers, token refresh, and consistent error formatting
 */
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // for refresh token cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Attach access token ───────────────────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Auto-refresh on 401 ───────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh-token');
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Typed API helpers ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
  const { data } = await api.get<ApiResponse<T>>(url, { params });
  return data;
}

export async function post<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  const { data } = await api.post<ApiResponse<T>>(url, body);
  return data;
}

export async function put<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  const { data } = await api.put<ApiResponse<T>>(url, body);
  return data;
}

export async function patch<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  const { data } = await api.patch<ApiResponse<T>>(url, body);
  return data;
}

export async function del<T>(url: string): Promise<ApiResponse<T>> {
  const { data } = await api.delete<ApiResponse<T>>(url);
  return data;
}
