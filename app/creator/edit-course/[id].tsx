import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { COLORS } from '../../../lib/constants';
import { TDivider } from '../../../components/Terminal';

export default function EditCourse() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('courses').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setCourse(data);
      setLoading(false);
    });
  }, [id]);

  async function togglePublish() {
    if (!course) return;
    setSaving(true);
    const { error } = await supabase.from('courses').update({ is_published: !course.is_published }).eq('id', id);
    if (!error) setCourse({ ...course, is_published: !course.is_published });
    else Alert.alert('[!!] error', error.message);
    setSaving(false);
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
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>{'<'} dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{'>'} {course.title}</Text>
      <Text style={styles.sub}>course management</Text>

      <TDivider />

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>language</Text>
          <Text style={styles.infoValue}>{course.language}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>difficulty</Text>
          <Text style={styles.infoValue}>{course.difficulty}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>status</Text>
          <Text style={[styles.infoValue, { color: course.is_published ? COLORS.success : COLORS.textMuted }]}>
            {course.is_published ? '[ok] published' : '[..] draft'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.action, course.is_published && styles.actionUnpublish]}
        onPress={togglePublish}
        disabled={saving}
      >
        <Text style={styles.actionText}>
          {saving ? '> saving...' : course.is_published ? '> unpublish' : '> publish course'}
        </Text>
      </TouchableOpacity>

      <TDivider />

      <Text style={styles.hint}>
        editing modules & lessons coming soon.{'\n'}
        use supabase dashboard for now.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  back: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  backText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: 'monospace' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace', paddingHorizontal: 16 },
  sub: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace', paddingHorizontal: 16, marginTop: 4, marginBottom: 8 },
  info: { marginHorizontal: 16, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace', letterSpacing: 1 },
  infoValue: { fontSize: 13, color: COLORS.text, fontFamily: 'monospace', fontWeight: '600', textTransform: 'capitalize' },
  action: { borderWidth: 1, borderColor: COLORS.border, padding: 16, alignItems: 'center', marginHorizontal: 16 },
  actionUnpublish: { borderColor: COLORS.error },
  actionText: { color: COLORS.terminal, fontSize: 12, fontFamily: 'monospace', fontWeight: '700' },
  hint: { color: COLORS.textMuted, fontSize: 11, fontFamily: 'monospace', paddingHorizontal: 16, marginTop: 16, lineHeight: 18, textAlign: 'center' },
});
