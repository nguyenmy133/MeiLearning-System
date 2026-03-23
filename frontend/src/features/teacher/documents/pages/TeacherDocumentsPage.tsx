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
  Youtube,
  Link2,
  Check,
  X,
  PlayCircle,
  ExternalLink,
  GraduationCap,
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
import { useDocuments, useUploadDocument, useUploadYoutube, useDeleteDocument } from "../hooks/useDocuments";
import { useClasses } from "@/features/admin/classes/hooks";
import { formatFileSize, extractYoutubeId, getYoutubeThumbnail } from "../services/documentService";
import { formatDate } from "@/lib/dateUtils";
import type { TeacherDocument, UploadDocumentDTO, UploadYoutubeDTO } from "../types";

// ── File icon helpers ──────────────────────────────────────────────────────────

function getFileIcon(type: string) {
  switch (type) {
    case "pdf":
      return <FileType className="w-8 h-8 text-destructive" />;
    case "youtube":
      return <Youtube className="w-8 h-8 text-red-500" />;
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
    youtube: "YouTube",
    video: "Video",
    image: "Hình ảnh",
    doc: "Word",
    ppt: "PowerPoint",
  };
  return map[type] ?? "Tệp";
}

function getFileTypeBadgeClass(type: string): string {
  const map: Record<string, string> = {
    pdf: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    youtube: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    video: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    image: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    doc: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    ppt: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return map[type] ?? "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
}

// ── Upload Form state ─────────────────────────────────────────────────────────

interface FileUploadForm {
  file: File | null;
  title: string;
  description: string;
  classIds: number[];
}

interface YoutubeUploadForm {
  youtubeUrl: string;
  title: string;
  description: string;
  classIds: number[];
}

const defaultFileForm: FileUploadForm = {
  file: null,
  title: "",
  description: "",
  classIds: [],
};

const defaultYoutubeForm: YoutubeUploadForm = {
  youtubeUrl: "",
  title: "",
  description: "",
  classIds: [],
};

// ── Validate YouTube URL ──────────────────────────────────────────────────────
function isValidYoutubeUrl(url: string): boolean {
  return extractYoutubeId(url) !== null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TeacherDocumentsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  // Dialogs
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<"file" | "youtube">("file");
  const [deleteTarget, setDeleteTarget] = useState<TeacherDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<TeacherDocument | null>(null);

  // Upload forms
  const [fileForm, setFileForm] = useState(defaultFileForm);
  const [youtubeForm, setYoutubeForm] = useState(defaultYoutubeForm);
  const [dragActive, setDragActive] = useState(false);

  // ── Hooks ────────────────────────────────────────────────────────────────────

  const classFilter = selectedClassId !== "all" ? Number(selectedClassId) : undefined;
  const { data: documents = [], isLoading } = useDocuments({ classId: classFilter });
  const { data: classes = [] } = useClasses({ limit: 100 });
  const uploadMutation = useUploadDocument();
  const youtubeMutation = useUploadYoutube();
  const deleteMutation = useDeleteDocument();

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Tổng tài liệu", value: documents.length, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    {
      label: "PDF",
      value: documents.filter((d) => d.fileType === "pdf").length,
      icon: FileType,
      color: "text-destructive",
      bg: "bg-red-100 dark:bg-red-900/20",
    },
    {
      label: "YouTube",
      value: documents.filter((d) => d.fileType === "youtube").length,
      icon: Youtube,
      color: "text-red-500",
      bg: "bg-red-100 dark:bg-red-900/20",
    },
    {
      label: "Video / Hình ảnh",
      value: documents.filter((d) => d.fileType === "video" || d.fileType === "image").length,
      icon: FileVideo,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
  ];

  // ── Class toggle helpers ──────────────────────────────────────────────────────

  const toggleClass = (
    classId: number,
    form: { classIds: number[] },
    setForm: (fn: any) => void,
  ) => {
    setForm((prev: any) => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter((id: number) => id !== classId)
        : [...prev.classIds, classId],
    }));
  };

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleFileDrop = (file: File) => {
    setFileForm((prev) => ({
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

  const handleUploadFile = async () => {
    if (!fileForm.file || !fileForm.title.trim()) return;
    await uploadMutation.mutateAsync({
      file: fileForm.file,
      title: fileForm.title.trim(),
      description: fileForm.description || undefined,
      classIds: fileForm.classIds,
    });
    setIsUploadOpen(false);
    setFileForm(defaultFileForm);
    setUploadTab("file");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadYoutube = async () => {
    if (!youtubeForm.youtubeUrl.trim() || !youtubeForm.title.trim()) return;
    if (!isValidYoutubeUrl(youtubeForm.youtubeUrl)) return;
    await youtubeMutation.mutateAsync({
      youtubeUrl: youtubeForm.youtubeUrl.trim(),
      title: youtubeForm.title.trim(),
      description: youtubeForm.description || undefined,
      classIds: youtubeForm.classIds,
    });
    setIsUploadOpen(false);
    setYoutubeForm(defaultYoutubeForm);
    setUploadTab("file");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleCloseUpload = () => {
    setIsUploadOpen(false);
    setFileForm(defaultFileForm);
    setYoutubeForm(defaultYoutubeForm);
    setUploadTab("file");
  };

  const isUploading = uploadMutation.isPending || youtubeMutation.isPending;

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
            Quản lý và chia sẻ tài liệu, video cho học viên
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsUploadOpen(true)}>
          <Plus className="w-4 h-4" />
          Thêm tài liệu
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
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
      <Card className="border-0 shadow-sm">
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
                <Skeleton key={i} className="h-48 rounded-xl" />
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
                  canDelete={true}
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
            <Card className="border-0 shadow-sm">
              <div className="divide-y divide-border">
                {filtered.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    canDelete={true}
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
      <Dialog open={isUploadOpen} onOpenChange={(open) => !open && handleCloseUpload()}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Thêm tài liệu mới</DialogTitle>
            <DialogDescription>
              Tải lên file hoặc thêm link YouTube để chia sẻ với học viên
            </DialogDescription>
          </DialogHeader>

          {/* Upload type tabs */}
          <Tabs value={uploadTab} onValueChange={(v) => setUploadTab(v as "file" | "youtube")}>
            <TabsList className="w-full">
              <TabsTrigger value="file" className="flex-1 gap-1.5">
                <Upload className="w-4 h-4" />
                Tải file
              </TabsTrigger>
              <TabsTrigger value="youtube" className="flex-1 gap-1.5">
                <Youtube className="w-4 h-4" />
                YouTube
              </TabsTrigger>
            </TabsList>

            {/* ── File upload tab ── */}
            <TabsContent value="file" className="mt-4 space-y-4">
              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : fileForm.file
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
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
                {fileForm.file ? (
                  <div className="space-y-1">
                    <File className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="font-medium text-foreground">{fileForm.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(fileForm.file.size)}
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
                <Label htmlFor="file-title">
                  Tên tài liệu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="file-title"
                  placeholder="Nhập tên tài liệu"
                  value={fileForm.title}
                  onChange={(e) =>
                    setFileForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>

              {/* Multi-class picker */}
              <MultiClassPicker
                classes={classes}
                selectedIds={fileForm.classIds}
                onToggle={(id) => toggleClass(id, fileForm, setFileForm)}
              />

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="file-desc">Mô tả (tùy chọn)</Label>
                <Textarea
                  id="file-desc"
                  placeholder="Mô tả nội dung tài liệu..."
                  rows={2}
                  value={fileForm.description}
                  onChange={(e) =>
                    setFileForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
            </TabsContent>

            {/* ── YouTube upload tab ── */}
            <TabsContent value="youtube" className="mt-4 space-y-4">
              {/* YouTube URL input */}
              <div className="space-y-2">
                <Label htmlFor="youtube-url">
                  Link YouTube <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="youtube-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="pl-10"
                    value={youtubeForm.youtubeUrl}
                    onChange={(e) =>
                      setYoutubeForm((p) => ({ ...p, youtubeUrl: e.target.value }))
                    }
                  />
                  {youtubeForm.youtubeUrl && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValidYoutubeUrl(youtubeForm.youtubeUrl) ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <X className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                  )}
                </div>
                {youtubeForm.youtubeUrl && !isValidYoutubeUrl(youtubeForm.youtubeUrl) && (
                  <p className="text-xs text-destructive">
                    URL không hợp lệ. Hãy nhập link YouTube đầy đủ.
                  </p>
                )}
              </div>

              {/* YouTube thumbnail preview */}
              {youtubeForm.youtubeUrl && isValidYoutubeUrl(youtubeForm.youtubeUrl) && (
                <div className="rounded-lg overflow-hidden border bg-black/5 dark:bg-white/5">
                  <img
                    src={getYoutubeThumbnail(youtubeForm.youtubeUrl) ?? ""}
                    alt="YouTube thumbnail"
                    className="w-full h-auto aspect-video object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="yt-title">
                  Tên tài liệu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="yt-title"
                  placeholder="Nhập tên cho video"
                  value={youtubeForm.title}
                  onChange={(e) =>
                    setYoutubeForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>

              {/* Multi-class picker */}
              <MultiClassPicker
                classes={classes}
                selectedIds={youtubeForm.classIds}
                onToggle={(id) => toggleClass(id, youtubeForm, setYoutubeForm)}
              />

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="yt-desc">Mô tả (tùy chọn)</Label>
                <Textarea
                  id="yt-desc"
                  placeholder="Mô tả nội dung video..."
                  rows={2}
                  value={youtubeForm.description}
                  onChange={(e) =>
                    setYoutubeForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseUpload}
              disabled={isUploading}
            >
              Hủy
            </Button>
            {uploadTab === "file" ? (
              <Button
                onClick={handleUploadFile}
                disabled={
                  !fileForm.file ||
                  !fileForm.title.trim() ||
                  isUploading
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
            ) : (
              <Button
                onClick={handleUploadYoutube}
                disabled={
                  !youtubeForm.youtubeUrl.trim() ||
                  !youtubeForm.title.trim() ||
                  !isValidYoutubeUrl(youtubeForm.youtubeUrl) ||
                  isUploading
                }
              >
                {youtubeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <Youtube className="w-4 h-4 mr-2" />
                    Thêm video
                  </>
                )}
              </Button>
            )}
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
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewDoc?.fileType === "youtube" && <Youtube className="w-5 h-5 text-red-500" />}
              {previewDoc?.title}
            </DialogTitle>
          </DialogHeader>

          {/* YouTube embed preview */}
          {previewDoc?.fileType === "youtube" && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${extractYoutubeId(previewDoc.fileUrl)}?autoplay=0`}
                title={previewDoc.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}

          <div className="space-y-3 py-2 text-sm">
            {previewDoc?.description && (
              <p className="text-muted-foreground bg-accent/50 p-3 rounded-lg">
                {previewDoc.description}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Loại</p>
                <p className="font-medium">{getFileTypeLabel(previewDoc?.fileType ?? "")}</p>
              </div>
              {previewDoc?.fileType !== "youtube" && (
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Kích thước</p>
                  <p className="font-medium">{formatFileSize(previewDoc?.fileSize ?? 0)}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Lớp học</p>
                <div className="flex flex-wrap gap-1">
                  {(previewDoc?.classes ?? []).length > 0
                    ? previewDoc!.classes.map((c) => (
                        <Badge key={c.id} variant="outline" className="text-xs">{c.name}</Badge>
                      ))
                    : <span className="text-muted-foreground text-xs">Tất cả lớp</span>}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">Ngày tải lên</p>
                <p className="font-medium">{formatDate(previewDoc?.createdAt ?? "")}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            {previewDoc?.fileType === "youtube" ? (
              <Button asChild>
                <a href={previewDoc.fileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Mở trên YouTube
                </a>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline">
                  <a href={previewDoc?.fileUrl} target="_blank" rel="noopener noreferrer" download>
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
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Multi-class picker ────────────────────────────────────────────────────────

function MultiClassPicker({
  classes,
  selectedIds,
  onToggle,
}: {
  classes: { id: number; name: string }[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <GraduationCap className="w-4 h-4" />
        Lớp học (tùy chọn, có thể chọn nhiều)
      </Label>
      {classes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có lớp học nào</p>
      ) : (
        <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-accent/30 max-h-32 overflow-y-auto">
          {classes.map((cls) => {
            const isSelected = selectedIds.includes(cls.id);
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => onToggle(cls.id)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  transition-all duration-150 cursor-pointer border
                  ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent"
                  }
                `}
              >
                {isSelected && <Check className="w-3 h-3" />}
                {cls.name}
              </button>
            );
          })}
        </div>
      )}
      {selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Đã chọn {selectedIds.length} lớp
        </p>
      )}
    </div>
  );
}

// ── Document Card ─────────────────────────────────────────────────────────────

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
  const isYoutube = doc.fileType === "youtube";
  const thumbnail = isYoutube ? getYoutubeThumbnail(doc.fileUrl) : null;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden">
      {/* YouTube thumbnail header */}
      {isYoutube && thumbnail && (
        <div
          className="relative aspect-video bg-black/5 cursor-pointer"
          onClick={onPreview}
        >
          <img
            src={thumbnail}
            alt={doc.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
          <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs gap-1">
            <Youtube className="w-3 h-3" />
            YouTube
          </Badge>
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* File icon (only for non-YouTube) */}
          {!isYoutube && (
            <div className="p-2.5 rounded-xl bg-accent flex-shrink-0">
              {getFileIcon(doc.fileType)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="font-medium text-foreground line-clamp-2 text-sm leading-tight cursor-pointer hover:text-primary transition-colors"
                onClick={onPreview}
              >
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
                  {isYoutube ? (
                    <DropdownMenuItem asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Mở YouTube
                      </a>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                        <Download className="w-4 h-4 mr-2" />
                        Tải xuống
                      </a>
                    </DropdownMenuItem>
                  )}
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
              <div className="flex items-center gap-1.5 flex-wrap">
                {!isYoutube && (
                  <Badge className={`text-xs border-0 ${getFileTypeBadgeClass(doc.fileType)}`}>
                    {getFileTypeLabel(doc.fileType)}
                  </Badge>
                )}
                {doc.classes.map((c) => (
                  <Badge key={c.id} variant="outline" className="text-xs">
                    {c.name}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {!isYoutube && <span>{formatFileSize(doc.fileSize)}</span>}
                <span>{formatDate(doc.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Document Row ──────────────────────────────────────────────────────────────

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
  const isYoutube = doc.fileType === "youtube";

  return (
    <div className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors">
      <div className="p-2 rounded-lg bg-accent flex-shrink-0">
        {getFileIcon(doc.fileType)}
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className="font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
          onClick={onPreview}
        >
          {doc.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge className={`text-xs border-0 ${getFileTypeBadgeClass(doc.fileType)}`}>
            {getFileTypeLabel(doc.fileType)}
          </Badge>
          {doc.classes.map((c) => (
            <span key={c.id} className="text-xs text-muted-foreground">{c.name}</span>
          ))}
          {!isYoutube && (
            <span className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
          )}
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
        {isYoutube ? (
          <Button variant="ghost" size="icon" asChild>
            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        ) : (
          <Button variant="ghost" size="icon" asChild>
            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
              <Download className="w-4 h-4" />
            </a>
          </Button>
        )}
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

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="py-16 text-center">
        <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Chưa có tài liệu nào</h3>
        <p className="text-muted-foreground mb-4">
          Tải lên tài liệu hoặc thêm video YouTube để chia sẻ với học viên
        </p>
        <Button onClick={onUpload}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm tài liệu đầu tiên
        </Button>
      </CardContent>
    </Card>
  );
}
