import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/stores/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/(main)/dashboard' : '/(auth)/login');
    }
  }, [user, loading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
} 