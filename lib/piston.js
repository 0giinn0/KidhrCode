import { PISTON_API_URL } from './constants';

const LANGUAGE_VERSIONS = {
  python: '3.10.0',
  javascript: '18.15.0',
  typescript: '5.0.3',
  rust: '1.68.0',
  go: '1.20.2',
  java: '15.0.2',
  cpp: '10.2.0',
  csharp: '6.12.0',
  ruby: '3.2.1',
  php: '8.2.3',
  bash: '5.2.0',
  sql: '3.40.0',
  r: '4.2.3',
  swift: '5.8.0',
  kotlin: '1.8.20',
  dart: '3.0.0',
};

export async function executeCode(language, code, stdin = '') {
  const lang = language.toLowerCase();
  const version = LANGUAGE_VERSIONS[lang];
  if (!version) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const response = await fetch(`${PISTON_API_URL}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: lang,
      version,
      files: [{ content: code }],
      stdin,
      compile_timeout: 10000,
      run_timeout: 5000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Execution failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    output: data.run?.output || '',
    stdout: data.run?.stdout || '',
    stderr: data.run?.stderr || '',
    code: data.run?.code || 0,
  };
}

export async function executeTestCases(language, code, testCases) {
  const results = [];
  for (const test of testCases) {
    try {
      const result = await executeCode(language, code, test.input || '');
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

export async function getSupportedLanguages() {
  const response = await fetch(`${PISTON_API_URL}/runtimes`);
  if (!response.ok) throw new Error('Failed to fetch runtimes');
  return response.json();
}
