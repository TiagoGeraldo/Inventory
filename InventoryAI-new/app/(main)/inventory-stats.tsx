import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, IconButton, useTheme } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { itemService } from '../../src/services/item/itemService';
import { categoryService } from '../../src/services/category/categoryService';
import { inventoryService } from '../../src/services/inventory/inventoryService';
import { Item, Category, Inventory } from '../../src/types';

interface CategoryStats {
  name: string;
  itemCount: number;
  totalQuantity: number;
  color: string;
}

export default function InventoryStats() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoryData, itemsData, categoriesData] = await Promise.all([
        inventoryService.getInventoryById(id as string),
        itemService.getItems(id as string),
        categoryService.getCategories(id as string)
      ]);

      setInventory(inventoryData);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryStats = (): CategoryStats[] => {
    const stats = new Map<string, CategoryStats>();

    // Initialize stats for each category
    categories.forEach(category => {
      stats.set(category.id, {
        name: category.name,
        itemCount: 0,
        totalQuantity: 0,
        color: category.color || theme.colors.primary
      });
    });

    // Add uncategorized stats
    stats.set('uncategorized', {
      name: 'Uncategorized',
      itemCount: 0,
      totalQuantity: 0,
      color: theme.colors.secondary
    });

    // Calculate stats
    items.forEach(item => {
      const categoryId = item.category_id || 'uncategorized';
      const stat = stats.get(categoryId);
      if (stat) {
        stat.itemCount++;
        stat.totalQuantity += item.quantity || 0;
      }
    });

    return Array.from(stats.values());
  };

  const renderCategoryStats = () => {
    const stats = getCategoryStats();
    return stats.map((stat, index) => (
      <Card key={index} style={styles.statCard}>
        <Card.Content>
          <View style={[styles.colorIndicator, { backgroundColor: stat.color }]} />
          <Text variant="titleMedium">{stat.name}</Text>
          <Text>Items: {stat.itemCount}</Text>
          <Text>Total Quantity: {stat.totalQuantity}</Text>
        </Card.Content>
      </Card>
    ));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {inventory?.name} Statistics
      </Text>

      <View style={styles.statsGrid}>
        {renderCategoryStats()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statCard: {
    width: '45%',
    marginBottom: 16,
    elevation: 2,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
}); 