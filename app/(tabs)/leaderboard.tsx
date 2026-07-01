import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/constants';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [period, setPeriod] = useState('all_time');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const query = supabase
      .from('leaderboard')
      .select('*')
      .eq('period', period)
      .order('xp', { ascending: false })
      .limit(50);

    query.then(({ data }) => {
      if (data) setLeaders(data);
      setLoading(false);
    });
  }, [period]);

  function getMedal(index) {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>

      <View style={styles.periodRow}>
        {['daily', 'weekly', 'monthly', 'all_time'].map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={leaders}
          keyExtractor={(item, index) => `${item.user_id}-${index}`}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🏆</Text>
              <Text style={styles.emptyText}>No rankings yet</Text>
              <Text style={styles.emptySubtext}>Complete exercises to appear here</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={[styles.row, index < 3 && styles.topRow]}>
              <Text style={styles.rank}>{getMedal(index)}</Text>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.username || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username || 'Anonymous'}</Text>
                <Text style={styles.level}>Level {item.level || 1}</Text>
              </View>
              <Text style={styles.xp}>{item.xp || 0} XP</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, paddingHorizontal: 16, marginBottom: 16 },
  periodRow: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 20,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 4,
  },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  periodBtnActive: { backgroundColor: COLORS.primary },
  periodText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  periodTextActive: { color: COLORS.text },
  list: { paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  topRow: { borderColor: COLORS.accent, borderWidth: 1.5 },
  rank: { fontSize: 20, width: 40, textAlign: 'center' },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  userInfo: { flex: 1 },
  username: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  level: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  xp: { color: COLORS.accent, fontSize: 16, fontWeight: '700' },
});
