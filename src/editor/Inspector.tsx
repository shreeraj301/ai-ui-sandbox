import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { DocumentNode } from '../document/schema';
import { getDefinition } from '../registry/registry';
import {
  STATE_LABELS,
  type ComponentDefinition,
  type Field,
  type StateId,
} from '../registry/types';
import { activePage, useEditor } from './store';

type Tab = 'properties' | 'states';

export function Inspector({ userVars }: { userVars: CSSProperties }) {
  const project = useEditor((state) => state.project);
  const selectedId = useEditor((state) => state.selectedId);
  const node = project && selectedId ? activePage(project).nodes[selectedId] : undefined;
  const definition = node ? getDefinition(node.type) : undefined;
  const [tab, setTab] = useState<Tab>('properties');

  return (
    <aside className="panel inspector" aria-label="Inspector">
      <Tabs tab={tab} onChange={setTab} />
      {node && definition ? (
        <div
          role="tabpanel"
          id={`inspector-panel-${tab}`}
          aria-labelledby={`inspector-tab-${tab}`}
          className="inspector__body"
        >
          <div className="inspector__head">
            <span className="inspector__name">{node.name}</span>
            {node.name !== definition.name ? (
              <span className="inspector__kind">{definition.name}</span>
            ) : null}
          </div>
          {tab === 'properties' ? (
            <PropertiesPanel key={node.id} node={node} definition={definition} />
          ) : (
            <StatesPanel node={node} definition={definition} userVars={userVars} />
          )}
        </div>
      ) : (
        <p className="panel__empty" role="tabpanel" id={`inspector-panel-${tab}`}>
          Select a component on the stage to edit it. Add one from the library to begin.
        </p>
      )}
    </aside>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'properties', label: 'Properties' },
  { id: 'states', label: 'States' },
];

