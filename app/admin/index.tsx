import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';
import { TDivider } from '../../components/Terminal';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ courses: 0, submissions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('user_progress').select('*', { count: 'exact', head: true }),
    ]).then(([coursesRes, progressRes]) => {
      setStats({
        courses: coursesRes.count || 0,
        submissions: progressRes.count || 0,
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={COLORS.terminal} />
      </View>
    );
  }

  const menuItems = [
    { label: 'all courses', action: '[##]', onPress: () => router.push('/creator') },
    { label: 'users', action: '[@]', onPress: () => {} },
    { label: 'pending reviews', action: '[!!]', onPress: () => {} },
    { label: 'creator studio', action: '[+]', onPress: () => router.push('/creator') },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{'>'} admin</Text>
      <Text style={styles.sub}>system overview</Text>

      <TDivider />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.courses}</Text>
          <Text style={styles.statLabel}>courses</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.submissions}</Text>
          <Text style={styles.statLabel}>submissions</Text>
        </View>
      </View>

      <TDivider />

      <Text style={styles.sectionTitle}>{'>'} management</Text>
      {menuItems.map((item, i) => (
        <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
          <Text style={styles.menuAction}>{item.action}</Text>
          <Text style={styles.menuLabel}>{item.label}</Text>
          <Text style={styles.menuArrow}>{'>'}</Text>
        </TouchableOpacity>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace', paddingHorizontal: 16 },
  sub: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace', paddingHorizontal: 16, marginTop: 4, marginBottom: 8 },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 12, marginBottom: 16 },
  statBox: { flex: 1, borderWidth: 1, borderColor: COLORS.border, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '700', color: COLORS.terminal, fontFamily: 'monospace' },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace', letterSpacing: 1, marginTop: 4 },
  sectionTitle: { fontSize: 11, color: COLORS.textSecondary, fontFamily: 'monospace', letterSpacing: 1, paddingHorizontal: 16, marginBottom: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, padding: 16, marginHorizontal: 16, marginBottom: 8 },
  menuAction: { fontSize: 13, color: COLORS.textMuted, fontFamily: 'monospace', marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 13, color: COLORS.text, fontFamily: 'monospace' },
  menuArrow: { fontSize: 13, color: COLORS.textMuted, fontFamily: 'monospace' },
});
