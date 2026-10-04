export const cleanAgentText = (text: string) => {
  let out = text.replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, '');
  const unclosed = out.match(/<think\b[^>]*>([\s\S]*)$/i);
  if (unclosed) out = unclosed[1] ?? '';
  out = out.replace(/<\/?think\b[^>]*>/gi, '');
  return out.replace(/\n{3,}/g, '\n\n').trim();
};

export const textFromGenerateResult = (result: {
  text?: string;
  reasoning?: unknown;
  reasoningText?: string;
}) => {
  const reasoning = typeof result.reasoning === 'string' ? result.reasoning : '';
  return cleanAgentText([result.text, result.reasoningText, reasoning].filter(Boolean).join('\n\n'));
};
