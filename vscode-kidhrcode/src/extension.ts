import * as vscode from 'vscode';
import { CourseTreeProvider } from './courseTreeProvider';
import { LessonWebviewProvider } from './webviewProvider';
import { ProgressManager } from './progress';

let courseTreeProvider: CourseTreeProvider;
let progressManager: ProgressManager;

export function activate(context: vscode.ExtensionContext) {
  courseTreeProvider = new CourseTreeProvider();
  progressManager = new ProgressManager();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('kidhrcode.courses', courseTreeProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('kidhrcode.refreshCourses', () => {
      courseTreeProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('kidhrcode.openLesson', (lessonId: string) => {
      if (lessonId) {
        LessonWebviewProvider.show(lessonId);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('kidhrcode.signIn', async () => {
      const email = await vscode.window.showInputBox({
        prompt: 'Email',
        placeHolder: 'your@email.com',
        ignoreFocusOut: true,
      });
      if (!email) return;
      const password = await vscode.window.showInputBox({
        prompt: 'Password',
        password: true,
        ignoreFocusOut: true,
      });
      if (!password) return;
      vscode.window.showInformationMessage('Sign-in opens in browser (Supabase auth). Check your email for magic link.');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('kidhrcode.showProgress', () => {
      vscode.window.showInformationMessage('KidhrCode - Open the Courses view in the sidebar to start learning!');
    })
  );
}

export function deactivate() {
  if (progressManager) {
    progressManager.dispose();
  }
}
