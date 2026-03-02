import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getQRSettings, updateQRSettings } from "../services";
import type { QRSettings } from "../types";

const qrSettingsKeys = {
  all: ["qr-settings"] as const,
  detail: () => [...qrSettingsKeys.all, "detail"] as const,
};

export function useQRSettings() {
  return useQuery({
    queryKey: qrSettingsKeys.detail(),
    queryFn: getQRSettings,
  });
}

export function useUpdateQRSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: QRSettings) => updateQRSettings(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qrSettingsKeys.all });
      toast.success("Đã lưu cấu hình");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
