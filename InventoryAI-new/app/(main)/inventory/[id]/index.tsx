import { Redirect } from 'expo-router';

export default function InventoryIndex() {
  // Redirect to items tab by default
  return <Redirect href="items" />;
} 