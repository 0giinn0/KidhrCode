import * as vscode from 'vscode';
import { fetchCourses, fetchModules, fetchLessons, Course, Module, Lesson } from './supabase';

export class CourseTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue: string,
    public readonly itemId?: string,
    public readonly description?: string
  ) {
    super(label, collapsibleState);
    this.description = description;
    this.tooltip = label;
    if (contextValue === 'lesson') {
      this.command = {
        command: 'kidhrcode.openLesson',
        title: 'Open Lesson',
        arguments: [this.itemId],
      };
    }
  }
}

export class CourseTreeProvider implements vscode.TreeDataProvider<CourseTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<CourseTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: CourseTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: CourseTreeItem): Promise<CourseTreeItem[]> {
    if (!element) {
      return this.getCourses();
    }
    if (element.contextValue === 'course') {
      return this.getModules(element.itemId!);
    }
    if (element.contextValue === 'module') {
      return this.getLessons(element.itemId!);
    }
    return [];
  }

  private async getCourses(): Promise<CourseTreeItem[]> {
    try {
      const courses = await fetchCourses();
      return courses.map((c: Course) => {
        const desc = `[${c.language}] ${c.difficulty}`;
        return new CourseTreeItem(c.title, vscode.TreeItemCollapsibleState.Collapsed, 'course', c.id, desc);
      });
    } catch {
      return [new CourseTreeItem('Could not load courses. Sign in?', vscode.TreeItemCollapsibleState.None, 'error')];
    }
  }

  private async getModules(courseId: string): Promise<CourseTreeItem[]> {
    const modules = await fetchModules(courseId);
    return modules.map((m: Module) =>
      new CourseTreeItem(`${m.order_index + 1}. ${m.title}`, vscode.TreeItemCollapsibleState.Collapsed, 'module', m.id)
    );
  }

  private async getLessons(moduleId: string): Promise<CourseTreeItem[]> {
    const lessons = await fetchLessons(moduleId);
    return lessons.map((l: Lesson) => {
      const icon = l.exercise_type === 'lesson' ? '$(book)' : '$(terminal)';
      return new CourseTreeItem(`${icon} ${l.title}`, vscode.TreeItemCollapsibleState.None, 'lesson', l.id, `[${l.exercise_type}]`);
    });
  }
}
