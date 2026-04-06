"use client";

import { useState, useRef, useEffect } from "react";
import { format, addDays, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addMonths, subMonths } from "date-fns";
import { motion } from "framer-motion";
import { useDroppable, useDndContext } from "@dnd-kit/core";

interface CalendarStripProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  taskDates: Set<string>;
}

function DayButton({ date, selectedDate, onSelectDate, hasTask, isDragging }: { date: Date, selectedDate: Date, onSelectDate: (d: Date) => void, hasTask: boolean, isDragging: boolean }) {
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
      className={`flex flex-col items-center justify-center transition-all duration-300 relative ${
        isDragging ? "min-w-[3.5rem] h-[4.5rem] rounded-2xl" : "min-w-[2.75rem] h-[3.5rem] rounded-xl"
      } ${
        isOver
          ? "bg-brand-200 dark:bg-brand-800 ring-2 ring-brand-500 scale-110 z-20"
          : isSelected 
          ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105" 
          : isToday
          ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/20"
          : "bg-white dark:bg-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 ring-1 ring-slate-900/5 dark:ring-white/10"
      }`}
    >
      <span className={`${isDragging ? 'text-xs mb-1' : 'text-[10px] mb-0.5'} font-medium uppercase tracking-wider opacity-80 transition-all duration-300`}>
        {format(date, "EEE")}
      </span>
      <span className={`${isDragging ? 'text-lg' : 'text-base'} font-bold transition-all duration-300 ${isOver && !isSelected ? "text-brand-700 dark:text-brand-300" : ""}`}>
        {format(date, "d")}
      </span>
      
      {isSelected && (
        <motion.div 
           layoutId="activeIndicator"
           className="absolute -bottom-1 w-1 h-1 rounded-full bg-white" 
        />
      )}

      {hasTask && (
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
      )}
    </button>
  );
}

export function CalendarStrip({ selectedDate, onSelectDate, taskDates }: CalendarStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<Date[]>([]);
  const { active } = useDndContext();
  const isDragging = !!active;

  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate ±365 days from today to allow scrolling
    const today = new Date();
    const range = [];
    for (let i = -365; i <= 365; i++) {
      range.push(addDays(today, i));
    }
    setDays(range);
  }, []);

  useEffect(() => {
    setCurrentMonth(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (isExpanded) return;

    let animationFrameId: number;
    let startTime: number | null = null;
    
    // Center selected date on mount or change
    if (containerRef.current) {
      const selectedEl = containerRef.current.querySelector('[data-selected="true"]') as HTMLElement;
      if (selectedEl) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const selectedRect = selectedEl.getBoundingClientRect();
        const targetDistance = (selectedRect.left - containerRect.left) - (containerRef.current.offsetWidth / 2) + (selectedRect.width / 2);
        
        const startLeft = containerRef.current.scrollLeft;
        const targetLeft = startLeft + targetDistance;
        const distance = targetDistance;
        
        const duration = 1200; 
        
        const animation = (currentTime: number) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          
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
  }, [selectedDate, days, isExpanded]);

  const handlePointerDown = () => {
    if (isExpanded) return;
    longPressTimer.current = setTimeout(() => {
      setIsExpanded(true);
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Full calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="py-1 px-2 w-full relative select-none">
      {!isExpanded ? (
        <>
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-50 dark:from-[#0f0f11] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-50 dark:from-[#0f0f11] to-transparent z-10 pointer-events-none" />
          
          <div 
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onContextMenu={(e) => isExpanded ? undefined : e.preventDefault()}
            className="flex gap-3 items-center overflow-x-auto no-scrollbar px-3 pb-2 pt-1 touch-pan-x"
            style={{ scrollbarWidth: "none" }}
          >
            <span className="text-xs font-bold text-slate-300 dark:text-slate-600 px-2 flex-shrink-0 animate-pulse hidden sm:inline-block pointer-events-none">
              Long press to expand
            </span>
            {days.map((date, idx) => (
              <div key={idx} className="flex-shrink-0 relative">
                <DayButton 
                  date={date} 
                  selectedDate={selectedDate} 
                  onSelectDate={(d) => {
                    if (longPressTimer.current) clearTimeout(longPressTimer.current);
                    onSelectDate(d);
                  }}
                  hasTask={taskDates.has(format(date, "yyyy-MM-dd"))}
                  isDragging={isDragging}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="absolute top-0 left-0 right-0 z-[100] bg-white dark:bg-[#1a1a1f] p-5 pb-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 mx-2 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="h-[22rem] overflow-y-auto pr-1 pb-4 custom-scrollbar space-y-6">
            {Array.from({ length: 24 }).map((_, mIndex) => {
              const monthStart = startOfMonth(addMonths(currentMonth, mIndex - 6));
              const monthEnd = endOfMonth(monthStart);
              const startDate = startOfWeek(monthStart);
              const endDate = endOfWeek(monthEnd);
              const days = eachDayOfInterval({ start: startDate, end: endDate });

              return (
                <div key={mIndex}>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">
                    {format(monthStart, "yyyy年 M月")}
                  </p>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
                      <div key={day} className={`text-center text-[10px] font-extrabold ${i === 0 ? "text-rose-500/80" : i === 6 ? "text-blue-500/80" : "text-slate-400"}`}>
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-2 gap-x-1.5">
                    {days.map((d) => {
                      const dateStr = format(d, "yyyy-MM-dd");
                      const isSelected = isSameDay(d, selectedDate);
                      const isCurrentMonth = isSameMonth(d, monthStart);
                      const hasTask = taskDates.has(dateStr);
                      const isToday = isSameDay(d, new Date());
                      
                      if (!isCurrentMonth) {
                        return <div key={`empty-${dateStr}`} className="aspect-square"></div>;
                      }

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => {
                            onSelectDate(d);
                            setIsExpanded(false);
                          }}
                          className={`aspect-square relative rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                            isSelected
                              ? "bg-brand-500 text-white shadow-md shadow-brand-500/30 scale-105 ring-2 ring-brand-500/50"
                              : isToday
                              ? "bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500/30"
                              : "bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
                          }`}
                        >
                          {format(d, "d")}
                          {hasTask && !isSelected && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
                          )}
                          {isSelected && (
                            <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={() => setIsExpanded(false)}
              className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors"
            >
              カレンダーを閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
