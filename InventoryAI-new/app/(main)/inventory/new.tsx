import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../../../src/stores/AuthContext';
import { inventoryService } from '../../../src/services/inventory/inventoryService';

export default function NewInventory() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCreate = async () => {
    if (!user || !name.trim()) return;

    try {
      setLoading(true);
      await inventoryService.createInventory(user.id, name.trim());
      router.back();
    } catch (err) {
      console.error('Failed to create inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Create New Inventory</Text>
      
      <TextInput
        label="Inventory Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleCreate}
        loading={loading}
        disabled={loading || !name.trim()}
        style={styles.button}
      >
        Create Inventory
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
}); 