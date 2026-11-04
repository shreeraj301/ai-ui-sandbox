import {
  CircleCheck,
  CircleX,
  ImageOff,
  Image as ImageIcon,
  Info,
  LoaderCircle,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { z } from 'zod';
import { ICONS, type IconName } from './icons';
import {
  splitOptions,
  type alertSchema,
  type avatarSchema,
  type badgeSchema,
  type buttonSchema,
  type cardSchema,
  type checkboxSchema,
  type dividerSchema,
  type iconButtonSchema,
  type imageSchema,
  type progressSchema,
  type selectSchema,
  type switchSchema,
  type textareaSchema,
  type textInputSchema,
  type textSchema,
} from './schemas';
import type { RenderProps } from './types';

/*
 * The user's components. Props arrive validated by each schema, so the casts
 * are safe. `state` forces a visual state for previews; CSS treats
 * [data-state="hover"] exactly like :hover, and so on.
 */

type Props<S extends z.ZodType> = z.infer<S>;

function Icon({ name, size = 16 }: { name: IconName | 'none'; size?: number }) {
  if (name === 'none') return null;
  const { Icon: Glyph } = ICONS[name];
  return <Glyph size={size} strokeWidth={2} aria-hidden="true" />;
}

const forced = (state: RenderProps['state']) => (state && state !== 'default' ? state : undefined);

export function TextRender({ props }: RenderProps) {
  const p = props as Props<typeof textSchema>;
  const Tag = p.variant === 'heading' ? 'h2' : 'p';
  return (
    <Tag className="uc-text" data-variant={p.variant} data-align={p.align}>
      {p.text}
    </Tag>
  );
}

export function ButtonRender({ props, state }: RenderProps) {
  const p = props as Props<typeof buttonSchema>;
  const loading = p.loading || state === 'loading';
  const disabled = p.disabled || state === 'disabled';
  return (
    <button
      type="button"
      className="uc-button"
      data-variant={p.variant}
      data-size={p.size}
      data-full={p.fullWidth || undefined}
      data-state={forced(state)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <LoaderCircle className="uc-spin" size={16} aria-hidden="true" />
      ) : (
        <Icon name={p.leadingIcon} />
      )}
      <span>{p.label}</span>
      {loading ? null : <Icon name={p.trailingIcon} />}
    </button>
  );
}

export function IconButtonRender({ props, state }: RenderProps) {
  const p = props as Props<typeof iconButtonSchema>;
  return (
    <button
      type="button"
      className="uc-icon-button"
      data-variant={p.variant}
      data-size={p.size}
      data-state={forced(state)}
      disabled={p.disabled || state === 'disabled'}
      aria-label={p.label}
      title={p.label}
    >
      <Icon name={p.icon} size={p.size === 'lg' ? 20 : 16} />
    </button>
  );
}

export function BadgeRender({ props }: RenderProps) {
  const p = props as Props<typeof badgeSchema>;
  return (
    <span className="uc-badge" data-tone={p.tone}>
      {p.label}
    </span>
  );
}

export function DividerRender({ props }: RenderProps) {
  const p = props as Props<typeof dividerSchema>;
  return (
    <div className="uc-divider" data-spacing={p.spacing} role="separator">
      {p.label ? <span className="uc-divider__label">{p.label}</span> : null}
    </div>
  );
}

/** Shared message line for form fields: error beats success beats helper. */
function FieldMessage({
  error,
  success,
  helper,
}: {
  error?: string;
  success?: string;
  helper?: string;
}) {
  if (error) return <span className="uc-field__error">{error}</span>;
  if (success) return <span className="uc-field__success">{success}</span>;
  if (helper) return <span className="uc-field__help">{helper}</span>;
  return null;
}

function fieldStatus(
  state: RenderProps['state'],
  errorText: string,
  successText = '',
): { error?: string; success?: string } {
  if (state === 'error') return { error: errorText || 'Check this field.' };
  if (state === 'success') return { success: successText || 'Looks good.' };
  if (errorText) return { error: errorText };
  if (successText) return { success: successText };
  return {};
}

