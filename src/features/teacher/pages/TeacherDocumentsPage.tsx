import { useState } from "react";
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
  Share2,
  Users,
  Bell,
  Lock,
  Unlock,
  Check
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Mock classes for sharing
const availableClasses = [
  { id: "1", name: "Toán 10A", students: 32 },
  { id: "8", name: "Toán 11-Nâng cao", students: 28 },
  { id: "6", name: "Lý 10-B", students: 25 },
];

// Mock data
const mockDocuments = [
  {
    id: 1,
    name: "Giáo án Toán 10 - Chương 1",
    type: "pdf",
    size: "2.5 MB",
    class: "Toán 10A",
    category: "Giáo án",
    uploadDate: "15/01/2025",
    downloads: 45,
  },
  {
    id: 2,
    name: "Bài tập Hình học không gian",
    type: "pdf",
    size: "1.8 MB",
    class: "Toán 11-Nâng cao",
    category: "Bài tập",
    uploadDate: "12/01/2025",
    downloads: 32,
  },
  {
    id: 3,
    name: "Video bài giảng - Tích phân",
    type: "video",
    size: "125 MB",
    class: "Lý 10-B",
    category: "Video",
    uploadDate: "10/01/2025",
    downloads: 28,
  },
  {
    id: 4,
    name: "Slide bài giảng - Lượng giác",
    type: "image",
    size: "5.2 MB",
    class: "Toán 10A",
    category: "Slide",
    uploadDate: "08/01/2025",
    downloads: 52,
  },
  {
    id: 5,
    name: "Đề kiểm tra 15 phút - Đại số",
    type: "doc",
    size: "450 KB",
    class: "Toán 11-Nâng cao",
    category: "Đề thi",
    uploadDate: "05/01/2025",
    downloads: 18,
  },
  {
    id: 6,
    name: "Tài liệu ôn tập học kỳ 1",
    type: "pdf",
    size: "3.2 MB",
    class: "Tất cả",
    category: "Tài liệu tham khảo",
    uploadDate: "01/01/2025",
    downloads: 89,
  },
];

const categories = [
  { value: "all", label: "Tất cả" },
  { value: "giao-an", label: "Giáo án" },
  { value: "bai-tap", label: "Bài tập" },
  { value: "de-thi", label: "Đề thi" },
  { value: "slide", label: "Slide" },
  { value: "video", label: "Video" },
  { value: "tham-khao", label: "Tài liệu tham khảo" },
];

const classes = [
  { value: "all", label: "Tất cả lớp" },
  { value: "1", label: "Toán 10A" },
  { value: "8", label: "Toán 11-Nâng cao" },
  { value: "6", label: "Lý 10-B" },
];

function getFileIcon(type: string) {
  switch (type) {
    case "pdf":
      return <FileType className="w-8 h-8 text-destructive" />;
    case "video":
      return <FileVideo className="w-8 h-8 text-info" />;
    case "image":
      return <FileImage className="w-8 h-8 text-success" />;
    default:
      return <File className="w-8 h-8 text-primary" />;
  }
}

function getFileTypeLabel(type: string) {
  switch (type) {
    case "pdf":
      return "PDF";
    case "video":
      return "Video";
    case "image":
      return "Hình ảnh";
    case "doc":
      return "Word";
    default:
      return "Khác";
  }
}

