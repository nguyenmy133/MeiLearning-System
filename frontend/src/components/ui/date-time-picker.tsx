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
import { ScrollArea } from "@/components/ui/scroll-area";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Không cho chọn ngày trước ngày này */
  fromDate?: Date;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Chọn ngày & giờ",
  disabled = false,
  className,
  fromDate,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Internal state for staged selection (only committed on "Xác nhận")
  const [stagedDate, setStagedDate] = React.useState<Date | undefined>(value);
  const [stagedHour, setStagedHour] = React.useState<number>(
    value ? value.getHours() : 8
  );
  const [stagedMinute, setStagedMinute] = React.useState<number>(
    value ? Math.round(value.getMinutes() / 15) * 15 : 0
  );

  // Sync internal state when external value changes
  React.useEffect(() => {
    setStagedDate(value);
    if (value) {
      setStagedHour(value.getHours());
      setStagedMinute(Math.round(value.getMinutes() / 15) * 15 % 60);
    }
  }, [value]);

  // Auto-scroll selected hour/minute into center of scroll area
  const hourRef = React.useRef<HTMLDivElement>(null);
  const minuteRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        scrollToSelected(hourRef, stagedHour, 36);
        scrollToSelected(minuteRef, MINUTES.indexOf(stagedMinute), 36);
      }, 50);
    }
  }, [open]);

  function scrollToSelected(
    ref: React.RefObject<HTMLDivElement | null>,
    index: number,
    itemHeight: number
  ) {
    if (!ref.current) return;
    const scrollEl = ref.current.querySelector("[data-radix-scroll-area-viewport]");
    if (scrollEl) {
      scrollEl.scrollTop = index * itemHeight - itemHeight * 2;
    }
  }

  function handleConfirm() {
    if (!stagedDate) return;
    const result = new Date(stagedDate);
    result.setHours(stagedHour, stagedMinute, 0, 0);
    onChange?.(result);
    setOpen(false);
  }

  function handleClear() {
    setStagedDate(undefined);
    setStagedHour(8);
    setStagedMinute(0);
    onChange?.(undefined);
    setOpen(false);
  }

  const displayLabel = value
    ? format(value, "dd/MM/yyyy  HH:mm", { locale: vi })
    : null;

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

          {/* ── Time Scroll Wheels ── */}
          <div className="flex flex-col">
            {/* Label row */}
            <div className="flex items-center gap-1 px-3 pt-3 pb-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Giờ
              </span>
              <span className="ml-auto text-xs font-semibold tabular-nums text-foreground">
                {String(stagedHour).padStart(2, "0")}:
                {String(stagedMinute).padStart(2, "0")}
              </span>
            </div>

            <div className="flex gap-1 px-2 pb-2">
              {/* Hour wheel */}
              <ScrollArea ref={hourRef} className="h-[220px] w-[60px]">
                <div className="flex flex-col py-2">
                  {HOURS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setStagedHour(h)}
                      className={cn(
                        "h-9 w-full rounded-md text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        stagedHour === h
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {String(h).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </ScrollArea>

              {/* Separator */}
              <div className="flex items-center">
                <span className="text-muted-foreground font-bold text-base">:</span>
              </div>

              {/* Minute wheel */}
              <ScrollArea ref={minuteRef} className="h-[220px] w-[60px]">
                <div className="flex flex-col py-2">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      onClick={() => setStagedMinute(m)}
                      className={cn(
                        "h-9 w-full rounded-md text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        stagedMinute === m
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {String(m).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Action buttons */}
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
