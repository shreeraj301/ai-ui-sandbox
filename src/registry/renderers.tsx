import type { z } from 'zod';
import type { badgeSchema, buttonSchema, cardSchema, textInputSchema, textSchema } from './schemas';

/* Props arrive validated by each schema, so the casts below are safe. */

type TextProps = z.infer<typeof textSchema>;
type ButtonProps = z.infer<typeof buttonSchema>;
type BadgeProps = z.infer<typeof badgeSchema>;
type TextInputProps = z.infer<typeof textInputSchema>;
type CardProps = z.infer<typeof cardSchema>;

export function TextRender({ props }: { props: Record<string, unknown> }) {
  const p = props as TextProps;
  const Tag = p.variant === 'heading' ? 'h2' : 'p';
  return (
    <Tag className="uc-text" data-variant={p.variant} data-align={p.align}>
      {p.text}
    </Tag>
  );
}

export function ButtonRender({ props }: { props: Record<string, unknown> }) {
  const p = props as ButtonProps;
  return (
    <button
      type="button"
      className="uc-button"
      data-variant={p.variant}
      data-size={p.size}
      data-full={p.fullWidth || undefined}
      disabled={p.disabled}
    >
      {p.label}
    </button>
  );
}

export function BadgeRender({ props }: { props: Record<string, unknown> }) {
  const p = props as BadgeProps;
  return (
    <span className="uc-badge" data-tone={p.tone}>
      {p.label}
    </span>
  );
}

export function TextInputRender({ props }: { props: Record<string, unknown> }) {
  const p = props as TextInputProps;
  const hasError = p.errorText.length > 0;
  return (
    <label className="uc-field" data-error={hasError || undefined}>
      <span className="uc-field__label">
        {p.label}
        {p.required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <input
        className="uc-field__input"
        placeholder={p.placeholder}
        defaultValue={p.value}
        key={p.value}
        disabled={p.disabled}
        required={p.required}
        aria-invalid={hasError || undefined}
      />
      {hasError ? (
        <span className="uc-field__error">{p.errorText}</span>
      ) : p.helperText ? (
        <span className="uc-field__help">{p.helperText}</span>
      ) : null}
    </label>
  );
}

export function CardRender({ props }: { props: Record<string, unknown> }) {
  const p = props as CardProps;
  return (
    <section className="uc-card" data-padding={p.padding}>
      <h3 className="uc-card__title">{p.title}</h3>
      {p.body ? <p className="uc-card__body">{p.body}</p> : null}
    </section>
  );
}
