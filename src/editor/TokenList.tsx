import { Copy, Download, TriangleAlert } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { getToken, TOKEN_GROUPS, TOKEN_SPECS, type TokenSpec } from '../design-system/catalogue';
import { checkContrast, formatRatio } from '../design-system/contrast';
import { defaultTokens } from '../design-system/defaultTokens';
import { tokensToCssFile, tokensToJson } from '../design-system/export';
import { describeValue } from '../design-system/describe';
import { tokenToCss } from '../design-system/resolve';
import type { Token } from '../document/schema';
import { activeDesignSystem, isSameValue, useEditor } from './store';

/** The Tokens tab: contrast summary, every editable token by group, and export. */
export function TokenList({ userVars }: { userVars: CSSProperties }) {
  const project = useEditor((state) => state.project);
  const selectedToken = useEditor((state) => state.selectedToken);
  const selectToken = useEditor((state) => state.selectToken);
  const resetTokens = useEditor((state) => state.resetTokens);
  const [message, setMessage] = useState('');
  const system = project ? activeDesignSystem(project) : undefined;
  const tokens = system?.tokens;
  if (!system || !tokens) return null;

  const contrast = checkContrast(tokens);
  const failing = contrast.filter((pair) => !pair.passes);
  const failingPaths = new Set(failing.flatMap((pair) => [pair.foreground, pair.background]));
  const changed = TOKEN_SPECS.filter((spec) => {
    const starter = getToken(defaultTokens, spec.path);
    const current = getToken(tokens, spec.path);
    return starter && current && !isSameValue(starter.$value, current.$value);
  }).length;

  const exportFile = async (kind: 'json' | 'css', action: 'copy' | 'download') => {
    const name = kind === 'json' ? 'tokens.json' : 'tokens.css';
    const text = kind === 'json' ? tokensToJson(system) : tokensToCssFile(system);
    if (action === 'download') {
      const url = URL.createObjectURL(
        new Blob([text], { type: kind === 'json' ? 'application/json' : 'text/css' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      setMessage(`Downloaded ${name}.`);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setMessage(`Copied ${name} to the clipboard.`);
    } catch {
      setMessage(`This browser blocked the clipboard. Use Download ${name} instead.`);
    }
  };

  return (
    <div className="tokens" style={userVars}>
      <section className="tokens__section" aria-labelledby="contrast-summary-title">
        <h3 className="section-label" id="contrast-summary-title">
          Contrast
        </h3>
        <p className="tokens__summary">
          {contrast.length - failing.length} of {contrast.length} colour pairs pass WCAG AA.
        </p>
        {failing.length > 0 ? (
          <ul className="tokens__failures">
            {failing.map((pair) => (
              <li key={`${pair.foreground}/${pair.background}`}>
                <button
                  type="button"
                  className="tokens__failure"
                  onClick={() => selectToken(pair.foreground)}
                >
                  <TriangleAlert aria-hidden="true" size={14} strokeWidth={2.25} />
                  <span>
                    {pair.label}: {formatRatio(pair.ratio)}, needs {pair.minimum}:1
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {TOKEN_GROUPS.map((group) => (
        <section key={group} className="tokens__section" aria-labelledby={`tokens-${group}`}>
          <h3 className="section-label" id={`tokens-${group}`}>
            {group}
          </h3>
          <ul className="tokens__list">
            {TOKEN_SPECS.filter((spec) => spec.group === group).map((spec) => {
              const token = getToken(tokens, spec.path);
              if (!token) return null;
              const fails = failingPaths.has(spec.path);
              return (
                <li key={spec.path}>
                  <button
                    type="button"
                    className="token-row"
                    aria-pressed={selectedToken === spec.path}
                    onClick={() => selectToken(spec.path)}
                  >
                    <TokenPreview spec={spec} token={token} />
                    <span className="token-row__name">{spec.label}</span>
                    {fails ? (
                      <TriangleAlert
                        className="token-row__flag"
                        aria-hidden="true"
                        size={13}
                        strokeWidth={2.25}
                      />
                    ) : null}
                    <span className="token-row__value">{describeValue(spec, token)}</span>
                    {fails ? (
                      <span className="visually-hidden">, fails a contrast check</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section className="tokens__section tokens__export" aria-labelledby="tokens-export-title">
        <h3 className="section-label" id="tokens-export-title">
          Export
        </h3>
        {(['json', 'css'] as const).map((kind) => {
          const name = kind === 'json' ? 'tokens.json' : 'tokens.css';
          return (
            <div key={kind} className="export-row">
              <span className="export-row__name">
                {name}
                <span className="export-row__desc">
                  {kind === 'json' ? 'W3C DTCG 2025.10' : 'CSS variables on :root'}
                </span>
              </span>
              <button
                type="button"
                className="icon-btn"
                aria-label={`Copy ${name}`}
                title={`Copy ${name}`}
                onClick={() => void exportFile(kind, 'copy')}
              >
                <Copy aria-hidden="true" size={16} />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label={`Download ${name}`}
                title={`Download ${name}`}
                onClick={() => void exportFile(kind, 'download')}
              >
                <Download aria-hidden="true" size={16} />
              </button>
            </div>
          );
        })}
        <p className="tokens__message" role="status">
          {message}
        </p>
        <button
          type="button"
          className="btn btn--quiet"
          disabled={changed === 0}
          onClick={() => {
            resetTokens();
            setMessage('All tokens are back to their starter values. Undo with Ctrl+Z.');
          }}
        >
          Reset all tokens{changed > 0 ? ` (${changed} changed)` : ''}
        </button>
      </section>
    </div>
  );
}

/** A small drawing of the token's effect: a swatch, a type sample, a bar, a corner, a shadow. */
function TokenPreview({ spec, token }: { spec: TokenSpec; token: Token }) {
  const css = tokenToCss(token) ?? undefined;
  let style: CSSProperties = {};
  let content = '';
  switch (spec.kind) {
    case 'color':
      style = { background: css };
      break;
    case 'fontFamily':
      style = { fontFamily: css };
      content = 'Aa';
      break;
    case 'fontWeight':
      style = { fontWeight: css };
      content = 'Aa';
      break;
    case 'number':
      // Three text lines spaced by the ratio: wider gaps for looser leading.
      style = { gap: `${Math.max(1, Math.round((Number(css) - 1) * 8))}px` };
      break;
    case 'dimension':
      if (spec.group === 'Type') {
        style = { fontSize: `min(${css}, 20px)` };
        content = 'A';
      } else if (spec.group === 'Spacing') {
        style = { width: `min(${css}, 28px)` };
      } else {
        style = { borderTopLeftRadius: `min(${css}, 14px)` };
      }
      break;
    case 'shadow':
      style = { boxShadow: css };
      break;
  }
  return (
    <span
      className="token-preview"
      data-kind={spec.kind}
      data-group={spec.group}
      aria-hidden="true"
    >
      <span className="token-preview__mark" style={style}>
        {spec.kind === 'number' ? (
          <>
            <i />
            <i />
            <i />
          </>
        ) : (
          content
        )}
      </span>
    </span>
  );
}
