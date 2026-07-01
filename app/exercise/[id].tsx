import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';
import { executeCode } from '../../lib/piston';
import { calculateXp } from '../../lib/gamification';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [lesson, setLesson] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [code, setCode] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadExercise();
  }, [id]);

  async function loadExercise() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    const { data } = await supabase
      .from('lessons')
      .select('*, modules!inner(course_id, courses!inner(language))')
      .eq('id', id)
      .single();

    if (data) {
      setLesson(data);
      setConfig(data.config || {});
      setCode(data.config?.starter_code || '');
    }
    setLoading(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setResult(null);

    try {
      let isCorrect = false;
      let feedback = '';
      let xpEarned = 0;
      const difficulty = lesson?.difficulty || 'easy';

      switch (lesson?.exercise_type) {
        case 'multiple_choice':
          isCorrect = selectedOption === config.correct_index;
          feedback = isCorrect ? 'Correct!' : `Incorrect. The answer was: ${config.options[config.correct_index]}`;
          break;

        case 'true_false':
          isCorrect = answer.toLowerCase() === String(config.correct).toLowerCase();
          feedback = isCorrect ? 'Correct!' : `Incorrect. The answer was: ${config.correct}`;
          break;

        case 'code_challenge':
          try {
            const lang = lesson.modules?.courses?.language || 'python';
            const output = await executeCode(lang, code);
            const expected = config.expected_output || '';
            isCorrect = output.output.trim() === expected.trim();
            feedback = isCorrect ? 'All tests passed!' : `Expected:\n${expected}\n\nGot:\n${output.output}`;
          } catch (e) {
            feedback = `Error: ${e.message}`;
          }
          break;

        case 'output_prediction':
          isCorrect = answer.trim().toLowerCase() === (config.correct_answer || '').trim().toLowerCase();
          feedback = isCorrect ? 'Correct!' : `The correct output was: ${config.correct_answer}`;
          break;

        case 'fill_blank':
          isCorrect = answer.trim().toLowerCase() === (config.correct_answer || '').trim().toLowerCase();
          feedback = isCorrect ? 'Correct!' : `The correct answer was: ${config.correct_answer}`;
          break;

        default:
          feedback = 'Submitted!';
          isCorrect = true;
      }

      if (isCorrect) {
        xpEarned = calculateXp(difficulty);
      }

      setResult({ isCorrect, feedback, xpEarned });

      if (user && isCorrect) {
        const { data: existing } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', id)
          .single();

        if (!existing) {
          await supabase.from('user_progress').insert({
            user_id: user.id,
            lesson_id: id,
            completed: true,
            xp_earned: xpEarned,
            language: lesson.modules?.courses?.language,
          });
        }
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: COLORS.textSecondary }}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back to course</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{lesson.title}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{lesson.exercise_type?.replace(/_/g, ' ')}</Text>
      </View>

      {config.description && (
        <Text style={styles.description}>{config.description}</Text>
      )}

      {config.code_snippet && (
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{config.code_snippet}</Text>
        </View>
      )}

      {renderExerciseContent(lesson.exercise_type)}

      {result && (
        <View style={[styles.resultBox, result.isCorrect ? styles.correctBox : styles.incorrectBox]}>
          <Text style={styles.resultIcon}>{result.isCorrect ? '✅' : '❌'}</Text>
          <Text style={styles.resultFeedback}>{result.feedback}</Text>
          {result.xpEarned > 0 && (
            <Text style={styles.xpEarned}>+{result.xpEarned} XP</Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>{submitting ? 'Checking...' : 'Submit'}</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );

  function renderExerciseContent(type) {
    switch (type) {
      case 'lesson':
        return <Text style={styles.content}>{config.content}</Text>;

      case 'multiple_choice':
        return (
          <View style={styles.options}>
            {config.options?.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.option, selectedOption === i && styles.optionSelected]}
                onPress={() => setSelectedOption(i)}
              >
                <Text style={[styles.optionText, selectedOption === i && styles.optionTextSelected]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'true_false':
        return (
          <View style={styles.options}>
            {['true', 'false'].map(val => (
              <TouchableOpacity
                key={val}
                style={[styles.option, answer === val && styles.optionSelected]}
                onPress={() => setAnswer(val)}
              >
                <Text style={[styles.optionText, answer === val && styles.optionTextSelected]}>
                  {val.charAt(0).toUpperCase() + val.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'code_challenge':
        return (
          <View>
            {config.test_cases && (
              <View style={styles.testCases}>
                <Text style={styles.testCaseTitle}>Test Cases:</Text>
                {config.test_cases.map((tc, i) => (
                  <View key={i} style={styles.testCase}>
                    <Text style={styles.testCaseLabel}>Input: </Text>
                    <Text style={styles.testCaseValue}>{tc.input || '(none)'}</Text>
                    <Text style={styles.testCaseLabel}>  Expected: </Text>
                    <Text style={styles.testCaseValue}>{tc.expected}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.codeEditor}>
              <Text style={styles.editorLabel}>Your Code:</Text>
              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={setCode}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Write your code here..."
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
        );

      case 'output_prediction':
        return (
          <View>
            <Text style={styles.question}>What will this code output?</Text>
            <TextInput
              style={styles.textInput}
              value={answer}
              onChangeText={setAnswer}
              placeholder="Type the output..."
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
            />
          </View>
        );

      case 'fill_blank':
        return (
          <View>
            <Text style={styles.question}>Fill in the blank:</Text>
            {config.question && <Text style={styles.fillQuestion}>{config.question}</Text>}
            <TextInput
              style={styles.textInput}
              value={answer}
              onChangeText={setAnswer}
              placeholder="Your answer..."
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
            />
          </View>
        );

      case 'short_answer':
        return (
          <View>
            <TextInput
              style={[styles.textInput, { height: 120 }]}
              value={answer}
              onChangeText={setAnswer}
              placeholder="Write your answer..."
              placeholderTextColor={COLORS.textMuted}
              multiline
            />
          </View>
        );

      default:
        return <Text style={styles.content}>Exercise type: {type}</Text>;
    }
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  back: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  backText: { color: COLORS.primary, fontSize: 16 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, paddingHorizontal: 16, marginBottom: 8 },
  badge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.primary + '30', paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 8, marginHorizontal: 16, marginBottom: 16,
  },
  badgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  description: { fontSize: 15, color: COLORS.textSecondary, paddingHorizontal: 16, lineHeight: 22, marginBottom: 16 },
  codeBlock: {
    backgroundColor: '#1a1a2e', padding: 16, marginHorizontal: 16, borderRadius: 12,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  codeText: { fontFamily: 'monospace', fontSize: 13, color: '#e2e8f0', lineHeight: 20 },
  content: { fontSize: 15, color: COLORS.textSecondary, paddingHorizontal: 16, lineHeight: 22 },
  options: { paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  option: {
    backgroundColor: COLORS.surface, padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '20' },
  optionText: { color: COLORS.text, fontSize: 15 },
  optionTextSelected: { color: COLORS.primary, fontWeight: '600' },
  testCases: { paddingHorizontal: 16, marginBottom: 16 },
  testCaseTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  testCase: { flexDirection: 'row', marginBottom: 4 },
  testCaseLabel: { fontSize: 13, color: COLORS.textMuted },
  testCaseValue: { fontSize: 13, color: COLORS.text, fontFamily: 'monospace' },
  codeEditor: { paddingHorizontal: 16, marginBottom: 16 },
  editorLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  codeInput: {
    backgroundColor: '#1a1a2e', color: '#e2e8f0', fontFamily: 'monospace', fontSize: 13,
    padding: 16, borderRadius: 12, minHeight: 150, textAlignVertical: 'top',
    borderWidth: 1, borderColor: COLORS.border,
  },
  question: { fontSize: 15, color: COLORS.text, paddingHorizontal: 16, marginBottom: 8 },
  fillQuestion: { fontSize: 15, color: COLORS.textSecondary, paddingHorizontal: 16, marginBottom: 8, lineHeight: 22 },
  textInput: {
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    padding: 16, fontSize: 16, color: COLORS.text, marginHorizontal: 16, marginBottom: 16,
  },
  resultBox: {
    marginHorizontal: 16, padding: 20, borderRadius: 12, marginBottom: 16,
    alignItems: 'center',
  },
  correctBox: { backgroundColor: COLORS.success + '20', borderWidth: 1, borderColor: COLORS.success },
  incorrectBox: { backgroundColor: COLORS.error + '20', borderWidth: 1, borderColor: COLORS.error },
  resultIcon: { fontSize: 32, marginBottom: 8 },
  resultFeedback: { color: COLORS.text, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  xpEarned: { color: COLORS.accent, fontSize: 18, fontWeight: '800', marginTop: 8 },
  submitBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginHorizontal: 16 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
});
