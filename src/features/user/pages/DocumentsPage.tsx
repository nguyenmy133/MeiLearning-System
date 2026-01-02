import { useState } from "react";
import { FileText, Download, Eye, Search, Folder, File, Clock, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const documents = [
  { id: 1, name: "Giáo trình Unit 1-5.pdf", course: "Tiếng Anh Giao tiếp", type: "pdf", size: "2.5 MB", date: "10/12/2024", isNew: true },
  { id: 2, name: "Bài tập Speaking Week 1.docx", course: "IELTS Speaking", type: "doc", size: "1.2 MB", date: "09/12/2024", isNew: true },
  { id: 3, name: "Vocabulary List.xlsx", course: "Business English", type: "excel", size: "500 KB", date: "08/12/2024", isNew: false },
  { id: 4, name: "Writing Task 2 Sample.pdf", course: "IELTS Writing", type: "pdf", size: "800 KB", date: "05/12/2024", isNew: false },
  { id: 5, name: "Audio Listening Practice.mp3", course: "IELTS Speaking", type: "audio", size: "15 MB", date: "03/12/2024", isNew: false },
  { id: 6, name: "Grammar Notes Chapter 3.pdf", course: "Tiếng Anh Giao tiếp", type: "pdf", size: "1.8 MB", date: "01/12/2024", isNew: false },
  { id: 7, name: "Presentation Slides.pptx", course: "Business English", type: "ppt", size: "5.2 MB", date: "28/11/2024", isNew: false },
  { id: 8, name: "Homework Week 3.pdf", course: "Tiếng Anh Giao tiếp", type: "pdf", size: "600 KB", date: "25/11/2024", isNew: false },
];

const courses = [
  { id: "all", name: "Tất cả khóa học" },
  { id: "english", name: "Tiếng Anh Giao tiếp" },
  { id: "ielts-speaking", name: "IELTS Speaking" },
  { id: "ielts-writing", name: "IELTS Writing" },
  { id: "business", name: "Business English" },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><FileText className="h-5 w-5 text-red-500" /></div>;
    case "doc":
      return <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><FileText className="h-5 w-5 text-blue-500" /></div>;
    case "excel":
      return <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><FileText className="h-5 w-5 text-green-500" /></div>;
    case "ppt":
      return <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center"><FileText className="h-5 w-5 text-orange-500" /></div>;
    case "audio":
      return <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><FileText className="h-5 w-5 text-purple-500" /></div>;
    default:
      return <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><File className="h-5 w-5 text-gray-500" /></div>;
  }
};

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const { toast } = useToast();

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === "all" || doc.course.toLowerCase().includes(selectedCourse);
    return matchesSearch && matchesCourse;
  });

  const handleDownload = (docName: string) => {
    toast({
      title: "Đang tải xuống",
      description: `File ${docName} đang được tải xuống...`,
    });
  };

  const handleView = (docName: string) => {
    toast({
      title: "Đang mở file",
      description: `Đang mở ${docName}...`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Tài liệu học tập
        </h1>
        <p className="text-muted-foreground mt-1">
          Truy cập tài liệu, bài giảng và bài tập của các khóa học
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
                <p className="text-2xl font-bold text-foreground">{documents.length}</p>
                <p className="text-xs text-muted-foreground">Tổng tài liệu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Folder className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">4</p>
                <p className="text-xs text-muted-foreground">Khóa học</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{documents.filter(d => d.isNew).length}</p>
                <p className="text-xs text-muted-foreground">Tài liệu mới</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Download className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">28 MB</p>
                <p className="text-xs text-muted-foreground">Tổng dung lượng</p>
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
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Chọn khóa học" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài liệu</CardTitle>
          <CardDescription>
            {filteredDocuments.length} tài liệu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getFileIcon(doc.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{doc.name}</p>
                      {doc.isNew && (
                        <Badge className="bg-accent text-accent-foreground text-xs">Mới</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {doc.course} • {doc.size} • {doc.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleView(doc.name)}
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
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Không tìm thấy tài liệu nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
