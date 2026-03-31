"use client";

import { useState, useRef, useEffect } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { motion } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";

interface CalendarStripProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}

function DayButton({ date, selectedDate, onSelectDate }: { date: Date, selectedDate: Date, onSelectDate: (d: Date) => void }) {
  const isSelected = isSameDay(date, selectedDate);
  const isToday = isSameDay(date, new Date());
  
  const { isOver, setNodeRef } = useDroppable({
    id: `date-${format(date, "yyyy-MM-dd")}`
  });

  return (
    <button
      ref={setNodeRef}
      data-selected={isSelected}
      onClick={() => onSelectDate(date)}
      className={`flex flex-col items-center justify-center min-w-[3.5rem] h-[4.5rem] rounded-2xl transition-all relative ${
        isOver
          ? "bg-brand-200 dark:bg-brand-800 ring-2 ring-brand-500 scale-110 z-20"
          : isSelected 
          ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105" 
          : isToday
          ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/20"
          : "bg-white dark:bg-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 ring-1 ring-slate-900/5 dark:ring-white/10"
      }`}
    >
      <span className="text-xs font-medium uppercase tracking-wider mb-1 opacity-80">
        {format(date, "EEE")}
      </span>
      <span className={`text-lg font-bold ${isOver && !isSelected ? "text-brand-700 dark:text-brand-300" : ""}`}>
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
    let animationFrameId: number;
    let startTime: number | null = null;
    
    // Center selected date on mount or change
    if (containerRef.current) {
      const selectedEl = containerRef.current.querySelector('[data-selected="true"]') as HTMLElement;
      if (selectedEl) {
        const targetLeft = selectedEl.offsetLeft - containerRef.current.offsetWidth / 2 + selectedEl.offsetWidth / 2;
        const startLeft = containerRef.current.scrollLeft;
        const distance = targetLeft - startLeft;
        
        const duration = 1200; // かなり落として (Much slower, 1.2 seconds)
        
        const animation = (currentTime: number) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          
          // custom smooth easeOut (exponential decay)
          const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          
          if (containerRef.current) {
            containerRef.current.scrollLeft = startLeft + distance * ease;
          }
          
          if (timeElapsed < duration) {
            animationFrameId = requestAnimationFrame(animation);
          }
        };
        
        animationFrameId = requestAnimationFrame(animation);
      }
    }
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [selectedDate, days]);

  return (
    <div className="py-4 px-2 w-full overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-50 dark:from-[#0f0f11] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-50 dark:from-[#0f0f11] to-transparent z-10 pointer-events-none" />
      
      <div 
        ref={containerRef}
        className="flex gap-3 overflow-x-auto no-scrollbar px-3 pb-2 pt-1"
        style={{ scrollbarWidth: "none" }}
      >
        {days.map((date, idx) => (
          <DayButton 
            key={idx} 
            date={date} 
            selectedDate={selectedDate} 
            onSelectDate={onSelectDate} 
          />
        ))}
      </div>
    </div>
  );
}
