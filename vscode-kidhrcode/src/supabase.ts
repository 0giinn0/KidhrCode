import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xqowmabashtmusjrovbt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5vwAk8Ec4SjL7Bv0QdIUGg_C9FDSTbi';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface Course {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  published: boolean;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  exercise_type: string;
  difficulty: string;
  config: any;
  order_index: number;
}

export async function fetchCourses(): Promise<Course[]> {
  const { data } = await supabase
    .from('courses')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function fetchModules(courseId: string): Promise<Module[]> {
  const { data } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });
  return data || [];
}

export async function fetchLessons(moduleId: string): Promise<Lesson[]> {
  const { data } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: true });
  return data || [];
}
