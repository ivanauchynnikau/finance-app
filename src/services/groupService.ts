import { supabase, Group, GroupInsert, GroupUpdate } from '@/lib/supabase';

export class GroupService {
  // Получить все группы пользователя
  static async getUserGroups(userId: string): Promise<Group[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Ошибка получения групп:', error);
      throw error;
    }

    return data || [];
  }

  // Создать группу
  static async createGroup(groupData: GroupInsert): Promise<Group> {
    const { data, error } = await supabase
      .from('groups')
      .insert([groupData])
      .select()
      .single();

    if (error) {
      console.error('Ошибка создания группы:', error);
      throw error;
    }

    return data;
  }

  // Обновить группу
  static async updateGroup(groupId: string, groupData: GroupUpdate): Promise<Group> {
    const { data, error } = await supabase
      .from('groups')
      .update(groupData)
      .eq('id', groupId)
      .select()
      .single();

    if (error) {
      console.error('Ошибка обновления группы:', error);
      throw error;
    }

    return data;
  }

  // Удалить группу (переместить категории в "Общие")
  static async deleteGroup(userId: string, groupId: string): Promise<void> {
    // Получаем дефолтную группу
    const { data: defaultGroup } = await supabase
      .from('groups')
      .select('id')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (!defaultGroup) {
      throw new Error('Не найдена группа по умолчанию');
    }

    // Переносим все категории из удаляемой группы в дефолтную
    const { error: updateError } = await supabase
      .from('categories')
      .update({ group_id: defaultGroup.id })
      .eq('group_id', groupId);

    if (updateError) {
      console.error('Ошибка переноса категорий:', updateError);
      throw updateError;
    }

    // Удаляем группу
    const { error: deleteError } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (deleteError) {
      console.error('Ошибка удаления группы:', deleteError);
      throw deleteError;
    }
  }

  // Получить дефолтную группу пользователя
  static async getDefaultGroup(userId: string): Promise<Group | null> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error) {
      console.error('Ошибка получения дефолтной группы:', error);
      return null;
    }

    return data;
  }
}