function Tabs({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const index = TABS.findIndex((item) => item.id === tab);
    const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
    if (!next) return;
    onChange(next.id);
    document.getElementById(`inspector-tab-${next.id}`)?.focus();
  };
  return (
    <div className="tabs" role="tablist" aria-label="Inspector sections">
      {TABS.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          id={`inspector-tab-${item.id}`}
          aria-selected={tab === item.id}
          aria-controls={`inspector-panel-${item.id}`}
          tabIndex={tab === item.id ? 0 : -1}
          className="tabs__tab"
          onClick={() => onChange(item.id)}
          onKeyDown={onKeyDown}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function PropertiesPanel({
  node,
  definition,
}: {
  node: DocumentNode;
  definition: ComponentDefinition;
}) {
  const removeNode = useEditor((state) => state.removeNode);
  const groups = [...new Set(definition.fields.map((field) => field.group))];
  return (
    <>
      {groups.map((group) => (
        <fieldset className="group" key={group}>
          <legend className="section-label">{group}</legend>
          {definition.fields
            .filter((field) => field.group === group)
            .map((field) => (
              <FieldControl key={field.key} node={node} field={field} />
            ))}
        </fieldset>
      ))}
      <div className="group group--end">
        <button type="button" className="btn btn--quiet" onClick={() => removeNode(node.id)}>
          Remove from page
        </button>
        <p className="inspector__hint">Undo with Ctrl+Z if you remove it by mistake.</p>
      </div>
    </>
  );
}

function FieldControl({ node, field }: { node: DocumentNode; field: Field }) {
  const updateProps = useEditor((state) => state.updateProps);
  const value = node.props[field.key];
  const id = `prop-${node.id}-${field.key}`;
  const hintId = field.hint ? `${id}-hint` : undefined;
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const errorId = `${id}-error`;

  const hint = field.hint ? (
    <span className="prop__hint" id={hintId}>
      {field.hint}
    </span>
  ) : null;

  if (field.kind === 'text' || field.kind === 'number') {
    const stored = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
    const shown = draft ?? stored;
    const onChange = (next: string) => {
      setDraft(next);
      const parsed = field.kind === 'number' ? (next.trim() === '' ? NaN : Number(next)) : next;
      const result = updateProps(node.id, { [field.key]: parsed });
      // An invalid value stays in the field with its message and never reaches the document.
      setError(result.ok ? null : result.error);
      if (result.ok) setDraft(null);
    };
    const describedBy = [error ? errorId : null, hintId].filter(Boolean).join(' ') || undefined;
    const common = {
      id,
      value: shown,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': describedBy,
      onChange: (event: { target: { value: string } }) => onChange(event.target.value),
      // Leaving a field with an invalid value puts back the last valid one.
      onBlur: () => {
        if (error) {
          setDraft(null);
          setError(null);
        }
      },
    };
    return (
      <div className="prop">
        <label htmlFor={id}>{field.label}</label>
        <div className="prop__control">
          {field.kind === 'number' ? (
            <span className="input-unit">
              <input
                className="input"
                type="number"
                inputMode="numeric"
                min={field.min}
                max={field.max}
                step={field.step ?? 1}
                {...common}
              />
              {field.unit ? <span aria-hidden="true">{field.unit}</span> : null}
            </span>
          ) : field.multiline ? (
            <textarea className="input input--area" rows={3} {...common} />
          ) : (
            <input className="input" type="text" {...common} />
          )}
          {error ? (
            <span className="prop__error" id={errorId} role="alert">
              {error}
            </span>
          ) : null}
          {hint}
        </div>
      </div>
    );
  }

  if (field.kind === 'choice') {
    return (
      <div className="prop" role="radiogroup" aria-labelledby={`${id}-label`}>
        <span id={`${id}-label`}>{field.label}</span>
        <div className="seg">
          {field.options.map((choice) => (
            <label key={choice.value} className="seg__option">
              <input
                type="radio"
                name={id}
                value={choice.value}
                checked={value === choice.value}
                onChange={() => updateProps(node.id, { [field.key]: choice.value })}
              />
              <span>{choice.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.kind === 'select') {
    return (
      <div className="prop">
        <label htmlFor={id}>{field.label}</label>
        <div className="prop__control">
          <span className="select">
            <select
              id={id}
              className="input"
              value={typeof value === 'string' ? value : ''}
              aria-describedby={hintId}
              onChange={(event) => updateProps(node.id, { [field.key]: event.target.value })}
            >
              {field.options.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          </span>
          {hint}
        </div>
      </div>
    );
  }

  return (
    <div className="prop">
      <label htmlFor={id}>{field.label}</label>
      <div className="prop__control">
        <input
          id={id}
          type="checkbox"
          role="switch"
          className="switch"
          checked={value === true}
          aria-describedby={hintId}
          onChange={(event) => updateProps(node.id, { [field.key]: event.target.checked })}
        />
        {hint}
      </div>
    </div>
  );
}

function StatesPanel({
  node,
  definition,
  userVars,
}: {
  node: DocumentNode;
  definition: ComponentDefinition;
  userVars: CSSProperties;
}) {
  const preview = useEditor((state) => state.preview);
  const setPreview = useEditor((state) => state.setPreview);
  const current: StateId = preview?.nodeId === node.id ? preview.state : 'default';
  const { Render } = definition;

  if (definition.states.length <= 1) {
    return (
      <p className="panel__empty">
        {definition.name} has no interaction states. It looks the same however people use the page.
      </p>
    );
  }

  return (
    <fieldset className="group">
      <legend className="section-label">Preview on stage</legend>
      <p className="inspector__hint">
        Pick a state to hold it on the stage. This is a preview only and is not saved.
      </p>
      <div className="states">
        {definition.states.map((state) => (
          <label key={state} className="state-cell" data-active={current === state || undefined}>
            <input
              type="radio"
              name={`state-${node.id}`}
              value={state}
              checked={current === state}
              onChange={() => setPreview(state === 'default' ? null : { nodeId: node.id, state })}
            />
            <ScaleToFit style={userVars}>
              <Render props={node.props} state={state} />
            </ScaleToFit>
            <span className="state-cell__label">{STATE_LABELS[state]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Shrinks its content to the cell width so wide components still fit. */
function ScaleToFit({ children, style }: { children: React.ReactNode; style: CSSProperties }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      if (!outer.current || !inner.current) return;
      const available = outer.current.clientWidth;
      const natural = inner.current.scrollWidth;
      const scale = natural > available && natural > 0 ? available / natural : 1;
      setFit({ scale, height: inner.current.offsetHeight * scale });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    if (outer.current) observer.observe(outer.current);
    if (inner.current) observer.observe(inner.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="scale-fit" ref={outer} style={{ height: fit.height || undefined }}>
      <div
        className="scale-fit__inner"
        ref={inner}
        inert
        style={{ ...style, transform: `scale(${fit.scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
