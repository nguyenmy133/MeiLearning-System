import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, Clock, RefreshCw, Save, Loader2 } from "lucide-react";
import { useQRSettings, useUpdateQRSettings } from "../hooks";

export function QRSettingsPage() {
  const { toast } = useToast();
  const { data, isLoading } = useQRSettings();
  const update = useUpdateQRSettings();

  // Remote settings as source of truth
  const remote = data ?? { expiryMinutes: 5, lateThresholdMinutes: 10, allowRegenerate: true };

  // Local state for input fields (avoids re-save on every keystroke)
  const [expiryMinutes, setExpiryMinutes] = useState(remote.expiryMinutes);
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState(remote.lateThresholdMinutes);

  // Sync local state when remote changes
  useEffect(() => {
    if (data) {
      setExpiryMinutes(data.expiryMinutes);
      setLateThresholdMinutes(data.lateThresholdMinutes);
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

  // Save all current values
  const saveConfig = useCallback(
    (overrides?: Partial<typeof remote>) => {
      update.reset();
      update.mutate({
        expiryMinutes,
        lateThresholdMinutes,
        allowRegenerate: remote.allowRegenerate,
        ...overrides,
      });
    },
    [expiryMinutes, lateThresholdMinutes, remote.allowRegenerate, update]
  );

  // Toggle switch → auto-save immediately
  const handleToggle = (checked: boolean) => {
    update.reset();
    update.mutate({
      expiryMinutes,
      lateThresholdMinutes,
      allowRegenerate: checked,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold mb-2">
          Cấu hình QR điểm danh
        </h1>
        <p className="text-muted-foreground">
          Thiết lập các tham số cho hệ thống điểm danh QR
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Cài đặt chung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="expiry" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Thời gian hiệu lực QR (phút)
            </Label>
            <Input
              id="expiry"
              type="number"
              min={1}
              max={30}
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(parseInt(e.target.value) || 5)}
              onBlur={(e) => { const v = parseInt(e.target.value) || 5; e.target.value = String(v); setExpiryMinutes(v); saveConfig({ expiryMinutes: v }); }}
              className="max-w-[200px]"
            />
            <p className="text-sm text-muted-foreground">
              Mã QR sẽ tự động hết hạn sau khoảng thời gian này
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="late" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Ngưỡng đi muộn (phút)
            </Label>
            <Input
              id="late"
              type="number"
              min={5}
              max={60}
              value={lateThresholdMinutes}
              onChange={(e) => setLateThresholdMinutes(parseInt(e.target.value) || 10)}
              onBlur={(e) => { const v = parseInt(e.target.value) || 10; e.target.value = String(v); setLateThresholdMinutes(v); saveConfig({ lateThresholdMinutes: v }); }}
              className="max-w-[200px]"
            />
            <p className="text-sm text-muted-foreground">
              Điểm danh sau thời gian này kể từ giờ học sẽ được tính là đi muộn
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                Cho phép tạo lại QR
              </Label>
              <p className="text-sm text-muted-foreground">
                Giáo viên có thể tạo mã QR mới trong cùng một buổi học
              </p>
            </div>
            <Switch
              checked={remote.allowRegenerate}
              onCheckedChange={handleToggle}
              disabled={update.isPending}
            />
          </div>

          <Button
            onClick={() => saveConfig()}
            disabled={update.isPending || isLoading}
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
        </CardContent>
      </Card>
    </div>
  );
}
