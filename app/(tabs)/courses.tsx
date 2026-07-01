import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';
import { TDivider } from '../../components/Terminal';

export default function Courses() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('courses').select('*').eq('is_published', true).order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) { setCourses(data); setFiltered(data); }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = courses;
    if (search) result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    if (selectedLang) result = result.filter(c => c.language === selectedLang);
    setFiltered(result);
  }, [search, selectedLang, courses]);

  const languages = [...new Set(courses.map(c => c.language))];

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={COLORS.terminal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{'>'} catalog</Text>
      <Text style={styles.sub}>browse all courses</Text>

      <TextInput
        style={styles.search}
        placeholder="[ search ]"
        placeholderTextColor={COLORS.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {languages.length > 0 && (
        <FlatList
          horizontal
          data={languages}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          style={styles.langRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, selectedLang === item && styles.chipActive]}
              onPress={() => setSelectedLang(selectedLang === item ? null : item)}
            >
              <Text style={[styles.chipText, selectedLang === item && styles.chipTextActive]}>
                [{item.toUpperCase()}]
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TDivider />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>[..]</Text>
            <Text style={styles.emptyText}>no courses found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/course/${item.id}`)}>
            <Text style={styles.cardLang}>[{item.language?.toUpperCase()}]</Text>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
              <Text style={styles.cardMeta}>
                {item.difficulty} | {item.modules_count || 0} modules
              </Text>
            </View>
            <Text style={styles.cardArrow}>{'>'}</Text>
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
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace', paddingHorizontal: 16 },
  sub: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace', paddingHorizontal: 16, marginTop: 4, marginBottom: 16 },
  search: {
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border,
    padding: 12, fontSize: 12, color: COLORS.text, fontFamily: 'monospace', marginHorizontal: 16, marginBottom: 12,
  },
  langRow: { marginBottom: 8, paddingHorizontal: 16 },
  chip: {
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 8, marginRight: 6,
  },
  chipActive: { borderColor: COLORS.primary },
  chipText: { color: COLORS.textMuted, fontSize: 11, fontFamily: 'monospace', fontWeight: '600' },
  chipTextActive: { color: COLORS.text },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 24, color: COLORS.textMuted, fontFamily: 'monospace' },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, fontFamily: 'monospace' },
  card: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
    padding: 14, marginBottom: 8,
  },
  cardLang: { color: COLORS.terminal, fontSize: 11, fontFamily: 'monospace', fontWeight: '700', marginRight: 12, letterSpacing: 1 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, fontFamily: 'monospace' },
  cardDesc: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace', marginTop: 4 },
  cardMeta: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'monospace', marginTop: 4 },
  cardArrow: { color: COLORS.textMuted, fontSize: 14, fontFamily: 'monospace' },
});
