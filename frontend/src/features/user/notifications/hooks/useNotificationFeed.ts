import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";

interface UseNotificationFeedParams {
  page: number;
  limit: number;
}

/**
 * Paginated notification hook.
 * Uses keepPreviousData so the list doesn't flash empty between page transitions.
 */
export function useNotificationFeed({ page, limit }: UseNotificationFeedParams) {
  return useQuery({
    queryKey: ["notifications", "feed", page, limit],
    queryFn: () => notificationService.getPaginated({ page, limit }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
