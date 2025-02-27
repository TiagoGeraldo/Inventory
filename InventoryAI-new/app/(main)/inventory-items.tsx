import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ItemList } from '../../src/components/item/ItemList';

export default function InventoryItems() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <ItemList inventoryId={id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 