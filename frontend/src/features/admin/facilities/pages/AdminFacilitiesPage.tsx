import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2, DoorOpen, Plus, Search, MoreHorizontal, Edit, Trash2,
  MapPin, Phone, Users, Loader2,
} from "lucide-react";

// ===== Module imports =====
import {
  useFacilities, useFacilityStats, useActiveFacilities,
  useCreateFacility, useUpdateFacility, useDeleteFacility,
  useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom,
} from "../hooks";
import type {
  Facility, Room, CreateFacilityDTO, UpdateFacilityDTO,
  CreateRoomDTO, UpdateRoomDTO, FacilityStatusType, RoomStatusType,
} from "../types";
import { FACILITY_STATUS_LABELS, ROOM_STATUS_LABELS } from "../types";

// ============================================================================
// STATUS BADGE HELPER
// ============================================================================

function FacilityStatusBadge({ status }: { status: FacilityStatusType }) {
  const map: Record<FacilityStatusType, string> = {
    active: "bg-primary/10 text-primary",
    maintenance: "bg-secondary/30 text-secondary-foreground",
    inactive: "bg-destructive/10 text-destructive",
  };
  return (
    <Badge className={`${map[status]} border-0`}>
      {FACILITY_STATUS_LABELS[status]}
    </Badge>
  );
}

function RoomStatusBadge({ status }: { status: RoomStatusType }) {
  const map: Record<RoomStatusType, string> = {
    available: "bg-primary/10 text-primary",
    occupied: "bg-accent text-accent-foreground",
    maintenance: "bg-secondary/30 text-secondary-foreground",
  };
  return (
    <Badge className={`${map[status]} border-0`}>
      {ROOM_STATUS_LABELS[status]}
    </Badge>
  );
}

// ============================================================================
// STATS CARDS
// ============================================================================

