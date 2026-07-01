import * as vscode from 'vscode';
import { supabase } from './supabase';

export class LessonWebviewProvider {
  public static currentPanel: vscode.WebviewPanel | undefined;

  static async show(lessonId: string) {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('*, modules!inner(course_id, courses!inner(language, title))')
      .eq('id', lessonId)
      .single();

    if (!lesson) {
      vscode.window.showErrorMessage('Lesson not found');
      return;
    }

    const config = lesson.config || {};
    const courseTitle = lesson.modules?.courses?.title || '';
    const language = lesson.modules?.courses?.language || '';

    if (this.currentPanel) {
      this.currentPanel.reveal(vscode.ViewColumn.One);
    } else {
      this.currentPanel = vscode.window.createWebviewPanel(
        'kidhrcodeLesson',
        lesson.title,
        vscode.ViewColumn.One,
        { enableScripts: true, retainContextWhenHidden: true }
      );
      this.currentPanel.onDidDispose(() => { this.currentPanel = undefined; });
    }

    this.currentPanel.title = `${courseTitle} - ${lesson.title}`;
    this.currentPanel.webview.html = getWebviewContent(lesson, config, language);
  }
}

function getWebviewContent(lesson: any, config: any, language: string): string {
  const bg = '#0a0a0a';
  const fg = '#d0d0d0';
  const green = '#3FB950';
  const border = '#222222';

  const codeSnippet = config.code_snippet
    ? `<pre style="background:#000;padding:12px;border:1px solid ${border};color:${green};font-family:monospace;font-size:13px;overflow-x:auto">${escapeHtml(config.code_snippet)}</pre>`
    : '';

  const content = config.content
    ? `<div style="color:${fg};font-family:monospace;font-size:13px;line-height:1.6;white-space:pre-wrap">${escapeHtml(config.content)}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    body { background:${bg}; color:${fg}; font-family:monospace; padding:16px; margin:0; }
    .title { color:${green}; font-size:16px; font-weight:700; margin-bottom:8px; }
    .badge { color:${green}; font-size:10px; letter-spacing:1px; margin-bottom:16px; opacity:0.7; }
    .desc { color:#999; font-size:12px; line-height:1.6; margin-bottom:16px; white-space:pre-wrap; }
    hr { border:none; border-top:1px solid ${border}; margin:16px 0; }
  </style>
</head>
<body>
  <div class="title">&gt; ${escapeHtml(lesson.title)}</div>
  <div class="badge">[${lesson.exercise_type?.replace(/_/g, ' ').toUpperCase()}]</div>
  <hr />
  ${config.description ? `<div class="desc">${escapeHtml(config.description)}</div>` : ''}
  ${codeSnippet}
  ${content}
  <hr />
  <div style="color:#555;font-size:10px;margin-top:12px;">
    Use the editor to write your solution, then run with the terminal.
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
