import { setDefaultResultOrder } from 'node:dns';

setDefaultResultOrder('ipv4first');

const value = (name: string, fallback?: string): string => {
  const configured = process.env[name]?.trim();
  if (configured) return configured;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${name}`);
};

export const config = {
  lmStudio: {
    baseURL: value('LM_STUDIO_BASE_URL', 'http://127.0.0.1:1234/v1'),
    apiKey: value('LM_STUDIO_API_KEY', 'lm-studio'),
    model: value('LM_STUDIO_MODEL', 'qwen/qwen3.5-9b'),
  },
};
