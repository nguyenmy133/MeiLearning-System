import { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Search,
  Folder,
  File,
  Clock,
  Filter,
  Video,
  Play,
  ExternalLink,
  Youtube,
  PlayCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { useDocuments, useCourses } from "../hooks/useDocuments";
import type { DocumentItem } from "../types";

// ── Helpers ──────────────────────────────────────────────────────────────

const getFileIcon = (type: string) => {
  const styles: Record<string, { bg: string; iconColor: string; Icon: any }> = {
    pdf: { bg: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500", Icon: FileText },
    doc: { bg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-500", Icon: FileText },
    excel: { bg: "bg-green-100 dark:bg-green-900/30", iconColor: "text-green-500", Icon: FileText },
    ppt: { bg: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-500", Icon: FileText },
    video: { bg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-500", Icon: Video },
    youtube: { bg: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500", Icon: Youtube },
  };
  const s = styles[type] ?? { bg: "bg-gray-100 dark:bg-gray-900/30", iconColor: "text-gray-500", Icon: File };
  return (
    <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
      <s.Icon className={`h-5 w-5 ${s.iconColor}`} />
    </div>
  );
};

const getFileTypeBadge = (type: string) => {
  const map: Record<string, { label: string; className: string }> = {
    pdf: { label: "PDF", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    doc: { label: "Word", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    excel: { label: "Excel", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    ppt: { label: "PowerPoint", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    video: { label: "Video", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    youtube: { label: "YouTube", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const info = map[type] ?? { label: "Tệp", className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400" };
  return <Badge className={`text-xs border-0 ${info.className}`}>{info.label}</Badge>;
};

function getYoutubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}

// ── Component ───────────────────────────────────────────────────────────

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [playingVideo, setPlayingVideo] = useState<DocumentItem | null>(null);

  const { data: documents = [], isLoading: docsLoading } = useDocuments();
  const { data: courses = [] } = useCourses();

  const allDocs = documents;
  const fileDocs = documents.filter((d) => d.type !== "video" && d.type !== "youtube");
  const videoDocs = documents.filter((d) => d.type === "video" || d.type === "youtube");

  const getFiltered = (items: DocumentItem[]) =>
    items.filter((doc) => {
      const matchesSearch = doc.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCourse =
        selectedCourse === "all" ||
        doc.course.includes(courses.find((c) => c.id === selectedCourse)?.name ?? "---");
      return matchesSearch && matchesCourse;
    });

  // ── Handlers — FIX: dùng doc.fileUrl trực tiếp thay vì URL tự tạo ────────

  const handleDownload = (doc: DocumentItem) => {
    if (doc.type === "youtube") {
      // YouTube: mở trong tab mới
      window.open(doc.fileUrl, "_blank");
      return;
    }
    // File: dùng fileUrl từ backend (e.g. /uploads/documents/xxx.pdf)
    const link = document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (doc: DocumentItem) => {
    if (doc.type === "youtube" || doc.type === "video") {
      setPlayingVideo(doc);
    } else {
      // Mở tài liệu — dùng fileUrl trực tiếp
      window.open(doc.fileUrl, "_blank");
    }
  };

  // ── Document Row ──────────────────────────────────────────────────────────

  const renderDocumentRow = (doc: DocumentItem) => {
    const isVideo = doc.type === "youtube" || doc.type === "video";

    return (
      <div
        key={doc.id}
        className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 group"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* YouTube mini thumbnail or file icon */}
          {doc.type === "youtube" && doc.youtubeId ? (
            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => handleView(doc)}>
              <img
                src={getYoutubeThumbnail(doc.youtubeId)}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
          ) : (
            getFileIcon(doc.type)
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className="font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleView(doc)}
              >
                {doc.name}
              </p>
              {doc.isNew && (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs border-0">
                  Mới
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {getFileTypeBadge(doc.type)}
              <span className="text-xs text-muted-foreground">{doc.course}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{doc.teacher}</span>
              {!isVideo && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{doc.size}</span>
                </>
              )}
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{doc.date}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {isVideo ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              onClick={() => handleView(doc)}
            >
              <PlayCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Xem</span>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleView(doc)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(doc)}
                className="text-muted-foreground hover:text-primary"
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  // ── Video Card (grid) ─────────────────────────────────────────────────────

  const renderVideoCard = (doc: DocumentItem) => {
    const isYoutube = doc.type === "youtube";

    return (
      <Card
        key={doc.id}
        className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300"
        onClick={() => handleView(doc)}
      >
        {/* Thumbnail */}
        {isYoutube && doc.youtubeId ? (
          <div className="relative aspect-video bg-black/5">
            <img
              src={getYoutubeThumbnail(doc.youtubeId)}
              alt={doc.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <PlayCircle className="w-14 h-14 text-white drop-shadow-lg" />
            </div>
            <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs gap-1">
              <Youtube className="w-3 h-3" /> YouTube
            </Badge>
            {doc.isNew && (
              <Badge className="absolute top-2 right-2 bg-emerald-500 text-white text-xs">Mới</Badge>
            )}
          </div>
        ) : (
          <div className="relative aspect-video bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center">
            <Video className="w-12 h-12 text-purple-400" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <PlayCircle className="w-14 h-14 text-white drop-shadow-lg" />
            </div>
          </div>
        )}
        <CardContent className="p-3">
          <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-tight">{doc.name}</h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
            <span>{doc.teacher}</span>
            <span>•</span>
            <span>{doc.course}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{doc.date}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Tài liệu & Video
        </h1>
        <p className="text-muted-foreground mt-1">
          Truy cập tài liệu, bài giảng và video từ giáo viên
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {docsLoading ? "-" : fileDocs.length}
                </p>
                <p className="text-xs text-muted-foreground">Tài liệu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Video className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {docsLoading ? "-" : videoDocs.length}
                </p>
                <p className="text-xs text-muted-foreground">Video bài giảng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {docsLoading ? "-" : documents.filter((d) => d.isNew).length}
                </p>
                <p className="text-xs text-muted-foreground">Mới cập nhật</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Folder className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {courses.length > 0 ? courses.length - 1 : 0}
                </p>
                <p className="text-xs text-muted-foreground">Lớp học</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm tài liệu, video..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedCourse}
                onValueChange={setSelectedCourse}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Chọn lớp" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: All / Documents / Videos */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="gap-1.5">
            <Folder className="w-4 h-4" />
            Tất cả ({allDocs.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5">
            <FileText className="w-4 h-4" />
            Tài liệu ({fileDocs.length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-1.5">
            <Video className="w-4 h-4" />
            Video ({videoDocs.length})
          </TabsTrigger>
        </TabsList>

        {/* All tab */}
        <TabsContent value="all" className="mt-4">
          {docsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : getFiltered(allDocs).length === 0 ? (
            <EmptyState message="Không tìm thấy tài liệu nào" />
          ) : (
            <div className="space-y-3">
              {getFiltered(allDocs).map(renderDocumentRow)}
            </div>
          )}
        </TabsContent>

        {/* Documents tab */}
        <TabsContent value="documents" className="mt-4">
          {docsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : getFiltered(fileDocs).length === 0 ? (
            <EmptyState message="Không tìm thấy tài liệu nào" />
          ) : (
            <div className="space-y-3">
              {getFiltered(fileDocs).map(renderDocumentRow)}
            </div>
          )}
        </TabsContent>

        {/* Videos tab — Grid layout for better visual */}
        <TabsContent value="videos" className="mt-4">
          {docsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-xl" />
              ))}
            </div>
          ) : getFiltered(videoDocs).length === 0 ? (
            <EmptyState message="Không tìm thấy video nào" icon={<Video className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFiltered(videoDocs).map(renderVideoCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Video Player Dialog */}
      <Dialog
        open={!!playingVideo}
        onOpenChange={() => setPlayingVideo(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {playingVideo?.type === "youtube" ? (
                <Youtube className="w-5 h-5 text-red-500" />
              ) : (
                <Video className="w-5 h-5 text-purple-500" />
              )}
              {playingVideo?.name}
            </DialogTitle>
          </DialogHeader>
          {playingVideo && (
            <div className="space-y-4">
              {/* Video embed */}
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                {playingVideo.type === "youtube" && playingVideo.youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${playingVideo.youtubeId}?autoplay=0`}
                    title={playingVideo.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <video
                    src={playingVideo.fileUrl}
                    controls
                    className="absolute inset-0 w-full h-full"
                  >
                    Trình duyệt không hỗ trợ phát video.
                  </video>
                )}
              </div>
              {/* Video info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>{playingVideo.teacher}</span>
                  <span>•</span>
                  <span>{playingVideo.course}</span>
                  <span>•</span>
                  <span>{playingVideo.date}</span>
                </div>
                {playingVideo.type === "youtube" && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={playingVideo.fileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Mở trên YouTube
                    </a>
                  </Button>
                )}
              </div>
              {playingVideo.description && (
                <p className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-lg">
                  {playingVideo.description}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="text-center py-12">
        {icon ?? <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />}
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
