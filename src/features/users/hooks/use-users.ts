import { useQuery } from '@tanstack/react-query';
import { UserApiService } from '../services/user-api';

export function useUsers(page: number = 1, limit: number = 20, peerOnboarding?: boolean) {
  return useQuery({
    queryKey: ['users', page, limit, peerOnboarding],
    queryFn: () => UserApiService.fetchUsers(page, limit, peerOnboarding),
  });
}
