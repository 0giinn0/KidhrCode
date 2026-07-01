import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';

export default function CreatorDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('courses').select('*').eq('creator_id', user.id).order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setCourses(data);
          setLoading(false);
        });
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Profile</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Creator Studio</Text>
      </View>

      <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/creator/create-course')}>
        <Text style={styles.createIcon}>+</Text>
        <Text style={styles.createText}>Create New Course</Text>
      </TouchableOpacity>

      {courses.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>My Courses ({courses.length})</Text>
          <FlatList
            data={courses}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.courseCard}
                onPress={() => router.push(`/creator/edit-course/${item.id}`)}
              >
                <View style={styles.courseHeader}>
                  <Text style={styles.courseTitle}>{item.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: item.is_published ? COLORS.success + '30' : COLORS.textMuted + '30' }]}>
                    <Text style={[styles.statusText, { color: item.is_published ? COLORS.success : COLORS.textMuted }]}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.courseDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.courseMeta}>{item.language} · {item.difficulty}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📝</Text>
                <Text style={styles.emptyText}>No courses yet</Text>
                <Text style={styles.emptySubtext}>Tap "Create New Course" to get started</Text>
              </View>
            }
            contentContainerStyle={styles.list}
          />
        </>
      )}

      <View style={{ height: 100 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 },
  backText: { color: COLORS.primary, fontSize: 16, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    marginHorizontal: 16, padding: 20, borderRadius: 16, marginBottom: 24,
  },
  createIcon: { fontSize: 28, color: '#fff', fontWeight: '300', marginRight: 12 },
  createText: { fontSize: 17, color: '#fff', fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, paddingHorizontal: 16, marginBottom: 12 },
  list: { paddingBottom: 100 },
  courseCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 12,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  courseTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  courseDesc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8, lineHeight: 20 },
  courseMeta: { fontSize: 13, color: COLORS.textMuted, textTransform: 'capitalize' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' },
});
