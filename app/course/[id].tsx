import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';
import { getLocalProgress } from '../../lib/localProgress';
import { TDivider } from '../../components/Terminal';

export default function CourseDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCourse(); }, [id]);

  async function loadCourse() {
    const { data: { user } } = await supabase.auth.getUser();

    const [courseRes, modulesRes] = await Promise.all([
      supabase.from('courses').select('*').eq('id', id).single(),
      supabase.from('modules').select('*, lessons(*)').eq('course_id', id).order('order', { ascending: true }),
    ]);

    if (courseRes.data) setCourse(courseRes.data);
    if (modulesRes.data) setModules(modulesRes.data);

    if (modulesRes.data) {
      const lessonIds = modulesRes.data.flatMap((m: any) => m.lessons?.map((l: any) => l.id) || []);
      if (user) {
        const { data } = await supabase.from('user_progress').select('*').eq('user_id', user.id).in('lesson_id', lessonIds);
        if (data) {
          const pm: Record<string, any> = {}; data.forEach((p: any) => { pm[p.lesson_id] = p; });
          setProgress(pm);
        }
      } else {
        const local = await getLocalProgress();
        const pm: Record<string, any> = {};
        for (const id of lessonIds) {
          if (local[id]) pm[id] = local[id];
        }
        setProgress(pm);
      }
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={COLORS.terminal} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: COLORS.textSecondary, fontFamily: 'monospace' }}>course not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>{'<'} back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.langBadge}>[{course.language?.toUpperCase()}]</Text>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.desc}>{course.description}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{course.difficulty}</Text>
          <Text style={styles.metaSep}>|</Text>
          <Text style={styles.metaText}>{modules.length} modules</Text>
        </View>
      </View>

      <TDivider />

      <FlatList
        data={modules}
        keyExtractor={(item: any) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>no modules yet</Text>
          </View>
        }
        renderItem={({ item: mod }: { item: any }) => {
          const completed = mod.lessons?.filter((l: any) => progress[l.id]?.completed).length || 0;
          const total = mod.lessons?.length || 0;
          return (
            <View style={styles.module}>
              <View style={styles.moduleHead}>
                <Text style={styles.moduleTitle}>[{mod.title}]</Text>
                <Text style={styles.moduleProg}>{completed}/{total}</Text>
              </View>
              {mod.lessons?.map((lesson: any) => {
                const done = progress[lesson.id]?.completed;
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[styles.lesson, done && styles.lessonDone]}
                    onPress={() => router.push(`/exercise/${lesson.id}`)}
                  >
                    <Text style={styles.lessonIcon}>{done ? '[ok]' : '[..]'}</Text>
                    <Text style={[styles.lessonTitle, done && styles.lessonTitleDone]} numberOfLines={1}>
                      {lesson.title}
                    </Text>
                    <Text style={styles.lessonType}>{lesson.exercise_type?.toUpperCase()}</Text>
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
  backText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: 'monospace' },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  langBadge: { color: COLORS.terminal, fontSize: 11, fontFamily: 'monospace', fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace', marginBottom: 8 },
  desc: { fontSize: 12, color: COLORS.textMuted, fontFamily: 'monospace', lineHeight: 18 },
  meta: { flexDirection: 'row', marginTop: 12 },
  metaText: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace', textTransform: 'capitalize' },
  metaSep: { color: COLORS.textMuted, marginHorizontal: 8, fontSize: 10, fontFamily: 'monospace' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: 'monospace' },
  module: { marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  moduleHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surfaceLight,
  },
  moduleTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace' },
  moduleProg: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace' },
  lesson: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  lessonDone: { backgroundColor: COLORS.surfaceLight },
  lessonIcon: { fontSize: 10, color: COLORS.terminal, fontFamily: 'monospace', fontWeight: '700', width: 30 },
  lessonTitle: { flex: 1, fontSize: 12, color: COLORS.text, fontFamily: 'monospace' },
  lessonTitleDone: { color: COLORS.textMuted },
  lessonType: { fontSize: 9, color: COLORS.textMuted, fontFamily: 'monospace', letterSpacing: 1, marginLeft: 8 },
});
