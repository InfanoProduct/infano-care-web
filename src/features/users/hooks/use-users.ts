import { useQuery } from '@tanstack/react-query';
import { UserApiService } from '../services/user-api';

export function useUsers(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => UserApiService.fetchUsers(page, limit),
  });
}
