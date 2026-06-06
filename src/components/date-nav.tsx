"use client";

import { useRouter } from "next/navigation";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Props {
  dateStr: string;
}

export function DateNav({ dateStr }: Props) {
  const router   = useRouter();
  const [open, setOpen] = useState(false);
  const date    = new Date(dateStr + "T12:00:00");
  const today   = format(new Date(), "yyyy-MM-dd");
  const isToday = dateStr === today;

  function go(d: Date) {
    router.push(`/today?date=${format(d, "yyyy-MM-dd")}`);
  }

  function handleCalendarSelect(selected: Date | undefined) {
    if (!selected) return;
    setOpen(false);
    go(selected);
  }

  return (
    <div className="flex items-center justify-between">
      {/* Prev */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
        onClick={() => go(subDays(date, 1))}>
        <ChevronLeft size={18} />
      </Button>

      {/* Date label + calendar trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
              "hover:bg-muted",
              isToday ? "text-primary" : "text-foreground"
            )} />
          }
        >
          <CalendarDays size={15} className="text-muted-foreground" />
          {isToday ? "Today" : format(date, "EEE, MMM d")}
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0 border-border bg-card" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleCalendarSelect}
            defaultMonth={date}
            disabled={(d) => d > new Date()}
          />
          {!isToday && (
            <div className="border-t border-border p-2">
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => { setOpen(false); router.push("/today"); }}>
                Jump to today
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Next */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
        disabled={isToday}
        onClick={() => go(addDays(date, 1))}>
        <ChevronRight size={18} />
      </Button>
    </div>
  );
}
