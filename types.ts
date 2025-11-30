export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
}

export interface MonthlyData {
  salary: number;
  sideIncome: number;
  investments: number; // Monthly contribution
  fixedExpenses: number; // Rent, bills, etc.
  assets: AssetLiabilityItem[];
  liabilities: AssetLiabilityItem[];
}

export interface AssetLiabilityItem {
  id: string;
  name: string;
  amount: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  term: 'short' | 'mid' | 'long'; // Short < 1yr, Mid 1-5yr, Long > 5yr
  color: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface EducationResource {
  title: string;
  description: string;
  url: string;
  sourceTitle?: string;
}

export interface NewsArticle {
  title: string;
  url: string;
  source?: string;
}

export type AppView = 'daily' | 'monthly' | 'ai-plan' | 'lessons' | 'profile';

export const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other'];
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment Return', 'Other'];

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY';

export const CURRENCIES: Record<CurrencyCode, { symbol: string; label: string; locale: string }> = {
  USD: { symbol: '$', label: 'US Dollar', locale: 'en-US' },
  INR: { symbol: '₹', label: 'Indian Rupee', locale: 'en-IN' },
  EUR: { symbol: '€', label: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', label: 'British Pound', locale: 'en-GB' },
  JPY: { symbol: '¥', label: 'Japanese Yen', locale: 'ja-JP' },
};

// Helper to format large numbers (e.g. 1.5 Lakh)
export const formatCompactNumber = (num: number, currency: CurrencyCode): string => {
  if (currency === 'INR') {
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)} k`;
    return num.toString();
  }
  
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

export const GET_SUGGESTED_AMOUNTS = (currency: CurrencyCode): number[] => {
  if (currency === 'INR') return [500, 1000, 5000, 10000, 50000];
  if (currency === 'JPY') return [1000, 5000, 10000, 50000];
  return [10, 50, 100, 500, 1000];
};