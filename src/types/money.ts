export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  note?: string;
  date: string;
  createdAt: any;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type?: TransactionType;
  createdAt: any;
}
