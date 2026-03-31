"use client";

import { useState, useEffect, useRef } from "react";
import { Target, Edit2, Check } from "lucide-react";

export function StrategyBoard() {
  const [strategyText, setStrategyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    <div className="mx-6 mb-4 mt-2 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/30 dark:to-indigo-950/30 rounded-2xl p-4 border border-brand-100/50 dark:border-brand-800/30 shadow-sm relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-200/20 dark:bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <h2 className="text-sm font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
          <Target size={16} strokeWidth={2.5} />
          長期的な戦略・目標
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors p-1"
            title="編集"
          >
            <Edit2 size={14} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            onClick={handleSave}
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
      </div>

      <div className="h-px w-full bg-brand-200/50 dark:bg-brand-800/50 mb-3 relative z-10" />

      <div className="relative z-10 text-sm">
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
    </div>
  );
}
