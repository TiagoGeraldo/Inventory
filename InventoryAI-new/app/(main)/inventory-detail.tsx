import { Tabs } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { inventoryService } from '../../src/services/inventory/inventoryService';
import { Inventory } from '../../src/types';

export default function InventoryDetailLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inventory, setInventory] = useState<Inventory | null>(null);

  useEffect(() => {
    loadInventory();
  }, [id]);

  const loadInventory = async () => {
    try {
      const data = await inventoryService.getInventoryById(id);
      setInventory(data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarLabelStyle: { textTransform: 'none' },
      }}
    >
      <Tabs.Screen
        name="items"
        options={{
          title: inventory?.name || 'Inventory',
          tabBarLabel: 'Items',
          headerTitleStyle: { fontSize: 20 },
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarLabel: 'Categories',
        }}
      />
    </Tabs>
  );
} 