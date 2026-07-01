export async function detectRuntimes() {
  if (typeof window !== 'undefined' && window.electronAPI?.detectRuntimes) {
    return await window.electronAPI.detectRuntimes();
  }
  return null;
}

export function isElectron() {
  return typeof window !== 'undefined' && window.electronAPI?.isElectron === true;
}
