import { supabase } from '../../config/supabase';
import { Item } from '../../types';
import { itemHistoryService } from './itemHistoryService';
import { useAuth } from '../../stores/AuthContext';

export const itemService = {
  async getItems(inventoryId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        category:category_id (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('inventory_id', inventoryId)
      .order('name');

    if (error) {
      console.error('Error fetching items:', error);
      throw error;
    }

    return data || [];
  },

  async createItem(item: Partial<Item>): Promise<Item> {
    try {
      // First create the item
      const { data: newItem, error: itemError } = await supabase
        .from('items')
        .insert(item)
        .select()
        .single();

      if (itemError) throw itemError;

      // Then create the history entry
      const { error: historyError } = await supabase
        .from('item_history')
        .insert({
          item_id: newItem.id,
          quantity_change: newItem.quantity,
          previous_quantity: 0,
          new_quantity: newItem.quantity,
          action_type: 'create',
          notes: 'Item created',
          created_by: item.user_id
        });

      if (historyError) {
        console.error('Error creating history entry:', historyError);
        // Don't throw here, just log the error since the item was created successfully
      }

      return newItem;
    } catch (error) {
      console.error('Error in createItem:', error);
      throw error;
    }
  },

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    try {
      // Remove any undefined values from updates
      Object.keys(updates).forEach(key => 
        updates[key] === undefined && delete updates[key]
      );

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Perform update without returning data first
      const { error: updateError } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      // Then fetch the updated item
      const { data, error: fetchError } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Item not found');

      // Handle quantity change history if needed
      if (updates.quantity !== undefined) {
        const { error: historyError } = await supabase
          .from('item_history')
          .insert({
            item_id: id,
            quantity_change: updates.quantity - data.quantity,
            previous_quantity: data.quantity,
            new_quantity: updates.quantity,
            action_type: 'update',
            notes: 'Quantity updated',
            created_by: updates.user_id
          });

        if (historyError) {
          console.error('Error creating history entry:', historyError);
        }
      }

      return data;
    } catch (error) {
      console.error('Error in updateItem:', error);
      throw error;
    }
  },

  async deleteItem(id: string): Promise<void> {
    // Get current item state before deletion
    const { data: currentItem } = await supabase
      .from('items')
      .select()
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Track deletion in history
    await itemHistoryService.addHistoryEntry({
      item_id: id,
      quantity_change: -currentItem.quantity,
      previous_quantity: currentItem.quantity,
      new_quantity: 0,
      action_type: 'delete',
      notes: 'Item deleted',
      created_by: currentItem.user_id
    });
  },

  async batchUpdateQuantity(
    itemIds: string[], 
    operation: 'increment' | 'decrement' | 'set', 
    value: number,
    userId: string
  ): Promise<void> {
    await Promise.all(
      itemIds.map(async (id) => {
        const { data: currentItem } = await supabase
          .from('items')
          .select()
          .eq('id', id)
          .single();

        let newQuantity = currentItem.quantity;
        switch (operation) {
          case 'increment':
            newQuantity += value;
            break;
          case 'decrement':
            newQuantity = Math.max(0, newQuantity - value);
            break;
          case 'set':
            newQuantity = value;
            break;
        }

        await this.updateItem(id, { 
          quantity: newQuantity,
          user_id: userId
        });
      })
    );
  }
}; 