"use client";

import { useState, useEffect, useRef } from "react";
import { Target, Edit2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function StrategyBoard() {
  const [strategyText, setStrategyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchStrategy();
  }, []);

  const fetchStrategy = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings?.strategyText) {
          setStrategyText(data.settings.strategyText);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyText }),
      });
      if (res.ok) {
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (isEditing) {
      resizeTextarea();
      textareaRef.current?.focus();
    }
  }, [isEditing, strategyText]);

  return (
    <div className="mx-6 mb-1 mt-1 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/30 dark:to-indigo-950/30 rounded-2xl border border-brand-100/50 dark:border-brand-800/30 shadow-sm relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-200/20 dark:bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div 
        className="flex justify-between items-center p-3 cursor-pointer relative z-10 transition-colors hover:bg-brand-100/30 dark:hover:bg-brand-900/30"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Target size={16} strokeWidth={2.5} className="text-brand-500" />
          <h2 className="text-sm font-bold text-brand-700 dark:text-brand-300 truncate">
            長期的な戦略・目標
          </h2>
          {!isExpanded && strategyText && (
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 truncate hidden sm:inline-block">
              {strategyText.split("\n")[0]}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 pl-2 shrink-0">
          {isExpanded && !isEditing && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors p-1"
              title="編集"
            >
              <Edit2 size={14} strokeWidth={2.5} />
            </button>
          )}
          {isExpanded && isEditing && (
            <button
              onClick={(e) => { e.stopPropagation(); handleSave(); }}
              disabled={isSaving}
              className="text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 rounded-md px-2.5 py-1 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50 shadow-sm shadow-brand-500/20"
            >
              {isSaving ? (
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={14} strokeWidth={2.5} />
              )}
              保存
            </button>
          )}
          <div className="text-brand-400/80 dark:text-brand-500/80 ml-1">
            {isExpanded ? <ChevronUp size={16} strokeWidth={2.5} /> : <ChevronDown size={16} strokeWidth={2.5} />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="h-px w-[calc(100%-1.5rem)] mx-auto bg-brand-200/50 dark:bg-brand-800/50 relative z-10" />

            <div className="p-3 pt-4 relative z-10 text-sm">
              {isEditing ? (
                <textarea
                  ref={textareaRef}
                  value={strategyText}
                  onChange={(e) => {
                    setStrategyText(e.target.value);
                    resizeTextarea();
                  }}
                  placeholder="ここに長期的な戦略や目標を入力してください..."
                  className="w-full bg-white/60 dark:bg-black/20 p-3 rounded-xl border border-brand-200/50 dark:border-brand-700/50 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none overflow-hidden transition-all min-h-[5rem]"
                  rows={2}
                />
              ) : (
                <div 
                  className={`whitespace-pre-wrap leading-relaxed ${strategyText ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600 italic px-2 py-1'}`}
                >
                  {strategyText || "目標が設定されていません。右上の編集ボタンから追加してください。"}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
