import api from './api';

export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    googleLogin: '/auth/google-login',
    verifyAccount: '/auth/verify-account',
    resendOtp: '/auth/resend-otp',
    forgotPassword: '/auth/forgot-password',
    forgotPasswordVerify: '/auth/forgot-password/verify',
    forgotPasswordResend: '/auth/forgot-password/resend',
  },
  notifications: {
    list: '/notifications',
    markRead: (id) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
  },
};

export const get = async (endpoint, config = {}) => {
  const response = await api.get(endpoint, config);
  return response.data;
};

export const post = async (endpoint, data, config = {}) => {
  const response = await api.post(endpoint, data, config);
  return response.data;
};

export const put = async (endpoint, data, config = {}) => {
  const response = await api.put(endpoint, data, config);
  return response.data;
};

export const del = async (endpoint, config = {}) => {
  const response = await api.delete(endpoint, config);
  return response.data;
};

export default {
  get,
  post,
  put,
  del,
};
