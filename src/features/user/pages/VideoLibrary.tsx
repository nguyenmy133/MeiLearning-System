import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Search, 
  Filter, 
  Clock, 
  Eye,
  BookOpen,
  Grid3x3,
  List
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Mock data
const videos = [
  {
    id: 1,
    title: "Bài 1: Giới thiệu về Đạo hàm",
    subject: "Toán",
    class: "Toán 10A",
    teacher: "Nguyễn Văn Toán",
    duration: "45:30",
    views: 234,
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    youtubeId: "dQw4w9WgXcQ",
    uploadDate: "2024-01-10",
    progress: 75,
    description: "Bài giảng giới thiệu khái niệm đạo hàm và các ứng dụng cơ bản"
  },
  {
    id: 2,
    title: "Bài 2: Quy tắc tính đạo hàm",
    subject: "Toán",
    class: "Toán 10A",
    teacher: "Nguyễn Văn Toán",
    duration: "38:15",
    views: 189,
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    youtubeId: "dQw4w9WgXcQ",
    uploadDate: "2024-01-12",
    progress: 45,
    description: "Các quy tắc cơ bản trong tính đạo hàm"
  },
  {
    id: 3,
    title: "Ngữ pháp: Thì hiện tại hoàn thành",
    subject: "Tiếng Anh",
    class: "IELTS-01",
    teacher: "Trần Thị Anh",
    duration: "32:20",
    views: 156,
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    youtubeId: "dQw4w9WgXcQ",
    uploadDate: "2024-01-11",
    progress: 100,
    description: "Cách sử dụng thì hiện tại hoàn thành"
  },
  {
    id: 4,
    title: "Bài 3: Ứng dụng đạo hàm vào khảo sát hàm số",
    subject: "Toán",
    class: "Toán 10A",
    teacher: "Nguyễn Văn Toán",
    duration: "52:10",
    views: 201,
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    youtubeId: "dQw4w9WgXcQ",
    uploadDate: "2024-01-15",
    progress: 0,
    description: "Sử dụng đạo hàm để khảo sát và vẽ đồ thị hàm số"
  },
];

export function VideoLibrary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handlePlay = (id: number) => navigate(`/user/videos?id=${id}`);

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || video.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = ["all", ...Array.from(new Set(videos.map(v => v.subject)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Thư viện Video</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredVideos.length} video bài giảng
          </p>
        </div>
        
        {/* View mode toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm video..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Subject filter */}
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn học</SelectItem>
                {subjects.filter(s => s !== "all").map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Video Grid/List */}
      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Không tìm thấy video nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-4"
        }>
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePlay(video.id)}>
              {viewMode === "grid" ? (
                <>
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted group">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="lg" className="rounded-full" onClick={(e) => { e.stopPropagation(); handlePlay(video.id); }}>
                        <Play className="w-6 h-6 mr-2" />
                        Xem ngay
                      </Button>
                    </div>
                    {video.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0">
                        <Progress value={video.progress} className="h-1 rounded-none" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
                        {video.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{video.teacher}</p>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{video.subject}</Badge>
                        <Badge variant="outline">{video.class}</Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {video.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.views} lượt xem
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="relative w-48 aspect-video bg-muted flex-shrink-0 rounded-lg overflow-hidden group">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" className="rounded-full" onClick={() => handlePlay(video.id)}>
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                    {video.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0">
                        <Progress value={video.progress} className="h-1 rounded-none" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-foreground">{video.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{video.subject}</Badge>
                      <Badge variant="outline">{video.class}</Badge>
                      <span className="text-xs text-muted-foreground">{video.teacher}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {video.views} lượt xem
                      </div>
                      {video.progress > 0 && (
                        <span>{video.progress}% đã xem</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
