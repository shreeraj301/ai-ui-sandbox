import { useState } from 'react';
import type { DocumentNode } from '../document/schema';
import { getDefinition } from '../registry/registry';
import type { Field } from '../registry/types';
import { activePage, useEditor } from './store';

export function Inspector() {
  const project = useEditor((state) => state.project);
  const selectedId = useEditor((state) => state.selectedId);
  const node = project && selectedId ? activePage(project).nodes[selectedId] : undefined;

  return (
    <aside className="panel inspector" aria-labelledby="inspector-title">
      <h2 className="panel__title" id="inspector-title">
        Properties
      </h2>
      {node ? (
        <NodeInspector key={node.id} node={node} />
      ) : (
        <p className="panel__empty">
          Select a component on the stage to edit it. Add one from the library to begin.
        </p>
      )}
    </aside>
  );
}

function NodeInspector({ node }: { node: DocumentNode }) {
  const definition = getDefinition(node.type);
  const removeNode = useEditor((state) => state.removeNode);
  if (!definition) {
    return <p className="panel__empty">This component type is not supported.</p>;
  }
  const groups = [...new Set(definition.fields.map((field) => field.group))];

  return (
    <div className="inspector__body">
      <div className="inspector__head">
        <span className="inspector__name">{node.name}</span>
        {node.name !== definition.name ? (
          <span className="inspector__kind">{definition.name}</span>
        ) : null}
      </div>
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
    </div>
  );
}

function FieldControl({ node, field }: { node: DocumentNode; field: Field }) {
  const updateProps = useEditor((state) => state.updateProps);
  const value = node.props[field.key];
  const id = `prop-${node.id}-${field.key}`;
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (field.kind === 'text') {
    const shown = draft ?? (typeof value === 'string' ? value : '');
    const onChange = (next: string) => {
      setDraft(next);
      const result = updateProps(node.id, { [field.key]: next });
      // An invalid value stays in the field with its message and never reaches the document.
      setError(result.ok ? null : result.error);
      if (result.ok) setDraft(null);
    };
    const errorId = `${id}-error`;
    const common = {
      id,
      value: shown,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? errorId : undefined,
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
          {field.multiline ? (
            <textarea className="input input--area" rows={3} {...common} />
          ) : (
            <input className="input" type="text" {...common} />
          )}
          {error ? (
            <span className="prop__error" id={errorId} role="alert">
              {error}
            </span>
          ) : null}
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
          onChange={(event) => updateProps(node.id, { [field.key]: event.target.checked })}
        />
      </div>
    </div>
  );
}
