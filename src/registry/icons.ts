import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  Download,
  Ellipsis,
  Heart,
  Mail,
  Plus,
  Search,
  Settings,
  Share2,
  Star,
  Trash2,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';

/**
 * The icons a user can pick for buttons. A fixed list keeps the bundle small
 * and lets the prop schema reject any other name.
 */
export const ICONS = {
  'arrow-right': { label: 'Arrow right', Icon: ArrowRight },
  'arrow-left': { label: 'Arrow left', Icon: ArrowLeft },
  plus: { label: 'Plus', Icon: Plus },
  check: { label: 'Check', Icon: Check },
  x: { label: 'Close', Icon: X },
  search: { label: 'Search', Icon: Search },
  settings: { label: 'Settings', Icon: Settings },
  heart: { label: 'Heart', Icon: Heart },
  star: { label: 'Star', Icon: Star },
  trash: { label: 'Trash', Icon: Trash2 },
  download: { label: 'Download', Icon: Download },
  mail: { label: 'Mail', Icon: Mail },
  bell: { label: 'Bell', Icon: Bell },
  user: { label: 'User', Icon: User },
  share: { label: 'Share', Icon: Share2 },
  more: { label: 'More', Icon: Ellipsis },
} satisfies Record<string, { label: string; Icon: LucideIcon }>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as [IconName, ...IconName[]];

export const iconOptions = ICON_NAMES.map((name) => ({ value: name, label: ICONS[name].label }));
