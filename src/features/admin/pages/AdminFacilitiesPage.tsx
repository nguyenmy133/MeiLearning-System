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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  DoorOpen,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Users,
} from "lucide-react";

// Mock data
const facilities = [
  {
    id: 1,
    name: "Cơ sở Quận 1",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    phone: "028-1234-5678",
    manager: "Nguyễn Văn A",
    rooms: 8,
    status: "active",
  },
  {
    id: 2,
    name: "Cơ sở Quận 3",
    address: "456 Võ Văn Tần, Quận 3, TP.HCM",
    phone: "028-2345-6789",
    manager: "Trần Thị B",
    rooms: 6,
    status: "active",
  },
  {
    id: 3,
    name: "Cơ sở Thủ Đức",
    address: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
    phone: "028-3456-7890",
    manager: "Lê Văn C",
    rooms: 10,
    status: "maintenance",
  },
];

const rooms = [
  { id: 1, name: "Phòng 101", facility: "Cơ sở Quận 1", capacity: 20, equipment: "Máy chiếu, Bảng trắng", status: "available" },
  { id: 2, name: "Phòng 102", facility: "Cơ sở Quận 1", capacity: 15, equipment: "Bảng trắng", status: "occupied" },
  { id: 3, name: "Phòng 201", facility: "Cơ sở Quận 1", capacity: 25, equipment: "Máy chiếu, Bảng trắng, Điều hòa", status: "available" },
  { id: 4, name: "Phòng A1", facility: "Cơ sở Quận 3", capacity: 18, equipment: "Máy chiếu", status: "maintenance" },
  { id: 5, name: "Phòng A2", facility: "Cơ sở Quận 3", capacity: 22, equipment: "Bảng trắng, Điều hòa", status: "available" },
  { id: 6, name: "Phòng Lab 1", facility: "Cơ sở Thủ Đức", capacity: 30, equipment: "Máy tính, Máy chiếu", status: "occupied" },
];

export function AdminFacilitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFacilityDialogOpen, setIsFacilityDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);

  const getStatusBadge = (status: string, type: "facility" | "room") => {
    if (type === "facility") {
      switch (status) {
        case "active":
          return <Badge className="bg-primary/10 text-primary border-0">Hoạt động</Badge>;
        case "maintenance":
          return <Badge className="bg-secondary/30 text-secondary-foreground border-0">Bảo trì</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    } else {
      switch (status) {
        case "available":
          return <Badge className="bg-primary/10 text-primary border-0">Trống</Badge>;
        case "occupied":
          return <Badge className="bg-accent text-accent-foreground border-0">Đang sử dụng</Badge>;
        case "maintenance":
          return <Badge className="bg-secondary/30 text-secondary-foreground border-0">Bảo trì</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{facilities.length}</p>
                <p className="text-sm text-muted-foreground">Cơ sở</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DoorOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{rooms.length}</p>
                <p className="text-sm text-muted-foreground">Phòng học</p>
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
                <p className="text-2xl font-bold text-foreground">
                  {rooms.reduce((acc, r) => acc + r.capacity, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Sức chứa</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <DoorOpen className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {rooms.filter((r) => r.status === "available").length}
                </p>
                <p className="text-sm text-muted-foreground">Phòng trống</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="facilities" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="facilities">Cơ sở</TabsTrigger>
            <TabsTrigger value="rooms">Phòng học</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Facilities Tab */}
        <TabsContent value="facilities">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-display">Danh sách cơ sở</CardTitle>
              <Dialog open={isFacilityDialogOpen} onOpenChange={setIsFacilityDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm cơ sở
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm cơ sở mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Tên cơ sở</Label>
                      <Input placeholder="Nhập tên cơ sở" />
                    </div>
                    <div className="space-y-2">
                      <Label>Địa chỉ</Label>
                      <Textarea placeholder="Nhập địa chỉ đầy đủ" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Số điện thoại</Label>
                        <Input placeholder="028-xxxx-xxxx" />
                      </div>
                      <div className="space-y-2">
                        <Label>Quản lý</Label>
                        <Input placeholder="Tên người quản lý" />
                      </div>
                    </div>
                    <Button className="w-full mt-6" onClick={() => setIsFacilityDialogOpen(false)}>
                      Lưu cơ sở
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên cơ sở</TableHead>
                    <TableHead className="hidden md:table-cell">Địa chỉ</TableHead>
                    <TableHead className="hidden lg:table-cell">Điện thoại</TableHead>
                    <TableHead className="hidden sm:table-cell">Quản lý</TableHead>
                    <TableHead className="text-center">Phòng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilities
                    .filter(
                      (f) =>
                        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        f.address.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((facility) => (
                      <TableRow key={facility.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="font-medium">{facility.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="text-sm">{facility.address}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span className="text-sm">{facility.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{facility.manager}</TableCell>
                        <TableCell className="text-center">{facility.rooms}</TableCell>
                        <TableCell>{getStatusBadge(facility.status, "facility")}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-display">Danh sách phòng học</CardTitle>
              <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm phòng
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Thêm phòng học mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tên phòng</Label>
                        <Input placeholder="VD: Phòng 101" />
                      </div>
                      <div className="space-y-2">
                        <Label>Cơ sở</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn cơ sở" />
                          </SelectTrigger>
                          <SelectContent>
                            {facilities.map((f) => (
                              <SelectItem key={f.id} value={f.id.toString()}>
                                {f.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Sức chứa</Label>
                        <Input type="number" placeholder="20" />
                      </div>
                      <div className="space-y-2">
                        <Label>Trạng thái</Label>
                        <Select defaultValue="available">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Trống</SelectItem>
                            <SelectItem value="occupied">Đang sử dụng</SelectItem>
                            <SelectItem value="maintenance">Bảo trì</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Thiết bị</Label>
                      <Textarea placeholder="Máy chiếu, Bảng trắng, Điều hòa..." />
                    </div>
                    <Button className="w-full" onClick={() => setIsRoomDialogOpen(false)}>
                      Lưu phòng
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên phòng</TableHead>
                    <TableHead>Cơ sở</TableHead>
                    <TableHead className="text-center">Sức chứa</TableHead>
                    <TableHead className="hidden md:table-cell">Thiết bị</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms
                    .filter(
                      (r) =>
                        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.facility.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((room) => (
                      <TableRow key={room.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DoorOpen className="w-4 h-4 text-primary" />
                            <span className="font-medium">{room.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{room.facility}</TableCell>
                        <TableCell className="text-center">{room.capacity}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">{room.equipment}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(room.status, "room")}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
