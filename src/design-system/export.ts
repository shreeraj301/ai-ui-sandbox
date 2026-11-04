import type { DesignSystem } from '../document/schema';
import { tokensToCssVariables } from './resolve';

/** The design system's tokens as a DTCG 2025.10 JSON file. */
export function tokensToJson(system: DesignSystem): string {
  return `${JSON.stringify(system.tokens, null, 2)}\n`;
}

/** The design system's tokens as CSS custom properties on :root, e.g. --color-brand. */
export function tokensToCssFile(system: DesignSystem): string {
  const lines = Object.entries(tokensToCssVariables(system.tokens, '--')).map(
    ([name, value]) => `  ${name}: ${value};`,
  );
  const title = system.name.replace(/\*\//g, '');
  return `/* ${title}: design tokens exported from AI UI Sandbox */\n:root {\n${lines.join('\n')}\n}\n`;
}
