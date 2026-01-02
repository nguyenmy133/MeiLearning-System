import { useState } from "react";
import { Ticket, MessageSquare, Plus, Clock, CheckCircle, AlertCircle, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const tickets = [
  {
    id: "TK-001",
    subject: "Không thể điểm danh bằng QR",
    category: "Kỹ thuật",
    status: "open",
    priority: "high",
    createdAt: "15/12/2024",
    lastUpdate: "15/12/2024",
    messages: [
      { id: 1, sender: "user", content: "Tôi không thể quét mã QR để điểm danh. Ứng dụng báo lỗi.", time: "10:30" },
      { id: 2, sender: "support", content: "Xin chào! Bạn vui lòng cập nhật ứng dụng lên phiên bản mới nhất và thử lại nhé.", time: "11:00" },
    ]
  },
  {
    id: "TK-002",
    subject: "Hỏi về chuyển lớp",
    category: "Học vụ",
    status: "resolved",
    priority: "medium",
    createdAt: "10/12/2024",
    lastUpdate: "12/12/2024",
    messages: [
      { id: 1, sender: "user", content: "Tôi muốn chuyển từ lớp sáng sang lớp chiều được không?", time: "14:00" },
      { id: 2, sender: "support", content: "Được ạ. Bạn vui lòng đến văn phòng để làm thủ tục chuyển lớp.", time: "15:00" },
    ]
  },
  {
    id: "TK-003",
    subject: "Xin cấp lại thẻ học viên",
    category: "Khác",
    status: "pending",
    priority: "low",
    createdAt: "08/12/2024",
    lastUpdate: "08/12/2024",
    messages: [
      { id: 1, sender: "user", content: "Tôi bị mất thẻ học viên, xin hướng dẫn cấp lại.", time: "09:00" },
    ]
  },
];

const categories = [
  { id: "technical", name: "Kỹ thuật" },
  { id: "academic", name: "Học vụ" },
  { id: "payment", name: "Thanh toán" },
  { id: "other", name: "Khác" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "open":
      return <Badge className="bg-info text-info-foreground">Đang xử lý</Badge>;
    case "pending":
      return <Badge variant="secondary">Chờ phản hồi</Badge>;
    case "resolved":
      return <Badge className="bg-success text-success-foreground">Đã giải quyết</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <Badge variant="destructive" className="text-xs">Cao</Badge>;
    case "medium":
      return <Badge variant="secondary" className="text-xs">Trung bình</Badge>;
    case "low":
      return <Badge variant="outline" className="text-xs">Thấp</Badge>;
    default:
      return null;
  }
};

export function TicketsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<typeof tickets[0] | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newContent, setNewContent] = useState("");
  const { toast } = useToast();

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Đã tạo ticket",
      description: "Ticket của bạn đã được gửi. Chúng tôi sẽ phản hồi sớm nhất có thể.",
    });
    setIsOpen(false);
    setNewSubject("");
    setNewCategory("");
    setNewContent("");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    toast({
      title: "Đã gửi tin nhắn",
      description: "Tin nhắn của bạn đã được gửi.",
    });
    setNewMessage("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Ticket hỗ trợ
          </h1>
          <p className="text-muted-foreground mt-1">
            Gửi yêu cầu hỗ trợ và theo dõi trạng thái
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo ticket mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo ticket mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề</Label>
                <Input
                  placeholder="Nhập tiêu đề..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Danh mục</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nội dung</Label>
                <Textarea
                  placeholder="Mô tả chi tiết vấn đề của bạn..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={!newSubject || !newCategory || !newContent}>
                  <Send className="h-4 w-4 mr-2" />
                  Gửi ticket
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {tickets.filter(t => t.status === "open").length}
                </p>
                <p className="text-xs text-muted-foreground">Đang xử lý</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {tickets.filter(t => t.status === "pending").length}
                </p>
                <p className="text-xs text-muted-foreground">Chờ phản hồi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {tickets.filter(t => t.status === "resolved").length}
                </p>
                <p className="text-xs text-muted-foreground">Đã giải quyết</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Danh sách ticket</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${
                    selectedTicket?.id === ticket.id ? "bg-secondary" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">{ticket.id} • {ticket.category}</p>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{ticket.lastUpdate}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ticket Detail */}
        <Card className="lg:col-span-2">
          {selectedTicket ? (
            <>
              <CardHeader className="border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{selectedTicket.id}</Badge>
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                    </div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <CardDescription>
                      {selectedTicket.category} • Tạo ngày {selectedTicket.createdAt}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Messages */}
                <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply */}
                {selectedTicket.status !== "resolved" && (
                  <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nhập tin nhắn..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Chọn một ticket để xem chi tiết</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
