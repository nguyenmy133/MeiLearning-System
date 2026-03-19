import { useState, useRef } from "react";
import {
  FileText,
  Upload,
  FolderOpen,
  Search,
  Download,
  Trash2,
  Eye,
  Plus,
  MoreVertical,
  File,
  FileImage,
  FileVideo,
  FileType,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDocuments, useUploadDocument, useDeleteDocument } from "../hooks/useDocuments";
import { useClasses } from "@/features/admin/classes/hooks";
import { formatFileSize } from "../services/documentService";
import type { TeacherDocument, UploadDocumentDTO } from "../types";
import { authService } from "@/features/shared/auth/authService";

const CURRENT_USER_ID = authService.getCurrentTeacherIdSafe();

// ── File icon helpers ──────────────────────────────────────────────────────────

function getFileIcon(type: string) {
  switch (type) {
    case "pdf":
      return <FileType className="w-8 h-8 text-destructive" />;
    case "video":
      return <FileVideo className="w-8 h-8 text-blue-500" />;
    case "image":
      return <FileImage className="w-8 h-8 text-emerald-500" />;
    default:
      return <File className="w-8 h-8 text-primary" />;
  }
}

function getFileTypeLabel(type: string): string {
  const map: Record<string, string> = {
    pdf: "PDF",
    video: "Video",
    image: "Hình ảnh",
    doc: "Word",
    ppt: "PowerPoint",
  };
  return map[type] ?? "Tệp";
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return iso;
  }
}

// ── Upload Form state ─────────────────────────────────────────────────────────

const defaultUploadForm: Omit<UploadDocumentDTO, "file"> & { file: File | null } = {
  file: null,
  title: "",
  description: "",
  classId: undefined,
};

// ── Component ─────────────────────────────────────────────────────────────────

