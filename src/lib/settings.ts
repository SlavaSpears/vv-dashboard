export type AIMode = 'OFF' | 'DEMO' | 'BYOK';
export type AIProvider = 'GEMINI';

export interface Settings {
  ai: {
    mode: AIMode;
    provider: AIProvider;
    apiKey: string;
  };
  ui: {
    compactLayout: boolean;
    reducedMotion: boolean;
  };
}

const STORAGE_KEY = 'vv_dashboard_settings';

export const DEFAULT_SETTINGS: Settings = {
  ai: {
    mode: 'OFF',
    provider: 'GEMINI',
    apiKey: '',
  },
  ui: {
    compactLayout: false,
    reducedMotion: false,
  },
};

export function getLocalSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveLocalSettings(settings: Settings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
