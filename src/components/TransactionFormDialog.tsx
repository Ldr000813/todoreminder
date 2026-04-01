import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Plus } from "lucide-react";
import { Transaction, Category, TransactionType } from "@/types/money";

interface TransactionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Transaction>) => void;
  transaction?: Transaction | null;
  categories: Category[];
  onOpenCategoryManager: () => void;
}

export function TransactionFormDialog({ isOpen, onClose, onSave, transaction, categories, onOpenCategoryManager }: TransactionFormDialogProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setType(transaction.type);
      setCategoryId(transaction.categoryId);
      setNote(transaction.note || "");
    } else {
      setAmount("");
      setType("expense");
      const expenseCategories = categories.filter(c => !c.type || c.type === "expense");
      const defaultCat = expenseCategories.find(c => c.name === "食費") || expenseCategories[0];
      setCategoryId(defaultCat ? defaultCat.id : "");
      setNote("");
    }
  }, [transaction, isOpen, categories]);

  const filteredCategories = categories.filter(c => !c.type || c.type === type);

  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.find(c => c.id === categoryId)) {
      const targetName = type === "expense" ? "食費" : "給与";
      const defaultCat = filteredCategories.find(c => c.name === targetName) || filteredCategories[0];
      setCategoryId(defaultCat.id);
    }
  }, [type, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (!numAmount || Number.isNaN(numAmount) || !categoryId) return;
    
    const category = categories.find(c => c.id === categoryId);
    
    onSave({
      amount: numAmount,
      type,
      categoryId,
      categoryName: category?.name || "Other",
      note: note.trim()
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 touch-none"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 mx-auto max-w-md pb-12 rounded-t-[2rem] bg-white dark:bg-[#1a1a1f] shadow-2xl border-t border-slate-200 dark:border-white/10"
          >
            <div className="flex justify-between items-center mb-6 pl-2">
              <h2 className="text-xl font-bold">{transaction ? "記録を編集" : "収支を追加"}</h2>
              <button 
                onClick={onClose}
                className="p-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-2">
              {/* Type Toggle */}
              <div className="flex bg-slate-100 dark:bg-[#0f0f11] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                    type === "expense" ? "bg-white dark:bg-[#1a1a1f] text-rose-600 dark:text-rose-400 shadow-sm" : "text-slate-500"
                  }`}
                >
                  支出 (-)
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                    type === "income" ? "bg-white dark:bg-[#1a1a1f] text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500"
                  }`}
                >
                  収入 (+)
                </button>
              </div>

              {/* Amount */}
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">¥</span>
                <input
                  autoFocus
                  required
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className={`w-full text-4xl font-extrabold bg-transparent border-none placeholder-slate-300 dark:placeholder-slate-800 focus:ring-0 pl-8 pr-0 outline-none ${
                    type === "expense" ? "text-slate-900 dark:text-slate-100" : "text-emerald-500"
                  }`}
                />
              </div>

              {/* Category */}
              <div className="flex items-center gap-2">
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-[#0f0f11] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 text-sm rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none"
                >
                  {filteredCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  {filteredCategories.length === 0 && <option value="" disabled>カテゴリなし</option>}
                </select>
                <button
                  type="button"
                  onClick={onOpenCategoryManager}
                  className="p-4 bg-slate-50 dark:bg-[#0f0f11] border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 hover:text-brand-500 transition-colors"
                >
                  <Settings size={20} />
                </button>
              </div>

              {/* Note */}
              <div>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="備考 (例: ホットミルク)"
                  className="w-full text-sm bg-slate-50 dark:bg-[#0f0f11] border border-slate-200 dark:border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-brand-500/50 outline-none"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-4 mt-2 font-bold rounded-2xl shadow-lg transition-all text-white ${
                  type === "income" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30" : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/30"
                }`}
              >
                {transaction ? "保存する" : "追加する"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
