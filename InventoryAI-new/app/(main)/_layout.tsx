import { Stack } from 'expo-router';
import { useAuth } from '../../src/stores/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function MainLayout() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Dashboard'
        }}
      />
      <Stack.Screen
        name="inventory"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings'
        }}
      />
    </Stack>
  );
} 