export function TeacherDocumentsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  // Dialogs
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeacherDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<TeacherDocument | null>(null);

  // Upload form
  const [uploadForm, setUploadForm] = useState(defaultUploadForm);
  const [dragActive, setDragActive] = useState(false);

  // ── Hooks ────────────────────────────────────────────────────────────────────

  const classFilter = selectedClassId !== "all" ? Number(selectedClassId) : undefined;
  const { data: documents = [], isLoading } = useDocuments({ classId: classFilter });
  // Chỉ lấy lớp của teacher này (phục vụ dropdown filter và form upload)
  const { data: classes = [] } = useClasses({ teacherId: CURRENT_USER_ID, limit: 100 });
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Tổng tài liệu", value: documents.length, icon: FileText, color: "text-primary" },
    {
      label: "PDF",
      value: documents.filter((d) => d.fileType === "pdf").length,
      icon: FileType,
      color: "text-destructive",
    },
    {
      label: "Video",
      value: documents.filter((d) => d.fileType === "video").length,
      icon: FileVideo,
      color: "text-blue-500",
    },
    {
      label: "Hình ảnh",
      value: documents.filter((d) => d.fileType === "image").length,
      icon: FileImage,
      color: "text-emerald-500",
    },
  ];


  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleFileDrop = (file: File) => {
    setUploadForm((prev) => ({
      ...prev,
      file,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileDrop(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileDrop(file);
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title.trim()) return;
    await uploadMutation.mutateAsync({
      file: uploadForm.file,
      title: uploadForm.title.trim(),
      description: uploadForm.description || undefined,
      classId: uploadForm.classId,
    });
    setIsUploadOpen(false);
    setUploadForm(defaultUploadForm);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Tài liệu giảng dạy
          </h1>
          <p className="text-muted-foreground">
            Quản lý và chia sẻ tài liệu cho học viên
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsUploadOpen(true)}>
          <Upload className="w-4 h-4" />
          Tải lên tài liệu
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-accent ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? "—" : stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm tài liệu..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tất cả lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lớp</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={String(cls.id)}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents list */}
      <Tabs defaultValue="grid" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Hiển thị {filtered.length} tài liệu
          </p>
          <TabsList>
            <TabsTrigger value="grid">Lưới</TabsTrigger>
            <TabsTrigger value="list">Danh sách</TabsTrigger>
          </TabsList>
        </div>

        {/* ── Grid view ── */}
        <TabsContent value="grid" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onUpload={() => setIsUploadOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  canDelete={!doc.uploadedById || doc.uploadedById === CURRENT_USER_ID}
                  onPreview={() => setPreviewDoc(doc)}
                  onDelete={() => setDeleteTarget(doc)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── List view ── */}
        <TabsContent value="list" className="mt-0">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onUpload={() => setIsUploadOpen(true)} />
          ) : (
            <Card>
              <div className="divide-y divide-border">
                {filtered.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    canDelete={!doc.uploadedById || doc.uploadedById === CURRENT_USER_ID}
                    onPreview={() => setPreviewDoc(doc)}
                    onDelete={() => setDeleteTarget(doc)}
                  />
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Upload Dialog ── */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Tải lên tài liệu mới</DialogTitle>
            <DialogDescription>
              Chọn file và điền thông tin để tải lên tài liệu giảng dạy
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : uploadForm.file
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                  : "border-border hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.jpg,.jpeg,.png,.gif"
              />
              {uploadForm.file ? (
                <div className="space-y-1">
                  <File className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="font-medium text-foreground">{uploadForm.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(uploadForm.file.size)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click để chọn file khác
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Kéo thả file vào đây hoặc click để chọn
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, PPT, PPTX, MP4, JPG, PNG (tối đa 200MB)
                  </p>
                </>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="doc-title">
                Tên tài liệu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="doc-title"
                placeholder="Nhập tên tài liệu"
                value={uploadForm.title}
                onChange={(e) =>
                  setUploadForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>

            {/* Class picker */}
            <div className="space-y-2">
              <Label>Lớp học (tùy chọn)</Label>
              <Select
                value={uploadForm.classId != null ? String(uploadForm.classId) : "none"}
                onValueChange={(v) =>
                  setUploadForm((p) => ({
                    ...p,
                    classId: v === "none" ? undefined : Number(v),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lớp (để trống = tất cả)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tất cả lớp</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={String(cls.id)}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="doc-desc">Mô tả (tùy chọn)</Label>
              <Textarea
                id="doc-desc"
                placeholder="Mô tả nội dung tài liệu..."
                rows={3}
                value={uploadForm.description}
                onChange={(e) =>
                  setUploadForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadOpen(false);
                setUploadForm(defaultUploadForm);
              }}
              disabled={uploadMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                !uploadForm.file ||
                !uploadForm.title.trim() ||
                uploadMutation.isPending
              }
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Tải lên
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài liệu?</AlertDialogTitle>
            <AlertDialogDescription>
              Tài liệu <span className="font-semibold">"{deleteTarget?.title}"</span> sẽ bị
              xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Preview Dialog ── */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{previewDoc?.title}</DialogTitle>
            <DialogDescription>{previewDoc?.description || "Không có mô tả"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Loại file</p>
                <p className="font-medium">{getFileTypeLabel(previewDoc?.fileType ?? "")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Kích thước</p>
                <p className="font-medium">{formatFileSize(previewDoc?.fileSize ?? 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Lớp học</p>
                <p className="font-medium">{previewDoc?.className || "Tất cả lớp"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Ngày tải lên</p>
                <p className="font-medium">{formatDate(previewDoc?.createdAt ?? "")}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button asChild variant="outline">
              <a
                href={previewDoc?.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Download className="w-4 h-4 mr-2" />
                Tải xuống
              </a>
            </Button>
            <Button asChild>
              <a href={previewDoc?.fileUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="w-4 h-4 mr-2" />
                Mở file
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DocumentCard({
  doc,
  canDelete = true,
  onPreview,
  onDelete,
}: {
  doc: TeacherDocument;
  canDelete?: boolean;
  onPreview: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-accent flex-shrink-0">
            {getFileIcon(doc.fileType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-foreground line-clamp-2 text-sm leading-tight">
                {doc.title}
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onPreview}>
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                      <Download className="w-4 h-4 mr-2" />
                      Tải xuống
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {canDelete && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {getFileTypeLabel(doc.fileType)}
                </Badge>
                {doc.className && (
                  <Badge variant="outline" className="text-xs">
                    {doc.className}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatFileSize(doc.fileSize)}</span>
                <span>{formatDate(doc.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentRow({
  doc,
  canDelete = true,
  onPreview,
  onDelete,
}: {
  doc: TeacherDocument;
  canDelete?: boolean;
  onPreview: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors">
      <div className="p-2 rounded-lg bg-accent flex-shrink-0">
        {getFileIcon(doc.fileType)}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{doc.title}</h3>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {getFileTypeLabel(doc.fileType)}
          </Badge>
          {doc.className && (
            <span className="text-xs text-muted-foreground">{doc.className}</span>
          )}
          <span className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
        </div>
      </div>
      <div className="hidden sm:block text-right flex-shrink-0">
        <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</p>
        <p className="text-xs text-muted-foreground">{doc.uploadedByName}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onPreview}>
          <Eye className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
            <Download className="w-4 h-4" />
          </a>
        </Button>
        {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Chưa có tài liệu nào</h3>
        <p className="text-muted-foreground mb-4">
          Tải lên tài liệu giảng dạy để chia sẻ với học viên của bạn
        </p>
        <Button onClick={onUpload}>
          <Plus className="w-4 h-4 mr-2" />
          Tải lên tài liệu đầu tiên
        </Button>
      </CardContent>
    </Card>
  );
}
