import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Отсутствуют переменные окружения Supabase! Проверьте файл .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы данных для базы
export interface Group {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  group_id: string | null;
  name: string;
  icon: string;
  type: 'income' | 'expense';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

// Типы для создания записей (без автогенерируемых полей)
export type GroupInsert = Omit<Group, 'id' | 'created_at' | 'updated_at'>;
export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;

// Типы для обновления записей
export type GroupUpdate = Partial<Omit<Group, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type CategoryUpdate = Partial<Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type TransactionUpdate = Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// Тип для категории с группой
export interface CategoryWithGroup extends Category {
  group?: Group;
}

// Тип для транзакции с категорией
export interface TransactionWithCategory extends Transaction {
  category?: CategoryWithGroup;
}
