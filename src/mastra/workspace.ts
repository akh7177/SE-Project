import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { LocalFilesystem, Workspace } from '@mastra/core/workspace';

export const workspaceRoot = [
  process.env.SE_PROJECT_WORKSPACE_ROOT,
  process.env.INIT_CWD,
  process.cwd(),
  resolve(process.cwd(), '../../..'),
].find((path): path is string => Boolean(path && existsSync(join(path, 'docs/ingested'))))
  ?? process.cwd();

export const architectWorkspace = new Workspace({
  id: 'architect-workspace',
  filesystem: new LocalFilesystem({ basePath: workspaceRoot, readOnly: true }),
  bm25: true,
  autoIndexPaths: [
    'docs/ingested/**/*.txt',
    'docs/ingested/**/*.md',
    'docs/ingested/**/*.yaml',
  ],
  skills: ['skills'],
  tools: { enabled: false },
});
