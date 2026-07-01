import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ courses: 0, users: 0, exercises: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('user_progress').select('*', { count: 'exact', head: true }),
    ]).then(([coursesRes, progressRes]) => {
      setStats({
        courses: coursesRes.count || 0,
        exercises: progressRes.count || 0,
        users: 0,
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <View style={styles.statsRow}>
        <StatBox value={stats.courses} label="Courses" />
        <StatBox value={stats.exercises} label="Submissions" />
        <StatBox value={stats.users} label="Users" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Management</Text>
        <MenuItem icon="📚" label="All Courses" onPress={() => {}} />
        <MenuItem icon="👥" label="Users" onPress={() => {}} />
        <MenuItem icon="🏷️" label="Pending Reviews" onPress={() => {}} />
      </View>
    </View>
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

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuText}>{label}</Text>
      <Text style={styles.menuArrow}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, paddingHorizontal: 16, marginBottom: 20 },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 12, marginBottom: 24 },
  statBox: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuText: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '500' },
  menuArrow: { fontSize: 18, color: COLORS.textMuted },
});
