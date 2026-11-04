import { Check, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { checkContrast, formatRatio } from '../design-system/contrast';
import {
  FONT_STACKS,
  fontStackFor,
  getToken,
  getTokenSpec,
  SHADOW_LIMITS,
  type TokenSpec,
} from '../design-system/catalogue';
import { defaultTokens } from '../design-system/defaultTokens';
import { describeValue } from '../design-system/describe';
import {
  colorToHex,
  colorValue,
  normalizeHex,
  px,
  shadowValueSchema,
  type ShadowValue,
} from '../design-system/tokenValues';
import type { Token } from '../document/schema';
import { activeDesignSystem, isSameValue, useEditor, type ChangeResult } from './store';

/** The right-hand panel for one token: its value, contrast where it applies, and reset. */
export function TokenEditor({ path }: { path: string }) {
  const project = useEditor((state) => state.project);
  const updateToken = useEditor((state) => state.updateToken);
  const resetTokens = useEditor((state) => state.resetTokens);
  const spec = getTokenSpec(path);
  const tokens = project ? activeDesignSystem(project).tokens : undefined;
  const token = tokens ? getToken(tokens, path) : undefined;
  const starter = getToken(defaultTokens, path);

  if (!spec || !token || !tokens) {
    return <p className="panel__empty">This token is missing from the design system.</p>;
  }

  const commit = (value: unknown) => updateToken(path, value);
  const isStarter = starter ? isSameValue(starter.$value, token.$value) : true;
  const pairs = checkContrast(tokens).filter(
    (pair) => pair.foreground === path || pair.background === path,
  );

  return (
    <div className="inspector__body">
      <div className="inspector__head">
        <span className="inspector__name">{spec.label}</span>
        <span className="inspector__kind">
          {spec.group} token <code className="token-path">{path}</code>
        </span>
      </div>
      <p className="token-used">
        <span className="section-label">Used by</span>
        {spec.usedBy}
      </p>
      <fieldset className="group">
        <legend className="section-label">Value</legend>
        <ValueControls spec={spec} token={token} commit={commit} />
      </fieldset>
      {pairs.length > 0 ? (
        <section className="group" aria-labelledby="token-contrast-title">
          <h3 className="section-label" id="token-contrast-title">
            Contrast
          </h3>
          <ul className="contrast-list">
            {pairs.map((pair) => (
              <li key={`${pair.foreground}/${pair.background}`} className="contrast-row">
                <span
                  className="contrast-row__sample"
                  style={{ color: pair.foregroundHex, background: pair.backgroundHex }}
                  aria-hidden="true"
                >
                  {pair.minimum === 3 ? '' : 'Aa'}
                  {pair.minimum === 3 ? (
                    <span
                      className="contrast-row__edge"
                      style={{ borderColor: pair.foregroundHex }}
                    />
                  ) : null}
                </span>
                <span className="contrast-row__text">
                  <span>{pair.label}</span>
                  <ContrastVerdict passes={pair.passes} ratio={pair.ratio} minimum={pair.minimum} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="group group--end">
        <button
          type="button"
          className="btn btn--quiet"
          disabled={isStarter}
          onClick={() => resetTokens([path])}
        >
          Reset to starter value
        </button>
        {starter ? (
          <p className="inspector__hint">
            Starter value: {describeValue(spec, starter)}. Undo with Ctrl+Z.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ContrastVerdict({
  passes,
  ratio,
  minimum,
}: {
  passes: boolean;
  ratio: number;
  minimum: number;
}) {
  return (
    <span className="verdict" data-passes={passes || undefined}>
      {passes ? (
        <Check aria-hidden="true" size={14} strokeWidth={2.25} />
      ) : (
        <TriangleAlert aria-hidden="true" size={14} strokeWidth={2.25} />
      )}
      <span>
        {formatRatio(ratio)}, {passes ? 'passes' : 'fails'} AA (needs {minimum}:1)
      </span>
    </span>
  );
}

function ValueControls({
  spec,
  token,
  commit,
}: {
  spec: TokenSpec;
  token: Token;
  commit: (value: unknown) => ChangeResult;
}) {
  const value = token.$value;
  const id = `token-${spec.path.replace(/\./g, '-')}`;

  switch (spec.kind) {
    case 'color':
      return (
        <ColorField
          id={id}
          label="Colour"
          hex={colorToHex(value) ?? '#000000'}
          onCommit={(hex) => commit(colorValue(hex))}
        />
      );
    case 'dimension': {
      const current = (value as { value?: number }).value ?? 0;
      return (
        <NumberField
          id={id}
          label="Size"
          value={current}
          min={spec.min}
          max={spec.max}
          step={spec.step}
          unit="px"
          onCommit={(n) => commit(px(n))}
        />
      );
    }
    case 'fontWeight':
    case 'number':
      return (
        <NumberField
          id={id}
          label={spec.kind === 'fontWeight' ? 'Weight' : 'Ratio'}
          value={typeof value === 'number' ? value : 0}
          min={spec.min}
          max={spec.max}
          step={spec.step}
          hint={
            spec.kind === 'fontWeight'
              ? 'From 100 (thin) to 900 (black). Fonts without that weight use the nearest one.'
              : 'Multiplied by the font size: 1.5 on 14px text gives 21px lines.'
          }
          onCommit={(n) => commit(n)}
        />
      );
    case 'fontFamily':
      return <FontField id={id} value={value} onCommit={(stack) => commit(stack)} />;
    case 'shadow':
      return <ShadowFields id={id} value={value} commit={commit} />;
  }
}

function FontField({
  id,
  value,
  onCommit,
}: {
  id: string;
  value: unknown;
  onCommit: (stack: string[]) => void;
}) {
  const current = fontStackFor(value);
  const hintId = `${id}-hint`;
  return (
    <div className="prop">
      <label htmlFor={id}>Stack</label>
      <div className="prop__control">
        <span className="select">
          <select
            id={id}
            className="input"
            value={current?.id ?? 'custom'}
            aria-describedby={hintId}
            onChange={(event) => {
              const stack = FONT_STACKS.find((item) => item.id === event.target.value);
              if (stack) onCommit(stack.value);
            }}
          >
            {current ? null : (
              <option value="custom" disabled>
                Custom stack
              </option>
            )}
            {FONT_STACKS.map((stack) => (
              <option key={stack.id} value={stack.id}>
                {stack.label}
              </option>
            ))}
          </select>
        </span>
        <span className="prop__hint" id={hintId}>
          Uses fonts already on people&apos;s devices, so nothing downloads. The browser picks the
          first one it has
          {current ? `: ${current.value.slice(0, 3).join(', ')}…` : '.'}
        </span>
      </div>
    </div>
  );
}

function ShadowFields({
  id,
  value,
  commit,
}: {
  id: string;
  value: unknown;
  commit: (value: unknown) => ChangeResult;
}) {
  const parsed = shadowValueSchema.safeParse(value);
  if (!parsed.success) return <p className="inspector__hint">This shadow can&apos;t be edited.</p>;
  const shadow = parsed.data;
  const update = (patch: Partial<ShadowValue>) => commit({ ...shadow, ...patch });
  const hex = colorToHex(shadow.color) ?? '#000000';
  const alpha = shadow.color.alpha ?? 1;
  const parts = [
    ['offsetX', 'X offset'],
    ['offsetY', 'Y offset'],
    ['blur', 'Blur'],
    ['spread', 'Spread'],
  ] as const;
  return (
    <>
      {parts.map(([key, label]) => (
        <NumberField
          key={key}
          id={`${id}-${key}`}
          label={label}
          value={shadow[key].value}
          min={SHADOW_LIMITS[key].min}
          max={SHADOW_LIMITS[key].max}
          step={1}
          unit="px"
          onCommit={(n) => update({ [key]: px(n) })}
        />
      ))}
      <ColorField
        id={`${id}-color`}
        label="Colour"
        hex={hex}
        onCommit={(next) => update({ color: colorValue(next, alpha) })}
      />
      <NumberField
        id={`${id}-alpha`}
        label="Opacity"
        value={Math.round(alpha * 100)}
        min={0}
        max={100}
        step={1}
        unit="%"
        onCommit={(n) => update({ color: colorValue(hex, n / 100) })}
      />
    </>
  );
}

/**
 * A field that may hold a value the token cannot take. The draft and its
 * message stay until the person fixes it; leaving the field puts back the
 * last valid value. Mirrors the component property fields.
 */
function useDraft(stored: string) {
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  return {
    shown: draft ?? stored,
    error,
    update(next: string, result: ChangeResult | string) {
      const message = typeof result === 'string' ? result : result.ok ? null : result.error;
      setDraft(message ? next : null);
      setError(message);
    },
    revert() {
      if (error) {
        setDraft(null);
        setError(null);
      }
    },
  };
}

function NumberField({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onCommit,
}: {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  hint?: string;
  onCommit: (value: number) => ChangeResult;
}) {
  const draft = useDraft(String(value));
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [draft.error ? errorId : null, hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="prop">
      <label htmlFor={id}>{label}</label>
      <div className="prop__control">
        <span className="input-unit">
          <input
            id={id}
            className="input"
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step ?? 1}
            value={draft.shown}
            aria-invalid={draft.error ? true : undefined}
            aria-describedby={describedBy}
            onChange={(event) => {
              const next = event.target.value;
              const parsed = next.trim() === '' ? NaN : Number(next);
              draft.update(next, Number.isFinite(parsed) ? onCommit(parsed) : 'Enter a number.');
            }}
            onBlur={draft.revert}
          />
          {unit ? <span aria-hidden="true">{unit}</span> : null}
        </span>
        {draft.error ? (
          <span className="prop__error" id={errorId} role="alert">
            {draft.error}
          </span>
        ) : null}
        {hint ? (
          <span className="prop__hint" id={hintId}>
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * A colour picker plus a hex field. The hex field applies a full six-digit
 * value as it is typed; a three-digit shorthand applies when the field is left,
 * so typing "#b51" on the way to "#b5175a" does not flash a different colour.
 */
function ColorField({
  id,
  label,
  hex,
  onCommit,
}: {
  id: string;
  label: string;
  hex: string;
  onCommit: (hex: string) => ChangeResult;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const errorId = `${id}-error`;
  const settle = (next: string, result: ChangeResult) => {
    setDraft(result.ok ? null : next);
    setError(result.ok ? null : result.error);
  };
  const onType = (next: string) => {
    const digits = next.trim().replace(/^#/, '');
    if (/^[0-9a-f]{6}$/i.test(digits)) return settle(next, onCommit(`#${digits.toLowerCase()}`));
    setDraft(next);
    setError(/^[0-9a-f]{0,6}$/i.test(digits) ? null : 'Use 3 or 6 hex digits, such as #b5175a.');
  };
  const onLeave = () => {
    const normalized = draft === null ? null : normalizeHex(draft);
    if (normalized) settle(draft as string, onCommit(normalized));
    else {
      setDraft(null);
      setError(null);
    }
  };
  return (
    <div className="prop">
      <label htmlFor={id}>{label}</label>
      <div className="prop__control">
        <span className="color-field">
          <input
            type="color"
            className="color-field__picker"
            value={hex}
            aria-label={`${label} picker`}
            onChange={(event) => settle(event.target.value, onCommit(event.target.value))}
          />
          <input
            id={id}
            className="input color-field__hex"
            type="text"
            spellCheck={false}
            autoComplete="off"
            value={draft ?? hex}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => onType(event.target.value)}
            onBlur={onLeave}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onLeave();
            }}
          />
        </span>
        {error ? (
          <span className="prop__error" id={errorId} role="alert">
            {error}
          </span>
        ) : null}
      </div>
    </div>
  );
}
