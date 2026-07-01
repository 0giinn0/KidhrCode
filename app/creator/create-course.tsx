import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS, EXERCISE_TYPES } from '../../lib/constants';

const LANGUAGES = [
  'python', 'javascript', 'typescript', 'rust', 'go', 'java', 'cpp',
  'csharp', 'ruby', 'php', 'bash', 'sql', 'r', 'swift', 'kotlin', 'dart',
];

const DIFFICULTIES = ['beginner', 'easy', 'medium', 'hard', 'expert'];

export default function CreateCourse() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [modules, setModules] = useState([{ title: '', lessons: [{ title: '', exercise_type: 'lesson', config: '{}' }] }]);

  async function handleCreateCourse() {
    if (!title.trim() || !language) {
      Alert.alert('Error', 'Please fill in title and language');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      setLoading(false);
      return;
    }

    const { data: course, error } = await supabase.from('courses').insert({
      title: title.trim(),
      description: description.trim(),
      language: language.toLowerCase(),
      difficulty,
      creator_id: user.id,
      is_published: false,
    }).select().single();

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    for (let i = 0; i < modules.length; i++) {
      const mod = modules[i];
      const { data: moduleData, error: modError } = await supabase.from('modules').insert({
        course_id: course.id,
        title: mod.title || `Module ${i + 1}`,
        order: i + 1,
      }).select().single();

      if (modError) continue;

      for (let j = 0; j < mod.lessons.length; j++) {
        const lesson = mod.lessons[j];
        let configObj = {};
        try { configObj = JSON.parse(lesson.config); } catch {}

        await supabase.from('lessons').insert({
          module_id: moduleData.id,
          title: lesson.title || `Lesson ${j + 1}`,
          exercise_type: lesson.exercise_type || 'lesson',
          config: configObj,
          order: j + 1,
          difficulty,
        });
      }
    }

    Alert.alert('Success', 'Course created!', [
      { text: 'OK', onPress: () => router.push('/creator') },
    ]);
    setLoading(false);
  }

  function addModule() {
    setModules([...modules, { title: '', lessons: [{ title: '', exercise_type: 'lesson', config: '{}' }] }]);
  }

  function addLesson(modIndex) {
    const updated = [...modules];
    updated[modIndex].lessons.push({ title: '', exercise_type: 'lesson', config: '{}' });
    setModules(updated);
  }

  function updateModule(modIndex, field, value) {
    const updated = [...modules];
    updated[modIndex][field] = value;
    setModules(updated);
  }

  function updateLesson(modIndex, lessonIndex, field, value) {
    const updated = [...modules];
    updated[modIndex].lessons[lessonIndex][field] = value;
    setModules(updated);
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Course</Text>

      <View style={styles.stepIndicator}>
        <View style={[styles.step, step >= 1 && styles.stepActive]}><Text style={styles.stepText}>1</Text></View>
        <View style={styles.stepLine} />
        <View style={[styles.step, step >= 2 && styles.stepActive]}><Text style={styles.stepText}>2</Text></View>
        <View style={styles.stepLine} />
        <View style={[styles.step, step >= 3 && styles.stepActive]}><Text style={styles.stepText}>3</Text></View>
      </View>

      {step === 1 && (
        <View>
          <Text style={styles.sectionTitle}>Course Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Course Title"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Description"
            placeholderTextColor={COLORS.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Language</Text>
          <View style={styles.chips}>
            {LANGUAGES.map(l => (
              <TouchableOpacity
                key={l}
                style={[styles.chip, language === l && styles.chipActive]}
                onPress={() => setLanguage(l)}
              >
                <Text style={[styles.chipText, language === l && styles.chipTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.chips}>
            {DIFFICULTIES.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, difficulty === d && styles.chipActive]}
                onPress={() => setDifficulty(d)}
              >
                <Text style={[styles.chipText, difficulty === d && styles.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
            <Text style={styles.nextText}>Next: Modules →</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.sectionTitle}>Modules & Lessons</Text>

          {modules.map((mod, mi) => (
            <View key={mi} style={styles.moduleCard}>
              <TextInput
                style={styles.moduleInput}
                placeholder={`Module ${mi + 1} Title`}
                placeholderTextColor={COLORS.textMuted}
                value={mod.title}
                onChangeText={v => updateModule(mi, 'title', v)}
              />

              {mod.lessons.map((lesson, li) => (
                <View key={li} style={styles.lessonRow}>
                  <TextInput
                    style={styles.lessonInput}
                    placeholder={`Lesson ${li + 1} Title`}
                    placeholderTextColor={COLORS.textMuted}
                    value={lesson.title}
                    onChangeText={v => updateLesson(mi, li, 'title', v)}
                  />
                  <View style={styles.typeChips}>
                    {EXERCISE_TYPES.map(t => (
                      <TouchableOpacity
                        key={t.id}
                        style={[styles.typeChip, lesson.exercise_type === t.id && styles.typeChipActive]}
                        onPress={() => updateLesson(mi, li, 'exercise_type', t.id)}
                      >
                        <Text style={[styles.typeChipText, lesson.exercise_type === t.id && styles.typeChipTextActive]}>
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addLessonBtn} onPress={() => addLesson(mi)}>
                <Text style={styles.addLessonText}>+ Add Lesson</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addModuleBtn} onPress={addModule}>
            <Text style={styles.addModuleText}>+ Add Module</Text>
          </TouchableOpacity>

          <View style={styles.stepButtons}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(3)}>
              <Text style={styles.nextText}>Review & Publish →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={styles.sectionTitle}>Review</Text>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewLabel}>Title</Text>
            <Text style={styles.reviewValue}>{title || '(not set)'}</Text>
            <Text style={styles.reviewLabel}>Language</Text>
            <Text style={styles.reviewValue}>{language || '(not set)'}</Text>
            <Text style={styles.reviewLabel}>Difficulty</Text>
            <Text style={styles.reviewValue}>{difficulty}</Text>
            <Text style={styles.reviewLabel}>Modules</Text>
            <Text style={styles.reviewValue}>{modules.length}</Text>
            <Text style={styles.reviewLabel}>Total Lessons</Text>
            <Text style={styles.reviewValue}>{modules.reduce((s, m) => s + m.lessons.length, 0)}</Text>
          </View>

          <View style={styles.stepButtons}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.publishBtn, loading && styles.publishBtnDisabled]}
              onPress={handleCreateCourse}
              disabled={loading}
            >
              <Text style={styles.publishText}>{loading ? 'Creating...' : 'Create Course'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  back: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  backText: { color: COLORS.primary, fontSize: 16 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, paddingHorizontal: 16, marginBottom: 20 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 24 },
  step: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  stepActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepText: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, paddingHorizontal: 16, marginBottom: 16 },
  input: {
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    padding: 16, fontSize: 16, color: COLORS.text, marginHorizontal: 16, marginBottom: 12,
  },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, paddingHorizontal: 16, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.text, fontSize: 13, textTransform: 'capitalize' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  nextBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginHorizontal: 16, marginTop: 16 },
  nextText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  moduleCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 16,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  moduleInput: {
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    padding: 14, fontSize: 15, color: COLORS.text, marginBottom: 12,
  },
  lessonRow: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  lessonInput: {
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    padding: 10, fontSize: 14, color: COLORS.text, marginBottom: 8,
  },
  typeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  typeChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: COLORS.surfaceLight,
    borderWidth: 1, borderColor: COLORS.border,
  },
  typeChipActive: { backgroundColor: COLORS.primary + '30', borderColor: COLORS.primary },
  typeChipText: { color: COLORS.textSecondary, fontSize: 11 },
  typeChipTextActive: { color: COLORS.primary, fontWeight: '600' },
  addLessonBtn: { paddingVertical: 10, alignItems: 'center' },
  addLessonText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  addModuleBtn: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, padding: 16, borderRadius: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
  },
  addModuleText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  stepButtons: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 24 },
  backBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  backBtnText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  reviewCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  reviewLabel: { fontSize: 13, color: COLORS.textMuted, marginTop: 12, marginBottom: 4 },
  reviewValue: { fontSize: 16, color: COLORS.text, fontWeight: '600' },
  publishBtn: { flex: 2, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  publishBtnDisabled: { opacity: 0.6 },
  publishText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
