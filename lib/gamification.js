import { RANKS } from './constants';

const DIFFICULTY_XP = {
  beginner: 10,
  easy: 25,
  medium: 50,
  hard: 100,
  expert: 200,
};

const STREAK_BONUS_MULTIPLIER = {
  0: 1,
  3: 1.2,
  7: 1.5,
  14: 1.8,
  30: 2.0,
};

export function calculateXp(difficulty, streakDays = 0) {
  const baseXp = DIFFICULTY_XP[difficulty] || 25;
  let multiplier = 1;
  for (const [days, mult] of Object.entries(STREAK_BONUS_MULTIPLIER)) {
    if (streakDays >= parseInt(days)) {
      multiplier = Math.max(multiplier, mult);
    }
  }
  return Math.round(baseXp * multiplier);
}

export function getRank(totalXp) {
  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (totalXp >= rank.minXp) {
      currentRank = rank;
    }
  }
  return currentRank;
}

export function getLevel(totalXp) {
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

export function getNextLevelXp(currentLevel) {
  return Math.pow(currentLevel, 2) * 100;
}

export function getLevelProgress(totalXp) {
  const currentLevel = getLevel(totalXp);
  const currentLevelXp = Math.pow(currentLevel - 1, 2) * 100;
  const nextLevelXp = Math.pow(currentLevel, 2) * 100;
  const xpIntoLevel = totalXp - currentLevelXp;
  const xpForNext = nextLevelXp - currentLevelXp;
  return xpForNext > 0 ? xpIntoLevel / xpForNext : 1;
}

export function languageLevel(languageXp) {
  return Math.floor(Math.sqrt(languageXp / 50)) + 1;
}

export const BADGES = {
  first_code: { name: 'First Code', description: 'Complete your first exercise', icon: '🌟' },
  streak_3: { name: 'Getting Started', description: '3-day streak', icon: '🔥' },
  streak_7: { name: 'Week Warrior', description: '7-day streak', icon: '🔥' },
  streak_30: { name: 'Monthly Master', description: '30-day streak', icon: '💪' },
  polyglot_3: { name: 'Polyglot', description: 'Complete courses in 3 languages', icon: '🗣️' },
  polyglot_5: { name: 'Language Master', description: 'Complete courses in 5 languages', icon: '🌍' },
  speed_demon: { name: 'Speed Demon', description: 'Complete 10 timed challenges', icon: '⚡' },
  bug_hunter: { name: 'Bug Hunter', description: 'Fix 50 bugs', icon: '🐛' },
  perfectionist: { name: 'Perfectionist', description: 'Get 100% on 10 exercises', icon: '✨' },
  contributor: { name: 'Contributor', description: 'Create your first course', icon: '📚' },
  helper: { name: 'Community Helper', description: 'Review 10 peer submissions', icon: '🤝' },
  centurion: { name: 'Centurion', description: 'Complete 100 exercises', icon: '💯' },
  course_completer: { name: 'Course Completer', description: 'Finish your first course', icon: '🎓' },
};

export function checkBadgeAwards(stats) {
  const awards = [];
  if (stats.totalExercises === 1) awards.push('first_code');
  if (stats.currentStreak >= 3) awards.push('streak_3');
  if (stats.currentStreak >= 7) awards.push('streak_7');
  if (stats.currentStreak >= 30) awards.push('streak_30');
  if (stats.languagesCompleted >= 3) awards.push('polyglot_3');
  if (stats.languagesCompleted >= 5) awards.push('polyglot_5');
  if (stats.timedChallenges >= 10) awards.push('speed_demon');
  if (stats.bugsFixed >= 50) awards.push('bug_hunter');
  if (stats.perfectScores >= 10) awards.push('perfectionist');
  if (stats.coursesCreated >= 1) awards.push('contributor');
  if (stats.peerReviews >= 10) awards.push('helper');
  if (stats.totalExercises >= 100) awards.push('centurion');
  if (stats.coursesCompleted >= 1) awards.push('course_completer');
  return awards;
}
