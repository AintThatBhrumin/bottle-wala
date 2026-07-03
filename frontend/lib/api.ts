import axios, { AxiosInstance, AxiosError } from 'axios';
import useAuthStore from './stores/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.jalsetu.me';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(
          `${API_BASE_URL}/api/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        useAuthStore.getState().setTokens(access, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// API helper functions
export const authAPI = {
  register: (email: string, name: string, password: string, role: string = 'customer') =>
    apiClient.post('/api/auth/register/', { email, name, password, role }),

  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login/', { email, password }),

  me: () => apiClient.get('/api/auth/me/'),

  createGuestSession: (cartData = [], browsingHistory = [], savedSuppliers = []) =>
    apiClient.post('/api/auth/guest-session/', {
      cart_data: cartData,
      browsing_history: browsingHistory,
      saved_suppliers: savedSuppliers,
    }),

  getGuestSession: (guestId: string) =>
    apiClient.get(`/api/auth/guest-session-detail/?guest_id=${guestId}`),

  updateGuestSession: (
    guestId: string,
    cartData: any[],
    browsingHistory: number[],
    savedSuppliers: number[]
  ) =>
    apiClient.put(`/api/auth/guest-session-detail/?guest_id=${guestId}`, {
      cart_data: cartData,
      browsing_history: browsingHistory,
      saved_suppliers: savedSuppliers,
    }),

  mergeGuestCart: (guestId: string) =>
    apiClient.post('/api/auth/merge-guest-cart/', { guest_id: guestId }),
};

export const productsAPI = {
  listProducts: (params?: any) =>
    apiClient.get('/api/products/', { params }),

  getProduct: (id: number) =>
    apiClient.get(`/api/products/${id}/`),
};

export const suppliersAPI = {
  listSuppliers: (params?: any) =>
    apiClient.get('/api/suppliers/', { params }),

  getSupplier: (id: number) =>
    apiClient.get(`/api/suppliers/${id}/`),

  getSupplierProducts: (id: number, params?: any) =>
    apiClient.get(`/api/suppliers/${id}/products/`, { params }),
};
