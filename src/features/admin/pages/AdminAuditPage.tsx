import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ShieldCheck, ShieldAlert, User, Clock } from "lucide-react";

// Mock data
const auditLogs = [
  {
    id: 1,
    actor: "Nguyễn Khoa",
    action: "create",
    resource: "Lớp Toán 10A",
    result: "success",
    ip: "103.12.45.12",
    createdAt: "20/12/2024 10:12",
  },
  {
    id: 2,
    actor: "Lê Thảo",
    action: "update",
    resource: "Học phí - Nguyễn Minh Anh",
    result: "success",
    ip: "103.12.45.13",
    createdAt: "20/12/2024 09:45",
  },
  {
    id: 3,
    actor: "Trần Quang",
    action: "delete",
    resource: "Lead Phạm Văn H",
    result: "failed",
    ip: "103.12.45.15",
    createdAt: "19/12/2024 17:05",
  },
  {
    id: 4,
    actor: "Nguyễn Khoa",
    action: "login",
    resource: "Đăng nhập Admin",
    result: "success",
    ip: "103.12.45.12",
    createdAt: "19/12/2024 08:20",
  },
  {
    id: 5,
    actor: "Lê Thảo",
    action: "export",
    resource: "Báo cáo học phí",
    result: "success",
    ip: "103.12.45.13",
    createdAt: "18/12/2024 14:55",
  },
];

const actionMap = {
  create: "Tạo mới",
  update: "Cập nhật",
  delete: "Xóa",
  login: "Đăng nhập",
  export: "Xuất báo cáo",
};

export function AdminAuditPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterResult, setFilterResult] = useState("all");

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAction = filterAction === "all" || log.action === filterAction;
    const matchResult = filterResult === "all" || log.result === filterResult;
    return matchSearch && matchAction && matchResult;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{auditLogs.length}</p>
                <p className="text-sm text-muted-foreground">Hoạt động hôm nay</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {auditLogs.filter((l) => l.result === "success").length}
                </p>
                <p className="text-sm text-muted-foreground">Thành công</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {auditLogs.filter((l) => l.result === "failed").length}
                </p>
                <p className="text-sm text-muted-foreground">Thất bại</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24h</p>
                <p className="text-sm text-muted-foreground">Khung thời gian</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display">Nhật ký hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo người thao tác hoặc tài nguyên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Hành động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="create">Tạo mới</SelectItem>
                  <SelectItem value="update">Cập nhật</SelectItem>
                  <SelectItem value="delete">Xóa</SelectItem>
                  <SelectItem value="login">Đăng nhập</SelectItem>
                  <SelectItem value="export">Xuất báo cáo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterResult} onValueChange={setFilterResult}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Kết quả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người thao tác</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead className="hidden md:table-cell">Tài nguyên</TableHead>
                <TableHead>Kết quả</TableHead>
                <TableHead className="hidden lg:table-cell">IP</TableHead>
                <TableHead className="hidden sm:table-cell">Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{log.actor}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {actionMap[log.action as keyof typeof actionMap]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{log.resource}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        log.result === "success"
                          ? "bg-success/10 text-success border-0"
                          : "bg-destructive/10 text-destructive border-0"
                      }
                    >
                      {log.result === "success" ? "Thành công" : "Thất bại"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{log.ip}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">{log.createdAt}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
