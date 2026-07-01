import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS, EXERCISE_TYPES } from '../../lib/constants';
import { TDivider } from '../../components/Terminal';

const LANGUAGES = ['python','javascript','typescript','rust','go','java','cpp','csharp','ruby','php','bash','sql','r','swift','kotlin','dart'];
const DIFFICULTIES = ['beginner','easy','medium','hard','expert'];

export default function CreateCourse() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [modules, setModules] = useState([{ title: '', lessons: [{ title: '', exercise_type: 'lesson', config: '{}' }] }]);

  async function handleCreate() {
    if (!title.trim() || !language) { Alert.alert('error', 'title and language required'); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { Alert.alert('error', 'login required'); setLoading(false); return; }

    const { data: course, error } = await supabase.from('courses').insert({
      title: title.trim(), description: description.trim(), language: language.toLowerCase(),
      difficulty, creator_id: user.id, is_published: false,
    }).select().single();
    if (error) { Alert.alert('error', error.message); setLoading(false); return; }

    for (let i = 0; i < modules.length; i++) {
      const mod = modules[i];
      const { data: md } = await supabase.from('modules').insert({ course_id: course.id, title: mod.title || `Module ${i+1}`, order: i+1 }).select().single();
      if (!md) continue;
      for (let j = 0; j < mod.lessons.length; j++) {
        const l = mod.lessons[j];
        let cfg = {};
        try { cfg = JSON.parse(l.config); } catch {}
        await supabase.from('lessons').insert({ module_id: md.id, title: l.title || `Lesson ${j+1}`, exercise_type: l.exercise_type || 'lesson', config: cfg, order: j+1, difficulty });
      }
    }

    Alert.alert('[ ok ]', 'course created', [{ text: 'ok', onPress: () => router.push('/creator') }]);
    setLoading(false);
  }

  function addModule() { setModules([...modules, { title: '', lessons: [{ title: '', exercise_type: 'lesson', config: '{}' }] }]); }
  function addLesson(i) { const m = [...modules]; m[i].lessons.push({ title: '', exercise_type: 'lesson', config: '{}' }); setModules(m); }
  function updModule(i, f, v) { const m = [...modules]; m[i][f] = v; setModules(m); }
  function updLesson(mi, li, f, v) { const m = [...modules]; m[mi].lessons[li][f] = v; setModules(m); }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>{'<'} back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{'>'} create course</Text>
      <Text style={styles.step}>step {step}/3</Text>

      <TDivider />

      {step === 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{'>'} course details</Text>
          <Text style={styles.label}>title</Text>
          <TextInput style={styles.input} placeholder="course title" placeholderTextColor={COLORS.textMuted} value={title} onChangeText={setTitle} />
          <Text style={styles.label}>description</Text>
          <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} placeholder="describe the course" placeholderTextColor={COLORS.textMuted} value={description} onChangeText={setDescription} multiline />
          <Text style={styles.label}>language</Text>
          <View style={styles.chips}>
            {LANGUAGES.map(l => (
              <TouchableOpacity key={l} style={[styles.chip, language === l && styles.chipActive]} onPress={() => setLanguage(l)}>
                <Text style={[styles.chipText, language === l && styles.chipTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>difficulty</Text>
          <View style={styles.chips}>
            {DIFFICULTIES.map(d => (
              <TouchableOpacity key={d} style={[styles.chip, difficulty === d && styles.chipActive]} onPress={() => setDifficulty(d)}>
                <Text style={[styles.chipText, difficulty === d && styles.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
            <Text style={styles.nextText}>[ ok ] next: modules</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{'>'} modules & lessons</Text>
          {modules.map((mod, mi) => (
            <View key={mi} style={styles.moduleCard}>
              <TextInput style={styles.moduleInput} placeholder={`Module ${mi+1}`} placeholderTextColor={COLORS.textMuted} value={mod.title} onChangeText={v => updModule(mi, 'title', v)} />
              {mod.lessons.map((l, li) => (
                <View key={li} style={styles.lessonRow}>
                  <TextInput style={styles.lessonInput} placeholder={`Lesson ${li+1}`} placeholderTextColor={COLORS.textMuted} value={l.title} onChangeText={v => updLesson(mi, li, 'title', v)} />
                  <View style={styles.typeChips}>
                    {EXERCISE_TYPES.map(t => (
                      <TouchableOpacity key={t.id} style={[styles.typeChip, l.exercise_type === t.id && styles.typeChipActive]} onPress={() => updLesson(mi, li, 'exercise_type', t.id)}>
                        <Text style={[styles.typeChipText, l.exercise_type === t.id && styles.typeChipTextActive]}>{t.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.addLesson} onPress={() => addLesson(mi)}>
                <Text style={styles.addLessonText}>[+] add lesson</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addModule} onPress={addModule}>
            <Text style={styles.addModuleText}>[+] add module</Text>
          </TouchableOpacity>
          <View style={styles.stepBtns}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Text style={styles.backBtnText}>{'<'} back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(3)}>
              <Text style={styles.nextText}>[ ok ] review</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{'>'} review</Text>
          <View style={styles.review}>
            <Text style={styles.rLabel}>title</Text><Text style={styles.rValue}>{title || '(not set)'}</Text>
            <Text style={styles.rLabel}>language</Text><Text style={styles.rValue}>{language || '(not set)'}</Text>
            <Text style={styles.rLabel}>difficulty</Text><Text style={styles.rValue}>{difficulty}</Text>
            <Text style={styles.rLabel}>modules</Text><Text style={styles.rValue}>{modules.length}</Text>
            <Text style={styles.rLabel}>lessons</Text><Text style={styles.rValue}>{modules.reduce((s,m)=>s+m.lessons.length,0)}</Text>
          </View>
          <View style={styles.stepBtns}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
              <Text style={styles.backBtnText}>{'<'} back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.createBtn, loading && { opacity: 0.5 }]} onPress={handleCreate} disabled={loading}>
              <Text style={styles.createText}>[ ok ] {loading ? 'creating...' : 'create course'}</Text>
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
  backText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: 'monospace' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace', paddingHorizontal: 16 },
  step: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace', paddingHorizontal: 16, marginTop: 4, marginBottom: 8 },
  section: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.terminal, fontFamily: 'monospace', marginBottom: 16 },
  label: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace', letterSpacing: 1, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, padding: 12, fontSize: 12, color: COLORS.text, fontFamily: 'monospace' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: 11, fontFamily: 'monospace' },
  chipTextActive: { color: COLORS.text },
  nextBtn: { borderWidth: 1, borderColor: COLORS.border, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  nextText: { color: COLORS.terminal, fontSize: 12, fontFamily: 'monospace', fontWeight: '700' },
  moduleCard: { borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  moduleInput: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, padding: 10, fontSize: 12, color: COLORS.text, fontFamily: 'monospace', marginBottom: 8 },
  lessonRow: { marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  lessonInput: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, padding: 8, fontSize: 11, color: COLORS.text, fontFamily: 'monospace', marginBottom: 6 },
  typeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  typeChip: { borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 8, paddingVertical: 3 },
  typeChipActive: { borderColor: COLORS.primary },
  typeChipText: { color: COLORS.textMuted, fontSize: 9, fontFamily: 'monospace' },
  typeChipTextActive: { color: COLORS.primary, fontWeight: '700' },
  addLesson: { paddingVertical: 8, alignItems: 'center' },
  addLessonText: { color: COLORS.primary, fontSize: 11, fontFamily: 'monospace' },
  addModule: { borderWidth: 1, borderColor: COLORS.border, padding: 14, alignItems: 'center', marginBottom: 12, borderStyle: 'dashed' },
  addModuleText: { color: COLORS.primary, fontSize: 12, fontFamily: 'monospace' },
  stepBtns: { flexDirection: 'row', gap: 12, marginTop: 16 },
  backBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 14, alignItems: 'center' },
  backBtnText: { color: COLORS.textSecondary, fontSize: 12, fontFamily: 'monospace' },
  review: { borderWidth: 1, borderColor: COLORS.border, padding: 16 },
  rLabel: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace', marginTop: 8, letterSpacing: 1 },
  rValue: { fontSize: 13, color: COLORS.text, fontFamily: 'monospace', fontWeight: '600' },
  createBtn: { flex: 2, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 14, alignItems: 'center' },
  createText: { color: COLORS.terminal, fontSize: 12, fontFamily: 'monospace', fontWeight: '700' },
});
