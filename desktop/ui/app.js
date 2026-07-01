// ─── State ───
const state = {
  courses: [],
  modules: {},
  lessons: {},
  currentCourse: null,
  currentModule: null,
  currentLesson: null,
  progress: {},
  runtimes: {},
  code: '',
  outputLines: [],
  runMode: 'run',
  isRunning: false,
  editor: null,
  language: 'python',
  stats: { courses: 0, lessons: 0, xp: 0, streak: 0 },
};

// ─── DOM Refs ───
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const DOM = {
  homeView: $('#homeView'),
  courseView: $('#courseView'),
  courseGrid: $('#courseGrid'),
  moduleTree: $('#moduleTree'),
  breadcrumb: $('#breadcrumb'),
  courseTitle: $('#courseTitle'),
  courseProgress: $('#courseProgress'),
  lessonBadge: $('#lessonBadge'),
  lessonTitle: $('#lessonTitle'),
  lessonDesc: $('#lessonDesc'),
  testCases: $('#testCases'),
  testList: $('#testList'),
  editorContainer: $('#editorContainer'),
  outputContent: $('#outputContent'),
  btnRun: $('#btnRun'),
  btnDebug: $('#btnDebug'),
  btnVSCode: $('#btnVSCode'),
  btnSubmit: $('#btnSubmit'),
  btnGodot: $('#btnGodot'),
  btnUnity: $('#btnUnity'),
  btnUnreal: $('#btnUnreal'),
  courseBack: $('#courseBack'),
  toast: $('#resultToast'),
  toastIcon: $('#toastIcon'),
  toastText: $('#toastText'),
  toastXp: $('#toastXp'),
  statusText: $('#statusText'),
  xpDisplay: $('#xpDisplay'),
  streakDisplay: $('#streakDisplay'),
  statCourses: $('#statCourses .stat-num'),
  statLessons: $('#statLessons .stat-num'),
  statXp: $('#statXp .stat-num'),
  statStreak: $('#statStreak .stat-num'),
  outputTabRun: $('#outputTabRun'),
  outputTabDebug: $('#outputTabDebug'),
  lessonsClose: $('#lessonsClose'),
  lessonsRestore: $('#lessonsRestore'),
  panelLessons: $('#panelLessons'),
  courseStatusbar: $('#courseStatusbar'),
};

// ─── Runtimes (Engine Detection Labels) ───
const ENGINE_LABELS = {
  python: { el: 'enginePython', label: 'python' },
  node: { el: 'engineNode', label: 'node' },
  godot: { el: 'engineGodot', label: 'godot' },
  unity: { el: 'engineUnity', label: 'unity' },
  unreal: { el: 'engineUnreal', label: 'unreal' },
  cpp: { el: 'engineCpp', label: 'cpp' },
};

const ENGINE_COLORS = {
  godot: '#478CBF', unity: '#222C37', unreal: '#99CCFF',
};

// ─── Init ───
document.addEventListener('DOMContentLoaded', async () => {
  initWindowControls();
  initDividers();
  initOutputTabs();
  initButtons();
  await detectRuntimes();
  await loadCourses();
  await loadProgress();
});

// ─── Window Controls ───
function initWindowControls() {
  $('#btnMinimize').onclick = () => window.electronAPI?.minimize?.();
  $('#btnMaximize').onclick = () => window.electronAPI?.maximize?.();
  $('#btnClose').onclick = () => window.electronAPI?.close?.();
}

// ─── Runtime Detection ───
async function detectRuntimes() {
  try {
    if (window.electronAPI?.detectRuntimes) {
      state.runtimes = await window.electronAPI.detectRuntimes();
    }
  } catch {}
  for (const [key, cfg] of Object.entries(ENGINE_LABELS)) {
    const el = document.getElementById(cfg.el);
    if (!el) continue;
    const found = state.runtimes[key];
    if (found) { el.classList.add('found'); el.textContent = `◈ ${cfg.label} ${found.split(' ')[0]}`; }
    else { el.classList.add('missing'); el.textContent = `◈ ${cfg.label} --`; }
  }
  updateEngineButtons();
}

