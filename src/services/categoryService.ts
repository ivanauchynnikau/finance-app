import { supabase, Category, CategoryInsert, CategoryUpdate, CategoryWithGroup } from '@/lib/supabase';

export class CategoryService {
  // Получить все категории пользователя
  static async getUserCategories(userId: string): Promise<CategoryWithGroup[]> {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        group:groups(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Ошибка получения категорий:', error);
      throw error;
    }

    return data || [];
  }

  // Получить категории по типу
  static async getCategoriesByType(userId: string, type: 'income' | 'expense'): Promise<CategoryWithGroup[]> {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        group:groups(*)
      `)
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Ошибка получения категорий по типу:', error);
      throw error;
    }

    return data || [];
  }

  // Получить категории по группе
  static async getCategoriesByGroup(groupId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Ошибка получения категорий группы:', error);
      throw error;
    }

    return data || [];
  }

  // Создать категорию
  static async createCategory(categoryData: CategoryInsert): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      console.error('Ошибка создания категории:', error);
      throw error;
    }

    return data;
  }

  // Обновить категорию
  static async updateCategory(categoryId: string, categoryData: CategoryUpdate): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Ошибка обновления категории:', error);
      throw error;
    }

    return data;
  }

  // Удалить категорию
  static async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Ошибка удаления категории:', error);
      throw error;
    }
  }
}

