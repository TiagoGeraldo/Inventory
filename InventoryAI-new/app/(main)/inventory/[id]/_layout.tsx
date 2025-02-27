import { Tabs } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { inventoryService } from '../../../../src/services/inventory/inventoryService';
import { Inventory } from '../../../../src/types';

export default function InventoryLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inventory, setInventory] = useState<Inventory | null>(null);

  useEffect(() => {
    loadInventory();
  }, [id]);

  const loadInventory = async () => {
    try {
      const data = await inventoryService.getInventoryById(id as string);
      setInventory(data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="items"
        options={{
          title: inventory?.name || 'Items',
          tabBarLabel: 'Items',
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarLabel: 'Categories',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistics',
          tabBarLabel: 'Stats',
        }}
      />
    </Tabs>
  );
} 