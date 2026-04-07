import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface DataTablePaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  className?: string;
}

export function DataTablePagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  className,
}: DataTablePaginationProps) {
  // Generate page number range with ellipsis
  const pages = useMemo(() => {
    const range: (number | "...")[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) range.push(i);
        range.push("...");
        range.push(totalPages);
      } else if (page >= totalPages - 2) {
        range.push(1);
        range.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) range.push(i);
      } else {
        range.push(1);
        range.push("...");
        for (let i = page - 1; i <= page + 1; i++) range.push(i);
        range.push("...");
        range.push(totalPages);
      }
    }
    return range;
  }, [page, totalPages]);

  // Hide entirely when there is only 1 page or no data
  if (total === 0 || totalPages <= 1) return null;

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  const isPrevDisabled = page <= 1;
  const isNextDisabled = page >= totalPages || totalPages === 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-2 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Record info — always visible */}
      <p className="text-sm text-muted-foreground whitespace-nowrap">
        Hiển thị{" "}
        <span className="font-semibold text-foreground">{startRecord}</span>
        {" – "}
        <span className="font-semibold text-foreground">{endRecord}</span>
        {" trong "}
        <span className="font-semibold text-foreground">{total}</span>
        {" bản ghi"}
      </p>

      {/* Controls — only render if more than 1 page */}
      {totalPages > 1 && (
        <div className="flex items-center gap-4">
          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Dòng/trang
            </span>
            <Select
              value={`${limit}`}
              onValueChange={(v) => onLimitChange(Number(v))}
            >
              <SelectTrigger className="h-9 w-[68px] text-sm">
                <SelectValue placeholder={limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            {/* First page — desktop only */}
            <Button
              variant="outline"
              size="icon"
              className="hidden h-9 w-9 lg:flex"
              onClick={() => onPageChange(1)}
              disabled={isPrevDisabled}
              title="Trang đầu"
            >
              <span className="sr-only">Trang đầu</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onPageChange(page - 1)}
              disabled={isPrevDisabled}
              title="Trang trước"
            >
              <span className="sr-only">Trang trước</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Numeric page buttons — hidden on mobile, show "n/m" instead */}
            <div className="hidden sm:flex items-center gap-1">
              {pages.map((p, i) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="w-8 text-center text-sm text-muted-foreground tracking-widest"
                  >
                    ···
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-9 w-9 text-sm font-medium transition-colors",
                      page === p
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => onPageChange(p as number)}
                  >
                    {p}
                  </Button>
                )
              )}
            </div>

            {/* Mobile: compact page indicator */}
            <span className="inline-flex sm:hidden items-center px-2 text-sm text-muted-foreground whitespace-nowrap">
              {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onPageChange(page + 1)}
              disabled={isNextDisabled}
              title="Trang sau"
            >
              <span className="sr-only">Trang sau</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last page — desktop only */}
            <Button
              variant="outline"
              size="icon"
              className="hidden h-9 w-9 lg:flex"
              onClick={() => onPageChange(totalPages)}
              disabled={isNextDisabled}
              title="Trang cuối"
            >
              <span className="sr-only">Trang cuối</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
