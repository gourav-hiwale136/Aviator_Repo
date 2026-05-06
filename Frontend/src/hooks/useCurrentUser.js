import { useQuery } from '@tanstack/react-query';
import { getRequest } from '../helper/apiHelper';

const fetchCurrentUser = async () => {
  const response = await getRequest('users/me');
  if (response?.success) {
    const data = response?.data || null;
    if (data && data.wallet && typeof data.wallet === 'object' && data.wallet.$numberDecimal) {
      return { ...data, wallet: Number(data.wallet.$numberDecimal) };
    }
    return data;
  }
  throw new Error(response?.message || 'Failed to fetch current user');
};

const useCurrentUser = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    enabled,
    staleTime: 30 * 1000,
    gcTime: 0,
  });
};

export default useCurrentUser;
