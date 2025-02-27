import { supabase } from '../supabase/supabaseClient';
import { ItemHistory } from '../../types';

export const itemHistoryService = {
  async getItemHistory(itemId: string): Promise<ItemHistory[]> {
    const { data, error } = await supabase
      .from('item_history')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addHistoryEntry(entry: Omit<ItemHistory, 'id' | 'created_at'>): Promise<ItemHistory> {
    const { data, error } = await supabase
      .from('item_history')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}; 