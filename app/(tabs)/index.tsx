import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS, ICONS } from '../../lib/constants';
import { getLocalStats } from '../../lib/localProgress';
import { TDivider, StatRow } from '../../components/Terminal';

export default function Home() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    const [coursesRes, progressRes] = await Promise.all([
      supabase.from('courses').select('*').eq('is_published', true).order('created_at', { ascending: false }),
      user ? supabase.from('user_progress').select('*').eq('user_id', user.id) : Promise.resolve({ data: [] }),
    ]);

    if (coursesRes.data) setCourses(coursesRes.data);

    if (user && progressRes.data) {
      const completed = progressRes.data.filter(p => p.completed).length;
      const totalXp = progressRes.data.reduce((s, p) => s + (p.xp_earned || 0), 0);
      setStats({ completed, totalXp, courses: courses.length });
    } else if (!user) {
      const local = await getLocalStats();
      setStats({ completed: local.completed, totalXp: local.totalXp, courses: courses.length });
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={COLORS.terminal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.prompt}>❯</Text>
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>kidhrcode</Text>
          <Text style={styles.sub}>terminal learning environment</Text>
        </View>
      </View>

      {!user && (
        <TouchableOpacity style={styles.guestPrompt} onPress={() => router.push('/auth/login')}>
          <Text style={styles.guestText}>[ .. ] guest mode — sign in to save progress & earn certificates</Text>
        </TouchableOpacity>
      )}

      <TDivider />

      {stats && (
        <StatRow stats={[
          { value: stats.totalXp, label: 'XP' },
          { value: stats.completed, label: 'DONE' },
          { value: stats.courses, label: 'COURSES' },
        ]} />
      )}

      <Text style={styles.sectionTitle}>{'>'} available courses</Text>

      <FlatList
        data={courses}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>[..]</Text>
            <Text style={styles.emptyText}>no courses available</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/course/${item.id}`)}>
            <Text style={styles.cardLang}>[{item.language}]</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDiff}>[{item.difficulty}]</Text>
            </View>
            <Text style={styles.cardArrow}>{'>'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, marginBottom: 8 },
  prompt: { color: COLORS.terminal, fontSize: 20, fontWeight: '700', fontFamily: 'monospace' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace' },
  sub: { fontSize: 12, color: COLORS.textSecondary, fontFamily: 'monospace', marginTop: 2 },
  guestPrompt: { borderWidth: 1, borderColor: COLORS.border, padding: 12, marginTop: 12 },
  guestText: { color: COLORS.textMuted, fontSize: 11, fontFamily: 'monospace', textAlign: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, fontFamily: 'monospace', marginBottom: 12, letterSpacing: 1 },
  card: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: COLORS.border, padding: 14, marginBottom: 8,
  },
  cardLang: { color: COLORS.primaryDark, fontSize: 11, fontFamily: 'monospace', marginRight: 10, width: 32 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, fontFamily: 'monospace' },
  cardDiff: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace', marginTop: 3 },
  cardArrow: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'monospace' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 28, color: COLORS.textMuted, fontFamily: 'monospace', marginBottom: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'monospace' },
});
