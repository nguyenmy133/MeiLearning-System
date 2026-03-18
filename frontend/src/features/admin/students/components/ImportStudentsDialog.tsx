import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { useCreateStudent } from "../hooks";
import { useEnrollableClassOptions } from "@/hooks/useClassOptions";
import type { CreateStudentDTO } from "../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

/** Map tên lớp (chuỗi cách nhau dấu phẩy) → ClassEnrollment[] */
function parseClasses(raw: string, classOpts: { id: number; name: string }[]) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => {
      const opt = classOpts.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      return opt ? { classId: opt.id, className: opt.name } : null;
    })
    .filter(Boolean) as { classId: number; className: string }[];
}

function validateEmail(e: string) {
  return !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

interface ParsedRow {
  rowIndex: number;
  name: string;
  phone: string;
  parentPhone: string;
  email: string;
  classes: string;
  // computed
  password: string;
  errors: string[];
  selected: boolean;
  importError?: string; // Lý do lỗi từ backend khi import thất bại
}

// ─── Template builder ────────────────────────────────────────────────────────

function downloadTemplate(classNames?: string[]) {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Họ và tên (*)", "Số điện thoại (*)", "SĐT Phụ huynh", "Email", "Lớp đăng ký (tên lớp, cách nhau bằng dấu phẩy)"],
  ]);
  ws["!cols"] = [{ wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 24 }, { wch: 40 }];

  // Set cột SĐT (B) và SĐT Phụ huynh (C) thành format Text
  // để Excel giữ nguyên số 0 đầu khi user nhập
  for (let row = 2; row <= 1000; row++) {
    const cellB = XLSX.utils.encode_cell({ r: row - 1, c: 1 }); // col B
    const cellC = XLSX.utils.encode_cell({ r: row - 1, c: 2 }); // col C
    if (!ws[cellB]) ws[cellB] = { t: 's', v: '' };
    if (!ws[cellC]) ws[cellC] = { t: 's', v: '' };
    ws[cellB].z = '@';
    ws[cellC].z = '@';
  }
  // Cập nhật range để bao gồm các cell đã format
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 999, c: 4 } });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Danh sách học viên");

  // Sheet phụ: danh sách lớp đang/sắp hoạt động để user tham khảo
  if (classNames && classNames.length > 0) {
    const classData = [["Tên lớp (copy tên vào cột 'Lớp đăng ký')"], ...classNames.map((n) => [n])];
    const wsClasses = XLSX.utils.aoa_to_sheet(classData);
    wsClasses["!cols"] = [{ wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsClasses, "Danh sách lớp");
  }

  XLSX.writeFile(wb, "template_hoc_vien.xlsx");
}

// ─── Export credentials after import ────────────────────────────────────────

function exportCredentials(rows: ParsedRow[], imported: number[]) {
  const data = [["STT", "Họ và tên", "Số ĐT (Username)", "Mật khẩu tạm"]];
  rows
    .filter((r) => imported.includes(r.rowIndex))
    .forEach((r, i) => data.push([String(i + 1), r.name, r.phone, r.password]));
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 6 }, { wch: 24 }, { wch: 18 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tài khoản học viên");
  XLSX.writeFile(wb, "tai_khoan_hoc_vien.xlsx");
}

// ─── Main component ──────────────────────────────────────────────────────────

