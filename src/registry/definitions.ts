import { BadgeRender, ButtonRender, CardRender, TextInputRender, TextRender } from './renderers';
import { badgeSchema, buttonSchema, cardSchema, textInputSchema, textSchema } from './schemas';
import type { ComponentDefinition } from './types';

const option = (value: string, label: string) => ({ value, label });

export const definitions: ComponentDefinition[] = [
  {
    type: 'text',
    name: 'Text',
    description: 'Heading, body or caption',
    category: 'Foundations',
    schema: textSchema,
    defaults: { text: 'Plan your week in one place', variant: 'heading', align: 'start' },
    fields: [
      { key: 'text', label: 'Text', group: 'Content', kind: 'text', multiline: true },
      {
        key: 'variant',
        label: 'Style',
        group: 'Appearance',
        kind: 'choice',
        options: [
          option('heading', 'Heading'),
          option('body', 'Body'),
          option('caption', 'Caption'),
        ],
      },
      {
        key: 'align',
        label: 'Align',
        group: 'Appearance',
        kind: 'choice',
        options: [option('start', 'Left'), option('center', 'Center'), option('end', 'Right')],
      },
    ],
    Render: TextRender,
  },
  {
    type: 'button',
    name: 'Button',
    description: '3 variants, 3 sizes',
    category: 'Foundations',
    schema: buttonSchema,
    defaults: {
      label: 'Start trial',
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      disabled: false,
    },
    fields: [
      { key: 'label', label: 'Label', group: 'Content', kind: 'text' },
      {
        key: 'variant',
        label: 'Variant',
        group: 'Appearance',
        kind: 'choice',
        options: [
          option('primary', 'Primary'),
          option('secondary', 'Secondary'),
          option('ghost', 'Ghost'),
        ],
      },
      {
        key: 'size',
        label: 'Size',
        group: 'Appearance',
        kind: 'choice',
        options: [option('sm', 'S'), option('md', 'M'), option('lg', 'L')],
      },
      { key: 'fullWidth', label: 'Full width', group: 'Layout', kind: 'toggle' },
      { key: 'disabled', label: 'Disabled', group: 'Behaviour', kind: 'toggle' },
    ],
    Render: ButtonRender,
  },
  {
    type: 'badge',
    name: 'Badge',
    description: 'Short status label',
    category: 'Foundations',
    schema: badgeSchema,
    defaults: { label: 'New', tone: 'brand' },
    fields: [
      { key: 'label', label: 'Label', group: 'Content', kind: 'text' },
      {
        key: 'tone',
        label: 'Tone',
        group: 'Appearance',
        kind: 'choice',
        options: [
          option('neutral', 'Neutral'),
          option('brand', 'Brand'),
          option('success', 'Success'),
          option('danger', 'Danger'),
        ],
      },
    ],
    Render: BadgeRender,
  },
  {
    type: 'text-input',
    name: 'Text input',
    description: 'Label, helper and error text',
    category: 'Forms',
    schema: textInputSchema,
    defaults: {
      label: 'Work email',
      placeholder: 'you@company.com',
      value: '',
      helperText: 'We send the trial link here.',
      errorText: '',
      required: false,
      disabled: false,
    },
    fields: [
      { key: 'label', label: 'Label', group: 'Content', kind: 'text' },
      { key: 'placeholder', label: 'Placeholder', group: 'Content', kind: 'text' },
      { key: 'value', label: 'Value', group: 'Content', kind: 'text' },
      { key: 'helperText', label: 'Helper text', group: 'Content', kind: 'text' },
      { key: 'errorText', label: 'Error text', group: 'Content', kind: 'text' },
      { key: 'required', label: 'Required', group: 'Behaviour', kind: 'toggle' },
      { key: 'disabled', label: 'Disabled', group: 'Behaviour', kind: 'toggle' },
    ],
    Render: TextInputRender,
  },
  {
    type: 'card',
    name: 'Card',
    description: 'Title and body on a surface',
    category: 'Content',
    schema: cardSchema,
    defaults: {
      title: 'Team plan',
      body: 'Shared projects, version history and single sign-on for up to 50 people.',
      padding: 'md',
    },
    fields: [
      { key: 'title', label: 'Title', group: 'Content', kind: 'text' },
      { key: 'body', label: 'Body', group: 'Content', kind: 'text', multiline: true },
      {
        key: 'padding',
        label: 'Padding',
        group: 'Layout',
        kind: 'choice',
        options: [option('sm', 'S'), option('md', 'M'), option('lg', 'L')],
      },
    ],
    Render: CardRender,
  },
];
