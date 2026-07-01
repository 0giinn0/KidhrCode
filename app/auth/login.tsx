import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';
import { TDivider } from '../../components/Terminal';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('[ !! ] error', error.message);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>{'<'} back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{'>'} sign in</Text>
      <Text style={styles.subtitle}>enter your credentials</Text>

      <TDivider />

      <View style={styles.form}>
        <Text style={styles.label}>{'>'} email</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor={COLORS.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.label}>{'>'} password</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor={COLORS.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.5 }]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>[ ok ] {loading ? 'authenticating...' : 'sign in'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push('/auth/signup')} style={styles.link}>
        <Text style={styles.linkText}>{'>'} don\'t have an account? sign up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 24, justifyContent: 'center' },
  back: { position: 'absolute', top: 60, left: 24 },
  backText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: 'monospace' },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace' },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, fontFamily: 'monospace', marginTop: 4, marginBottom: 16 },
  form: { gap: 10 },
  label: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace', letterSpacing: 1 },
  input: {
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border,
    padding: 14, fontSize: 13, color: COLORS.text, fontFamily: 'monospace',
  },
  btn: {
    borderWidth: 1, borderColor: COLORS.border, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
  },
  btnText: { color: COLORS.terminal, fontSize: 13, fontFamily: 'monospace', fontWeight: '700' },
  link: { marginTop: 24 },
  linkText: { color: COLORS.textSecondary, fontSize: 12, fontFamily: 'monospace', textAlign: 'center' },
});
