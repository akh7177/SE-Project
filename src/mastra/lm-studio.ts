import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { wrapLanguageModel } from 'ai';
import { config } from './config';

import { Agent } from 'undici';

export const lmStudio = createOpenAICompatible({
  name: 'lm-studio',
  baseURL: config.lmStudio.baseURL,
  apiKey: config.lmStudio.apiKey,
  fetch: async (url, options) => {
    // The default AI SDK fetch aborts or times out after 5 minutes (300 seconds).
    // For large local models, we need to extend this.
    const customOptions = {
      ...options,
      dispatcher: new Agent({ headersTimeout: 30 * 60 * 1000 })
    };
    return fetch(url, customOptions as any);
  }
});

export const chatModel = wrapLanguageModel({
  model: lmStudio.chatModel(config.lmStudio.model),
  middleware: {
    transformParams: async ({ params }) => {
      const prompt = params.prompt;
      if (!Array.isArray(prompt)) return params;

      const systemContents: string[] = [];
      const restMessages: any[] = [];

      for (const msg of prompt) {
        if (msg.role === 'system') {
          systemContents.push(msg.content);
        } else {
          restMessages.push(msg);
        }
      }

      if (systemContents.length > 0) {
        // Gemma and some strict templates do not support the "system" role at all.
        // We inject all system instructions into the first user message.
        const combinedSystem = `<system_instructions>\n${systemContents.join('\n\n')}\n</system_instructions>\n\n`;
        
        if (restMessages.length > 0 && restMessages[0].role === 'user') {
          const originalContent = restMessages[0].content;
          let newContent;
          
          // Vercel AI SDK v3/v4 expects user message content to be an array of parts
          if (Array.isArray(originalContent)) {
            newContent = [{ type: 'text', text: combinedSystem }, ...originalContent];
          } else if (typeof originalContent === 'string') {
            newContent = combinedSystem + originalContent;
          } else {
            newContent = [{ type: 'text', text: combinedSystem }];
          }

          restMessages[0] = {
             ...restMessages[0],
             content: newContent
          };
          return {
            ...params,
            prompt: restMessages
          };
        } else {
           return {
             ...params,
             prompt: [
               { role: 'user', content: [{ type: 'text', text: combinedSystem }] },
               ...restMessages
             ]
           };
        }
      }

      return params;
    }
  }
});
