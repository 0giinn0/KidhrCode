import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';
import { TDivider } from '../../components/Terminal';

export default function CreatorDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('courses').select('*').eq('creator_id', user.id).order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setCourses(data); setLoading(false); });
    });
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
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>{'<'} profile</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{'>'} creator studio</Text>
      <Text style={styles.sub}>build and manage courses</Text>

      <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/creator/create-course')}>
        <Text style={styles.createText}>[+] create new course</Text>
      </TouchableOpacity>

      <TDivider />

      <Text style={styles.sectionTitle}>{'>'} my courses ({courses.length})</Text>

      <FlatList
        data={courses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/creator/edit-course/${item.id}`)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.status, { borderColor: item.is_published ? COLORS.success : COLORS.textMuted }]}>
                <Text style={[styles.statusText, { color: item.is_published ? COLORS.success : COLORS.textMuted }]}>
                  {item.is_published ? '[ok]' : '[..]'}
                </Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>{item.language} | {item.difficulty}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>no courses yet</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
      <View style={{ height: 100 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  back: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  backText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: 'monospace' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace', paddingHorizontal: 16 },
  sub: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace', paddingHorizontal: 16, marginTop: 4, marginBottom: 20 },
  createBtn: { borderWidth: 1, borderColor: COLORS.border, padding: 16, marginHorizontal: 16, marginBottom: 16 },
  createText: { color: COLORS.terminal, fontSize: 13, fontFamily: 'monospace', fontWeight: '700', textAlign: 'center' },
  sectionTitle: { fontSize: 11, color: COLORS.textSecondary, fontFamily: 'monospace', letterSpacing: 1, paddingHorizontal: 16, marginBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 8 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace', flex: 1 },
  status: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 9, fontFamily: 'monospace', fontWeight: '700' },
  cardMeta: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace', textTransform: 'capitalize' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, fontFamily: 'monospace' },
});
