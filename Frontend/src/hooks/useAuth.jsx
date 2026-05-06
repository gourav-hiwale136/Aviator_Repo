import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postRequest } from '../helper/apiHelper';
// import { postRequest } from '../helper/apiHelper';

const deepDecimalFix = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (value && typeof value === 'object') {
      if (value.$numberDecimal) {
        obj[key] = Number(value.$numberDecimal);
      } else if (Array.isArray(value)) {
        value.forEach((item) => deepDecimalFix(item));
      } else {
        deepDecimalFix(value);
      }
    }
  });
  return obj;
};

// Web3 login mutation - NO TOKEN
export const useWeb3Login = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ address, message, signature, referral = null }) => {
      const response = await postRequest('auth/web3-connect', {
        address,
        message,
        signature,
        referral,
      });
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.token) {
        localStorage.setItem('Aviatortoken', data.data.token);
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      console.error('Web3 login failed:', error);
    },
  });
};
export const usePrivyLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, referral = null }) => {
      const response = await postRequest('auth/privy-login', { token, referral });
      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.token) {
        localStorage.setItem('Aviatortoken', data.data.token);
      }
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      console.error('Privy login failed:', error);
    },
  });
};
export { deepDecimalFix };
