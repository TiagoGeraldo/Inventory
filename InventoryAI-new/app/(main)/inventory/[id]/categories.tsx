import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CategoryList } from '../../../../src/components/category/CategoryList';

export default function InventoryCategories() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <CategoryList inventoryId={id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 