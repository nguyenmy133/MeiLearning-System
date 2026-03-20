import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Không cho chọn ngày trước ngày này */
  fromDate?: Date;
  /** Hiển thị thêm cặp drum wheel giờ kết thúc */
  showEndTime?: boolean;
  /** Giờ kết thúc "HH:mm" */
  endTime?: string;
  /** Callback khi giờ kết thúc thay đổi */
  onEndTimeChange?: (time: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const ITEM_H = 36; // px — height of each row

/** Drum-style scroll wheel with mouse wheel support */
function ScrollWheel({
  items,
  selected,
  onSelect,
  formatLabel,
}: {
  items: number[];
  selected: number;
  onSelect: (v: number) => void;
  formatLabel: (v: number) => string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Scroll to the selected item on mount / open
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = items.indexOf(selected);
    if (idx < 0) return;
    el.scrollTop = idx * ITEM_H;
  }, []); // only on mount

  // Snap & pick closest item when scroll ends
  const handleScrollEnd = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    // Snap scroll position
    el.scrollTop = clamped * ITEM_H;
    onSelect(items[clamped]);
  }, [items, onSelect]);

  // Use scrollend when available, otherwise debounce
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
    <div className="relative w-[60px] h-[220px] overflow-hidden" onWheel={handleWheel}>
      {/* Gradient fade top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 z-10 bg-gradient-to-b from-background to-transparent" />
      {/* Gradient fade bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 z-10 bg-gradient-to-t from-background to-transparent" />
      {/* Center highlight */}
      <div className="pointer-events-none absolute inset-x-1 z-10 rounded-md bg-primary/10 border border-primary/20"
        style={{ top: "50%", height: ITEM_H, transform: "translateY(-50%)" }}
      />

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll"
        style={{
          scrollSnapType: "y mandatory",
          // Hide scrollbar cross-browser
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Top padding so first item can center */}
        <div style={{ height: `calc(50% - ${ITEM_H / 2}px)` }} />

        {items.map((v) => (
          <button
            key={v}
            type="button"
            style={{ height: ITEM_H, scrollSnapAlign: "center" }}
            onClick={() => {
              onSelect(v);
              // Also scroll to this item
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

        {/* Bottom padding so last item can center */}
        <div style={{ height: `calc(50% - ${ITEM_H / 2}px)` }} />
      </div>
      {/* Hide webkit scrollbar via inline style trick */}
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

/** A pair of hour+minute drum wheels with a label */
function TimeWheelPair({
  label,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}: {
  label: string;
  hour: number;
  minute: number;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
}) {
  return (
    <div className="flex flex-col">
      {/* Label */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-1">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <span className="ml-auto text-sm font-semibold tabular-nums text-primary">
          {String(hour).padStart(2, "0")}:
          {String(minute).padStart(2, "0")}
        </span>
      </div>

      {/* Column labels */}
      <div className="flex gap-1 px-3 pb-1">
        <span className="w-[60px] text-center text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          Giờ
        </span>
        <span className="w-4" />
        <span className="w-[60px] text-center text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          Phút
        </span>
      </div>

      <div className="flex gap-1 px-2 pb-2 items-center">
        {/* Hour wheel */}
        <ScrollWheel
          items={HOURS}
          selected={hour}
          onSelect={onHourChange}
          formatLabel={(h) => String(h).padStart(2, "0")}
        />

        {/* Colon */}
        <div className="flex items-center justify-center w-4">
          <span className="text-muted-foreground font-bold text-base">:</span>
        </div>

        {/* Minute wheel */}
        <ScrollWheel
          items={MINUTES}
          selected={minute}
          onSelect={onMinuteChange}
          formatLabel={(m) => String(m).padStart(2, "0")}
        />
      </div>
    </div>
  );
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Chọn ngày & giờ",
  disabled = false,
  className,
  fromDate,
  showEndTime = false,
  endTime,
  onEndTimeChange,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Staged selection — only committed on "Xác nhận"
  const [stagedDate, setStagedDate] = React.useState<Date | undefined>(value);
  const [stagedHour, setStagedHour] = React.useState<number>(
    value ? value.getHours() : 8
  );
  const [stagedMinute, setStagedMinute] = React.useState<number>(
    value ? Math.round(value.getMinutes() / 15) * 15 % 60 : 0
  );

  // End time staged state
  const parsedEndHour = endTime ? parseInt(endTime.split(":")[0], 10) : 10;
  const parsedEndMinute = endTime ? parseInt(endTime.split(":")[1], 10) : 0;
  const [stagedEndHour, setStagedEndHour] = React.useState<number>(parsedEndHour);
  const [stagedEndMinute, setStagedEndMinute] = React.useState<number>(parsedEndMinute);

  // Sync when external value changes
  React.useEffect(() => {
    setStagedDate(value);
    if (value) {
      setStagedHour(value.getHours());
      setStagedMinute(Math.round(value.getMinutes() / 15) * 15 % 60);
    }
  }, [value]);

  React.useEffect(() => {
    if (endTime) {
      setStagedEndHour(parseInt(endTime.split(":")[0], 10));
      setStagedEndMinute(parseInt(endTime.split(":")[1], 10));
    }
  }, [endTime]);

  function handleConfirm() {
    if (!stagedDate) return;
    const result = new Date(stagedDate);
    result.setHours(stagedHour, stagedMinute, 0, 0);
    onChange?.(result);

    // Commit end time
    if (showEndTime && onEndTimeChange) {
      const hh = String(stagedEndHour).padStart(2, "0");
      const mm = String(stagedEndMinute).padStart(2, "0");
      onEndTimeChange(`${hh}:${mm}`);
    }

    setOpen(false);
  }

  function handleClear() {
    setStagedDate(undefined);
    setStagedHour(8);
    setStagedMinute(0);
    setStagedEndHour(10);
    setStagedEndMinute(0);
    onChange?.(undefined);
    if (showEndTime && onEndTimeChange) {
      onEndTimeChange("");
    }
    setOpen(false);
  }

  // Build display label
  let displayLabel: string | null = null;
  if (value) {
    const datePart = format(value, "dd/MM/yyyy  HH:mm", { locale: vi });
    if (showEndTime && endTime) {
      displayLabel = `${datePart} - ${endTime}`;
    } else {
      displayLabel = datePart;
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {displayLabel ?? placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0 shadow-xl"
        align="start"
        sideOffset={6}
      >
        <div className="flex flex-col sm:flex-row">
          {/* ── Calendar ── */}
          <Calendar
            mode="single"
            selected={stagedDate}
            onSelect={setStagedDate}
            locale={vi}
            disabled={fromDate ? { before: fromDate } : undefined}
            initialFocus
          />

          {/* ── Divider ── */}
          <div className="hidden sm:block w-px bg-border" />
          <div className="block sm:hidden h-px bg-border" />

          {/* ── Time Drum Wheels ── */}
          <div className="flex flex-col">
            <div className={showEndTime ? "flex flex-row" : ""}>
              <TimeWheelPair
                label={showEndTime ? "Bắt đầu" : "Giờ"}
                hour={stagedHour}
                minute={stagedMinute}
                onHourChange={setStagedHour}
                onMinuteChange={setStagedMinute}
              />

              {/* End time wheels — side by side */}
              {showEndTime && (
                <>
                  <div className="w-px bg-border my-3" />
                  <TimeWheelPair
                    label="Kết thúc"
                    hour={stagedEndHour}
                    minute={stagedEndMinute}
                    onHourChange={setStagedEndHour}
                    onMinuteChange={setStagedEndMinute}
                  />
                </>
              )}
            </div>

            {/* Actions */}
            <div className="border-t px-3 py-2 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground hover:text-foreground"
                onClick={handleClear}
              >
                Xóa
              </Button>
              <Button
                size="sm"
                className="flex-1"
                disabled={!stagedDate}
                onClick={handleConfirm}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
