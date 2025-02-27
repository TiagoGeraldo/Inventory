import React, { useState } from 'react';
import { Card, IconButton, Dialog, Text, Button, Portal } from '@react-native-material/core';
import { inventoryService } from '../../services/InventoryService';

export function InventoryCard({ inventory, onDelete }: InventoryCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await inventoryService.deleteInventory(inventory.id);
      onDelete();
    } catch (error) {
      console.error('Failed to delete inventory:', error);
      alert('Failed to delete inventory. Please try again.');
    }
  };

  return (
    <>
      <Card>
        {/* ... existing card content */}
        <IconButton
          icon="delete"
          onPress={() => setShowDeleteConfirm(true)}
        />
      </Card>

      <Portal>
        <Dialog visible={showDeleteConfirm} onDismiss={() => setShowDeleteConfirm(false)}>
          <Dialog.Title>Delete Inventory</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this inventory? This will delete all items within it.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button onPress={handleDelete} textColor="red">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
} 