function updateEngineButtons() {
  DOM.btnGodot.classList.toggle('missing', !state.runtimes.godot);
  DOM.btnUnity.classList.toggle('missing', !state.runtimes.unity);
  DOM.btnUnreal.classList.toggle('missing', !state.runtimes.unreal);
  if (state.runtimes.godot) DOM.btnGodot.classList.add('godot');
  if (state.runtimes.unity) DOM.btnUnity.classList.add('unity');
  if (state.runtimes.unreal) DOM.btnUnreal.classList.add('unreal');
}

// ─── Supabase / Course Loading ───
const SUPABASE_URL = 'https://xqowmabashtmusjrovbt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5vwAk8Ec4SjL7Bv0QdIUGg_C9FDSTbi';

async function supabaseQuery(table, opts = {}) {
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${opts.select || '*'}`;
  if (opts.eq) url += `&${opts.eq.col}=eq.${encodeURIComponent(opts.eq.val)}`;
  if (opts.order) url += `&order=${opts.order.col}.${opts.order.dir || 'asc'}`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  return res.json();
}

async function loadCourses() {
  try {
    const courses = await supabaseQuery('courses', {
      select: '*',
      eq: { col: 'published', val: true },
      order: { col: 'created_at', dir: 'desc' },
    });
    state.courses = courses || [];
    renderCourseGrid();
  } catch (e) {
    DOM.courseGrid.innerHTML = `<div class="bento-empty">failed to load courses: ${e.message}</div>`;
  }
}

async function loadModules(courseId) {
  if (state.modules[courseId]) return state.modules[courseId];
  const modules = await supabaseQuery('modules', {
    select: '*',
    eq: { col: 'course_id', val: courseId },
    order: { col: 'order_index', dir: 'asc' },
  });
  state.modules[courseId] = modules || [];
  return state.modules[courseId];
}

async function loadLessons(moduleId) {
  if (state.lessons[moduleId]) return state.lessons[moduleId];
  const lessons = await supabaseQuery('lessons', {
    select: '*',
    eq: { col: 'module_id', val: moduleId },
    order: { col: 'order_index', dir: 'asc' },
  });
  state.lessons[moduleId] = lessons || [];
  return state.lessons[moduleId];
}

async function loadProgress() {
  try {
    const stored = localStorage.getItem('khc_progress');
    if (stored) state.progress = JSON.parse(stored);
    computeStats();
  } catch {}
}

function saveProgress() {
  try { localStorage.setItem('khc_progress', JSON.stringify(state.progress)); } catch {}
}

function computeStats() {
  const p = state.progress;
  state.stats.xp = Object.values(p).reduce((sum, l) => sum + (l.xp || 0), 0);
  state.stats.lessons = Object.values(p).filter(l => l.completed).length;
  state.stats.courses = new Set(Object.values(p).filter(l => l.courseId).map(l => l.courseId)).size;
  updateStatsUI();
}

function updateStatsUI() {
  DOM.statCourses.textContent = state.stats.courses;
  DOM.statLessons.textContent = state.stats.lessons;
  DOM.statXp.textContent = state.stats.xp;
  DOM.statStreak.textContent = `${state.stats.streak || 0}d`;
  DOM.xpDisplay.textContent = `+${state.stats.xp} xp`;
}

// ─── Bento Course Grid ───
function renderCourseGrid() {
  if (state.courses.length === 0) {
    DOM.courseGrid.innerHTML = '<div class="bento-empty">no courses available</div>';
    return;
  }
  DOM.courseGrid.innerHTML = state.courses.map(c => {
    const progress = getCourseProgress(c.id);
    return `
      <div class="bento-card" data-id="${c.id}">
        <div class="card-top">
          <span class="card-lang">[${c.language}]</span>
          <span class="card-diff">${c.difficulty}</span>
        </div>
        <div class="card-title">${escapeHtml(c.title)}</div>
        <div class="card-desc">${escapeHtml(c.description || '')}</div>
        <div class="card-bar"><div class="card-bar-fill" style="width:${progress}%"></div></div>
        <div class="card-meta">
          <span>${c.modules_count || 0} modules</span>
          <span>${progress}% done</span>
        </div>
      </div>
    `;
  }).join('');
  DOM.courseGrid.querySelectorAll('.bento-card').forEach(el => {
    el.onclick = () => openCourse(el.dataset.id);
  });
}

function getCourseProgress(courseId) {
  const lessons = Object.entries(state.progress).filter(([k, v]) => v.courseId === courseId && v.completed);
  if (!lessons.length) return 0;
  return Math.min(100, Math.round((lessons.length / Math.max(1, lessons.length + 5)) * 100));
}

// ─── Open Course (3-Panel View) ───
async function openCourse(courseId) {
  const course = state.courses.find(c => c.id === courseId);
  if (!course) return;
  state.currentCourse = course;
  state.language = course.language?.toLowerCase() || 'python';

  DOM.homeView.style.display = 'none';
  DOM.courseView.style.display = 'flex';
  DOM.courseTitle.textContent = `${course.title}`;
  updateBreadcrumb(course.title);

  const modules = await loadModules(courseId);
  if (!modules.length) { DOM.moduleTree.innerHTML = '<div style="padding:12px;color:var(--text-muted);font-size:10px">no modules</div>'; return; }

  state.currentModule = modules[0];
  renderModuleTree(modules);
  renderModuleLessons(modules[0]?.id);
  initMonaco();
}

async function renderModuleTree(modules) {
  DOM.moduleTree.innerHTML = '';
  for (const mod of modules) {
    const group = document.createElement('div');
    group.className = 'module-group';
    group.innerHTML = `
      <div class="module-header" data-id="${mod.id}">
        <span class="module-expand open">▸</span>
        <span class="module-num">${String(mod.order_index + 1).padStart(2, '0')}</span>
        <span class="module-title">${escapeHtml(mod.title)}</span>
      </div>
      <div class="module-children" id="modChildren_${mod.id}"></div>
    `;
    const header = group.querySelector('.module-header');
    header.onclick = (e) => {
      const expand = header.querySelector('.module-expand');
      const children = group.querySelector('.module-children');
      const isOpen = expand.classList.toggle('open');
      children.style.display = isOpen ? '' : 'none';
    };
    DOM.moduleTree.appendChild(group);
    await renderLessonList(mod.id);
  }
}

async function renderLessonList(moduleId) {
  const lessons = await loadLessons(moduleId);
  const container = document.getElementById(`modChildren_${moduleId}`);
  if (!container) return;
  container.innerHTML = lessons.map(l => {
    const done = state.progress[l.id]?.completed;
    return `
      <div class="lesson-item${done ? ' done' : ''}" data-id="${l.id}" data-module="${moduleId}">
        <span class="lesson-status${done ? ' done' : ''}">${done ? 'ok' : '·'}</span>
        <span>${escapeHtml(l.title)}</span>
        <span style="margin-left:auto;font-size:7px;color:var(--text-dim)">[${l.exercise_type?.replace(/_/g, ' ').slice(0, 4) || '...'}]</span>
      </div>
    `;
  }).join('');
  container.querySelectorAll('.lesson-item').forEach(el => {
    el.onclick = () => openLesson(el.dataset.id, el.dataset.module);
  });
}

// ─── Open Lesson ───
async function openLesson(lessonId, moduleId) {
  state.currentLesson = lessonId;
  document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
  const item = document.querySelector(`.lesson-item[data-id="${lessonId}"]`);
  if (item) item.classList.add('active');

  const lessons = await loadLessons(moduleId);
  const lesson = lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  const config = lesson.config || {};
  DOM.lessonBadge.textContent = `[${lesson.exercise_type?.replace(/_/g, ' ').toUpperCase()}]`;
  DOM.lessonTitle.textContent = lesson.title;
  DOM.lessonDesc.textContent = config.description || '';
  state.code = config.starter_code || '';

  // Render test cases
  if (config.test_cases?.length) {
    DOM.testCases.style.display = '';
    DOM.testList.innerHTML = config.test_cases.map((tc, i) =>
      `<div class="test-item">[${i + 1}] in:${tc.input || '(none)'} expected:${tc.expected}</div>`
    ).join('');
  } else {
    DOM.testCases.style.display = 'none';
  }

  // Code snippet display
  if (config.code_snippet && !config.starter_code) {
    // Show as read-only in a code block (inline for instructions)
    DOM.lessonDesc.innerHTML += `<pre style="background:#000;padding:8px;margin-top:8px;font-size:10px;color:var(--terminal);border:1px solid var(--border);overflow-x:auto">${escapeHtml(config.code_snippet)}</pre>`;
  }

  // Content display
  if (config.content) {
    DOM.lessonDesc.innerHTML += `<div style="margin-top:8px;line-height:1.6">${escapeHtml(config.content)}</div>`;
  }

  // Set Monaco content
  if (state.editor) {
    state.editor.setValue(state.code);
  }
  updateCourseProgress();
  clearOutput();
}

function updateCourseProgress() {
  const total = document.querySelectorAll('.lesson-item').length;
  const done = document.querySelectorAll('.lesson-item.done').length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  DOM.courseProgress.textContent = `${pct}%`;
}

// ─── Monaco Editor ───
let monacoReady = false;

function initMonaco() {
  if (monacoReady) return;
  if (typeof monaco === 'undefined') {
    setTimeout(initMonaco, 500);
    return;
  }
  monacoReady = true;

  monaco.editor.defineTheme('khc-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '555555' },
      { token: 'keyword', foreground: '58A6FF' },
      { token: 'string', foreground: '3FB950' },
      { token: 'number', foreground: 'D0D0D0' },
      { token: 'type', foreground: '999999' },
    ],
    colors: {
      'editor.background': '#000000',
      'editor.foreground': '#D0D0D0',
      'editor.lineHighlightBackground': '#111111',
      'editor.selectionBackground': '#242424',
      'editorCursor.foreground': '#3FB950',
      'editorLineNumber.foreground': '#333333',
      'editorLineNumber.activeForeground': '#666666',
    },
  });

  state.editor = monaco.editor.create(document.getElementById('editorContainer'), {
    value: state.code || '',
    language: mapLanguage(state.language),
    theme: 'khc-dark',
    minimap: { enabled: false },
    fontSize: 13,
    fontFamily: "'SF Mono','Fira Code','Cascadia Code',monospace",
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    renderWhitespace: 'selection',
    bracketPairColorization: { enabled: true },
    padding: { top: 12 },
  });

  state.editor.onDidChangeModelContent(() => {
    state.code = state.editor.getValue();
  });
}

function mapLanguage(lang) {
  const map = {
    python: 'python', javascript: 'javascript', typescript: 'typescript',
    rust: 'rust', go: 'go', java: 'java', cpp: 'cpp', csharp: 'csharp',
    ruby: 'ruby', php: 'php', bash: 'shell', sql: 'sql',
    gdscript: 'python', cpp_c: 'cpp',
  };
  return map[lang] || 'plaintext';
}

// ─── Output ───
function clearOutput() {
  state.outputLines = [];
  DOM.outputContent.innerHTML = '<div class="output-placeholder">run your code to see output here</div>';
}

function appendOutput(text, stream = 'stdout') {
  state.outputLines.push({ text, stream });
  const placeholder = DOM.outputContent.querySelector('.output-placeholder');
  if (placeholder) placeholder.remove();
  const cls = stream === 'stderr' ? 'line-stderr' : stream === 'system' ? 'line-system' : 'line-stdout';
  const line = document.createElement('div');
  line.className = cls;
  line.textContent = text;
  DOM.outputContent.appendChild(line);
  DOM.outputContent.scrollTop = DOM.outputContent.scrollHeight;
}

// ─── Code Execution ───
async function handleRun() {
  if (state.isRunning) return;
  state.isRunning = true;
  DOM.btnRun.disabled = true;
  clearOutput();
  appendOutput(`[run] executing...`, 'system');

  try {
    if (window.electronAPI?.runCode) {
      const result = await window.electronAPI.runCode(state.language, state.code, '');
      const out = result.output || result.stdout || '(no output)';
      appendOutput(out, 'stdout');
      if (result.stderr) appendOutput(result.stderr, 'stderr');
      appendOutput(`\n[process exited with code ${result.exitCode || 0}]`, 'system');
    } else {
      appendOutput('local runner not available (use the Electron app)', 'stderr');
    }
  } catch (e) {
    appendOutput(`error: ${e.message}`, 'stderr');
  }
  state.isRunning = false;
  DOM.btnRun.disabled = false;
}

function handleDebug() {
  if (state.isRunning) return;
  state.isRunning = true;
  clearOutput();
  appendOutput('[debug mode] streaming output...', 'system');

  if (state.runMode === 'debugging') {
    state.isRunning = false;
    return;
  }

  try {
    if (window.electronAPI?.debugCode) {
      window.electronAPI.debugCode(state.language, state.code, '');
      window.electronAPI.onDebugOutput((data) => {
        appendOutput(data.text, data.stream);
      });
      window.electronAPI.onDebugDone((data) => {
        if (data.error) appendOutput(`error: ${data.error}`, 'stderr');
        else appendOutput(`\n[process exited with code ${data.exitCode}]`, 'system');
        state.isRunning = false;
        window.electronAPI.removeDebugListeners();
      });
    } else {
      appendOutput('debug mode requires the Electron app', 'stderr');
      state.isRunning = false;
    }
  } catch (e) {
    appendOutput(`error: ${e.message}`, 'stderr');
    state.isRunning = false;
  }
}

async function handleSubmit() {
  appendOutput('[ok] checking solution...', 'system');
  try {
    const lang = state.language;
    const result = await window.electronAPI.runCode(lang, state.code, '');
    const lesson = state.currentLesson;
    const config = await getCurrentLessonConfig();
    const expected = (config?.expected_output || '').trim();
    const actual = (result.output || '').trim();
    const isCorrect = !expected || actual === expected;

    showToast(isCorrect, isCorrect ? 'all tests passed' : `expected: ${expected}`, isCorrect ? 25 : 0);
    if (isCorrect) {
      state.progress[lesson] = { completed: true, xp: 25, courseId: state.currentCourse?.id };
      saveProgress();
      computeStats();
      updateLessonStatus(lesson);
    }
  } catch (e) {
    showToast(false, `error: ${e.message}`, 0);
  }
}

async function getCurrentLessonConfig() {
  if (!state.currentLesson || !state.currentModule) return {};
  const lessons = await loadLessons(state.currentModule);
  const lesson = lessons.find(l => l.id === state.currentLesson);
  return lesson?.config || {};
}

function updateLessonStatus(lessonId) {
  const item = document.querySelector(`.lesson-item[data-id="${lessonId}"]`);
  if (!item) return;
  item.classList.add('done');
  const status = item.querySelector('.lesson-status');
  if (status) { status.textContent = 'ok'; status.classList.add('done'); }
  updateCourseProgress();
}

// ─── Engine Integration ───
async function launchEngine(engine) {
  const lessonId = state.currentLesson;
  if (!lessonId) return appendOutput('select a lesson first', 'stderr');
  const lang = state.language;

  appendOutput(`[${engine}] launching...`, 'system');

  try {
    if (window.electronAPI?.launchEngine) {
      const result = await window.electronAPI.launchEngine(engine, state.code, lang);
      if (result.success) appendOutput(`[${engine}] project created at: ${result.projectPath}`, 'stdout');
      else appendOutput(`[${engine}] failed: ${result.error}`, 'stderr');
    } else {
      appendOutput(`[${engine}] engine launch requires the Electron app`, 'stderr');
    }
  } catch (e) {
    appendOutput(`[${engine}] error: ${e.message}`, 'stderr');
  }
}

// ─── Toast ───
let toastTimeout;

function showToast(isCorrect, text, xp) {
  clearTimeout(toastTimeout);
  DOM.toast.className = 'toast ' + (isCorrect ? 'correct' : 'incorrect');
  DOM.toastIcon.textContent = isCorrect ? '[ok]' : '[!!]';
  DOM.toastText.textContent = text;
  DOM.toastXp.textContent = xp > 0 ? `+${xp} xp` : '';
  DOM.toast.style.display = 'flex';
  toastTimeout = setTimeout(() => { DOM.toast.style.display = 'none'; }, 3000);
}

// ─── Dividers ───
function initDividers() {
  setupDivider('dividerLessons', 'panelLessons', 'col', true);
  setupDivider('dividerOutput', 'panelOutput', 'col', false);
}

function setupDivider(dividerId, panelId, dir, isLeft) {
  const divider = document.getElementById(dividerId);
  const panel = document.getElementById(panelId);
  if (!divider || !panel) return;

  let isDragging = false;
  const prop = 'width';
  const minSize = isLeft ? 160 : 240;
  const maxSize = isLeft ? 350 : 500;

  divider.addEventListener('mousedown', (e) => {
    isDragging = true;
    divider.classList.add('active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const bodyRect = document.querySelector('.course-body').getBoundingClientRect();
    let size;
    if (isLeft) size = e.clientX - bodyRect.left;
    else size = bodyRect.right - e.clientX;
    size = Math.max(minSize, Math.min(maxSize, size));
    panel.style.width = size + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    divider.classList.remove('active');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });
}

// ─── Output Tabs ───
function initOutputTabs() {
  DOM.outputTabRun.onclick = () => {
    state.runMode = 'run';
    DOM.outputTabRun.classList.add('active');
    DOM.outputTabDebug.classList.remove('active');
  };
  DOM.outputTabDebug.onclick = () => {
    state.runMode = 'debug';
    DOM.outputTabDebug.classList.add('active');
    DOM.outputTabRun.classList.remove('active');
  };
}

// ─── Buttons ───
function initButtons() {
  DOM.btnRun.onclick = handleRun;
  DOM.btnDebug.onclick = handleDebug;
  DOM.btnSubmit.onclick = handleSubmit;
  DOM.btnVSCode.onclick = openInVSCode;
  DOM.btnGodot.onclick = () => launchEngine('godot');
  DOM.btnUnity.onclick = () => launchEngine('unity');
  DOM.btnUnreal.onclick = () => launchEngine('unreal');
  DOM.courseBack.onclick = goHome;
  DOM.lessonsClose.onclick = () => DOM.panelLessons.classList.add('collapsed');
  DOM.lessonsRestore.onclick = () => DOM.panelLessons.classList.remove('collapsed');

  document.querySelector('.crumb-home').onclick = goHome;
}

function goHome() {
  if (state.editor) {
    state.editor.dispose();
    monacoReady = false;
    state.editor = null;
  }
  DOM.courseView.style.display = 'none';
  DOM.homeView.style.display = 'flex';
  DOM.breadcrumb.innerHTML = `<span class="crumb-home">courses</span>`;
}

function openInVSCode() {
  if (!state.code) return;
  try {
    if (window.electronAPI?.openInVSCode) {
      window.electronAPI.openInVSCode(state.code, state.language);
      appendOutput('[vs] opened in VS Code', 'system');
    }
  } catch {}
}

function updateBreadcrumb(title) {
  DOM.breadcrumb.innerHTML = `
    <span class="crumb-home">courses</span>
    <span class="crumb-sep">/</span>
    <span class="crumb-item">${escapeHtml(title)}</span>
  `;
}

// ─── Utilities ───
function escapeHtml(t) {
  if (!t) return '';
  const d = document.createElement('div');
  d.textContent = t;
  return d.innerHTML;
}

// ─── Engine IPC Handlers (Register on Electron side) ───
// These are injected at preload time if available
