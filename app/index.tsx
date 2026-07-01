import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/constants';

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>💻</Text>
        <Text style={styles.title}>KidhrCode</Text>
        <Text style={styles.subtitle}>Learn every language.{'\n'}Master every concept.{'\n'}For free. Forever.</Text>
      </View>

      <View style={styles.features}>
        <Feature icon="📚" text="40+ exercise types" />
        <Feature icon="🏆" text="Gamified learning" />
        <Feature icon="🌍" text="17+ programming languages" />
        <Feature icon="🎯" text="Skill trees & quests" />
        <Feature icon="👥" text="Community courses" />
        <Feature icon="🔥" text="Streaks & leaderboards" />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/auth/signup')}>
          <Text style={styles.primaryBtnText}>Get Started Free</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Feature({ icon, text }) {
  return (
    <View style={styles.feature}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
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
    marginBottom: 48,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    marginBottom: 48,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  featureText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  buttons: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
});
