import { useState } from "react";
import { Clock, Calendar, Send, CheckCircle, XCircle, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const leaveRequests = [
  { id: 1, type: "leave", date: "18/12/2024", class: "IELTS Speaking", reason: "Có việc gia đình đột xuất", status: "pending", createdAt: "14/12/2024" },
  { id: 2, type: "late", date: "16/12/2024", class: "Tiếng Anh Giao tiếp", reason: "Kẹt xe trên đường đi học", status: "approved", createdAt: "15/12/2024" },
  { id: 3, type: "leave", date: "10/12/2024", class: "Business English", reason: "Đi khám bệnh", status: "approved", createdAt: "08/12/2024" },
  { id: 4, type: "leave", date: "05/12/2024", class: "IELTS Writing", reason: "Tham dự đám cưới", status: "rejected", createdAt: "03/12/2024", rejectReason: "Đã quá hạn xin phép" },
];

const upcomingClasses = [
  { id: 1, name: "IELTS Speaking", date: "18/12/2024", time: "10:00 - 11:30" },
  { id: 2, name: "Business English", date: "19/12/2024", time: "14:00 - 15:30" },
  { id: 3, name: "Tiếng Anh Giao tiếp", date: "20/12/2024", time: "08:00 - 09:30" },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-5 w-5 text-success" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-destructive" />;
    case "pending":
      return <Clock className="h-5 w-5 text-warning" />;
    default:
      return null;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "approved":
      return "Đã duyệt";
    case "rejected":
      return "Từ chối";
    case "pending":
      return "Chờ duyệt";
    default:
      return "";
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "approved":
      return "default";
    case "rejected":
      return "destructive";
    case "pending":
      return "secondary";
    default:
      return "outline";
  }
};

export function LeavePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [requestType, setRequestType] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Đã gửi yêu cầu",
      description: "Yêu cầu của bạn đã được gửi và đang chờ xét duyệt",
    });
    setIsOpen(false);
    setRequestType("");
    setSelectedClass("");
    setReason("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Xin nghỉ / Đi muộn
          </h1>
          <p className="text-muted-foreground mt-1">
            Gửi yêu cầu xin nghỉ học hoặc thông báo đi muộn
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo yêu cầu mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo yêu cầu mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Loại yêu cầu</Label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại yêu cầu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leave">Xin nghỉ học</SelectItem>
                    <SelectItem value="late">Thông báo đi muộn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Buổi học</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn buổi học" />
                  </SelectTrigger>
                  <SelectContent>
                    {upcomingClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name} - {cls.date} ({cls.time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lý do</Label>
                <Textarea
                  placeholder="Nhập lý do..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={!requestType || !selectedClass || !reason}>
                  <Send className="h-4 w-4 mr-2" />
                  Gửi yêu cầu
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{leaveRequests.length}</p>
                <p className="text-xs text-muted-foreground">Tổng yêu cầu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {leaveRequests.filter(r => r.status === "pending").length}
                </p>
                <p className="text-xs text-muted-foreground">Chờ duyệt</p>
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
                  {leaveRequests.filter(r => r.status === "approved").length}
                </p>
                <p className="text-xs text-muted-foreground">Đã duyệt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {leaveRequests.filter(r => r.status === "rejected").length}
                </p>
                <p className="text-xs text-muted-foreground">Từ chối</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
          <CardDescription>
            Các yêu cầu xin nghỉ và đi muộn của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-secondary/50 rounded-lg border border-border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {request.type === "leave" ? "Xin nghỉ" : "Đi muộn"}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(request.status) as any} className="text-xs">
                          {getStatusText(request.status)}
                        </Badge>
                      </div>
                      <p className="font-medium text-foreground mt-2">{request.class}</p>
                      <p className="text-sm text-muted-foreground">Ngày: {request.date}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Lý do:</span> {request.reason}
                      </p>
                      {request.rejectReason && (
                        <p className="text-sm text-destructive mt-1">
                          <span className="font-medium">Lý do từ chối:</span> {request.rejectReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {request.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notice */}
      <Card className="border-info/30 bg-info/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Lưu ý khi xin nghỉ</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Yêu cầu xin nghỉ cần được gửi trước ít nhất 24 giờ</li>
                <li>Mỗi học viên được phép nghỉ tối đa 3 buổi/khóa học</li>
                <li>Buổi học bù sẽ được sắp xếp sau khi yêu cầu được duyệt</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
