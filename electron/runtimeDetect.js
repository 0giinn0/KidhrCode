const { exec } = require('child_process');

const RUNTIMES = {
  python:  { cmd: 'python3 --version', alt: 'python --version' },
  node:    { cmd: 'node --version' },
  cpp:     { cmd: 'g++ --version' },
  csharp:  { cmd: 'dotnet --version' },
  rust:    { cmd: 'rustc --version' },
  go:      { cmd: 'go version' },
  java:    { cmd: 'java -version', alt: 'java --version' },
  ruby:    { cmd: 'ruby --version' },
  php:     { cmd: 'php --version' },
  typescript: { cmd: 'npx tsc --version' },
  dart:    { cmd: 'dart --version' },
  bash:    { cmd: 'bash --version' },
};

function execPromise(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
      const output = (stdout || stderr || '').toString().trim();
      resolve({ found: !error, version: output.split('\n')[0] });
    });
  });
}

async function detectRuntimes() {
  const results = {};
  for (const [lang, config] of Object.entries(RUNTIMES)) {
    let result = await execPromise(config.cmd);
    if (!result.found && config.alt) {
      result = await execPromise(config.alt);
    }
    results[lang] = result.found ? result.version : null;
  }
  return results;
}

module.exports = { detectRuntimes };
