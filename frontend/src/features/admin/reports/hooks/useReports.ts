import { useQuery } from "@tanstack/react-query";
import { getFinancialReport, getAcademicReport, getReportsOverview } from "../services";

const reportsKeys = {
  all: ["reports"] as const,
  overview: () => [...reportsKeys.all, "overview"] as const,
  financial: () => [...reportsKeys.all, "financial"] as const,
  academic: () => [...reportsKeys.all, "academic"] as const,
};

export function useReportsOverview() {
  return useQuery({
    queryKey: reportsKeys.overview(),
    queryFn: getReportsOverview,
  });
}

export function useFinancialReport() {
  return useQuery({
    queryKey: reportsKeys.financial(),
    queryFn: getFinancialReport,
  });
}

export function useAcademicReport() {
  return useQuery({
    queryKey: reportsKeys.academic(),
    queryFn: getAcademicReport,
  });
}
