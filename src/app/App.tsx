import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { tokensToCssVariables } from '../design-system/resolve';
import { createProject } from '../document/project';
import { Inspector } from '../editor/Inspector';
import { Library } from '../editor/Library';
import { useEditor } from '../editor/store';
import { startAutosave } from '../persistence/autosave';
import { openLastOrCreate } from '../persistence/database';
import { Stage } from '../stage/Stage';

type Boot = { state: 'loading' } | { state: 'ready'; note?: string };

export function App() {
  const [boot, setBoot] = useState<Boot>({ state: 'loading' });
  const project = useEditor((state) => state.project);
  const canUndo = useEditor((state) => state.past.length > 0);
  const canRedo = useEditor((state) => state.future.length > 0);
  const undo = useEditor((state) => state.undo);
  const redo = useEditor((state) => state.redo);

  // Editor shortcuts. Text fields keep their own undo and Escape behaviour.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (mod && key === 'z' && !event.shiftKey) {
        event.preventDefault();
        useEditor.getState().undo();
      } else if (mod && ((key === 'z' && event.shiftKey) || key === 'y')) {
        event.preventDefault();
        useEditor.getState().redo();
      } else if (key === 'escape') {
        useEditor.getState().select(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let stopAutosave: (() => void) | undefined;
    openLastOrCreate()
      .then(({ project: opened, note }) => {
        if (cancelled) return;
        useEditor.getState().load(opened);
        useEditor.getState().setSave({ state: 'saved' });
        stopAutosave = startAutosave();
        setBoot({ state: 'ready', note });
      })
      .catch(() => {
        if (cancelled) return;
        // Storage is blocked (private mode, disabled site data). Work still runs, unsaved.
        useEditor.getState().load(createProject());
        useEditor.getState().setSave({
          state: 'unavailable',
          message: 'This browser is blocking local storage',
        });
        setBoot({
          state: 'ready',
          note: 'This browser is blocking local storage, so changes will be lost when you reload. Allow site data for this page to keep your work.',
        });
      });
    return () => {
      cancelled = true;
      stopAutosave?.();
    };
  }, []);

  const designSystem = project?.designSystems.find(
    (system) => system.id === project.activeDesignSystemId,
  );
  const userVars = useMemo(
    () => (designSystem ? (tokensToCssVariables(designSystem.tokens) as CSSProperties) : {}),
    [designSystem],
  );

  if (boot.state === 'loading' || !project) {
    return (
      <main className="boot">
        <h1 className="boot__title">AI UI Sandbox</h1>
        <p className="boot__status" role="status">
          Opening your playground…
        </p>
      </main>
    );
  }

  return (
    <div className="editor">
      <header className="toolbar">
        <h1 className="toolbar__mark">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="icon icon--mark">
            <rect x="3.5" y="3.5" width="17" height="17" rx="1" />
            <path d="M3.5 12h17M12 3.5v17" />
            <circle cx="12" cy="12" r="3" className="icon__fill" />
          </svg>
          AI UI Sandbox
        </h1>
        <span className="toolbar__project">{project.name}</span>
        <span className="toolbar__spacer" />
        <button
          type="button"
          className="icon-btn"
          onClick={undo}
          disabled={!canUndo}
          aria-label="Undo"
          title="Undo (Ctrl+Z)"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="icon">
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h11a5 5 0 0 1 0 10h-3" />
          </svg>
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={redo}
          disabled={!canRedo}
          aria-label="Redo"
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="icon">
            <path d="m15 14 5-5-5-5" />
            <path d="M20 9H9a5 5 0 0 0 0 10h3" />
          </svg>
        </button>
      </header>
      {boot.note ? (
        <p className="notice" role="status">
          {boot.note}
        </p>
      ) : null}
      <p className="narrow-notice">
        Editing needs a screen at least 900px wide. You can look at the page here; open it on a
        larger screen to add and edit components.
      </p>
      <Library userVars={userVars} />
      <Stage userVars={userVars} />
      <Inspector userVars={userVars} />
    </div>
  );
}
