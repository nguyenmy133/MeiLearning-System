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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// ── Mock data — Consistent with TeacherDocumentsPage ─────────────────────
// Documents + Videos merged into a single module

interface DocumentItem {
  id: number;
  name: string;
  course: string;
  type: "pdf" | "doc" | "excel" | "ppt" | "audio" | "video";
  size: string;
  date: string;
  isNew: boolean;
  teacher: string;
  // Video-specific fields
  youtubeId?: string;
  duration?: string;
  views?: number;
  progress?: number;
  description?: string;
}

const documents: DocumentItem[] = [
  // Regular documents (from TeacherDocumentsPage)
  {
    id: 1,
    name: "Giáo trình Unit 1-5.pdf",
    course: "Toán 10A",
    type: "pdf",
    size: "2.5 MB",
    date: "10/12/2024",
    isNew: true,
    teacher: "Nguyễn Văn Toán",
  },
  {
    id: 2,
    name: "Bài tập Chương 1 - Đại số.docx",
    course: "Toán 10A",
    type: "doc",
    size: "1.2 MB",
    date: "09/12/2024",
    isNew: true,
    teacher: "Nguyễn Văn Toán",
  },
  {
    id: 3,
    name: "Công thức Hóa học cơ bản.xlsx",
    course: "Hóa 11-A",
    type: "excel",
    size: "500 KB",
    date: "08/12/2024",
    isNew: false,
    teacher: "Lê Văn Hóa",
  },
  {
    id: 4,
    name: "Đề thi giữa kỳ Toán 10.pdf",
    course: "Toán 10A",
    type: "pdf",
    size: "800 KB",
    date: "05/12/2024",
    isNew: false,
    teacher: "Nguyễn Văn Toán",
  },
  {
    id: 5,
    name: "Slide bài giảng Vật lý - Cơ học.pptx",
    course: "Lý 10-B",
    type: "ppt",
    size: "5.2 MB",
    date: "03/12/2024",
    isNew: false,
    teacher: "Nguyễn Văn Toán",
  },
  {
    id: 6,
    name: "Bài tập ôn thi HK1.pdf",
    course: "Toán 10A",
    type: "pdf",
    size: "1.8 MB",
    date: "01/12/2024",
    isNew: false,
    teacher: "Nguyễn Văn Toán",
  },
  // Video items (merged from VideoLibrary)
  {
    id: 101,
    name: "Bài 1: Giới thiệu về Đạo hàm",
    course: "Toán 10A",
    type: "video",
    size: "",
    date: "15/12/2024",
    isNew: true,
    teacher: "Nguyễn Văn Toán",
    youtubeId: "dQw4w9WgXcQ",
    duration: "45:30",
    views: 234,
    progress: 75,
    description: "Giới thiệu khái niệm đạo hàm và các ứng dụng cơ bản",
  },
  {
    id: 102,
    name: "Bài 2: Phương trình bậc hai",
    course: "Toán 10A",
    type: "video",
    size: "",
    date: "12/12/2024",
    isNew: true,
    teacher: "Nguyễn Văn Toán",
    youtubeId: "dQw4w9WgXcQ",
    duration: "38:15",
    views: 189,
    progress: 100,
    description: "Cách giải phương trình bậc hai và ứng dụng",
  },
  {
    id: 103,
    name: "Thí nghiệm: Định luật Newton",
    course: "Lý 10-B",
    type: "video",
    size: "",
    date: "08/12/2024",
    isNew: false,
    teacher: "Nguyễn Văn Toán",
    youtubeId: "dQw4w9WgXcQ",
    duration: "25:40",
    views: 156,
    progress: 100,
    description: "Video thí nghiệm minh họa 3 định luật Newton",
  },
  {
    id: 104,
    name: "Bài 3: Phản ứng Oxi hóa khử",
    course: "Hóa 11-A",
    type: "video",
    size: "",
    date: "05/12/2024",
    isNew: false,
    teacher: "Lê Văn Hóa",
    youtubeId: "dQw4w9WgXcQ",
    duration: "52:10",
    views: 201,
    progress: 30,
    description: "Giải thích phản ứng oxi hóa khử và bài tập áp dụng",
  },
];

const courses = [
  { id: "all", name: "Tất cả lớp" },
  { id: "1", name: "Toán 10A" },
  { id: "6", name: "Lý 10-B" },
  { id: "3", name: "Hóa 11-A" },
];

