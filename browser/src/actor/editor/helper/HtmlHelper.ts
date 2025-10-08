
// Simple HTML formatter
export function formatHtml(html: string): string {
  let formatted = html;
  let indent = 0;
  const indentStr = '  ';

  // Add line breaks and indentation
  formatted = formatted
    .replace(/></g, '>\n<')
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      // Decrease indent for closing tags
      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1);
      }

      const result = indentStr.repeat(indent) + trimmed;

      // Increase indent for opening tags (but not self-closing)
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
        indent++;
      }

      return result;
    })
    .join('\n');

  return formatted;
}