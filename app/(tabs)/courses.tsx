import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS, DIFFICULTY_COLORS } from '../../lib/constants';

export default function Courses() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('courses').select('*').eq('is_published', true).order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setCourses(data);
          setFiltered(data);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = courses;
    if (search) {
      result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (selectedLang) {
      result = result.filter(c => c.language === selectedLang);
    }
    setFiltered(result);
  }, [search, selectedLang, courses]);

  const languages = [...new Set(courses.map(c => c.language))];

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Courses</Text>

      <TextInput
        style={styles.search}
        placeholder="Search courses..."
        placeholderTextColor={COLORS.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        horizontal
        data={languages}
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        style={styles.langFilter}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.langChip, selectedLang === item && styles.langChipActive]}
            onPress={() => setSelectedLang(selectedLang === item ? null : item)}
          >
            <Text style={styles.langChipText}>{getLangEmoji(item)} {item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No courses found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/course/${item.id}`)}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{getLangEmoji(item.language)}</Text>
              <View style={[styles.badge, { backgroundColor: DIFFICULTY_COLORS[item.difficulty] || '#6366F1' }]}>
                <Text style={styles.badgeText}>{item.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.cardMeta}>{item.language} · {item.modules_count || 0} modules</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
  loading: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, paddingHorizontal: 16, marginBottom: 16 },
  search: {
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    padding: 14, fontSize: 16, color: COLORS.text, marginHorizontal: 16, marginBottom: 16,
  },
  langFilter: { marginBottom: 16, paddingHorizontal: 16 },
  langChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface,
    marginRight: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  langChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langChipText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  list: { paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  card: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 12,
    borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardEmoji: { fontSize: 32 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  cardDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 12 },
  cardMeta: { fontSize: 13, color: COLORS.textMuted },
});
