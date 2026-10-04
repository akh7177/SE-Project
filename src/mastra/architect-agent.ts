import { Agent } from '@mastra/core/agent';
import { chatModel } from './lm-studio';


export const architectAgent = new Agent({
  id: 'architect-agent',
  name: 'SE Project Coordinator',
  description: 'Coordinator: runs Requirements Agent then SDLC Selection Agent. Use the workflow in Studio for the same pipeline.',
  instructions: 'Do not draft requirements or an SDLC yourself. The workflow handles running the two-agent process.',
  model: chatModel,
  defaultOptions: {
    modelSettings: { maxOutputTokens: 200 },
    providerOptions: { lmStudio: { reasoningEffort: 'none', enable_thinking: false } },
  },
});
