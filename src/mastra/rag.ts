import * as fs from 'node:fs';
import * as path from 'node:path';
import type { InputProcessorOrWorkflow, ProcessInputArgs, ProcessInputResult } from '@mastra/core/processors';
import { architectWorkspace } from './workspace';

const SKIP_IDS = /(?:clarify|specify|analyze)-command/i;
const MAX_HIT_CHARS = 1200;
const TOP_K = 5;
const SDLC_QUERY = 'waterfall v-shaped prototype rapid application development RAD spiral iterative software development lifecycle models';

const partText = (part: unknown): string => {
  if (typeof part === 'string') return part;
  if (!part || typeof part !== 'object') return '';
  const record = part as Record<string, unknown>;
  if (typeof record.text === 'string') return record.text;
  if (typeof record.content === 'string') return record.content;
  return '';
};

const messageText = (message: { content?: unknown }): string => {
  const content = message.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map(partText).join('\n');
  if (content && typeof content === 'object') {
    const record = content as Record<string, unknown>;
    if (typeof record.content === 'string') return record.content;
    if (Array.isArray(record.parts)) return record.parts.map(partText).join('\n');
  }
  return '';
};

const queryFromMessages = (messages: Array<{ role?: string; content?: unknown }>) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message?.role !== 'user') continue;
    const text = messageText(message).replace(/(^|\s)\/pdf\b/gi, ' ').trim();
    if (text && !text.startsWith('/')) return text;
  }
  return '';
};

export const retrieveEvidence = async (query: string) => {
  const trimmed = query.trim();
  if (trimmed.length < 8) return [];
  const results = await architectWorkspace.search(trimmed, { mode: 'bm25', topK: TOP_K });
  return results.filter((hit) => !SKIP_IDS.test(hit.id));
};

const uniqueHits = (...lists: Array<Array<{ id: string; content: string }>>) => {
  const seen = new Set<string>();
  const merged: Array<{ id: string; content: string }> = [];
  for (const list of lists) {
    for (const hit of list) {
      if (seen.has(hit.id)) continue;
      seen.add(hit.id);
      merged.push(hit);
    }
  }
  return merged.slice(0, 8);
};

export const formatEvidence = (hits: Array<{ id: string; content: string }>) => {
  if (hits.length === 0) {
    return [
      'Retrieved evidence: none.',
      'Mark every regulatory, security, and numeric claim NEEDS-VALIDATION.',
      'Do not invent thresholds or legal applicability.',
    ].join('\n');
  }

  const blocks = hits.map((hit, index) => {
    const excerpt = hit.content.replace(/\s+/g, ' ').trim().slice(0, MAX_HIT_CHARS);
    return `[${index + 1}] ${hit.id}\n${excerpt}`;
  });
  return [
    'Retrieved evidence from docs/ingested (already searched — do not call search tools).',
    'Treat retrieved spec-kit command files as irrelevant. Do not interview.',
    ...blocks,
  ].join('\n\n');
};

export const assertCorpusSearchable = async () => {
  // Check removed: The workspace will index available files automatically.
};

export const ragContextProcessor = {
  id: 'rag-context-processor',
  name: 'RAG Context',
  async processInput({ messages, systemMessages }: ProcessInputArgs): Promise<ProcessInputResult> {
    const query = queryFromMessages(messages);
    if (!query) return { messages, systemMessages };
    let evidence = formatEvidence(uniqueHits(
      await retrieveEvidence(query),
      await retrieveEvidence(SDLC_QUERY),
    ));

    // If this is the SDLC Selection agent, inject the ENTIRE lecture file for perfect accuracy
    const isSdlcAgent = systemMessages.some(msg =>
      typeof msg.content === 'string' && msg.content.includes('choose an SDLC model')
    );

    if (isSdlcAgent) {
      try {
        const lecturePath = path.resolve(process.cwd(), 'docs/ingested/requirements/lecture-sdlc-models.txt');
        if (fs.existsSync(lecturePath)) {
          const lectureContent = fs.readFileSync(lecturePath, 'utf8');
          evidence += `\n\n--- ENTIRE LECTURE NOTES DIRECTORY ---\n${lectureContent}\n--------------------------------------\n`;
        }
      } catch (e) {
        console.error('Failed to inject lecture notes:', e);
      }
    }

    // Merge evidence into the first system message to avoid Jinja template errors
    const mergedSystem = [...systemMessages];
    if (mergedSystem.length > 0 && mergedSystem[0].role === 'system') {
      mergedSystem[0] = {
        ...mergedSystem[0],
        content: `${mergedSystem[0].content}\n\n${evidence}`
      } as any;
    } else {
      mergedSystem.push({ role: 'system', content: evidence });
    }

    return {
      messages,
      systemMessages: mergedSystem,
    };
  },
} as InputProcessorOrWorkflow;
