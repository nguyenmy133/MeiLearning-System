import { useQuery } from "@tanstack/react-query";
import { getFinancialReport, getAcademicReport } from "../services";

const reportsKeys = {
  all: ["reports"] as const,
  financial: () => [...reportsKeys.all, "financial"] as const,
  academic: () => [...reportsKeys.all, "academic"] as const,
};

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
