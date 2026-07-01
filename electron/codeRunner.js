const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const EXTENSIONS = {
  python: 'py', javascript: 'js', typescript: 'ts', rust: 'rs',
  go: 'go', java: 'java', cpp: 'cpp', csharp: 'cs', ruby: 'rb',
  php: 'php', bash: 'sh', dart: 'dart',
};

const RUNNERS = {
  python: { cmd: 'python3', alt: 'python', args: (f) => [f] },
  javascript: { cmd: 'node', args: (f) => [f] },
  typescript: { cmd: 'npx', args: (f) => ['tsx', f] },
  rust: {
    compile: { cmd: 'rustc', args: (f) => [f, '-o', f + '.out'] },
    run: { cmd: (f) => f + '.out', args: () => [] },
  },
  cpp: {
    compile: { cmd: 'g++', args: (f) => [f, '-o', f + '.out'] },
    run: { cmd: (f) => f + '.out', args: () => [] },
  },
  go: { cmd: 'go', args: (f) => ['run', f] },
  csharp: { cmd: 'dotnet', args: (f) => ['script', f] },
  java: {
    compile: { cmd: 'javac', args: (f) => [f] },
    run: { cmd: 'java', args: (f) => [path.basename(f, '.java')], cwd: (f) => path.dirname(f) },
  },
  ruby: { cmd: 'ruby', args: (f) => [f] },
  php: { cmd: 'php', args: (f) => [f] },
  bash: { cmd: 'bash', args: (f) => [f] },
  dart: { cmd: 'dart', args: (f) => ['run', f] },
};

function createTempFile(code, ext) {
  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `khc_${Date.now()}.${ext}`);
  fs.writeFileSync(filePath, code);
  return filePath;
}

function runCode(lang, code, stdin = '') {
  return new Promise((resolve, reject) => {
    const l = lang.toLowerCase();
    const ext = EXTENSIONS[l];
    if (!ext) return reject(new Error(`unsupported: ${lang}`));
    const runner = RUNNERS[l];
    if (!runner) return reject(new Error(`no runner: ${lang}`));

    const filePath = createTempFile(code, ext);
    let stdout = '', stderr = '';

    function spawnOne(cmd, args, opts, onDone) {
      const proc = spawn(cmd, args, { timeout: 15000, cwd: opts?.cwd, ...opts });
      if (stdin) { proc.stdin.write(stdin); }
      proc.stdin.end();
      proc.stdout.on('data', (d) => { stdout += d.toString(); });
      proc.stderr.on('data', (d) => { stderr += d.toString(); });
      proc.on('close', (code) => onDone(code));
      proc.on('error', reject);
    }

    function finalize(exitCode) {
      resolve({ output: stdout + stderr, stdout, stderr, exitCode });
    }

    if (runner.compile) {
      spawnOne(runner.compile.cmd, runner.compile.args(filePath), {}, (compileCode) => {
        if (compileCode !== 0) return finalize(compileCode);
        const runCmd = typeof runner.run.cmd === 'function' ? runner.run.cmd(filePath) : runner.run.cmd;
        const runArgs = runner.run.args(filePath);
        const opts = runner.run.cwd ? { cwd: runner.run.cwd(filePath) } : {};
        spawnOne(runCmd, runArgs, opts, finalize);
      });
    } else {
      spawnOne(runner.cmd, runner.args(filePath), {}, finalize);
    }
  });
}

function debugCode(lang, code, stdin, onOutput, onDone) {
  const l = lang.toLowerCase();
  const ext = EXTENSIONS[l];
  if (!ext) { onDone({ error: `unsupported: ${lang}` }); return; }
  const runner = RUNNERS[l];
  if (!runner) { onDone({ error: `no runner: ${lang}` }); return; }

  const filePath = createTempFile(code, ext);
  let currentProc = null;

  function streamProc(cmd, args, opts) {
    currentProc = spawn(cmd, args, { timeout: 30000, cwd: opts?.cwd, ...opts });
    if (stdin) { currentProc.stdin.write(stdin); }
    currentProc.stdin.end();
    currentProc.stdout.on('data', (d) => {
      d.toString().split('\n').filter(Boolean).forEach(line => onOutput({ text: line, stream: 'stdout' }));
    });
    currentProc.stderr.on('data', (d) => {
      d.toString().split('\n').filter(Boolean).forEach(line => onOutput({ text: line, stream: 'stderr' }));
    });
    currentProc.on('close', (code) => { currentProc = null; onDone({ exitCode: code }); });
    currentProc.on('error', (err) => { currentProc = null; onDone({ error: err.message }); });
  }

  if (runner.compile) {
    const compileProc = spawn(runner.compile.cmd, runner.compile.args(filePath), { timeout: 15000 });
    compileProc.stderr.on('data', (d) => {
      d.toString().split('\n').filter(Boolean).forEach(line => onOutput({ text: line, stream: 'stderr' }));
    });
    compileProc.on('close', (code) => {
      if (code !== 0) return onDone({ exitCode: code });
      const runCmd = typeof runner.run.cmd === 'function' ? runner.run.cmd(filePath) : runner.run.cmd;
      const runArgs = runner.run.args(filePath);
      const opts = runner.run.cwd ? { cwd: runner.run.cwd(filePath) } : {};
      streamProc(runCmd, runArgs, opts);
    });
  } else {
    streamProc(runner.cmd, runner.args(filePath), {});
  }
}

module.exports = { runCode, debugCode };
