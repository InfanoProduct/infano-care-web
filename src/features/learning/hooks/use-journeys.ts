import { useQuery } from '@tanstack/react-query';
import { LearningApiService } from '../services/learning-api';

export function useJourneys() {
  return useQuery({
    queryKey: ['admin-journeys'],
    queryFn: () => LearningApiService.fetchJourneys(),
  });
}