function StatsCards() {
  const { data: stats, isLoading } = useFacilityStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-7 w-10" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    { icon: Building2, value: stats?.totalFacilities ?? 0, label: "Cơ sở", variant: "primary" },
    { icon: DoorOpen, value: stats?.totalRooms ?? 0, label: "Phòng học", variant: "primary" },
    { icon: Users, value: stats?.totalCapacity ?? 0, label: "Sức chứa", variant: "primary" },
    { icon: DoorOpen, value: stats?.availableRooms ?? 0, label: "Phòng trống", variant: "secondary" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                c.variant === "primary" ? "bg-primary/10" : "bg-secondary/20"
              }`}>
                <c.icon className={`w-5 h-5 ${
                  c.variant === "primary" ? "text-primary" : "text-secondary-foreground"
                }`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
                <p className="text-sm text-muted-foreground">{c.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// FACILITY FORM (dùng chung cho Add + Edit)
// ============================================================================

interface FacilityFormProps {
  initialData?: Facility;
  onSubmit: (data: CreateFacilityDTO | UpdateFacilityDTO) => void;
  isPending: boolean;
  mode: "create" | "edit";
}

function FacilityForm({ initialData, onSubmit, isPending, mode }: FacilityFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [manager, setManager] = useState(initialData?.manager ?? "");
  const [status, setStatus] = useState<FacilityStatusType>(initialData?.status ?? "active");

  const handleSubmit = () => {
    if (mode === "create") {
      onSubmit({ name, address, phone, manager } as CreateFacilityDTO);
    } else {
      onSubmit({ name, address, phone, manager, status } as UpdateFacilityDTO);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Tên cơ sở</Label>
        <Input placeholder="Nhập tên cơ sở" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Địa chỉ</Label>
        <Textarea placeholder="Nhập địa chỉ đầy đủ" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Số điện thoại</Label>
          <Input placeholder="028-xxxx-xxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Quản lý</Label>
          <Input placeholder="Tên người quản lý" value={manager} onChange={(e) => setManager(e.target.value)} />
        </div>
      </div>

      {/* Trạng thái chỉ hiện khi EDIT */}
      {mode === "edit" && (
        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as FacilityStatusType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(FACILITY_STATUS_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {mode === "create" && (
        <p className="text-xs text-muted-foreground">
          * Trạng thái mặc định: <strong>Hoạt động</strong>. Có thể thay đổi sau khi tạo.
        </p>
      )}

      <Button className="w-full mt-2" onClick={handleSubmit} disabled={isPending || !name.trim()}>
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {mode === "create" ? "Lưu cơ sở" : "Cập nhật cơ sở"}
      </Button>
    </div>
  );
}

// ============================================================================
// ROOM FORM (dùng chung cho Add + Edit)
// ============================================================================

interface RoomFormProps {
  initialData?: Room;
  onSubmit: (data: CreateRoomDTO | UpdateRoomDTO) => void;
  isPending: boolean;
  mode: "create" | "edit";
}

function RoomForm({ initialData, onSubmit, isPending, mode }: RoomFormProps) {
  const { data: activeFacilities } = useActiveFacilities();

  const [name, setName] = useState(initialData?.name ?? "");
  const [facilityId, setFacilityId] = useState<string>(
    initialData?.facilityId?.toString() ?? ""
  );
  const [capacity, setCapacity] = useState(initialData?.capacity ?? 20);
  const [status, setStatus] = useState<RoomStatusType>(initialData?.status ?? "available");

  const handleSubmit = () => {
    if (mode === "create") {
      onSubmit({ name, facilityId: Number(facilityId), capacity } as CreateRoomDTO);
    } else {
      onSubmit({
        name, facilityId: Number(facilityId), capacity, status,
      } as UpdateRoomDTO);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tên phòng</Label>
          <Input placeholder="VD: Phòng 101" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Cơ sở</Label>
          <Select value={facilityId} onValueChange={setFacilityId}>
            <SelectTrigger><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
            <SelectContent>
              {activeFacilities?.map((f) => (
                <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Sức chứa</Label>
        <Input
          type="number" min={1} max={200} value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">Nhập số lượng từ 1 - 200 học viên</p>
      </div>

      {mode === "edit" && (
        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as RoomStatusType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(ROOM_STATUS_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {mode === "create" && (
        <p className="text-xs text-muted-foreground">
          * Trạng thái mặc định: <strong>Trống</strong>. Có thể thay đổi sau khi tạo.
        </p>
      )}

      <Button
        className="w-full mt-2" onClick={handleSubmit}
        disabled={isPending || !name.trim() || !facilityId}
      >
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {mode === "create" ? "Lưu phòng" : "Cập nhật phòng"}
      </Button>
    </div>
  );
}

// ============================================================================
// TABLE SKELETON
// ============================================================================

function TableSkeleton({ cols, rows = 3 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <TableCell key={c}><Skeleton className="h-5 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export function AdminFacilitiesPage() {
  // ===== Search =====
  const [searchTerm, setSearchTerm] = useState("");

  // ===== Dialogs =====
  const [addFacilityOpen, setAddFacilityOpen] = useState(false);
  const [editFacility, setEditFacility] = useState<Facility | null>(null);
  const [deleteFacilityTarget, setDeleteFacilityTarget] = useState<Facility | null>(null);

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteRoomTarget, setDeleteRoomTarget] = useState<Room | null>(null);

  // ===== Queries =====
  const { data: facilitiesData, isLoading: loadingFacilities } = useFacilities({ search: searchTerm });
  const { data: roomsData, isLoading: loadingRooms } = useRooms({ search: searchTerm });

  const facilities = facilitiesData?.data ?? [];
  const rooms = roomsData?.data ?? [];

  // ===== Mutations =====
  const createFacilityMut = useCreateFacility();
  const updateFacilityMut = useUpdateFacility();
  const deleteFacilityMut = useDeleteFacility();
  const createRoomMut = useCreateRoom();
  const updateRoomMut = useUpdateRoom();
  const deleteRoomMut = useDeleteRoom();

  // ===== Handlers =====
  const handleCreateFacility = async (dto: CreateFacilityDTO | UpdateFacilityDTO) => {
    try {
      await createFacilityMut.mutateAsync(dto as CreateFacilityDTO);
      toast.success("Tạo cơ sở thành công");
      setAddFacilityOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleUpdateFacility = async (dto: CreateFacilityDTO | UpdateFacilityDTO) => {
    if (!editFacility) return;
    try {
      await updateFacilityMut.mutateAsync({ id: editFacility.id, dto: dto as UpdateFacilityDTO });
      toast.success("Cập nhật cơ sở thành công");
      setEditFacility(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteFacility = async () => {
    if (!deleteFacilityTarget) return;
    try {
      await deleteFacilityMut.mutateAsync(deleteFacilityTarget.id);
      toast.success(`Đã xóa cơ sở "${deleteFacilityTarget.name}"`);
      setDeleteFacilityTarget(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCreateRoom = async (dto: CreateRoomDTO | UpdateRoomDTO) => {
    try {
      await createRoomMut.mutateAsync(dto as CreateRoomDTO);
      toast.success("Tạo phòng thành công");
      setAddRoomOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleUpdateRoom = async (dto: CreateRoomDTO | UpdateRoomDTO) => {
    if (!editRoom) return;
    try {
      await updateRoomMut.mutateAsync({ id: editRoom.id, dto: dto as UpdateRoomDTO });
      toast.success("Cập nhật phòng thành công");
      setEditRoom(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteRoom = async () => {
    if (!deleteRoomTarget) return;
    try {
      await deleteRoomMut.mutateAsync(deleteRoomTarget.id);
      toast.success(`Đã xóa phòng "${deleteRoomTarget.name}"`);
      setDeleteRoomTarget(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // ===== Room count per facility =====
  const getRoomCount = (facilityId: number) =>
    roomsData?.data.filter((r) => r.facilityId === facilityId).length ?? 0;

  // ===== RENDER =====
  return (
    <div className="space-y-6">
      <StatsCards />

      <Tabs defaultValue="facilities" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="facilities">Cơ sở</TabsTrigger>
            <TabsTrigger value="rooms">Phòng học</TabsTrigger>
          </TabsList>
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* ==================== FACILITIES TAB ==================== */}
        <TabsContent value="facilities">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-display">Danh sách cơ sở</CardTitle>
              <Dialog open={addFacilityOpen} onOpenChange={setAddFacilityOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" />Thêm cơ sở</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Thêm cơ sở mới</DialogTitle></DialogHeader>
                  <FacilityForm
                    mode="create"
                    onSubmit={handleCreateFacility}
                    isPending={createFacilityMut.isPending}
                  />
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
                  {loadingFacilities ? (
                    <TableSkeleton cols={7} rows={3} />
                  ) : facilities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "Không tìm thấy cơ sở phù hợp" : "Chưa có cơ sở nào"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    facilities.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="font-medium">{f.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="text-sm">{f.address}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span className="text-sm">{f.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{f.manager}</TableCell>
                        <TableCell className="text-center">{getRoomCount(f.id)}</TableCell>
                        <TableCell><FacilityStatusBadge status={f.status} /></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditFacility(f)}>
                                <Edit className="w-4 h-4 mr-2" />Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteFacilityTarget(f)}>
                                <Trash2 className="w-4 h-4 mr-2" />Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ROOMS TAB ==================== */}
        <TabsContent value="rooms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-display">Danh sách phòng học</CardTitle>
              <Dialog open={addRoomOpen} onOpenChange={setAddRoomOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" />Thêm phòng</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Thêm phòng học mới</DialogTitle></DialogHeader>
                  <RoomForm
                    mode="create"
                    onSubmit={handleCreateRoom}
                    isPending={createRoomMut.isPending}
                  />
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
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingRooms ? (
                    <TableSkeleton cols={5} rows={4} />
                  ) : rooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "Không tìm thấy phòng phù hợp" : "Chưa có phòng nào"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rooms.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DoorOpen className="w-4 h-4 text-primary" />
                            <span className="font-medium">{r.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{r.facilityName}</TableCell>
                        <TableCell className="text-center">{r.capacity}</TableCell>
                        <TableCell><RoomStatusBadge status={r.status} /></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditRoom(r)}>
                                <Edit className="w-4 h-4 mr-2" />Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteRoomTarget(r)}>
                                <Trash2 className="w-4 h-4 mr-2" />Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== EDIT FACILITY DIALOG ==================== */}
      <Dialog open={!!editFacility} onOpenChange={(open) => !open && setEditFacility(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chỉnh sửa cơ sở</DialogTitle></DialogHeader>
          {editFacility && (
            <FacilityForm
              key={editFacility.id}
              mode="edit"
              initialData={editFacility}
              onSubmit={handleUpdateFacility}
              isPending={updateFacilityMut.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== EDIT ROOM DIALOG ==================== */}
      <Dialog open={!!editRoom} onOpenChange={(open) => !open && setEditRoom(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chỉnh sửa phòng học</DialogTitle></DialogHeader>
          {editRoom && (
            <RoomForm
              key={editRoom.id}
              mode="edit"
              initialData={editRoom}
              onSubmit={handleUpdateRoom}
              isPending={updateRoomMut.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== DELETE FACILITY CONFIRM ==================== */}
      <AlertDialog open={!!deleteFacilityTarget} onOpenChange={(open) => !open && setDeleteFacilityTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa cơ sở</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa cơ sở <strong>"{deleteFacilityTarget?.name}"</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFacility}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteFacilityMut.isPending}
            >
              {deleteFacilityMut.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ==================== DELETE ROOM CONFIRM ==================== */}
      <AlertDialog open={!!deleteRoomTarget} onOpenChange={(open) => !open && setDeleteRoomTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phòng học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa phòng <strong>"{deleteRoomTarget?.name}"</strong>
              {" "}thuộc <strong>{deleteRoomTarget?.facilityName}</strong>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteRoomMut.isPending}
            >
              {deleteRoomMut.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
