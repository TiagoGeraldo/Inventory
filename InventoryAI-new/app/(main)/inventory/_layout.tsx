import { Stack } from 'expo-router';

export default function InventoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen name="new" />
    </Stack>
  );
} 