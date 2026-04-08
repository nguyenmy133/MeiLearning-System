import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "../services";

const dashboardKeys = {
  all: ["dashboard"] as const,
  data: () => [...dashboardKeys.all, "data"] as const,
};

export function useDashboardData() {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: getDashboardData,
    staleTime: 60_000, 
    refetchInterval: 60_000, // Thêm refetchInterval để tự động cập nhật data mỗi phút (Monitoring)
  });
}
