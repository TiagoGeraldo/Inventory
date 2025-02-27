import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { itemService } from '../../services/item/itemService';
import { categoryService } from '../../services/category/categoryService';
import { Item, Category } from '../../types';

interface InventoryStatsProps {
  inventoryId: string;
}

interface CategoryStats {
  category: Category;
  itemCount: number;
  totalQuantity: number;
}

export function InventoryStats({ inventoryId }: InventoryStatsProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [inventoryId]);

  const loadData = async () => {
    try {
      const [itemsData, categoriesData] = await Promise.all([
        itemService.getItems(inventoryId),
        categoryService.getCategories(inventoryId)
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load stats data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryStats = (): CategoryStats[] => {
    return categories.map(category => {
      const categoryItems = items.filter(item => item.category_id === category.id);
      return {
        category,
        itemCount: categoryItems.length,
        totalQuantity: categoryItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    });
  };

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const categoryStats = getCategoryStats();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Overview" />
        <Card.Content>
          <Text>Total Items: {totalItems}</Text>
          <Text>Total Quantity: {totalQuantity}</Text>
          <Text>Categories: {categories.length}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Categories" />
        <Card.Content>
          {categoryStats.map(stat => (
            <View key={stat.category.id} style={styles.categoryRow}>
              <View style={[styles.colorIndicator, { backgroundColor: stat.category.color }]} />
              <Text>{stat.category.name}</Text>
              <Text>Items: {stat.itemCount}</Text>
              <Text>Quantity: {stat.totalQuantity}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
}); 