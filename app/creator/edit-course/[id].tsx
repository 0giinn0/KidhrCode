import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { COLORS } from '../../../lib/constants';

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
    else Alert.alert('Error', error.message);
    setSaving(false);
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
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{course.title}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, course.is_published ? styles.unpublishBtn : styles.publishBtn]}
          onPress={togglePublish}
          disabled={saving}
        >
          <Text style={styles.actionText}>
            {saving ? 'Saving...' : course.is_published ? 'Unpublish' : 'Publish'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoLabel}>Language</Text>
        <Text style={styles.infoValue}>{course.language}</Text>
        <Text style={styles.infoLabel}>Difficulty</Text>
        <Text style={styles.infoValue}>{course.difficulty}</Text>
        <Text style={styles.infoLabel}>Status</Text>
        <Text style={[styles.infoValue, { color: course.is_published ? COLORS.success : COLORS.textMuted }]}>
          {course.is_published ? 'Published' : 'Draft'}
        </Text>
      </View>

      <Text style={styles.hint}>
        To edit modules and lessons, use the Supabase dashboard or API.{'\n'}
        Course builder improvements coming soon.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  back: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  backText: { color: COLORS.primary, fontSize: 16 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, paddingHorizontal: 16, marginBottom: 20 },
  actions: { paddingHorizontal: 16, marginBottom: 24 },
  actionBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  publishBtn: { backgroundColor: COLORS.success },
  unpublishBtn: { backgroundColor: COLORS.error },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  info: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  infoLabel: { fontSize: 13, color: COLORS.textMuted, marginTop: 12, marginBottom: 4 },
  infoValue: { fontSize: 16, color: COLORS.text, fontWeight: '600', textTransform: 'capitalize' },
  hint: { color: COLORS.textMuted, fontSize: 14, paddingHorizontal: 16, marginTop: 24, lineHeight: 20, textAlign: 'center' },
});
