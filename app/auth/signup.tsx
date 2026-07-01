import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    setLoading(true);
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Check your email for confirmation!');
      router.push('/auth/login');
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Join KidhrCode</Text>
      <Text style={styles.subtitle}>Start your coding journey</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={COLORS.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          placeholderTextColor={COLORS.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignup} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  back: {
    position: 'absolute',
    top: 60,
    left: 24,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  form: {
    gap: 12,
    marginBottom: 24,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  link: {
    color: COLORS.primary,
    textAlign: 'center',
    fontSize: 15,
  },
});
