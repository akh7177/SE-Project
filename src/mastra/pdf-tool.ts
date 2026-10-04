import { execFile } from 'node:child_process';
import { constants } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const run = promisify(execFile);

const findPdfBinary = async () => {
  const candidates = [
    process.env.MAKE_PDF_BIN,
    resolve('.agents/skills/gstack/make-pdf/dist/pdf'),
    join(homedir(), '.gstack/repos/gstack/make-pdf/dist/pdf'),
  ].filter((path): path is string => Boolean(path));

  for (const path of candidates) {
    try {
      await access(path, constants.X_OK);
      return path;
    } catch {}
  }
  throw new Error('PDF renderer unavailable. Set MAKE_PDF_BIN or build the gstack make-pdf skill.');
};

export const renderFinancePdf = async (title: string, markdown: string) => {
  const outputDir = resolve('artifacts/finance');
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'finance-document';
  const markdownPath = join(outputDir, `${slug}.md`);
  const pdfPath = join(outputDir, `${slug}.pdf`);
  await mkdir(outputDir, { recursive: true });
  await writeFile(markdownPath, `# ${title}\n\n${markdown.trim()}\n`, 'utf8');
  await run(await findPdfBinary(), ['generate', '--cover', '--toc', markdownPath, pdfPath]);
  return pdfPath;
};

export const renderPdfTool = createTool({
  id: 'render-finance-pdf',
  description: 'Render a completed Markdown finance requirements document to PDF. Use for /PDF or an explicit PDF request.',
  inputSchema: z.object({
    title: z.string().min(3).max(120),
    markdown: z.string().min(100),
  }),
  outputSchema: z.object({ pdfPath: z.string() }),
  execute: async ({ title, markdown }) => ({
    pdfPath: await renderFinancePdf(title, markdown),
  }),
});
