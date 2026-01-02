import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Plus, Search, MoreHorizontal, Users, Lock } from "lucide-react";

// Mock data
const roles = [
  {
    id: 1,
    name: "Super Admin",
    description: "Toàn quyền cấu hình và quản trị hệ thống",
    type: "system",
    status: "active",
    users: 2,
    permissions: ["Quản trị hệ thống", "Quản lý người dùng", "Báo cáo", "Cấu hình"],
  },
  {
    id: 2,
    name: "Quản lý đào tạo",
    description: "Quản lý lớp, giáo viên, lịch học",
    type: "custom",
    status: "active",
    users: 5,
    permissions: ["Quản lý lớp", "Quản lý giáo viên", "Lịch học"],
  },
  {
    id: 3,
    name: "CSKH",
    description: "Xử lý yêu cầu, ticket và phản hồi",
    type: "custom",
    status: "active",
    users: 6,
    permissions: ["Ticket", "Học viên", "Thông báo"],
  },
  {
    id: 4,
    name: "Kế toán",
    description: "Theo dõi học phí và hóa đơn",
    type: "custom",
    status: "locked",
    users: 3,
    permissions: ["Học phí", "Doanh thu", "Báo cáo"],
  },
];

const permissionOptions = [
  "Quản trị hệ thống",
  "Quản lý người dùng",
  "Quản lý lớp",
  "Quản lý giáo viên",
  "Học viên",
  "Học phí",
  "Báo cáo",
  "Ticket",
  "Thông báo",
  "Lịch học",
];

export function AdminRolesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = roles.reduce((sum, role) => sum + role.users, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{roles.length}</p>
                <p className="text-sm text-muted-foreground">Tổng vai trò</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {roles.filter((r) => r.type === "system").length}
                </p>
                <p className="text-sm text-muted-foreground">Vai trò hệ thống</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {roles.filter((r) => r.type === "custom").length}
                </p>
                <p className="text-sm text-muted-foreground">Vai trò tùy chỉnh</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Người dùng gán vai trò</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
          <CardTitle className="text-lg font-display">Quản lý vai trò</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Thêm vai trò
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Tạo vai trò mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tên vai trò</Label>
                  <Input placeholder="Nhập tên vai trò" />
                </div>
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Input placeholder="Mô tả ngắn" />
                </div>
                <div className="space-y-2">
                  <Label>Phân quyền</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {permissionOptions.map((perm) => (
                      <label key={perm} className="flex items-center gap-2 text-sm">
                        <Checkbox />
                        {perm}
                      </label>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                  Tạo vai trò
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên vai trò..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vai trò</TableHead>
                <TableHead className="hidden md:table-cell">Phân quyền</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-primary/10 text-primary border-0">
                      {role.users} người
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        role.status === "active"
                          ? "bg-success/10 text-success border-0"
                          : "bg-muted text-muted-foreground border-0"
                      }
                    >
                      {role.status === "active" ? "Hoạt động" : "Khóa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem>Gán người dùng</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
