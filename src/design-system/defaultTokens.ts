import type { TokenGroup } from '../document/schema';
import { colorValue, px as pxValue } from './tokenValues';

const color = (hex: string, description?: string) => ({
  $type: 'color',
  $value: colorValue(hex),
  ...(description ? { $description: description } : {}),
});

const px = (value: number) => ({ $type: 'dimension', $value: pxValue(value) });

const shadow = (y: number, blur: number, spread: number, alpha: number) => ({
  $type: 'shadow',
  $value: {
    color: colorValue('#1c1a1d', alpha),
    offsetX: pxValue(0),
    offsetY: pxValue(y),
    blur: pxValue(blur),
    spread: pxValue(spread),
  },
});

/**
 * The starter design system every new project begins with, in W3C DTCG
 * 2025.10 format. This is the user's system, not the editor's: it styles only
 * the components on the stage. The token editor changes it through updateToken.
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
    weight: {
      strong: { $type: 'fontWeight', $value: 600 },
      heading: { $type: 'fontWeight', $value: 650 },
    },
    'line-height': {
      body: { $type: 'number', $value: 1.5 },
      heading: { $type: 'number', $value: 1.25 },
    },
  },
  shadow: {
    sm: shadow(1, 2, 0, 0.08),
    md: shadow(4, 12, -2, 0.12),
    lg: shadow(12, 32, -8, 0.18),
  },
};
