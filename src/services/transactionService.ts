import { supabase, Transaction, TransactionInsert, TransactionUpdate, TransactionWithCategory } from '@/lib/supabase';

export class TransactionService {
  // Получить все транзакции пользователя
  static async getUserTransactions(userId: string, limit?: number): Promise<TransactionWithCategory[]> {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        category:categories(
          *,
          group:groups(*)
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Ошибка получения транзакций:', error);
      throw error;
    }

    return data || [];
  }

  // Получить транзакции за период
  static async getTransactionsByPeriod(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<TransactionWithCategory[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(
          *,
          group:groups(*)
        )
      `)
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Ошибка получения транзакций за период:', error);
      throw error;
    }

    return data || [];
  }

  // Получить транзакции по категории
  static async getTransactionsByCategory(categoryId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('category_id', categoryId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Ошибка получения транзакций категории:', error);
      throw error;
    }

    return data || [];
  }

  // Создать транзакцию
  static async createTransaction(transactionData: TransactionInsert): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) {
      console.error('Ошибка создания транзакции:', error);
      throw error;
    }

    return data;
  }

  // Обновить транзакцию
  static async updateTransaction(transactionId: string, transactionData: TransactionUpdate): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(transactionData)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Ошибка обновления транзакции:', error);
      throw error;
    }

    return data;
  }

  // Удалить транзакцию
  static async deleteTransaction(transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      console.error('Ошибка удаления транзакции:', error);
      throw error;
    }
  }

  // Получить статистику (доходы, расходы, баланс)
  static async getStatistics(userId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Ошибка получения статистики:', error);
      throw error;
    }

    const income = data
      ?.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const expense = data
      ?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    return {
      income,
      expense,
      balance: income - expense,
    };
  }

  // Получить статистику по категориям
  static async getCategoryStatistics(
    userId: string,
    type: 'income' | 'expense',
    startDate?: string,
    endDate?: string
  ) {
    let query = supabase
      .from('transactions')
      .select(`
        amount,
        category:categories(
          id,
          name,
          icon,
          group:groups(
            id,
            name,
            icon,
            color
          )
        )
      `)
      .eq('user_id', userId)
      .eq('type', type);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Ошибка получения статистики по категориям:', error);
      throw error;
    }

    return data || [];
  }
}

