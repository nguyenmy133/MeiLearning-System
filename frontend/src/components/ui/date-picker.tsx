import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Không cho chọn ngày trước ngày này */
  fromDate?: Date;
  /** Không cho chọn ngày sau ngày này */
  toDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled = false,
  className,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  function handleSelect(date: Date | undefined) {
    onChange?.(date);
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange?.(undefined);
  }

  const displayLabel = value
    ? format(value, "dd/MM/yyyy", { locale: vi })
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
          <span className="flex-1">
            {displayLabel ?? placeholder}
          </span>
          {value && (
            <span
              role="button"
              aria-label="Xóa ngày"
              onClick={handleClear}
              className="ml-2 rounded-sm opacity-50 hover:opacity-100 hover:bg-accent px-1 text-sm leading-none"
            >
              ✕
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 shadow-xl" align="start" sideOffset={6}>
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          locale={vi}
          disabled={
            fromDate || toDate
              ? { before: fromDate, after: toDate }
              : undefined
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
