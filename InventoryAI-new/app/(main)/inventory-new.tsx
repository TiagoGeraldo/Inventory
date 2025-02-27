import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../../src/stores/AuthContext';
import { inventoryService } from '../../src/services/inventory/inventoryService';
import { IconPicker } from '../../src/components/IconPicker';

export default function NewInventory() {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('box');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const { user } = useAuth();

  const handleCreate = async () => {
    if (!user || !name.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await inventoryService.createInventory(user.id, name.trim(), icon);
      router.back();
    } catch (err) {
      console.error('Failed to create inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to create inventory');
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
        error={!!error}
      />

      <View style={styles.iconSelector}>
        <Text variant="bodyMedium">Icon</Text>
        <IconButton
          icon={icon}
          size={32}
          onPress={() => setIconPickerVisible(true)}
          style={styles.iconButton}
        />
      </View>

      {error && (
        <Text style={styles.errorText} variant="bodySmall">
          {error}
        </Text>
      )}

      <Button
        mode="contained"
        onPress={handleCreate}
        loading={loading}
        disabled={loading || !name.trim()}
        style={styles.button}
      >
        Create Inventory
      </Button>

      <IconPicker
        selectedIcon={icon}
        onSelectIcon={setIcon}
        visible={iconPickerVisible}
        onDismiss={() => setIconPickerVisible(false)}
      />
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
  button: {
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    marginBottom: 8,
  },
}); 