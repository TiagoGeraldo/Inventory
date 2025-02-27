import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton, FAB, Card, Button, Portal, Dialog, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router, Tabs } from 'expo-router';
import { useState, useEffect } from 'react';
import { inventoryService } from '../../../src/services/inventory/inventoryService';
import { Inventory } from '../../../src/types';
import { useAuth } from '../../../src/stores/AuthContext';

export default function InventoryLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="items"
        options={{
          title: 'Items',
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistics',
        }}
      />
    </Tabs>
  );
}

export function InventoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [id]);

  const loadInventory = async () => {
    if (!id) return;
    try {
      const data = await inventoryService.getInventoryById(id);
      setInventory(data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await inventoryService.deleteInventory(id as string);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete inventory');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!inventory) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Inventory not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <Text variant="titleLarge">{inventory.name}</Text>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.infoCard}>
          <Card.Title
            title={inventory.name}
            subtitle={`${inventory.item_count} items`}
            left={(props) => (
              <IconButton {...props} icon={inventory.icon} size={24} />
            )}
            right={(props) => (
              <IconButton
                {...props}
                icon="delete"
                onPress={() => setDeleteDialogVisible(true)}
              />
            )}
          />
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Items
        </Text>

        {inventory.item_count === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.emptyText}>
                No items yet. Add your first item!
              </Text>
            </Card.Content>
          </Card>
        ) : null}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push(`/inventory/${inventory.id}/items/new`)}
        label="Add Item"
      />

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Inventory</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this inventory?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    marginBottom: 24,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  emptyCard: {
    marginTop: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 