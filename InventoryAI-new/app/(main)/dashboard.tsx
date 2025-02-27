import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, FAB, useTheme, IconButton, Menu, Portal, Dialog, TextInput } from 'react-native-paper';
import { useAuth } from '../../src/stores/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../../src/services/inventory/inventoryService';
import { Inventory } from '../../src/types';
import { router, useNavigation } from 'expo-router';
import { IconPicker } from '../../src/components/IconPicker';

export default function Dashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Add states for editing
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('box');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);

  const loadInventories = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const data = await inventoryService.getInventories(user.id);
      setInventories(data);
    } catch (err) {
      console.error('Failed to load inventories:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadInventories();
  }, [loadInventories]);

  // Listen for focus events to refresh data
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadInventories();
    });

    return unsubscribe;
  }, [navigation, loadInventories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInventories();
  }, [loadInventories]);

  const handleEdit = (inventory: Inventory) => {
    setEditingInventory(inventory);
    setEditName(inventory.name);
    setEditIcon(inventory.icon);
    setEditDialogVisible(true);
    setMenuVisible(null);
  };

  const handleSaveEdit = async () => {
    if (!editingInventory) return;

    try {
      await inventoryService.updateInventory(editingInventory.id, {
        name: editName.trim(),
        icon: editIcon,
      });
      await loadInventories();
      setEditDialogVisible(false);
      setEditingInventory(null);
    } catch (err) {
      console.error('Failed to update inventory:', err);
    }
  };

  const handleDelete = async (inventoryId: string) => {
    try {
      await inventoryService.deleteInventory(inventoryId);
      await loadInventories();
    } catch (err) {
      console.error('Failed to delete inventory:', err);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {loading ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>Loading...</Text>
            </Card.Content>
          </Card>
        ) : inventories.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No inventories yet</Text>
            </Card.Content>
          </Card>
        ) : (
          inventories.map((inventory) => (
            <Card
              key={inventory.id}
              style={styles.inventoryCard}
              onPress={() => router.push({
                pathname: '/inventory-items',
                params: { id: inventory.id }
              })}
            >
              <Card.Title
                title={inventory.name}
                subtitle={`${inventory.item_count} items`}
                left={(props) => <IconButton {...props} icon={inventory.icon} />}
                right={(props) => (
                  <IconButton 
                    {...props} 
                    icon="dots-vertical" 
                    onPress={(e) => {
                      e.stopPropagation();
                      setMenuVisible(inventory.id);
                    }}
                  />
                )}
              />
              <Menu
                visible={menuVisible === inventory.id}
                onDismiss={() => setMenuVisible(null)}
                anchor={{ x: 0, y: 0 }} // This will be updated by the IconButton
              >
                <Menu.Item 
                  onPress={() => handleEdit(inventory)} 
                  title="Edit"
                  leadingIcon="pencil"
                />
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(null);
                    handleDelete(inventory.id);
                  }}
                  title="Delete"
                  leadingIcon="delete"
                />
              </Menu>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        label="New Inventory"
        style={styles.fab}
        onPress={() => router.push('/inventory-new')}
      />

      <Portal>
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => setEditDialogVisible(false)}
        >
          <Dialog.Title>Edit Inventory</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={editName}
              onChangeText={setEditName}
              mode="outlined"
              style={styles.input}
            />
            <View style={styles.iconSelector}>
              <Text variant="bodyMedium">Icon</Text>
              <IconButton
                icon={editIcon}
                size={32}
                onPress={() => setIconPickerVisible(true)}
                style={styles.iconButton}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <IconButton icon="close" onPress={() => setEditDialogVisible(false)} />
            <IconButton icon="check" onPress={handleSaveEdit} />
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <IconPicker
        selectedIcon={editIcon}
        onSelectIcon={setEditIcon}
        visible={iconPickerVisible}
        onDismiss={() => setIconPickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    minHeight: '100%',
  },
  inventoryCard: {
    marginBottom: 12,
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
  input: {
    marginBottom: 16,
  },
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconButton: {
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
}); 