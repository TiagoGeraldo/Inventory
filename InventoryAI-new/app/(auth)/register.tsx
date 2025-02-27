import { View, StyleSheet } from 'react-native';
import { Button, TextInput, Text, HelperText } from 'react-native-paper';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../../src/stores/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(email, password);
      router.replace('/(main)/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err instanceof Error) {
        // Handle specific Supabase errors
        if (err.message.includes('already registered')) {
          setError('This email is already registered');
        } else if (err.message.includes('invalid email')) {
          setError('Please enter a valid email address');
        } else {
          setError(err.message);
        }
      } else {
        setError('An error occurred during registration');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
      
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

      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
        disabled={loading}
      />
      
      {error ? <HelperText type="error">{error}</HelperText> : null}
      
      <Button 
        mode="contained" 
        onPress={handleRegister} 
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Register
      </Button>
      
      <Button 
        mode="text" 
        onPress={() => router.push('/login')}
        style={styles.linkButton}
        disabled={loading}
      >
        Already have an account? Login
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