import { View, StyleSheet } from 'react-native';
import { Button, TextInput, Text, HelperText } from 'react-native-paper';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { useAuth } from '../../src/stores/AuthContext';
import { testSupabaseConnection } from '../../src/services/auth/testAuth';
import { supabase } from '../../src/services/supabase/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      console.log('Attempting login with:', { email });
      setLoading(true);
      setError('');
      await login(email, password);
      console.log('Login successful');
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Login error details:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      
      if (err instanceof Error) {
        if (err.message.includes('Invalid login')) {
          setError('Invalid email or password');
        } else if (err.message.includes('Email not confirmed')) {
          setError('Please confirm your email address');
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError('An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const result = await testSupabaseConnection();
      console.log('Connection test result:', result);
      alert(result ? 'Connection successful' : 'Connection failed');
    } catch (err) {
      console.error('Test connection error:', err);
      alert('Connection test error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const directTest = async () => {
    try {
      const testEmail = `test.${Math.random().toString(36).substring(7)}@example.com`;
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'Test123456!'
      });
      
      console.log('Direct test result:', { data, error });
      alert(error ? `Error: ${error.message}` : `Success! Created user with email: ${testEmail}`);
    } catch (err) {
      console.error('Direct test error:', err);
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Welcome to InventoryAI</Text>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={loading}
      />
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
        disabled={loading}
      />
      
      {error ? <HelperText type="error">{error}</HelperText> : null}
      
      <Button 
        mode="contained" 
        onPress={handleLogin} 
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Login
      </Button>
      
      <Button 
        mode="text" 
        onPress={() => router.push('/register')}
        style={styles.linkButton}
        disabled={loading}
      >
        Don't have an account? Register
      </Button>
      
      <Button 
        mode="outlined" 
        onPress={testConnection}
        style={styles.button}
      >
        Test Connection
      </Button>
      
      <Button 
        mode="outlined" 
        onPress={directTest}
        style={styles.button}
      >
        Direct Test
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginTop: 16,
  },
  linkButton: {
    marginTop: 8,
  },
}); 