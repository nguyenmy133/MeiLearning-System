import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const ITEM_H = 36; // px

/** Drum-style scroll wheel */
function ScrollWheel({
  items,
  selected,
  onSelect,
  formatLabel,
}: {
  items: number[];
  selected: number | null;
  onSelect: (v: number) => void;
  formatLabel: (v: number) => string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Scroll to selected on open
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = selected !== null ? items.indexOf(selected) : -1;
    if (idx >= 0) el.scrollTop = idx * ITEM_H;
  }, []);

  // Snap to nearest item on scroll end
  const handleScrollEnd = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    el.scrollTop = clamped * ITEM_H;
    onSelect(items[clamped]);
  }, [items, onSelect]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(handleScrollEnd, 120);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [handleScrollEnd]);

  // Mouse wheel handler — scroll by 1 item per wheel tick
  const handleWheel = React.useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = containerRef.current;
      if (!el) return;
      const direction = e.deltaY > 0 ? 1 : -1;
      const currentIdx = Math.round(el.scrollTop / ITEM_H);
      const nextIdx = Math.max(0, Math.min(currentIdx + direction, items.length - 1));
      el.scrollTo({ top: nextIdx * ITEM_H, behavior: "smooth" });
    },
    [items.length]
  );

  return (
    <div className="relative w-[60px] h-[180px] overflow-hidden" onWheel={handleWheel}>
      {/* Gradient fades */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 z-10 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 z-10 bg-gradient-to-t from-background to-transparent" />
      {/* Center highlight */}
      <div
        className="pointer-events-none absolute inset-x-1 z-10 rounded-md bg-primary/10 border border-primary/20"
        style={{ top: "50%", height: ITEM_H, transform: "translateY(-50%)" }}
      />

      {/* Native scroll drum */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll"
        style={{
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Padding so first/last item can center */}
        <div style={{ height: `calc(50% - ${ITEM_H / 2}px)` }} />
        {items.map((v) => (
          <button
            key={v}
            type="button"
            style={{ height: ITEM_H, scrollSnapAlign: "center" }}
            onClick={() => {
              onSelect(v);
              const idx = items.indexOf(v);
              containerRef.current?.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
            }}
            className={cn(
              "w-full flex items-center justify-center text-sm font-medium transition-colors",
              selected === v
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {formatLabel(v)}
          </button>
        ))}
        <div style={{ height: `calc(50% - ${ITEM_H / 2}px)` }} />
      </div>
    </div>
  );
}

interface TimePickerProps {
  value?: string; // "HH:mm"
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Chọn giờ",
  disabled = false,
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const currentHour = value ? parseInt(value.split(":")[0], 10) : null;
  const currentMinute = value ? parseInt(value.split(":")[1], 10) : null;

  const [stagedHour, setStagedHour] = React.useState<number | null>(currentHour);
  const [stagedMinute, setStagedMinute] = React.useState<number | null>(currentMinute);

  React.useEffect(() => {
    if (value) {
      setStagedHour(parseInt(value.split(":")[0], 10));
      setStagedMinute(parseInt(value.split(":")[1], 10));
    } else {
      setStagedHour(null);
      setStagedMinute(null);
    }
  }, [value]);

  function handleConfirm() {
    if (stagedHour !== null && stagedMinute !== null) {
      const hh = String(stagedHour).padStart(2, "0");
      const mm = String(stagedMinute).padStart(2, "0");
      onChange?.(`${hh}:${mm}`);
    }
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    setStagedHour(null);
    setStagedMinute(null);
    onChange?.("");
  }

  const displayTime =
    stagedHour !== null && stagedMinute !== null
      ? `${String(stagedHour).padStart(2, "0")}:${String(stagedMinute).padStart(2, "0")}`
      : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-1">{value || placeholder}</span>
          {value && (
            <span
              role="button"
              aria-label="Xóa giờ"
              onClick={handleClear}
              className="ml-2 rounded-sm opacity-50 hover:opacity-100 hover:bg-accent px-1 text-sm leading-none"
            >
              ✕
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 shadow-xl" align="start" sideOffset={6}>
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
            <Clock className="w-3.5 h-3.5" />
            Chọn giờ
          </div>
          <span className="text-sm font-semibold tabular-nums text-primary">
            {displayTime ?? "-- : --"}
          </span>
        </div>

        {/* Wheels */}
        <div className="flex items-center gap-1 px-4 py-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
              Giờ
            </span>
            <ScrollWheel
              items={HOURS}
              selected={stagedHour}
              onSelect={setStagedHour}
              formatLabel={(h) => String(h).padStart(2, "0")}
            />
          </div>

          <div className="flex items-center justify-center w-6 -mt-2">
            <span className="text-muted-foreground font-bold text-xl">:</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
              Phút
            </span>
            <ScrollWheel
              items={MINUTES}
              selected={stagedMinute}
              onSelect={setStagedMinute}
              formatLabel={(m) => String(m).padStart(2, "0")}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="border-t px-3 py-2 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-muted-foreground"
            onClick={() => setOpen(false)}
          >
            Đóng
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={stagedHour === null || stagedMinute === null}
            onClick={handleConfirm}
          >
            Xác nhận
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
