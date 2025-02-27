import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, FAB, IconButton, Searchbar, Menu, Portal, Dialog, Button } from 'react-native-paper';
import { Item } from '../../types';
import { itemService } from '../../services/item/itemService';
import { ItemDialog } from './ItemDialog';
import { useAuth } from '../../stores/AuthContext';

interface ItemListProps {
  inventoryId: string;
}

export function ItemList({ inventoryId }: ItemListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadItems();
  }, [inventoryId]);

  const loadItems = async () => {
    try {
      const data = await itemService.getItems(inventoryId);
      setItems(data);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await itemService.deleteItem(itemId);
      await loadItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search items"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <ScrollView>
        {filteredItems.map(item => (
          <Card key={item.id} style={styles.itemCard}>
            <Card.Title
              title={item.name}
              subtitle={`Quantity: ${item.quantity}${item.unit ? ` ${item.unit}` : ''}`}
              right={(props) => (
                <Menu
                  visible={menuVisible === item.id}
                  onDismiss={() => setMenuVisible(null)}
                  anchor={
                    <IconButton
                      {...props}
                      icon="dots-vertical"
                      onPress={() => setMenuVisible(item.id)}
                    />
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      setSelectedItem(item);
                      setDialogVisible(true);
                      setMenuVisible(null);
                    }}
                    title="Edit"
                    leadingIcon="pencil"
                  />
                  <Menu.Item
                    onPress={() => {
                      setSelectedItem(item);
                      setDeleteDialogVisible(true);
                      setMenuVisible(null);
                    }}
                    title="Delete"
                    leadingIcon="delete"
                  />
                </Menu>
              )}
            />
            {item.description && (
              <Card.Content>
                <Text>{item.description}</Text>
              </Card.Content>
            )}
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          setSelectedItem(null);
          setDialogVisible(true);
        }}
      />

      {user && (
        <ItemDialog
          visible={dialogVisible}
          onDismiss={() => {
            setDialogVisible(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          inventoryId={inventoryId}
          userId={user.id}
          onSave={loadItems}
        />
      )}

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Item</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this item?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button 
              onPress={() => {
                if (selectedItem) {
                  handleDelete(selectedItem.id);
                }
                setDeleteDialogVisible(false);
              }}
              textColor="red"
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    margin: 16,
  },
  itemCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 