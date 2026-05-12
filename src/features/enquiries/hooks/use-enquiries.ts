import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { EnquiryApiService } from '../services/enquiry-api';

export function useEnquiries() {
  return useQuery({
    queryKey: ['enquiries'],
    queryFn: () => EnquiryApiService.getEnquiries(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
  });
}

export function useEnquiry(id: string) {
  return useQuery({
    queryKey: ['enquiries', id],
    queryFn: () => EnquiryApiService.getEnquiryById(id),
    enabled: !!id,
  });
}
