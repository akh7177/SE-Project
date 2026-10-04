import { Agent } from '@mastra/core/agent';
import { chatModel } from './lm-studio';
import { REQUIREMENTS_PROMPT, SDLC_PROMPT } from './prompts';
import { ragContextProcessor } from './rag';
import { architectWorkspace } from './workspace';

const options = {
  modelSettings: { maxOutputTokens: 1000 },
  providerOptions: { lmStudio: { reasoningEffort: 'none', enable_thinking: false } },
} as const;

export const requirementsAgent = new Agent({
  id: 'requirements-agent',
  name: 'Requirements Agent',
  description: '(i) Identify and list software requirements for a given scenario.',
  instructions: REQUIREMENTS_PROMPT,
  model: chatModel,
  defaultOptions: options,
  workspace: architectWorkspace,
  inputProcessors: [ragContextProcessor],
});

export const sdlcSelectionAgent = new Agent({
  id: 'sdlc-selection-agent',
  name: 'SDLC Selection Agent',
  description: '(ii) Identify a suitable SDLC for a completed requirements specification.',
  instructions: SDLC_PROMPT,
  model: chatModel,
  defaultOptions: {
    ...options,
    modelSettings: { maxOutputTokens: 1000 },
  },
  workspace: architectWorkspace,
  inputProcessors: [ragContextProcessor],
});
