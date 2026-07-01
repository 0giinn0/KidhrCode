import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS, RANKS } from '../../lib/constants';
import { getLevel, getRank, getLevelProgress } from '../../lib/gamification';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    const [progressRes, achievementsRes] = await Promise.all([
      supabase.from('user_progress').select('*').eq('user_id', user.id),
      supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', user.id),
    ]);

    if (progressRes.data) {
      const totalXp = progressRes.data.reduce((s, p) => s + (p.xp_earned || 0), 0);
      const completed = progressRes.data.filter(p => p.completed).length;
      const languages = [...new Set(progressRes.data.map(p => p.language).filter(Boolean))];
      setStats({ totalXp, completed, languagesCount: languages.length });
    }

    if (achievementsRes.data) {
      setProfile({ achievements: achievementsRes.data.map(a => a.achievements) });
    }
  }

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await supabase.auth.signOut();
      }},
    ]);
  }

  const level = stats ? getLevel(stats.totalXp) : 1;
  const rank = stats ? getRank(stats.totalXp) : RANKS[0];
  const progress = stats ? getLevelProgress(stats.totalXp) : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: rank.color }]}>
          <Text style={styles.avatarText}>{(user?.user_metadata?.username || 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{user?.user_metadata?.username || 'Learner'}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={[styles.rankBadge, { backgroundColor: rank.color + '30' }]}>
          <Text style={[styles.rankText, { color: rank.color }]}>{rank.name}</Text>
        </View>
      </View>

      <View style={styles.levelCard}>
        <Text style={styles.levelText}>Level {level}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatBox value={stats?.totalXp || 0} label="Total XP" />
        <StatBox value={stats?.completed || 0} label="Exercises" />
        <StatBox value={stats?.languagesCount || 0} label="Languages" />
      </View>

      {profile?.achievements?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badges}>
            {profile.achievements.map((badge, i) => (
              <View key={i} style={styles.badge}>
                <Text style={styles.badgeIcon}>{badge.icon || '🏅'}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/creator')}>
          <Text style={styles.menuIcon}>📝</Text>
          <Text style={styles.menuText}>Create a Course</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

function StatBox({ value, label }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  username: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  rankBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  rankText: { fontSize: 14, fontWeight: '700' },
  levelCard: {
    marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 20, marginBottom: 16,
  },
  levelText: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  progressBar: { height: 8, backgroundColor: COLORS.surfaceLight, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 12, marginBottom: 24 },
  statBox: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  section: { marginBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, width: '30%',
  },
  badgeIcon: { fontSize: 28, marginBottom: 4 },
  badgeName: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuText: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '500' },
  menuArrow: { fontSize: 18, color: COLORS.textMuted },
  logoutBtn: { marginHorizontal: 16, paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.error },
  logoutText: { color: COLORS.error, fontSize: 16, fontWeight: '600' },
});
