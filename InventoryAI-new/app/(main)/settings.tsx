import { View, StyleSheet } from 'react-native';
import { Text, List, Switch, Button } from 'react-native-paper';
import { useAuth } from '../../src/stores/AuthContext';

export default function Settings() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Email"
          description={user?.email}
          left={props => <List.Icon {...props} icon="email" />}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Dark Mode"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={props => <Switch value={false} onValueChange={() => {}} />}
        />
        <List.Item
          title="Notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={props => <Switch value={true} onValueChange={() => {}} />}
        />
      </List.Section>

      <Button 
        mode="contained" 
        onPress={signOut}
        style={styles.signOutButton}
      >
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  signOutButton: {
    margin: 16,
  },
}); 