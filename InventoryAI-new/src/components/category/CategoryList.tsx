import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, FAB, IconButton, Text } from 'react-native-paper';
import { Category } from '../../types';
import { categoryService } from '../../services/category/categoryService';
import { CategoryDialog } from './CategoryDialog';

interface CategoryListProps {
  inventoryId: string;
}

export function CategoryList({ inventoryId }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [inventoryId]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories(inventoryId);
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {categories.map(category => (
          <List.Item
            key={category.id}
            title={category.name}
            left={props => <List.Icon {...props} icon={category.icon} color={category.color} />}
            right={props => (
              <IconButton
                {...props}
                icon="pencil"
                onPress={() => {
                  setSelectedCategory(category);
                  setDialogVisible(true);
                }}
              />
            )}
          />
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          setSelectedCategory(null);
          setDialogVisible(true);
        }}
      />

      <CategoryDialog
        visible={dialogVisible}
        onDismiss={() => {
          setDialogVisible(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        inventoryId={inventoryId}
        onSave={loadCategories}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 