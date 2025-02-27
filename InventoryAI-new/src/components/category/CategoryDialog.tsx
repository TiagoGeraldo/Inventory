import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog, Portal, TextInput, Button, IconButton } from 'react-native-paper';
import { Category } from '../../types';
import { categoryService } from '../../services/category/categoryService';
import ColorPicker from '../ColorPicker';
import { IconPicker } from '../IconPicker';

interface CategoryDialogProps {
  visible: boolean;
  onDismiss: () => void;
  category: Category | null;
  inventoryId: string;
  onSave: () => void;
}

export function CategoryDialog({ visible, onDismiss, category, inventoryId, onSave }: CategoryDialogProps) {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#000000');
  const [icon, setIcon] = useState(category?.icon || 'tag');
  const [loading, setLoading] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    try {
      setLoading(true);
      const categoryData = {
        name: name.trim(),
        color,
        icon,
        inventory_id: inventoryId
      };

      if (category) {
        await categoryService.updateCategory(category.id, categoryData);
      } else {
        await categoryService.createCategory(categoryData);
      }
      onSave();
      onDismiss();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;

    try {
      setLoading(true);
      await categoryService.deleteCategory(category.id);
      onSave();
      onDismiss();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{category ? 'Edit Category' : 'New Category'}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          
          <View style={styles.row}>
            <Button
              mode="outlined"
              onPress={() => setShowColorPicker(true)}
              style={[styles.colorButton, { backgroundColor: color }]}
            >
              Color
            </Button>
            <IconButton
              icon={icon}
              size={24}
              onPress={() => setShowIconPicker(true)}
            />
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          {category && (
            <Button onPress={handleDelete} textColor="red">Delete</Button>
          )}
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={handleSave} loading={loading}>Save</Button>
        </Dialog.Actions>
      </Dialog>

      <ColorPicker
        visible={showColorPicker}
        onDismiss={() => setShowColorPicker(false)}
        onSelect={setColor}
        initialColor={color}
      />

      <IconPicker
        visible={showIconPicker}
        onDismiss={() => setShowIconPicker(false)}
        onSelect={setIcon}
        selectedIcon={icon}
      />
    </Portal>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  colorButton: {
    flex: 1,
    marginRight: 16,
  },
}); 