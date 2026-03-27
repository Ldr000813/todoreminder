"use client";

import { useState, useRef, useEffect } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { motion } from "framer-motion";

interface CalendarStripProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}

export function CalendarStrip({ selectedDate, onSelectDate }: CalendarStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<Date[]>([]);

  useEffect(() => {
    // Generate ±30 days from today to allow scrolling
    const today = new Date();
    const range = [];
    for (let i = -30; i <= 30; i++) {
      range.push(addDays(today, i));
    }
    setDays(range);
  }, []);

  useEffect(() => {
    // Center selected date on mount or change
    if (containerRef.current) {
      const selectedEl = containerRef.current.querySelector('[data-selected="true"]') as HTMLElement;
      if (selectedEl) {
        containerRef.current.scrollTo({
          left: selectedEl.offsetLeft - containerRef.current.offsetWidth / 2 + selectedEl.offsetWidth / 2,
          behavior: "smooth"
        });
      }
    }
  }, [selectedDate, days]);

  return (
    <div className="py-4 px-2 w-full overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-50 dark:from-[#0f0f11] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-50 dark:from-[#0f0f11] to-transparent z-10 pointer-events-none" />
      
      <div 
        ref={containerRef}
        className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-3 pb-2 pt-1"
        style={{ scrollbarWidth: "none" }}
      >
        {days.map((date, idx) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          
          return (
            <button
              key={idx}
              data-selected={isSelected}
              onClick={() => onSelectDate(date)}
              className={`snap-center flex flex-col items-center justify-center min-w-[3.5rem] h-[4.5rem] rounded-2xl transition-all relative ${
                isSelected 
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105" 
                  : isToday
                  ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/20"
                  : "bg-white dark:bg-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 ring-1 ring-slate-900/5 dark:ring-white/10"
              }`}
            >
              <span className="text-xs font-medium uppercase tracking-wider mb-1 opacity-80">
                {format(date, "EEE")}
              </span>
              <span className="text-lg font-bold">
                {format(date, "d")}
              </span>
              
              {isSelected && (
                <motion.div 
                   layoutId="activeIndicator"
                   className="absolute -bottom-1 w-1 h-1 rounded-full bg-white" 
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
