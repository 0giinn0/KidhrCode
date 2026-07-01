import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS, DIFFICULTY_COLORS } from '../../lib/constants';

export default function CourseDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [id]);

  async function loadCourse() {
    const { data: { user } } = await supabase.auth.getUser();

    const [courseRes, modulesRes] = await Promise.all([
      supabase.from('courses').select('*').eq('id', id).single(),
      supabase.from('modules').select('*, lessons(*)').eq('course_id', id).order('order', { ascending: true }),
    ]);

    if (courseRes.data) setCourse(courseRes.data);
    if (modulesRes.data) setModules(modulesRes.data);

    if (user) {
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', modulesRes.data?.flatMap(m => m.lessons?.map(l => l.id) || []) || []);
      if (data) {
        const progressMap = {};
        data.forEach(p => { progressMap[p.lesson_id] = p; });
        setProgress(progressMap);
      }
    }

    setLoading(false);
  }

  function getLangEmoji(lang) {
    const map = {
      python: '🐍', javascript: '🟨', typescript: '🔷', rust: '🦀', go: '🐹',
      java: '☕', cpp: '⚙️', csharp: '💎', ruby: '💎', php: '🐘',
      bash: '⌨️', sql: '🗃️', r: '📊', swift: '🍎', kotlin: '📱', dart: '🎯',
    };
    return map[lang?.toLowerCase()] || '💻';
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: COLORS.textSecondary }}>Course not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.emoji}>{getLangEmoji(course.language)}</Text>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.description}>{course.description}</Text>
        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: DIFFICULTY_COLORS[course.difficulty] || '#6366F1' }]}>
            <Text style={styles.badgeText}>{course.difficulty}</Text>
          </View>
          <Text style={styles.lang}>{course.language}</Text>
          <Text style={styles.moduleCount}>{modules.length} modules</Text>
        </View>
      </View>

      <FlatList
        data={modules}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No modules yet</Text>
          </View>
        }
        renderItem={({ item: mod }) => {
          const completedLessons = mod.lessons?.filter(l => progress[l.id]?.completed).length || 0;
          const totalLessons = mod.lessons?.length || 0;
          return (
            <View style={styles.module}>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
                <Text style={styles.moduleProgress}>{completedLessons}/{totalLessons}</Text>
              </View>
              {mod.lessons?.map(lesson => {
                const isCompleted = progress[lesson.id]?.completed;
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[styles.lesson, isCompleted && styles.lessonCompleted]}
                    onPress={() => router.push(`/exercise/${lesson.id}`)}
                  >
                    <Text style={styles.lessonIcon}>{isCompleted ? '✅' : '📖'}</Text>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <Text style={styles.lessonType}>{lesson.exercise_type}</Text>
                    </View>
                    {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        }}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  back: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  backText: { color: COLORS.primary, fontSize: 16 },
  header: { paddingHorizontal: 16, paddingBottom: 24 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 16 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  lang: { fontSize: 14, color: COLORS.primary, fontWeight: '600', textTransform: 'capitalize' },
  moduleCount: { fontSize: 14, color: COLORS.textMuted },
  list: { paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  module: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  moduleHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  moduleTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  moduleProgress: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  lesson: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    paddingHorizontal: 12, borderRadius: 10, marginBottom: 4,
  },
  lessonCompleted: { backgroundColor: COLORS.surfaceLight },
  lessonIcon: { fontSize: 18, marginRight: 12 },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  lessonType: { fontSize: 12, color: COLORS.textMuted, marginTop: 2, textTransform: 'capitalize' },
  checkmark: { fontSize: 16, color: COLORS.success, fontWeight: '700' },
});
