import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, TextInput, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';
import { runCodeLocally, debugCodeLocally } from '../../lib/localRunner';
import { executeCode } from '../../lib/piston';
import { calculateXp } from '../../lib/gamification';
import { saveLocalProgress } from '../../lib/localProgress';
import { TDivider } from '../../components/Terminal';
import CodeEditor from '../../components/CodeEditor';
import { isElectron } from '../../lib/runtimeDetect';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [code, setCode] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [runOutput, setRunOutput] = useState<any[]>([]);
  const [runMode, setRunMode] = useState<'idle' | 'running' | 'debugging'>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [electronAware, setElectronAware] = useState(false);
  const debugCleanupRef = useRef<(() => void) | null>(null);
  const outputScrollRef = useRef<ScrollView>(null);

  useEffect(() => { setElectronAware(isElectron()); }, []);

  useEffect(() => { loadExercise(); return () => { if (debugCleanupRef.current) debugCleanupRef.current(); }; }, [id]);

  async function loadExercise() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    const { data } = await supabase.from('lessons').select('*, modules!inner(course_id, courses!inner(language))').eq('id', id).single();
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
          feedback = isCorrect ? 'correct' : 'incorrect';
          break;
        case 'true_false':
          isCorrect = answer.toLowerCase() === String(config.correct).toLowerCase();
          feedback = isCorrect ? 'correct' : 'incorrect';
          break;
        case 'code_challenge':
          try {
            const lang = lesson.modules?.courses?.language || 'python';
            const output = await executeCode(lang, code);
            isCorrect = output.output.trim() === (config.expected_output || '').trim();
            feedback = isCorrect ? 'all tests passed' : 'output mismatch';
          } catch (e) { feedback = `error: ${e.message}`; }
          break;
        case 'output_prediction':
        case 'fill_blank':
          isCorrect = answer.trim().toLowerCase() === (config.correct_answer || '').trim().toLowerCase();
          feedback = isCorrect ? 'correct' : `expected: ${config.correct_answer}`;
          break;
        default:
          isCorrect = true;
          feedback = 'submitted';
      }

      if (isCorrect) xpEarned = calculateXp(difficulty);
      setResult({ isCorrect, feedback, xpEarned });

      if (isCorrect) {
        const lang = lesson.modules?.courses?.language;
        const progressData = { completed: true, xp_earned: xpEarned, language: lang };
        if (user) {
          const { data: existing } = await supabase.from('user_progress').select('*').eq('user_id', user.id).eq('lesson_id', id).single();
          if (!existing) {
            await supabase.from('user_progress').insert({
              user_id: user.id, lesson_id: id, ...progressData,
            });
          }
        } else {
          await saveLocalProgress(id, progressData);
        }
      }
    } catch (e) { Alert.alert('error', e.message); }
    setSubmitting(false);
  }

  async function handleRun() {
    const lang = lesson?.modules?.courses?.language || 'python';
    setIsRunning(true);
    setRunMode('running');
    setRunOutput([]);
    try {
      const result = await runCodeLocally(lang, code);
      setRunOutput([{ text: result.output || result.stdout || '(no output)', stream: 'stdout' }]);
    } catch (e) {
      setRunOutput([{ text: `error: ${e.message}`, stream: 'stderr' }]);
    }
    setIsRunning(false);
  }

  async function openInVSCode() {
    try {
      const lang = lesson?.modules?.courses?.language || 'python';
      const win = window as any;
      if (win.electronAPI?.openInVSCode) {
        await win.electronAPI.openInVSCode(code, lang);
      }
    } catch {}
  }

  function handleDebug() {
    if (runMode === 'debugging') {
      if (debugCleanupRef.current) debugCleanupRef.current();
      setRunMode('idle');
      return;
    }
    const lang = lesson?.modules?.courses?.language || 'python';
    setRunMode('debugging');
    setRunOutput([{ text: '[debug mode] running...', stream: 'stdout' }]);
    setIsRunning(true);

    debugCleanupRef.current = debugCodeLocally(lang, code, '',
      (data) => {
        setRunOutput((prev) => [...prev, data]);
      },
      (data) => {
        setIsRunning(false);
        if (data.error) {
          setRunOutput((prev) => [...prev, { text: `error: ${data.error}`, stream: 'stderr' }]);
        } else {
          setRunOutput((prev) => [...prev, { text: `\n[process exited with code ${data.exitCode}]`, stream: 'stdout' }]);
        }
      }
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={COLORS.terminal} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: COLORS.textSecondary, fontFamily: 'monospace' }}>not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} ref={outputScrollRef} onContentSizeChange={() => outputScrollRef.current?.scrollToEnd({ animated: true })}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>{'<'} back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{'>'} {lesson.title}</Text>
      <Text style={styles.badge}>[{lesson.exercise_type?.replace(/_/g, ' ').toUpperCase()}]</Text>

      <TDivider />

      {config.description && <Text style={styles.desc}>{config.description}</Text>}

      {config.code_snippet && (
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{config.code_snippet}</Text>
        </View>
      )}

      {renderContent()}

      {runOutput.length > 0 && (
        <View style={styles.outputPane}>
          <Text style={styles.outputLabel}>{'>'} output [{runMode === 'debugging' ? 'debug' : 'run'}]</Text>
          {runOutput.map((line, i) => (
            <Text key={i} style={[styles.outputLine, line.stream === 'stderr' && styles.outputStderr]}>
              {line.text}
            </Text>
          ))}
          {isRunning && runMode === 'debugging' && (
            <Text style={styles.outputBlink}>_</Text>
          )}
        </View>
      )}

      {result && (
        <View style={[styles.result, result.isCorrect ? styles.correct : styles.incorrect]}>
          <Text style={styles.resultIcon}>{result.isCorrect ? '[ok]' : '[!!]'}</Text>
          <Text style={styles.resultText}>{result.feedback}</Text>
          {result.xpEarned > 0 && (
            <Text style={styles.xpText}>+{result.xpEarned} xp</Text>
          )}
        </View>
      )}

      <View style={styles.actionRow}>
        {(lesson?.exercise_type === 'code_challenge' || lesson?.exercise_type === 'project') && (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, isRunning && { opacity: 0.5 }]}
              onPress={handleRun}
              disabled={isRunning}
            >
              <Text style={styles.actionBtnText}>[ run ]</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.debugBtn, runMode === 'debugging' && styles.debugBtnActive]}
              onPress={handleDebug}
            >
              <Text style={styles.actionBtnText}>
                {runMode === 'debugging' ? '[stop]' : '[debug]'}
              </Text>
            </TouchableOpacity>
            {electronAware && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.vscodeBtn]}
                onPress={openInVSCode}
              >
                <Text style={styles.actionBtnText}>[ vs ]</Text>
              </TouchableOpacity>
            )}
          </>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, styles.submitBtn, (submitting || isRunning) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={submitting || isRunning}
        >
          <Text style={styles.actionBtnText}>[ ok ] {submitting ? 'checking...' : 'submit'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );

  function renderContent() {
    switch (lesson?.exercise_type) {
      case 'lesson':
        return <Text style={styles.content}>{config.content}</Text>;

      case 'multiple_choice':
        return (
          <View style={styles.options}>
            {config.options?.map((opt: any, i: number) => (
              <TouchableOpacity
                key={i}
                style={[styles.option, selectedOption === i && styles.optionSelected]}
                onPress={() => setSelectedOption(i)}
              >
                <Text style={[styles.optionText, selectedOption === i && styles.optionTextSelected]}>
                  [{i + 1}] {opt}
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
                  [{val === 'true' ? 'T' : 'F'}] {val.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'code_challenge':
        return (
          <View>
            {config.test_cases && (
              <View style={styles.tests}>
                <Text style={styles.testsTitle}>{'>'} test cases</Text>
                {config.test_cases.map((tc: any, i: number) => (
                  <Text key={i} style={styles.testLine}>
                    [{i + 1}] in:{tc.input || '(none)'} expected:{tc.expected}
                  </Text>
                ))}
              </View>
            )}
            <View style={styles.editor}>
              <Text style={styles.editorLabel}>
                {'>'} your code
                {electronAware && <Text style={styles.editorSub}>  [powered by Monaco — VS Code engine]</Text>}
              </Text>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={lesson?.modules?.courses?.language || 'python'}
                minHeight={200}
              />
            </View>
          </View>
        );

      case 'output_prediction':
      case 'fill_blank':
        return (
          <View>
            {lesson.exercise_type === 'output_prediction' && (
              <Text style={styles.question}>{'>'} what will this output?</Text>
            )}
            <TextInput
              style={styles.textInput}
              value={answer}
              onChangeText={setAnswer}
              placeholder="your answer"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
            />
          </View>
        );

      default:
        return <Text style={styles.content}>type: {lesson?.exercise_type}</Text>;
    }
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  back: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  backText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: 'monospace' },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace', paddingHorizontal: 16, marginBottom: 8 },
  badge: { fontSize: 10, color: COLORS.terminal, fontFamily: 'monospace', letterSpacing: 1, paddingHorizontal: 16, marginBottom: 12 },
  desc: { fontSize: 12, color: COLORS.textSecondary, fontFamily: 'monospace', paddingHorizontal: 16, lineHeight: 20, marginBottom: 16 },
  codeBlock: { backgroundColor: '#000', padding: 14, marginHorizontal: 16, borderRadius: 0, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  codeText: { fontFamily: 'monospace', fontSize: 12, color: COLORS.terminal, lineHeight: 18 },
  content: { fontSize: 12, color: COLORS.textSecondary, fontFamily: 'monospace', paddingHorizontal: 16, lineHeight: 20 },
  options: { paddingHorizontal: 16, gap: 6, marginBottom: 16 },
  option: { borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  optionSelected: { borderColor: COLORS.primary },
  optionText: { color: COLORS.text, fontSize: 12, fontFamily: 'monospace' },
  optionTextSelected: { color: COLORS.primary, fontWeight: '700' },
  tests: { paddingHorizontal: 16, marginBottom: 16 },
  testsTitle: { fontSize: 11, color: COLORS.terminal, fontFamily: 'monospace', marginBottom: 8 },
  testLine: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace', marginBottom: 2 },
  editor: { paddingHorizontal: 16, marginBottom: 16 },
  editorLabel: { fontSize: 11, color: COLORS.terminal, fontFamily: 'monospace', marginBottom: 8 },
  editorSub: { fontSize: 10, color: COLORS.textMuted },
  codeInput: {
    backgroundColor: '#000', color: COLORS.terminal, fontFamily: 'monospace', fontSize: 12,
    padding: 14, minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.border,
  },
  question: { fontSize: 12, color: COLORS.text, fontFamily: 'monospace', paddingHorizontal: 16, marginBottom: 8 },
  textInput: {
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border,
    padding: 14, fontSize: 12, color: COLORS.text, fontFamily: 'monospace', marginHorizontal: 16, marginBottom: 16,
  },
  outputPane: {
    marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: '#000', padding: 14, maxHeight: 300,
  },
  outputLabel: { fontSize: 10, color: COLORS.terminal, fontFamily: 'monospace', marginBottom: 8, letterSpacing: 1 },
  outputLine: { fontFamily: 'monospace', fontSize: 11, color: COLORS.terminal, lineHeight: 16 },
  outputStderr: { color: COLORS.error },
  outputBlink: { fontFamily: 'monospace', fontSize: 11, color: COLORS.terminal },
  result: { marginHorizontal: 16, padding: 16, marginBottom: 16, borderWidth: 1, alignItems: 'center' },
  correct: { borderColor: COLORS.success },
  incorrect: { borderColor: COLORS.error },
  resultIcon: { fontSize: 14, color: COLORS.terminal, fontFamily: 'monospace', fontWeight: '700', marginBottom: 8 },
  resultText: { color: COLORS.text, fontSize: 12, fontFamily: 'monospace', textAlign: 'center' },
  xpText: { color: COLORS.terminal, fontSize: 14, fontWeight: '700', fontFamily: 'monospace', marginTop: 8 },
  actionRow: { flexDirection: 'row', marginHorizontal: 16, gap: 8, marginBottom: 16 },
  actionBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 14, alignItems: 'center' },
  actionBtnText: { color: COLORS.terminal, fontSize: 12, fontFamily: 'monospace', fontWeight: '700' },
  debugBtn: { borderColor: COLORS.textMuted },
  debugBtnActive: { borderColor: COLORS.prompt, backgroundColor: 'rgba(88,166,255,0.1)' },
  vscodeBtn: { borderColor: '#007ACC', backgroundColor: 'rgba(0,122,204,0.08)' },
  submitBtn: {},
});
