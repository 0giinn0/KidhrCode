import * as vscode from 'vscode';
import { supabase } from './supabase';

export class ProgressManager {
  private _statusBarItem: vscode.StatusBarItem;

  constructor() {
    this._statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this._statusBarItem.command = 'kidhrcode.showProgress';
    this._statusBarItem.text = '$(book) KidhrCode';
    this._statusBarItem.tooltip = 'KidhrCode - Click to see progress';
    this._statusBarItem.show();
  }

  dispose() {
    this._statusBarItem.dispose();
  }
}

export async function syncProgress(
  userId: string,
  lessonId: string,
  xpEarned: number,
  language: string
) {
  const { data: existing } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();

  if (!existing) {
    await supabase.from('user_progress').insert({
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      xp_earned: xpEarned,
      language,
    });
  }
}
