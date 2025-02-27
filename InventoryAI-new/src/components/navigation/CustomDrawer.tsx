import { View, StyleSheet } from 'react-native';
import { Text, List, Button } from 'react-native-paper';
import { useAuth } from '../../stores/AuthContext';
import { router } from 'expo-router';

export function CustomDrawer() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium">{user?.email}</Text>
      </View>

      <List.Section>
        <List.Item
          title="Dashboard"
          left={props => <List.Icon {...props} icon="view-dashboard" />}
          onPress={() => router.push('/dashboard')}
        />
        <List.Item
          title="Settings"
          left={props => <List.Icon {...props} icon="cog" />}
          onPress={() => router.push('/settings')}
        />
      </List.Section>

      <Button 
        mode="outlined" 
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoutButton: {
    margin: 16,
  },
}); 