export function TeacherDocumentsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<typeof mockDocuments[0] | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    category: "",
    class: "",
    description: "",
  });
  const [shareForm, setShareForm] = useState({
    selectedClasses: [] as string[],
    allowDownload: true,
    allowView: true,
    sendNotification: true,
    message: "",
  });

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleUpload = () => {
    toast({
      title: "Tải lên thành công!",
      description: `Tài liệu "${uploadForm.name}" đã được tải lên.`,
    });
    setIsUploadDialogOpen(false);
    setUploadForm({ name: "", category: "", class: "", description: "" });
  };

  const handleDelete = (docName: string) => {
    toast({
      title: "Đã xóa tài liệu",
      description: `"${docName}" đã được xóa khỏi hệ thống.`,
      variant: "destructive",
    });
  };

  const handleOpenShare = (doc: typeof mockDocuments[0]) => {
    setSelectedDocument(doc);
    setShareForm({
      selectedClasses: [],
      allowDownload: true,
      allowView: true,
      sendNotification: true,
      message: "",
    });
    setIsShareDialogOpen(true);
  };

  const handleShare = () => {
    if (shareForm.selectedClasses.length === 0) {
      toast({
        title: "Chưa chọn lớp",
        description: "Vui lòng chọn ít nhất một lớp để chia sẻ tài liệu.",
        variant: "destructive",
      });
      return;
    }

    const classNames = shareForm.selectedClasses
      .map(id => availableClasses.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    toast({
      title: "Chia sẻ thành công!",
      description: `Đã chia sẻ "${selectedDocument?.name}" cho ${classNames}.`,
    });
    setIsShareDialogOpen(false);
    setSelectedDocument(null);
  };

  const toggleClassSelection = (classId: string) => {
    setShareForm(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter(id => id !== classId)
        : [...prev.selectedClasses, classId]
    }));
  };

  const selectAllClasses = () => {
    setShareForm(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.length === availableClasses.length
        ? []
        : availableClasses.map(c => c.id)
    }));
  };

  const stats = [
    { label: "Tổng tài liệu", value: mockDocuments.length, icon: FileText, color: "text-primary" },
    { label: "Giáo án", value: mockDocuments.filter(d => d.category === "Giáo án").length, icon: FolderOpen, color: "text-info" },
    { label: "Bài tập & Đề thi", value: mockDocuments.filter(d => ["Bài tập", "Đề thi"].includes(d.category)).length, icon: File, color: "text-warning" },
    { label: "Video", value: mockDocuments.filter(d => d.category === "Video").length, icon: FileVideo, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Tài liệu giảng dạy</h1>
          <p className="text-muted-foreground">Quản lý và chia sẻ tài liệu cho học viên</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              Tải lên tài liệu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tải lên tài liệu mới</DialogTitle>
              <DialogDescription>
                Chọn file và điền thông tin để tải lên tài liệu giảng dạy
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Upload area */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">
                  Kéo thả file vào đây hoặc click để chọn
                </p>
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ: PDF, DOC, DOCX, PPT, PPTX, MP4, JPG, PNG (tối đa 200MB)
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="doc-name">Tên tài liệu</Label>
                  <Input
                    id="doc-name"
                    placeholder="Nhập tên tài liệu"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Danh mục</Label>
                    <Select
                      value={uploadForm.category}
                      onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="giao-an">Giáo án</SelectItem>
                        <SelectItem value="bai-tap">Bài tập</SelectItem>
                        <SelectItem value="de-thi">Đề thi</SelectItem>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="tham-khao">Tài liệu tham khảo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Lớp học</Label>
                    <Select
                      value={uploadForm.class}
                      onValueChange={(value) => setUploadForm({ ...uploadForm, class: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lớp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả lớp</SelectItem>
                        <SelectItem value="1">Toán 10A</SelectItem>
                        <SelectItem value="8">Toán 11-Nâng cao</SelectItem>
                        <SelectItem value="6">Lý 10-B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả (tùy chọn)</Label>
                  <Textarea
                    id="description"
                    placeholder="Nhập mô tả về tài liệu..."
                    rows={3}
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Tải lên
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-accent ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
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
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Lớp" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.value} value={cls.value}>
                      {cls.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <Tabs defaultValue="grid" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Hiển thị {filteredDocuments.length} tài liệu
          </p>
          <TabsList>
            <TabsTrigger value="grid">Lưới</TabsTrigger>
            <TabsTrigger value="list">Danh sách</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-foreground line-clamp-2 text-sm">
                          {doc.name}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Xem
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Tải xuống
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenShare(doc)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Chia sẻ
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(doc.name)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {doc.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {doc.class}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{doc.size}</span>
                          <span>{doc.downloads} lượt tải</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tải lên: {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <Card>
            <div className="divide-y divide-border">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors">
                  <div className="p-2 rounded-lg bg-accent">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{doc.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {doc.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{doc.class}</span>
                      <span className="text-xs text-muted-foreground">{doc.size}</span>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm text-muted-foreground">{doc.downloads} lượt tải</p>
                    <p className="text-xs text-muted-foreground">{doc.uploadDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenShare(doc)}
                    >
                      <Share2 className="w-4 h-4 text-primary" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(doc.name)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Không tìm thấy tài liệu</h3>
            <p className="text-muted-foreground mb-4">
              Thử thay đổi bộ lọc hoặc tải lên tài liệu mới
            </p>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tải lên tài liệu đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Chia sẻ tài liệu
            </DialogTitle>
            <DialogDescription>
              Chia sẻ "{selectedDocument?.name}" cho học viên
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Class Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Chọn lớp học</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={selectAllClasses}
                >
                  {shareForm.selectedClasses.length === availableClasses.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </Button>
              </div>
              <div className="space-y-2">
                {availableClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      shareForm.selectedClasses.includes(cls.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleClassSelection(cls.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        shareForm.selectedClasses.includes(cls.id)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      }`}>
                        {shareForm.selectedClasses.includes(cls.id) && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{cls.name}</p>
                        <p className="text-xs text-muted-foreground">{cls.students} học viên</p>
                      </div>
                    </div>
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            {/* Access Permissions */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quyền truy cập</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Cho phép xem online</p>
                      <p className="text-xs text-muted-foreground">Học viên có thể xem trực tiếp trên hệ thống</p>
                    </div>
                  </div>
                  <Switch
                    checked={shareForm.allowView}
                    onCheckedChange={(checked) => setShareForm(prev => ({ ...prev, allowView: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Cho phép tải về</p>
                      <p className="text-xs text-muted-foreground">Học viên có thể download tài liệu</p>
                    </div>
                  </div>
                  <Switch
                    checked={shareForm.allowDownload}
                    onCheckedChange={(checked) => setShareForm(prev => ({ ...prev, allowDownload: checked }))}
                  />
                </div>
              </div>
            </div>

            {/* Notification */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Gửi thông báo</p>
                    <p className="text-xs text-muted-foreground">Thông báo cho học viên về tài liệu mới</p>
                  </div>
                </div>
                <Switch
                  checked={shareForm.sendNotification}
                  onCheckedChange={(checked) => setShareForm(prev => ({ ...prev, sendNotification: checked }))}
                />
              </div>
              
              {shareForm.sendNotification && (
                <Textarea
                  placeholder="Nhập tin nhắn kèm theo (tùy chọn)..."
                  rows={2}
                  value={shareForm.message}
                  onChange={(e) => setShareForm(prev => ({ ...prev, message: e.target.value }))}
                  className="resize-none"
                />
              )}
            </div>

            {/* Summary */}
            {shareForm.selectedClasses.length > 0 && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm text-success font-medium">
                  Sẽ chia sẻ cho {shareForm.selectedClasses.reduce((acc, id) => {
                    const cls = availableClasses.find(c => c.id === id);
                    return acc + (cls?.students || 0);
                  }, 0)} học viên từ {shareForm.selectedClasses.length} lớp
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleShare} disabled={shareForm.selectedClasses.length === 0}>
              <Share2 className="w-4 h-4 mr-2" />
              Chia sẻ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
