import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/constants';
import { TDivider } from '../components/Terminal';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.ascii}>
          {'  _  __ _           _        ____          _      '}{'\n'}
          {' | |/ /(_)         | |      / ___|___   __| | ___ '}{'\n'}
          {' | \' /  _ _ __   __| |___  | |   / _ \\ / _` |/ _ \\'}{'\n'}
          {' | . \\ | | \'_ \\ / _` |___| | |__| (_) | (_| |  __/'}{'\n'}
          {' |_|\\_\\|_| |_| \\__,_|     \\____\\___/ \\__,_|\\___|'}{'\n'}
        </Text>
      </View>

      <TDivider />

      <View style={styles.stats}>
        <Text style={styles.statLine}>{'>'} 17+ languages supported</Text>
        <Text style={styles.statLine}>{'>'} 40+ exercise types</Text>
        <Text style={styles.statLine}>{'>'} XP, streaks & leaderboards</Text>
        <Text style={styles.statLine}>{'>'} community courses</Text>
      </View>

      <TDivider />

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/signup')}>
          <Text style={styles.btnText}>[ enter ] start learning</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnSecondaryText}>[ .. ] returning user</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ascii: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: COLORS.primary,
    lineHeight: 14,
    marginBottom: 16,
  },
  tagline: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  stats: {
    marginBottom: 24,
  },
  statLine: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 6,
    lineHeight: 18,
  },
  buttons: {
    gap: 10,
  },
  btn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    color: COLORS.terminal,
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
