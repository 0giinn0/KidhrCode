import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  progress: 'kidhrcode_local_progress',
  stats: 'kidhrcode_local_stats',
};

export async function getLocalProgress() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.progress);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export async function saveLocalProgress(lessonId, data) {
  const progress = await getLocalProgress();
  progress[lessonId] = { ...data, savedAt: Date.now() };
  await AsyncStorage.setItem(KEYS.progress, JSON.stringify(progress));
  await recalcStats();
}

export async function getLocalStats() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.stats);
    return raw ? JSON.parse(raw) : { totalXp: 0, completed: 0, languages: [] };
  } catch { return { totalXp: 0, completed: 0, languages: [] }; }
}

async function recalcStats() {
  const progress = await getLocalProgress();
  let totalXp = 0;
  let completed = 0;
  const langs = new Set();
  for (const p of Object.values(progress)) {
    if (p.completed) {
      totalXp += p.xpEarned || 0;
      completed++;
      if (p.language) langs.add(p.language);
    }
  }
  await AsyncStorage.setItem(KEYS.stats, JSON.stringify({
    totalXp, completed, languages: [...langs],
  }));
}

export async function mergeLocalToServer(supabase, userId) {
  const progress = await getLocalProgress();
  for (const [lessonId, data] of Object.entries(progress)) {
    if (!data.completed) continue;
    const { error } = await supabase.from('user_progress').upsert({
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      xp_earned: data.xpEarned || 0,
      language: data.language || null,
    }, { onConflict: 'user_id,lesson_id' });
    if (error) console.error('Merge error:', error);
  }
  await AsyncStorage.multiRemove([KEYS.progress, KEYS.stats]);
}