export function TextInputRender({ props, state }: RenderProps) {
  const p = props as Props<typeof textInputSchema>;
  const status = fieldStatus(state, p.errorText, p.successText);
  return (
    <label
      className="uc-field"
      data-error={status.error ? true : undefined}
      data-success={status.success ? true : undefined}
    >
      <span className="uc-field__label">
        {p.label}
        {p.required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <input
        className="uc-field__input"
        placeholder={p.placeholder}
        value={p.value}
        readOnly
        data-state={forced(state)}
        disabled={p.disabled || state === 'disabled'}
        required={p.required}
        aria-invalid={status.error ? true : undefined}
      />
      <FieldMessage {...status} helper={p.helperText} />
    </label>
  );
}

export function TextareaRender({ props, state }: RenderProps) {
  const p = props as Props<typeof textareaSchema>;
  const status = fieldStatus(state, p.errorText);
  return (
    <label className="uc-field" data-error={status.error ? true : undefined}>
      <span className="uc-field__label">
        {p.label}
        {p.required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <textarea
        className="uc-field__input uc-field__input--area"
        placeholder={p.placeholder}
        value={p.value}
        readOnly
        rows={p.rows}
        data-state={forced(state)}
        disabled={p.disabled || state === 'disabled'}
        required={p.required}
        aria-invalid={status.error ? true : undefined}
      />
      <FieldMessage {...status} helper={p.helperText} />
    </label>
  );
}

export function SelectRender({ props, state }: RenderProps) {
  const p = props as Props<typeof selectSchema>;
  const status = fieldStatus(state, p.errorText);
  return (
    <label className="uc-field" data-error={status.error ? true : undefined}>
      <span className="uc-field__label">{p.label}</span>
      <span className="uc-select">
        <select
          className="uc-field__input"
          defaultValue=""
          data-state={forced(state)}
          disabled={p.disabled || state === 'disabled'}
          aria-invalid={status.error ? true : undefined}
        >
          <option value="" disabled>
            {p.placeholder || 'Choose one'}
          </option>
          {splitOptions(p.options).map((option, index) => (
            <option key={`${index}-${option}`} value={option}>
              {option}
            </option>
          ))}
        </select>
      </span>
      <FieldMessage {...status} helper={p.helperText} />
    </label>
  );
}

function ChoiceControl({
  kind,
  props,
  state,
}: {
  kind: 'checkbox' | 'switch';
  props: Props<typeof checkboxSchema> | Props<typeof switchSchema>;
  state: RenderProps['state'];
}) {
  return (
    <label className={`uc-choice uc-choice--${kind}`}>
      <input
        type="checkbox"
        role={kind === 'switch' ? 'switch' : undefined}
        className={kind === 'switch' ? 'uc-switch' : 'uc-checkbox'}
        checked={props.checked}
        readOnly
        data-state={forced(state)}
        disabled={props.disabled || state === 'disabled'}
      />
      <span className="uc-choice__text">
        <span className="uc-choice__label">{props.label}</span>
        {props.description ? (
          <span className="uc-choice__description">{props.description}</span>
        ) : null}
      </span>
    </label>
  );
}

export function CheckboxRender({ props, state }: RenderProps) {
  return (
    <ChoiceControl kind="checkbox" props={props as Props<typeof checkboxSchema>} state={state} />
  );
}

export function SwitchRender({ props, state }: RenderProps) {
  return <ChoiceControl kind="switch" props={props as Props<typeof switchSchema>} state={state} />;
}

export function CardRender({ props }: RenderProps) {
  const p = props as Props<typeof cardSchema>;
  return (
    <section className="uc-card" data-padding={p.padding}>
      <h3 className="uc-card__title">{p.title}</h3>
      {p.body ? <p className="uc-card__body">{p.body}</p> : null}
    </section>
  );
}

/** Initials from up to two words of the name. */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words.at(-1)] : [words[0]?.slice(0, 2)];
  return letters
    .map((part) => part?.[0] ?? '')
    .join('')
    .toUpperCase();
}

export function AvatarRender({ props }: RenderProps) {
  const p = props as Props<typeof avatarSchema>;
  return (
    <span
      className="uc-avatar"
      data-size={p.size}
      data-shape={p.shape}
      role="img"
      aria-label={p.name}
    >
      {initials(p.name)}
    </span>
  );
}

export function ImageRender({ props, state }: RenderProps) {
  const p = props as Props<typeof imageSchema>;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const ratio = p.ratio.replace(':', ' / ');
  const style = { width: p.width, aspectRatio: ratio };

  if (state === 'loading') {
    return <div className="uc-image uc-image--loading" style={style} aria-label="Loading image" />;
  }
  if (state === 'error' || (p.src && failedSrc === p.src)) {
    return (
      <div className="uc-image uc-image--empty" style={style} role="img" aria-label={p.alt}>
        <ImageOff size={24} aria-hidden="true" />
        <span>This image could not load.</span>
      </div>
    );
  }
  if (!p.src) {
    return (
      <div className="uc-image uc-image--empty" style={style} role="img" aria-label={p.alt}>
        <ImageIcon size={24} aria-hidden="true" />
        <span>No image yet. Add an https address.</span>
      </div>
    );
  }
  return (
    <img
      className="uc-image"
      src={p.src}
      alt={p.alt}
      style={{ ...style, objectFit: p.fit }}
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(p.src)}
    />
  );
}

const alertIcons = { info: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleX };

export function AlertRender({ props }: RenderProps) {
  const p = props as Props<typeof alertSchema>;
  const Glyph = alertIcons[p.severity];
  return (
    <div
      className="uc-alert"
      data-severity={p.severity}
      role={p.severity === 'danger' ? 'alert' : 'status'}
    >
      {p.showIcon ? <Glyph className="uc-alert__icon" size={18} aria-hidden="true" /> : null}
      <div className="uc-alert__text">
        <p className="uc-alert__title">{p.title}</p>
        {p.description ? <p className="uc-alert__description">{p.description}</p> : null}
      </div>
      {p.dismissible ? (
        <button type="button" className="uc-alert__close" aria-label="Dismiss">
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export function ProgressRender({ props }: RenderProps) {
  const p = props as Props<typeof progressSchema>;
  return (
    <div className="uc-progress">
      {p.label || p.showValue ? (
        <div className="uc-progress__head">
          <span>{p.label}</span>
          {p.showValue ? <span>{p.value}%</span> : null}
        </div>
      ) : null}
      <div
        className="uc-progress__track"
        role="progressbar"
        aria-label={p.label || 'Progress'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={p.value}
      >
        <div className="uc-progress__bar" style={{ width: `${p.value}%` }} />
      </div>
    </div>
  );
}