type Step = "idle" | "preview" | "importing" | "done";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportStudentsDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importedIndices, setImportedIndices] = useState<number[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateStudent();
  const { data: classOptions } = useEnrollableClassOptions();

  const handleClose = () => {
    if (step === "importing") return;
    setStep("idle");
    setRows([]);
    setImportedIndices([]);
    setImportProgress(0);
    onOpenChange(false);
  };

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "", raw: false });

        const parsed: ParsedRow[] = raw.map((r, idx) => {
          const name = String(r["Họ và tên (*)"] ?? r["Họ và tên"] ?? "").trim();
          let phone = String(r["Số điện thoại (*)"] ?? r["Số điện thoại"] ?? "").trim();
          let parentPhone = String(r["SĐT Phụ huynh"] ?? "").trim();

          // Auto-fix: Excel cắt số 0 đầu → thêm lại nếu thiếu
          if (phone && /^[1-9][0-9]{8}$/.test(phone)) phone = '0' + phone;
          if (parentPhone && /^[1-9][0-9]{8}$/.test(parentPhone)) parentPhone = '0' + parentPhone;

          const email = String(r["Email"] ?? "").trim();
          const classes = String(r["Lớp đăng ký (tên lớp, cách nhau bằng dấu phẩy)"] ?? r["Lớp đăng ký"] ?? "").trim();

          const errors: string[] = [];
          if (!name) errors.push("Thiếu họ tên");
          if (!phone) errors.push("Thiếu SĐT");
          else if (!/^0[0-9]{9}$/.test(phone)) errors.push("SĐT không hợp lệ (phải 10 số, bắt đầu bằng 0)");
          if (email && !validateEmail(email)) errors.push("Email sai định dạng");

          return { rowIndex: idx, name, phone, parentPhone, email, classes, password: generatePassword(), errors, selected: errors.length === 0 };
        });

        // Check duplicate phones within file
        const phones = parsed.map((r) => r.phone).filter(Boolean);
        parsed.forEach((r) => {
          if (r.phone && phones.filter((p) => p === r.phone).length > 1) {
            if (!r.errors.includes("SĐT trùng trong file")) r.errors.push("SĐT trùng trong file");
            r.selected = false;
          }
        });

        // Check duplicate emails within file
        const emails = parsed.map((r) => r.email.toLowerCase()).filter(Boolean);
        parsed.forEach((r) => {
          if (r.email && emails.filter((e) => e === r.email.toLowerCase()).length > 1) {
            if (!r.errors.includes("Email trùng trong file")) r.errors.push("Email trùng trong file");
            r.selected = false;
          }
        });

        setRows(parsed);
        setStep("preview");
      } catch {
        toast.error("Không thể đọc file. Vui lòng dùng file Excel (.xlsx/.xls) hoặc CSV.");
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const toggleRow = (idx: number) => {
    setRows((prev) =>
      prev.map((r) => (r.rowIndex === idx ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleImport = async () => {
    const selected = rows.filter((r) => r.selected && r.errors.length === 0);
    if (selected.length === 0) return;
    setStep("importing");
    setImportProgress(0);
    const succeeded: number[] = [];

    for (let i = 0; i < selected.length; i++) {
      const r = selected[i];
      const dto: CreateStudentDTO = {
        name: r.name,
        phone: r.phone,
        parentPhone: r.parentPhone,
        email: r.email,
        classes: parseClasses(r.classes, classOptions ?? []),
        username: r.phone,       // phone = username
        password: r.password,
      };
      try {
        await createMutation.mutateAsync(dto);
        succeeded.push(r.rowIndex);
      } catch (err: any) {
        // Lưu lý do lỗi cụ thể từ backend
        setRows((prev) =>
          prev.map((pr) =>
            pr.rowIndex === r.rowIndex
              ? { ...pr, importError: err.message || "Lỗi không xác định" }
              : pr
          )
        );
      }
      setImportProgress(Math.round(((i + 1) / selected.length) * 100));
    }

    setImportedIndices(succeeded);
    setStep("done");
    const failedCount = selected.length - succeeded.length;
    if (failedCount > 0) {
      toast.warning(`Import: ${succeeded.length} thành công, ${failedCount} thất bại. Xem chi tiết bên dưới.`);
    } else {
      toast.success(`Import thành công ${succeeded.length}/${selected.length} học viên!`);
    }
  };

  const handleCopyRow = (r: ParsedRow, idx: number) => {
    navigator.clipboard.writeText(`${r.name} | ${r.phone} | ${r.password}`);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const errorCount = rows.filter((r) => r.errors.length > 0).length;
  const selectedCount = rows.filter((r) => r.selected).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] flex flex-col" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Import danh sách học viên từ Excel
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* ── STEP: IDLE ── */}
          {step === "idle" && (
            <div className="space-y-4">
              <Alert className="border-blue-200/50 bg-blue-50/50 dark:bg-blue-950/20">
                <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                  <strong>Tên đăng nhập = Số điện thoại học viên.</strong> Mật khẩu sẽ được tự động tạo. Sau import bạn có thể xuất file thông tin tài khoản để gửi cho học viên.
                </AlertDescription>
              </Alert>

              {/* Download template */}
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Bước 1: Tải template mẫu</p>
                  <p className="text-xs text-muted-foreground mt-0.5">File có sẵn tiêu đề cột. Sheet "Danh sách lớp" chứa tên các lớp đang/sắp hoạt động.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => downloadTemplate((classOptions ?? []).map((c) => c.name))} className="gap-2 shrink-0">
                  <Download className="w-4 h-4" />
                  Tải template
                </Button>
              </div>

              {/* Upload zone */}
              <div
                className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground">Bước 2: Upload file đã điền</p>
                <p className="text-sm text-muted-foreground mt-1">Kéo thả hoặc click để chọn file .xlsx, .xls, .csv</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
              </div>
            </div>
          )}

          {/* ── STEP: PREVIEW ── */}
          {step === "preview" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {validCount} hợp lệ
                </Badge>
                {errorCount > 0 && (
                  <Badge className="bg-destructive/10 text-destructive gap-1">
                    <XCircle className="w-3 h-3" /> {errorCount} lỗi
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground ml-auto">Đã chọn: {selectedCount} dòng để import</span>
              </div>

              {errorCount > 0 && (
                <Alert className="border-amber-400/50 bg-amber-50/50 dark:bg-amber-900/10 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                    Các dòng lỗi đã bị bỏ chọn tự động. Bạn có thể sửa file và upload lại, hoặc chỉ import các dòng hợp lệ.
                  </AlertDescription>
                </Alert>
              )}

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>SĐT (Username)</TableHead>
                      <TableHead className="hidden sm:table-cell">Lớp</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.rowIndex} className={r.errors.length > 0 ? "bg-destructive/5" : ""}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={r.selected && r.errors.length === 0}
                            disabled={r.errors.length > 0}
                            onChange={() => toggleRow(r.rowIndex)}
                            className="h-4 w-4 accent-primary"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{r.name || <span className="text-destructive italic">Trống</span>}</TableCell>
                        <TableCell className="font-mono text-sm">{r.phone || <span className="text-destructive italic">Trống</span>}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{r.classes || "—"}</TableCell>
                        <TableCell>
                          {r.errors.length === 0 ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px]">
                              Hợp lệ
                            </Badge>
                          ) : (
                            <div className="space-y-0.5">
                              {r.errors.map((e) => (
                                <Badge key={e} className="bg-destructive/10 text-destructive text-[10px] block w-fit">
                                  {e}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ── STEP: IMPORTING ── */}
          {step === "importing" && (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
              <p className="font-medium text-foreground">Đang import... {importProgress}%</p>
              <div className="h-2 bg-secondary rounded-full overflow-hidden max-w-sm mx-auto">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${importProgress}%` }} />
              </div>
              <p className="text-sm text-muted-foreground">Vui lòng không đóng cửa sổ này</p>
            </div>
          )}

          {/* ── STEP: DONE ── */}
          {step === "done" && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-xl font-bold text-foreground">Import hoàn tất!</p>
                <p className="text-muted-foreground mt-1">
                  {importedIndices.length} học viên đã được thêm vào hệ thống.
                </p>
              </div>

              {/* Thông báo dòng thất bại */}
              {rows.some((r) => r.importError) && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    {rows.filter((r) => r.importError).length} dòng import thất bại
                  </p>
                  <div className="mt-2 space-y-1">
                    {rows.filter((r) => r.importError).map((r) => (
                      <p key={r.rowIndex} className="text-xs text-destructive">
                        <span className="font-medium">{r.name || `Dòng ${r.rowIndex + 1}`}</span>
                        {" — "}{r.importError}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {importedIndices.length > 0 && (
                <>
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Xuất file thông tin tài khoản</p>
                      <p className="text-xs text-muted-foreground mt-0.5">SĐT (username) + mật khẩu tạm để gửi cho học viên</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => exportCredentials(rows, importedIndices)} className="gap-2 shrink-0">
                      <Download className="w-4 h-4" />
                      Xuất Excel
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Họ và tên</TableHead>
                          <TableHead>SĐT (Username)</TableHead>
                          <TableHead>Mật khẩu tạm</TableHead>
                          <TableHead className="w-8"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows
                          .filter((r) => importedIndices.includes(r.rowIndex))
                          .map((r, i) => (
                            <TableRow key={r.rowIndex}>
                              <TableCell className="font-medium">{r.name}</TableCell>
                              <TableCell className="font-mono text-sm">{r.phone}</TableCell>
                              <TableCell className="font-mono text-sm">{r.password}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleCopyRow(r, i)}
                                  title="Sao chép thông tin"
                                >
                                  {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="gap-2 pt-2 border-t border-border shrink-0">
          {step === "idle" && (
            <Button variant="outline" onClick={handleClose}>Hủy</Button>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => { setStep("idle"); setRows([]); }}>
                ← Upload lại
              </Button>
              <Button
                onClick={handleImport}
                disabled={selectedCount === 0}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Import {selectedCount} học viên
              </Button>
            </>
          )}
          {step === "done" && (
            <Button onClick={handleClose}>Đóng</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
