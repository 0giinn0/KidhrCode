import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS, DIFFICULTY_COLORS } from '../../lib/constants';

export default function Home() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [coursesRes, progressRes] = await Promise.all([
      supabase.from('courses').select('*').eq('is_published', true).order('created_at', { ascending: false }),
      supabase.from('user_progress').select('*').eq('user_id', user.id),
    ]);

    if (coursesRes.data) setCourses(coursesRes.data);
    if (progressRes.data) {
      const completed = progressRes.data.filter(p => p.completed).length;
      const totalXp = progressRes.data.reduce((sum, p) => sum + (p.xp_earned || 0), 0);
      setUserStats({ completed, totalXp });
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  function getLanguageEmoji(lang) {
    const map = {
      python: '🐍', javascript: '🟨', typescript: '🔷', rust: '🦀', go: '🐹',
      java: '☕', cpp: '⚙️', csharp: '💎', ruby: '💎', php: '🐘',
      bash: '⌨️', sql: '🗃️', r: '📊', swift: '🍎', kotlin: '📱', dart: '🎯',
      html: '🌐', css: '🎨',
    };
    return map[lang?.toLowerCase()] || '💻';
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userStats && (
        <View style={styles.statsBar}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{userStats.totalXp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{userStats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{courses.length}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
        </View>
      )}

      <FlatList
        data={courses}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.greeting}>Welcome to KidhrCode</Text>
            <Text style={styles.subtitle}>Continue your learning journey</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyText}>No courses yet</Text>
            <Text style={styles.emptySubtext}>Courses will appear here once created</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.courseCard}
            onPress={() => router.push(`/course/${item.id}`)}
          >
            <View style={styles.courseHeader}>
              <Text style={styles.courseEmoji}>{getLanguageEmoji(item.language)}</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[item.difficulty] || '#6366F1' }]}>
                <Text style={styles.difficultyText}>{item.difficulty || 'beginner'}</Text>
              </View>
            </View>
            <Text style={styles.courseTitle}>{item.title}</Text>
            <Text style={styles.courseDescription} numberOfLines={2}>{item.description}</Text>
            <View style={styles.courseMeta}>
              <Text style={styles.courseLanguage}>{item.language}</Text>
              <Text style={styles.courseModules}>{item.modules_count || 0} modules</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  statsBar: {
    flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 60,
    borderRadius: 16, padding: 20, justifyContent: 'space-around',
  },
  stat: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  header: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 },
  greeting: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4 },
  list: { paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
  courseCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 12,
    borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  courseEmoji: { fontSize: 36 },
  difficultyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  difficultyText: { color: '#fff', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  courseTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  courseDescription: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 12 },
  courseMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  courseLanguage: { fontSize: 13, color: COLORS.primary, fontWeight: '600', textTransform: 'capitalize' },
  courseModules: { fontSize: 13, color: COLORS.textMuted },
});
