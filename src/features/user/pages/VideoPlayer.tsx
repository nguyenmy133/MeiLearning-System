import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown,
  Share2,
  Download,
  Clock,
  Eye,
  BookOpen,
  ChevronRight
} from "lucide-react";

// Mock data - same as VideoLibrary
const videos = [
  {
    id: 1,
    title: "Bài 1: Giới thiệu về Đạo hàm",
    subject: "Toán học",
    class: "Toán 12A",
    teacher: "Thầy An",
    duration: "45:30",
    views: 234,
    youtubeId: "dQw4w9WgXcQ",
    uploadDate: "2024-01-10",
    description: "Bài giảng giới thiệu khái niệm đạo hàm và các ứng dụng cơ bản. Trong video này, chúng ta sẽ tìm hiểu về định nghĩa đạo hàm, ý nghĩa hình học và vật lý của đạo hàm.",
    likes: 45,
    dislikes: 2
  },
  {
    id: 2,
    title: "Bài 2: Quy tắc tính đạo hàm",
    subject: "Toán học",
    class: "Toán 12A",
    teacher: "Thầy An",
    duration: "38:15",
    views: 189,
    youtubeId: "dQw4w9WgXcQ",
    uploadDate: "2024-01-12",
    description: "Các quy tắc cơ bản trong tính đạo hàm",
    likes: 38,
    dislikes: 1
  },
  {
    id: 3,
    title: "English Grammar: Present Perfect",
    subject: "Tiếng Anh",
    class: "Tiếng Anh 10B",
    teacher: "Cô Bích",
    duration: "32:20",
    views: 156,
    youtubeId: "dQw4w9WgXcQ",
    uploadDate: "2024-01-11",
    description: "Cách sử dụng thì hiện tại hoàn thành",
    likes: 29,
    dislikes: 0
  },
];

export function VideoPlayer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoId = parseInt(searchParams.get("id") || "1");
  
  const currentVideo = videos.find(v => v.id === videoId) || videos[0];
  const relatedVideos = videos.filter(v => 
    v.id !== videoId && v.subject === currentVideo.subject
  ).slice(0, 3);

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [watchProgress, setWatchProgress] = useState(35);

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate("/user/videos")}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại thư viện
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main video section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video player */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1`}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Card>

          {/* Video info */}
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Title and badges */}
              <div className="space-y-3">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {currentVideo.title}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{currentVideo.subject}</Badge>
                  <Badge variant="outline">{currentVideo.class}</Badge>
                  <span className="text-sm text-muted-foreground">{currentVideo.teacher}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {currentVideo.views} lượt xem
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentVideo.duration}
                </div>
                <span>{currentVideo.uploadDate}</span>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant={liked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                    className="gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {currentVideo.likes + (liked ? 1 : 0)}
                  </Button>
                  <Button
                    variant={disliked ? "default" : "outline"}
                    size="sm"
                    onClick={handleDislike}
                    className="gap-2"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    {currentVideo.dislikes + (disliked ? 1 : 0)}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Chia sẻ
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Tải xuống
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Mô tả</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentVideo.description}
                </p>
              </div>

              {/* Watch progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tiến độ xem</span>
                  <span className="font-medium text-foreground">{watchProgress}%</span>
                </div>
                <Progress value={watchProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Related videos */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Video liên quan
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              {relatedVideos.map((video) => (
                <Card 
                  key={video.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/user/video-player?id=${video.id}`)}
                >
                  <div className="flex gap-3 p-3">
                    <div className="relative w-32 aspect-video bg-muted flex-shrink-0 rounded overflow-hidden">
                      <img 
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground line-clamp-2 leading-tight mb-1">
                        {video.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{video.teacher}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Eye className="w-3 h-3" />
                        {video.views}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {relatedVideos.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => navigate("/user/videos")}
                >
                  Xem thêm video
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
