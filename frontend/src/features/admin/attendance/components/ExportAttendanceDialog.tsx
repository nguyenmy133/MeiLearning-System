import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { useClassOptions, useMonthOptions } from "@/hooks/useClassOptions";
import { exportAttendanceExcel } from "../services/attendanceService";

interface ExportAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportAttendanceDialog({ open, onOpenChange }: ExportAttendanceDialogProps) {
  const { data: classOptions = [], isLoading: isLoadingClasses } = useClassOptions();
  const monthOptions = useMonthOptions();
  
  // Mặc định chọn tháng hiện tại (phần tử thứ 1 trong mảng vì phần tử 0 là tháng tương lai)
  const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions[1]);
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!selectedMonth) {
      toast.error("Vui lòng chọn tháng cần xuất báo cáo");
      return;
    }

    try {
      setExporting(true);
      const classIdParam = selectedClassId !== "all" ? Number(selectedClassId) : undefined;
      const formattedMonth = selectedMonth.split("/").reverse().join("-"); // "04/2026" -> "2026-04"
      
      const blob = await exportAttendanceExcel(classIdParam, formattedMonth);
      
      // Tạo URL để download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      
      // Định dạng tên file: Bao_Cao_Diem_Danh_2026-04.xlsx
      const filename = `Bao_Cao_Diem_Danh_${formattedMonth}.xlsx`;
      link.setAttribute("download", filename);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Đã xuất báo cáo điểm danh thành công!");
      onOpenChange(false);
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      toast.error("Xuất file báo cáo thất bại");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Xuất Báo Cáo Chuyên Cần</DialogTitle>
          <DialogDescription>
            Chọn tháng và phạm vi lớp học để kết xuất dữ liệu Điểm danh ra file Excel.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Chọn Tháng */}
          <div className="grid gap-2">
            <Label>Tháng xuất báo cáo</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn tháng" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chọn Phạm vi lớp */}
          <div className="grid gap-2">
            <Label>Phạm vi kết xuất</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phạm vi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả các lớp (Gộp file)</SelectItem>
                {classOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[0.8rem] text-muted-foreground mt-1">
              * Nếu chọn "Tất cả", mỗi lớp sẽ được chia thành 1 Sheet riêng trong file Excel.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Hủy
          </Button>
          <Button onClick={handleExport} disabled={exporting || !selectedMonth || isLoadingClasses}>
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang nén file...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Xác nhận Xuất
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
