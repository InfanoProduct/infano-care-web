import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { EnquiryApiService, Enquiry } from '../services/enquiry-api';

export function useEnquiries() {
  return useQuery({
    queryKey: ['enquiries'],
    queryFn: () => EnquiryApiService.getEnquiries(),
    staleTime: 0, // Always fetch the latest when possible
    refetchInterval: 5000, // Poll every 5 seconds for new enquiries
    placeholderData: keepPreviousData,
  });
}

export function useEnquiry(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['enquiries', id],
    queryFn: () => EnquiryApiService.getEnquiryById(id),
    enabled: !!id,
    initialData: () => {
      // Try to find the enquiry from the list cache so it loads instantly
      const cachedEnquiries = queryClient.getQueryData<Enquiry[]>(['enquiries']);
      const found = cachedEnquiries?.find((enq) => enq.id === id);
      return found ? found : undefined;
    },
  });
}
