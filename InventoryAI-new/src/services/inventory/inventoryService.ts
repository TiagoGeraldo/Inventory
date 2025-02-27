import { supabase } from '../../config/supabase';
import { Inventory } from '../../types';

export const inventoryService = {
  async getInventories(userId: string): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventories')
      .select(`
        *,
        items:items(count)
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return data.map(inventory => ({
      ...inventory,
      item_count: inventory.items?.[0]?.count || 0
    }));
  },

  async createInventory(userId: string, name: string, icon: string = 'box'): Promise<Inventory> {
    try {
      const { data, error } = await supabase
        .from('inventories')
        .insert({
          user_id: userId,
          name: name.trim(),
          icon,
          item_count: 0,
          last_accessed: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      return data;
    } catch (error) {
      console.error('Error in createInventory:', error);
      throw new Error('Failed to create inventory');
    }
  },

  async getInventoryById(id: string): Promise<Inventory | null> {
    const { data, error } = await supabase
      .from('inventories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }

    return data;
  },

  async updateInventory(id: string, updates: Partial<Inventory>): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventories')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }

    return data;
  },

  async deleteInventory(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 