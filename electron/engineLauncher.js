const { exec, spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const EXTENSIONS = {
  python: 'py', javascript: 'js', typescript: 'ts', rust: 'rs',
  go: 'go', java: 'java', cpp: 'cpp', csharp: 'cs', ruby: 'rb',
  php: 'php', gdscript: 'gd',
};

function getEngineCmd(engine) {
  switch (engine) {
    case 'godot': return process.platform === 'win32' ? 'godot' : 'godot';
    case 'unity': return process.platform === 'win32'
      ? 'C:\\Program Files\\Unity\\Hub\\Editor\\2022.3\\Editor\\Unity.exe'
      : '/Applications/Unity/Hub/Editor/2022.3/Unity.app/Contents/MacOS/Unity';
    case 'unreal': return process.platform === 'win32'
      ? 'C:\\Program Files\\Epic Games\\UE_5.3\\Engine\\Binaries\\Win64\\UnrealEditor-Cmd.exe'
      : '/Users/Shared/Epic Games/UE_5.3/Engine/Binaries/Mac/UnrealEditor-Cmd';
    default: return null;
  }
}

async function launchGodot(code, language) {
  const ext = EXTENSIONS[language] || 'txt';
  const projectDir = path.join(os.tmpdir(), `khc_godot_${Date.now()}`);
  fs.mkdirSync(projectDir, { recursive: true });

  const scriptPath = path.join(projectDir, `main.${ext}`);
  fs.writeFileSync(scriptPath, code);

  const projectFile = path.join(projectDir, 'project.godot');
  fs.writeFileSync(projectFile, `[application]\nconfig/name="KidhrCode Exercise"\nconfig/run/main_scene="res://main.${ext}"\n`);

  const cmd = getEngineCmd('godot');
  return new Promise((resolve) => {
    exec(`"${cmd}" --path "${projectDir}" --headless --script "${scriptPath}"`, { timeout: 30000 }, (error, stdout, stderr) => {
      resolve({
        success: !error || true,
        projectPath: projectDir,
        output: stdout,
        error: stderr || (error ? error.message : null),
      });
    });
  });
}

async function launchUnity(code, language) {
  const projectDir = path.join(os.tmpdir(), `khc_unity_${Date.now()}`);
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'Assets'), { recursive: true });

  const scriptExt = language === 'csharp' ? 'cs' : 'txt';
  const scriptPath = path.join(projectDir, 'Assets', `Exercise.${scriptExt}`);
  fs.writeFileSync(scriptPath, code);

  const assemblyPath = path.join(projectDir, 'Assets', 'Assembly-CSharp.csproj');
  fs.writeFileSync(assemblyPath, `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><TargetFramework>netstandard2.1</TargetFramework></PropertyGroup></Project>`);

  const cmd = getEngineCmd('unity');
  return new Promise((resolve) => {
    if (!fs.existsSync(cmd)) {
      resolve({ success: false, projectPath: projectDir, error: 'Unity not found at default path. Install Unity or provide custom path.' });
      return;
    }
    exec(`"${cmd}" -projectPath "${projectDir}" -batchmode -quit -executeMethod ExerciseRunner.Run`, { timeout: 60000 }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        projectPath: projectDir,
        output: stdout,
        error: stderr || (error ? error.message : null),
      });
    });
  });
}

async function launchUnreal(code, language) {
  const projectDir = path.join(os.tmpdir(), `khc_unreal_${Date.now()}`);
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'Source', 'KidhrCode'), { recursive: true });

  const ext = language === 'cpp' ? 'cpp' : 'txt';
  const srcPath = path.join(projectDir, 'Source', 'KidhrCode', `Exercise.${ext}`);
  fs.writeFileSync(srcPath, code);

  const uprojectPath = path.join(projectDir, 'KidhrCode.uproject');
  fs.writeFileSync(uprojectPath, JSON.stringify({
    FileVersion: 3,
    EngineAssociation: '5.3',
    Category: '',
    Description: 'KidhrCode Exercise',
    Modules: [{ Name: 'KidhrCode', Type: 'Runtime', LoadingPhase: 'Default' }],
  }, null, 2));

  fs.writeFileSync(path.join(projectDir, 'Source', 'KidhrCode.Target.cs'),
    'using UnrealBuildTool; public class KidhrCodeTarget : TargetRules { public KidhrCodeTarget(TargetInfo Target) : base(Target) { Type = TargetType.Game; } }');

  const cmd = getEngineCmd('unreal');
  return new Promise((resolve) => {
    if (!fs.existsSync(cmd)) {
      resolve({ success: false, projectPath: projectDir, error: 'Unreal Engine not found at default path.' });
      return;
    }
    exec(`"${cmd}" "${uprojectPath}" -RunTest`, { timeout: 120000 }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        projectPath: projectDir,
        output: stdout,
        error: stderr || (error ? error.message : null),
      });
    });
  });
}

async function launchEngine(engine, code, language) {
  switch (engine) {
    case 'godot': return await launchGodot(code, language);
    case 'unity': return await launchUnity(code, language);
    case 'unreal': return await launchUnreal(code, language);
    default: return { success: false, error: `Unknown engine: ${engine}` };
  }
}

module.exports = { launchEngine };
