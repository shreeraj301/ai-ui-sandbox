import type { TokenGroup } from '../document/schema';

const color = (hex: string, description?: string) => {
  const n = parseInt(hex.slice(1), 16);
  const components = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(
    (c) => Math.round((c / 255) * 1000) / 1000,
  );
  return {
    $type: 'color',
    $value: { colorSpace: 'srgb', components, hex: hex.toLowerCase() },
    ...(description ? { $description: description } : {}),
  };
};

const px = (value: number) => ({ $type: 'dimension', $value: { value, unit: 'px' } });

/**
 * The starter design system every new project begins with, in W3C DTCG
 * 2025.10 format. This is the user's system, not the editor's: it styles only
 * the components on the stage. Phase 1 sub-milestone 3 makes it editable.
 */
export const defaultTokens: TokenGroup = {
  color: {
    brand: color('#B5175A', 'Primary actions and selected states'),
    'brand-strong': color('#9A1249', 'Hover on brand surfaces'),
    'brand-subtle': color('#F7DCE7', 'Tinted backgrounds such as badges'),
    'brand-subtle-text': color('#8C1146', 'Text on brand-subtle'),
    'on-brand': color('#FFFFFF', 'Text and icons on brand'),
    text: color('#1C1A1D', 'Primary text'),
    'text-muted': color('#615C63', 'Secondary text'),
    surface: color('#FFFFFF', 'Cards and inputs'),
    canvas: color('#FAF8F9', 'Page background'),
    border: color('#CFC7CD', 'Input and card borders'),
    success: color('#1E7A4C'),
    'success-subtle': color('#DDF3E6'),
    danger: color('#B42318'),
    'danger-subtle': color('#FCE4E1'),
    warning: color('#8A5300'),
    'warning-subtle': color('#FFF4DB'),
    info: color('#1F5FAD'),
    'info-subtle': color('#E3EEFB'),
    neutral: color('#615C63'),
    'neutral-subtle': color('#EEEAED'),
  },
  radius: { sm: px(6), md: px(10), lg: px(14), full: px(999) },
  space: { 1: px(4), 2: px(8), 3: px(12), 4: px(16), 5: px(20), 6: px(24), 8: px(32) },
  font: {
    family: {
      $type: 'fontFamily',
      $value: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
    size: { caption: px(12), body: px(14), heading: px(20) },
  },
};
