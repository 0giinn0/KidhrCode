import { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { COLORS } from '../lib/constants';

const WEB_PLATFORM = Platform.OS === 'web';

let MonacoEditor: any = null;
if (WEB_PLATFORM) {
  try {
    MonacoEditor = require('@monaco-editor/react').default;
  } catch {}
}

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language?: string;
  readOnly?: boolean;
  minHeight?: number;
}

const LANG_MAP: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  rust: 'rust',
  go: 'go',
  java: 'java',
  cpp: 'cpp',
  csharp: 'csharp',
  ruby: 'ruby',
  php: 'php',
  bash: 'shell',
  sql: 'sql',
  swift: 'swift',
  kotlin: 'kotlin',
  dart: 'dart',
  html: 'html',
  css: 'css',
};

export default function CodeEditor({ value, onChange, language, readOnly, minHeight = 120 }: CodeEditorProps) {
  const lang = LANG_MAP[language?.toLowerCase() || ''] || 'plaintext';

  if (!WEB_PLATFORM || !MonacoEditor) {
    return (
      <View style={[styles.fallback, { minHeight }]}>
        <Text style={styles.fallbackLabel}>{'>'} editor (desktop only)</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { minHeight }]}>
      <MonacoEditor
        height={`${Math.max(minHeight, 200)}px`}
        language={lang}
        value={value}
        onChange={(val: string | undefined) => onChange(val || '')}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          padding: { top: 12 },
          backgroundColor: '#000',
        }}
        loading={
          <View style={styles.loading}>
            <Text style={styles.loadingText}>loading editor...</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackLabel: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  loading: {
    backgroundColor: '#000',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 11,
  },
});