// ── Helpers ──────────────────────────────────────────────────────────────

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return (
        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <FileText className="h-5 w-5 text-red-500" />
        </div>
      );
    case "doc":
      return (
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <FileText className="h-5 w-5 text-blue-500" />
        </div>
      );
    case "excel":
      return (
        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <FileText className="h-5 w-5 text-green-500" />
        </div>
      );
    case "ppt":
      return (
        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <FileText className="h-5 w-5 text-orange-500" />
        </div>
      );
    case "video":
      return (
        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Video className="h-5 w-5 text-purple-500" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
          <File className="h-5 w-5 text-gray-500" />
        </div>
      );
  }
};

// ── Component ───────────────────────────────────────────────────────────

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [playingVideo, setPlayingVideo] = useState<DocumentItem | null>(null);

  const allDocs = documents;
  const fileDocs = documents.filter((d) => d.type !== "video");
  const videoDocs = documents.filter((d) => d.type === "video");

  const getFiltered = (items: DocumentItem[]) =>
    items.filter((doc) => {
      const matchesSearch = doc.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCourse =
        selectedCourse === "all" ||
        doc.course === courses.find(c => c.id === selectedCourse)?.name;
      return matchesSearch && matchesCourse;
    });

  const handleDownload = (docName: string) => {
    toast.success("Đang tải xuống", {
      description: `File ${docName} đang được tải xuống...`,
    });
  };

  const handleView = (doc: DocumentItem) => {
    if (doc.type === "video") {
      setPlayingVideo(doc);
    } else {
      toast.success("Đang mở file", {
        description: `Đang mở ${doc.name}...`,
      });
    }
  };

  const renderDocumentRow = (doc: DocumentItem) => (
    <div
      key={doc.id}
      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {getFileIcon(doc.type)}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-foreground truncate">{doc.name}</p>
            {doc.isNew && (
              <Badge className="bg-accent text-accent-foreground text-xs">
                Mới
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {doc.course} • {doc.teacher}
            {doc.type !== "video" && ` • ${doc.size}`} • {doc.date}
          </p>
          {/* Video progress bar */}
          {doc.type === "video" && doc.progress !== undefined && (
            <div className="flex items-center gap-2 mt-1.5">
              <Progress value={doc.progress} className="h-1.5 w-24" />
              <span className="text-xs text-muted-foreground">
                {doc.progress}%
              </span>
              {doc.duration && (
                <span className="text-xs text-muted-foreground">
                  • {doc.duration}
                </span>
              )}
              {doc.views !== undefined && (
                <span className="text-xs text-muted-foreground">
                  • {doc.views} lượt xem
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {doc.type === "video" ? (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            onClick={() => handleView(doc)}
          >
            <Play className="h-4 w-4" />
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
              onClick={() => handleDownload(doc.name)}
              className="text-muted-foreground hover:text-primary"
            >
              <Download className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {fileDocs.length}
                </p>
                <p className="text-xs text-muted-foreground">Tài liệu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Video className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {videoDocs.length}
                </p>
                <p className="text-xs text-muted-foreground">Video bài giảng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {documents.filter((d) => d.isNew).length}
                </p>
                <p className="text-xs text-muted-foreground">Mới cập nhật</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Folder className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {courses.length - 1}
                </p>
                <p className="text-xs text-muted-foreground">Lớp học</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
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

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả tài liệu & video</CardTitle>
              <CardDescription>
                {getFiltered(allDocs).length} mục
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getFiltered(allDocs).map(renderDocumentRow)}
              </div>
              {getFiltered(allDocs).length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground">
                    Không tìm thấy tài liệu nào
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu</CardTitle>
              <CardDescription>
                {getFiltered(fileDocs).length} tài liệu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getFiltered(fileDocs).map(renderDocumentRow)}
              </div>
              {getFiltered(fileDocs).length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground">
                    Không tìm thấy tài liệu nào
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Video bài giảng</CardTitle>
              <CardDescription>
                {getFiltered(videoDocs).length} video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getFiltered(videoDocs).map(renderDocumentRow)}
              </div>
              {getFiltered(videoDocs).length === 0 && (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground">
                    Không tìm thấy video nào
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
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
              <Video className="w-5 h-5 text-purple-500" />
              {playingVideo?.name}
            </DialogTitle>
          </DialogHeader>
          {playingVideo && (
            <div className="space-y-4">
              {/* YouTube embed */}
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${playingVideo.youtubeId}?autoplay=0`}
                  title={playingVideo.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              {/* Video info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>{playingVideo.teacher}</span>
                  <span>•</span>
                  <span>{playingVideo.course}</span>
                  <span>•</span>
                  <span>{playingVideo.duration}</span>
                </div>
                <span>{playingVideo.views} lượt xem</span>
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
