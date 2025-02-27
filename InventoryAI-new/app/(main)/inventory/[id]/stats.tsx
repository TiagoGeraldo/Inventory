import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { InventoryStats } from '../../../../src/components/inventory/InventoryStats';

export default function InventoryStatsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <InventoryStats inventoryId={id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 