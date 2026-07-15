import { useQuery } from '@tanstack/react-query';
import { UserApiService } from '../services/user-api';

export function useUsers(
  page: number = 1, 
  limit: number = 15, 
  peerOnboarding?: boolean,
  role?: string,
  accountStatus?: string
) {
  return useQuery({
    queryKey: ['users', page, limit, peerOnboarding, role, accountStatus],
    queryFn: () => UserApiService.fetchUsers(page, limit, peerOnboarding, role, accountStatus),
  });
}
