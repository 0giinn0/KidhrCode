import { executeCode, executeTestCases } from './piston';
import { isElectron } from './runtimeDetect';

export async function runCodeLocally(language, code, stdin = '') {
  if (isElectron()) {
    const result = await window.electronAPI.runCode(language, code, stdin);
    return {
      output: result.output || '',
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      code: result.exitCode || 0,
    };
  }
  return await executeCode(language, code, stdin);
}

export function debugCodeLocally(language, code, stdin = '', onOutput, onDone) {
  if (!isElectron()) {
    executeCode(language, code, stdin).then((result) => {
      if (result.stdout) onOutput({ text: result.stdout, stream: 'stdout' });
      if (result.stderr) onOutput({ text: result.stderr, stream: 'stderr' });
      onDone({ exitCode: result.code });
    }).catch((err) => {
      onDone({ error: err.message });
    });
    return () => {};
  }

  window.electronAPI.debugCode(language, code, stdin);
  window.electronAPI.onDebugOutput(onOutput);
  window.electronAPI.onDebugDone((data) => {
    window.electronAPI.removeDebugListeners();
    onDone(data);
  });

  return () => {
    window.electronAPI.removeDebugListeners();
  };
}

export async function runTestCasesLocally(language, code, testCases) {
  const results = [];
  for (const test of testCases) {
    try {
      const result = await runCodeLocally(language, code, test.input || '');
      const passed = result.output.trim() === (test.expected || '').trim();
      results.push({
        input: test.input,
        expected: test.expected,
        actual: result.output.trim(),
        passed,
        error: result.stderr || null,
      });
    } catch (e) {
      results.push({
        input: test.input,
        expected: test.expected,
        actual: null,
        passed: false,
        error: e.message,
      });
    }
  }
  return results;
}
