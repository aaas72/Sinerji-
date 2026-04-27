// Extend the Window interface for custom properties used below
declare global {
  interface Window {
    __zustandStore?: {
      logout?: () => void;
    };
    useAuthStore?: {
      getState?: () => {
        logout?: () => void;
      };
    };
  }
}
import axios, { AxiosError } from 'axios';
import { ApiError } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

console.log('API_URL configured as:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies are sent if needed
});

// Response Interceptor: Handle Errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    let errorMessage = "An unexpected error occurred.";
    let statusCode = 500;

    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error - Server might be down or CORS issue');
      errorMessage = "Unable to connect to the server. Please check your internet connection.";
      statusCode = 0;
    } else if (error.response) {
      // Server responded with a status code outside 2xx
      statusCode = error.response.status;

      // Try to extract message from backend standard error response
      // Expecting: { status: 'error', message: '...' } or { message: '...' }
      errorMessage = error.response.data?.message || error.response.data?.error || error.message;

      if (statusCode === 401) {
        if (typeof window !== 'undefined' && window.location.pathname === '/') {
          // لا تطبع الرسالة إذا كان المستخدم في صفحة تسجيل الدخول
        } else {
          console.error('Unauthorized! Clearing local auth state.');
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          try {
            // استدعاء دالة تسجيل الخروج من zustand store إذا كانت متاحة
            window.__zustandStore?.logout?.();
            window.useAuthStore?.getState?.().logout?.();
          } catch (e) {
            // تجاهل أي خطأ في محاولة استدعاء logout
          }
          // إعادة التوجيه لصفحة تسجيل الدخول
          if (window.location.pathname !== '/') {
            window.location.replace('/');
          }
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = "No response from server.";
    } else {
      // Something happened in setting up the request
      errorMessage = error.message;
    }

    // Reject with a standardized ApiError object
    const standardizedError = new ApiError(errorMessage, statusCode);
    return Promise.reject(standardizedError);
  }
);

export default api;
