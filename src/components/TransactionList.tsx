import { motion } from "framer-motion";
import { format } from "date-fns";
import { Transaction } from "@/types/money";
import { Trash2, Edit2, TrendingUp, TrendingDown } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const netAmount = totalIncome - totalExpense;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f0f11] px-4 w-full">
      {/* Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white dark:bg-[#1a1a1f] p-5 rounded-3xl shadow-lg border border-slate-100 dark:border-white/5 mb-6"
      >
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">本日の収支</span>
          <span className={`text-4xl font-extrabold tracking-tight ${netAmount >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {netAmount >= 0 ? "+" : ""}{netAmount.toLocaleString()} <span className="text-xl font-bold ml-1">円</span>
          </span>
        </div>
        <div className="flex justify-between mt-5 pt-5 border-t border-slate-100 dark:border-white/5">
          <div className="flex flex-col items-center flex-1">
            <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              <TrendingUp size={14} className="mr-1" /> 収入
            </span>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{totalIncome.toLocaleString()}</span>
          </div>
          <div className="w-px bg-slate-100 dark:bg-white/5" />
          <div className="flex flex-col items-center flex-1">
            <span className="flex items-center text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
              <TrendingDown size={14} className="mr-1" /> 支出
            </span>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{totalExpense.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Transaction List */}
      <div className="flex flex-col gap-3 pb-32">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 mb-4" />
            <p className="font-bold text-slate-500 dark:text-slate-400">記録がありません</p>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">右下の「+」ボタンから追加</p>
          </div>
        ) : (
          transactions.map(t => (
            <motion.div
              layout
              key={t.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, height: 0 }}
              className="bg-white dark:bg-[#1a1a1f] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4 ${
                  t.type === "income" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                }`}>
                  {t.type === "income" ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                <div className="flex flex-col min-w-0 pr-4">
                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{t.categoryName}</span>
                  {t.note && <span className="text-xs font-medium text-slate-500 truncate mt-0.5">{t.note}</span>}
                </div>
              </div>
              <div className="flex items-center shrink-0 gap-3">
                <span className={`font-extrabold text-lg mr-2 ${t.type === "income" ? "text-emerald-500" : "text-slate-800 dark:text-slate-100"}`}>
                  {t.type === "income" ? "+" : "-"}{t.amount.toLocaleString()}
                </span>
                <button
                  onClick={() => onEdit(t)}
                  className="p-1.5 text-slate-400 hover:text-brand-500 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
