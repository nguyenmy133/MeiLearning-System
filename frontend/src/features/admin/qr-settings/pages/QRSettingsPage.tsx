import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, Clock, RefreshCw, Save, Loader2, Power } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQRSettings, useUpdateQRSettings } from "../hooks";

const LIMITS = {
  expiryMinutes: { min: 1, max: 30 },
  lateThresholdMinutes: { min: 1, max: 60 },
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function QRSettingsPage() {
  const { toast } = useToast();
  const { data, isLoading } = useQRSettings();
  const update = useUpdateQRSettings();

  // ALL fields are local state — chỉ lưu khi bấm "Lưu cấu hình"
  const [enabled, setEnabled] = useState(true);
  const [expiryMinutes, setExpiryMinutes] = useState(5);
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState(10);
  const [allowRegenerate, setAllowRegenerate] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync local state when remote data loads
  useEffect(() => {
    if (data) {
      setEnabled(data.enabled);
      setExpiryMinutes(data.expiryMinutes);
      setLateThresholdMinutes(data.lateThresholdMinutes);
      setAllowRegenerate(data.allowRegenerate);
    }
  }, [data]);

  // Toast on success
  useEffect(() => {
    if (update.isSuccess) {
      toast({
        title: "Đã lưu cấu hình",
        description: "Cấu hình QR điểm danh đã được cập nhật.",
      });
    }
  }, [update.isSuccess, toast]);

  // Check if local state differs from remote
  const hasChanges =
    data != null &&
    (enabled !== data.enabled ||
      expiryMinutes !== data.expiryMinutes ||
      lateThresholdMinutes !== data.lateThresholdMinutes ||
      allowRegenerate !== data.allowRegenerate);

  // Validate inputs — returns true if valid
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { expiryMinutes: expLimits, lateThresholdMinutes: lateLimits } = LIMITS;

    if (expiryMinutes < expLimits.min || expiryMinutes > expLimits.max) {
      newErrors.expiryMinutes = `Giá trị phải từ ${expLimits.min} đến ${expLimits.max} phút`;
    }
    if (lateThresholdMinutes < lateLimits.min || lateThresholdMinutes > lateLimits.max) {
      newErrors.lateThresholdMinutes = `Giá trị phải từ ${lateLimits.min} đến ${lateLimits.max} phút`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save ALL fields via button click only
  const handleSave = () => {
    if (!validate()) return;
    update.reset();
    update.mutate({
      enabled,
      expiryMinutes: clamp(expiryMinutes, LIMITS.expiryMinutes.min, LIMITS.expiryMinutes.max),
      lateThresholdMinutes: clamp(lateThresholdMinutes, LIMITS.lateThresholdMinutes.min, LIMITS.lateThresholdMinutes.max),
      allowRegenerate,
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-24 max-w-2xl" />
        <Skeleton className="h-80 max-w-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold mb-2">
          Cấu hình QR
        </h1>
        <p className="text-muted-foreground">
          Thiết lập các tham số cho hệ thống điểm danh QR
        </p>
      </div>

      {/* Master toggle — bật/tắt toàn bộ hệ thống */}
      <Card className={`max-w-2xl border-2 transition-colors ${enabled ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}>
        <CardContent className="flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${enabled ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
              <Power className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Hệ thống QR điểm danh</p>
              <p className="text-sm text-muted-foreground">
                {enabled
                  ? "Bật — cho phép sử dụng QR để điểm danh"
                  : "Tắt — tất cả chức năng QR bị vô hiệu hóa"}
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </CardContent>
      </Card>

      <Card className={`max-w-2xl transition-opacity ${!enabled ? "opacity-50 pointer-events-none" : ""}`}>
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Cài đặt chung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Thời gian hiệu lực */}
          <div className="space-y-2">
            <Label htmlFor="expiry" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Thời gian hiệu lực QR (phút)
            </Label>
            <Input
              id="expiry"
              type="number"
              min={LIMITS.expiryMinutes.min}
              max={LIMITS.expiryMinutes.max}
              value={expiryMinutes}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setExpiryMinutes(isNaN(v) ? LIMITS.expiryMinutes.min : v);
                setErrors((prev) => ({ ...prev, expiryMinutes: "" }));
              }}
              className={`max-w-[200px] ${errors.expiryMinutes ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.expiryMinutes ? (
              <p className="text-sm text-destructive font-medium">{errors.expiryMinutes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Mã QR sẽ tự động hết hạn sau khoảng thời gian này ({LIMITS.expiryMinutes.min}–{LIMITS.expiryMinutes.max} phút)
              </p>
            )}
          </div>

          {/* Ngưỡng đi muộn */}
          <div className="space-y-2">
            <Label htmlFor="late" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Ngưỡng đi muộn (phút)
            </Label>
            <Input
              id="late"
              type="number"
              min={LIMITS.lateThresholdMinutes.min}
              max={LIMITS.lateThresholdMinutes.max}
              value={lateThresholdMinutes}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setLateThresholdMinutes(isNaN(v) ? LIMITS.lateThresholdMinutes.min : v);
                setErrors((prev) => ({ ...prev, lateThresholdMinutes: "" }));
              }}
              className={`max-w-[200px] ${errors.lateThresholdMinutes ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.lateThresholdMinutes ? (
              <p className="text-sm text-destructive font-medium">{errors.lateThresholdMinutes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Điểm danh sau thời gian này kể từ giờ học sẽ được tính là đi muộn ({LIMITS.lateThresholdMinutes.min}–{LIMITS.lateThresholdMinutes.max} phút)
              </p>
            )}
          </div>

          {/* Cho phép tạo lại QR */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                Cho phép tạo lại mã QR
              </Label>
              <p className="text-sm text-muted-foreground">
                Khi bật, giáo viên có thể tạo mã QR mới nếu mã cũ đã hết hạn (trong cùng 1 buổi học)
              </p>
            </div>
            <Switch
              checked={allowRegenerate}
              onCheckedChange={setAllowRegenerate}
            />
          </div>

        </CardContent>
      </Card>

      {/* Save button (Must be outside the disabled card above to allow saving when turning off master toggle) */}
      <div className="flex justify-start">
        <Button
          onClick={handleSave}
          disabled={update.isPending || !hasChanges}
          className="btn-primary"
        >
          {update.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Lưu cấu hình
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
