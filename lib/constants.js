import Constants from 'expo-constants';

const ENV = {
  development: {
    SUPABASE_URL: 'http://localhost:54321',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn-I0',
    PISTON_API_URL: 'https://emkc.org/api/v2/piston',
  },
  production: {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    PISTON_API_URL: 'https://emkc.org/api/v2/piston',
  },
};

const getEnvVars = () => {
  return ENV.development;
};

export const { SUPABASE_URL, SUPABASE_ANON_KEY, PISTON_API_URL } = getEnvVars();

export const COLORS = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#22D3EE',
  accent: '#F59E0B',
  success: '#22C55E',
  error: '#EF4444',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  card: '#1E293B',
  inputBg: '#0F172A',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
};

export const DIFFICULTY_COLORS = {
  beginner: '#22C55E',
  easy: '#22D3EE',
  medium: '#F59E0B',
  hard: '#EF4444',
  expert: '#8B5CF6',
};

export const RANKS = [
  { name: 'Bronze', minXp: 0, color: '#CD7F32' },
  { name: 'Silver', minXp: 1000, color: '#C0C0C0' },
  { name: 'Gold', minXp: 5000, color: '#FFD700' },
  { name: 'Platinum', minXp: 15000, color: '#E5E4E2' },
  { name: 'Diamond', minXp: 35000, color: '#B9F2FF' },
  { name: 'Legend', minXp: 70000, color: '#FF6B6B' },
];

export const EXERCISE_TYPES = [
  { id: 'lesson', label: 'Text Lesson' },
  { id: 'multiple_choice', label: 'Multiple Choice' },
  { id: 'true_false', label: 'True / False' },
  { id: 'fill_blank', label: 'Fill in the Blank' },
  { id: 'matching', label: 'Matching' },
  { id: 'ordering', label: 'Ordering' },
  { id: 'output_prediction', label: 'Output Prediction' },
  { id: 'code_completion', label: 'Code Completion' },
  { id: 'code_challenge', label: 'Code Challenge' },
  { id: 'parsons_problem', label: 'Parsons Problem' },
  { id: 'debug_challenge', label: 'Debugging Challenge' },
  { id: 'code_review', label: 'Code Review' },
  { id: 'sql_challenge', label: 'SQL Challenge' },
  { id: 'regex_challenge', label: 'Regex Challenge' },
  { id: 'short_answer', label: 'Short Answer' },
  { id: 'project', label: 'Project' },
];
