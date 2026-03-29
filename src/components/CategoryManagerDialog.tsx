import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus } from "lucide-react";
import { Category, TransactionType } from "@/types/money";

interface CategoryManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (name: string, type: TransactionType) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CategoryManagerDialog({ isOpen, onClose, categories, onAdd, onDelete }: CategoryManagerDialogProps) {
  const [activeType, setActiveType] = useState<TransactionType>("expense");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onAdd(newCategoryName.trim(), activeType);
    setNewCategoryName("");
    setIsSubmitting(false);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    await onDelete(categoryToDelete);
    setCategoryToDelete(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] touch-none"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[60] p-4 mx-auto max-w-md pb-12 rounded-t-[2rem] bg-white dark:bg-[#1a1a1f] shadow-2xl border-t border-slate-200 dark:border-white/10 h-[70vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-6 pl-2 shrink-0">
              <h2 className="text-xl font-bold">カテゴリ管理</h2>
              <button 
                onClick={onClose}
                className="p-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="flex bg-slate-100 dark:bg-[#0f0f11] p-1 rounded-xl mb-4 shrink-0">
              <button
                type="button"
                onClick={() => setActiveType("expense")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeType === "expense" ? "bg-white dark:bg-[#1a1a1f] text-rose-600 dark:text-rose-400 shadow-sm" : "text-slate-500"
                }`}
              >
                支出カテゴリ
              </button>
              <button
                type="button"
                onClick={() => setActiveType("income")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeType === "income" ? "bg-white dark:bg-[#1a1a1f] text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500"
                }`}
              >
                収入カテゴリ
              </button>
            </div>

            {/* Add New Category */}
            <form onSubmit={handleAdd} className="flex gap-2 mb-6 shrink-0">
              <input
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="新しいカテゴリ名"
                className="flex-1 bg-slate-50 dark:bg-[#0f0f11] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/50"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newCategoryName.trim()}
                className="bg-brand-600 text-white p-3 rounded-xl disabled:opacity-50 transition-opacity flex items-center justify-center shrink-0"
              >
                <Plus size={20} className="mr-1" /> 追加
              </button>
            </form>

            <div className="flex-1 overflow-y-auto">
              {categories.filter(c => !c.type || c.type === activeType).map(c => (
                <div key={c.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5 mx-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                  <button
                    onClick={() => setCategoryToDelete(c.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Sub-confirmation for deletion */}
            <AnimatePresence>
              {categoryToDelete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-x-4 bottom-8 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-[70] text-center"
                >
                  <p className="font-bold mb-4">このカテゴリを削除しますか？<br/><span className="text-xs text-slate-500">※既存の記録は削除されません</span></p>
                  <div className="flex gap-2">
                    <button onClick={() => setCategoryToDelete(null)} className="flex-1 p-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold text-sm">キャンセル</button>
                    <button onClick={confirmDelete} className="flex-1 p-3 bg-rose-500 text-white rounded-xl font-bold text-sm">削除する</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
