import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Dialog, Portal, TextInput, Button, Text, Switch, SegmentedButtons } from 'react-native-paper';
import { Item, Category } from '../../types';
import { itemService } from '../../services/item/itemService';
import { ImageUploadButton } from './ImageUploadButton';
import { supabase } from '../../config/supabase';
import { categoryService } from '../../services/category/categoryService';

interface ItemDialogProps {
  visible: boolean;
  onDismiss: () => void;
  item: Item | null;
  inventoryId: string;
  userId: string;
  onSave: () => void;
}

export function ItemDialog({ visible, onDismiss, item, inventoryId, userId, onSave }: ItemDialogProps) {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [quantity, setQuantity] = useState(item?.quantity?.toString() || '1');
  const [unit, setUnit] = useState(item?.unit || '');
  const [alertEnabled, setAlertEnabled] = useState(item?.alert_enabled || false);
  const [alertThreshold, setAlertThreshold] = useState(item?.alert_threshold?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [currentItem, setCurrentItem] = useState<Item | null>(item);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(item?.category_id || null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (visible) {
      setCurrentItem(item);
      setName(item?.name || '');
      setDescription(item?.description || '');
      setQuantity(item?.quantity?.toString() || '1');
      setUnit(item?.unit || '');
      setAlertEnabled(item?.alert_enabled || false);
      setAlertThreshold(item?.alert_threshold?.toString() || '');
      loadCategories();
    }
  }, [visible, item]);

  // Add this debug function to check the image URL
  useEffect(() => {
    if (currentItem?.image_url) {
      console.log('Image URL updated:', currentItem.image_url);
    }
  }, [currentItem?.image_url]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories(inventoryId);
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    try {
      setLoading(true);
      const itemData = {
        name: name.trim(),
        description: description.trim(),
        quantity: parseInt(quantity) || 0,
        unit: unit.trim(),
        inventory_id: inventoryId,
        alert_enabled: alertEnabled,
        alert_threshold: alertEnabled ? parseInt(alertThreshold) || 0 : null,
        category_id: selectedCategory,
      };

      if (item) {
        await itemService.updateItem(item.id, itemData);
      } else {
        await itemService.createItem(itemData);
      }
      await onSave();
      onDismiss();
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Failed to save item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploaded = async () => {
    if (!item?.id) return;
    
    try {
      console.log('Fetching updated item...');
      const { data: updatedItem, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', item.id)
        .single();

      if (error) {
        console.error('Error fetching updated item:', error);
        return;
      }

      console.log('Updated item received:', updatedItem);
      if (updatedItem) {
        // Force a refresh of the image by adding a timestamp
        const refreshedItem = {
          ...updatedItem,
          image_url: updatedItem.image_url ? `${updatedItem.image_url}?t=${Date.now()}` : null
        };
        setCurrentItem(refreshedItem);
        
        // Call onSave to refresh the parent component
        onSave();
      }
    } catch (err) {
      console.error('Error in handleImageUploaded:', err);
    }
  };

  const debugItem = () => {
    console.log('Current item:', currentItem);
    console.log('Image URL:', currentItem?.image_url);
    if (currentItem?.image_url) {
      fetch(currentItem.image_url)
        .then(response => {
          console.log('Image fetch response:', response.status, response.statusText);
          return response.blob();
        })
        .then(blob => {
          console.log('Image blob:', blob);
        })
        .catch(error => {
          console.error('Error fetching image:', error);
        });
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await itemService.deleteItem(item!.id);
      onSave();
      onDismiss();
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{item ? 'Edit Item' : 'New Item'}</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView>
            <Dialog.Content>
              <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                style={styles.input}
              />
              
              <View style={styles.row}>
                <TextInput
                  label="Quantity"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  mode="outlined"
                  style={[styles.input, styles.flex1]}
                />
                <TextInput
                  label="Unit"
                  value={unit}
                  onChangeText={setUnit}
                  mode="outlined"
                  style={[styles.input, styles.flex2, styles.marginLeft]}
                />
              </View>

              <View style={styles.alertSection}>
                <View style={styles.row}>
                  <Switch
                    value={alertEnabled}
                    onValueChange={setAlertEnabled}
                  />
                  <Text style={styles.marginLeft}>Enable low stock alerts</Text>
                </View>
                {alertEnabled && (
                  <TextInput
                    label="Alert Threshold"
                    value={alertThreshold}
                    onChangeText={setAlertThreshold}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                  />
                )}
              </View>

              <View style={styles.categorySection}>
                <Text variant="bodyMedium" style={styles.label}>Category</Text>
                <SegmentedButtons
                  value={selectedCategory || ''}
                  onValueChange={setSelectedCategory}
                  buttons={[
                    { value: '', label: 'No Category' },
                    ...categories.map(cat => ({
                      value: cat.id,
                      label: cat.name,
                    }))
                  ]}
                />
              </View>

              {item?.id && (
                <View style={styles.imageSection}>
                  {currentItem?.image_url && (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: currentItem.image_url }}
                        style={styles.image}
                        onError={(error) => console.error('Image loading error:', error)}
                      />
                    </View>
                  )}
                  <ImageUploadButton
                    itemId={item.id}
                    userId={userId}
                    onImageUploaded={handleImageUploaded}
                  />
                </View>
              )}
            </Dialog.Content>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          {item && (
            <Button 
              onPress={() => setShowDeleteConfirm(true)}
              textColor="red"
            >
              Delete
            </Button>
          )}
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={handleSave} loading={loading}>Save</Button>
        </Dialog.Actions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog visible={showDeleteConfirm} onDismiss={() => setShowDeleteConfirm(false)}>
        <Dialog.Title>Delete Item</Dialog.Title>
        <Dialog.Content>
          <Text>Are you sure you want to delete this item?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button onPress={handleDelete} textColor="red">Delete</Button>
        </Dialog.Actions>
      </Dialog>
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
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  marginLeft: {
    marginLeft: 8,
  },
  alertSection: {
    marginVertical: 16,
  },
  imageSection: {
    marginTop: 16,
    width: '100%',
  },
  imageContainer: {
    marginBottom: 16,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#fff',
    resizeMode: 'contain',
  },
  categorySection: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
}); 