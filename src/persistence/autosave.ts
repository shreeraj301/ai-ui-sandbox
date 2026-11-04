import type { Project } from '../document/schema';
import { useEditor } from '../editor/store';
import { describeSaveError, saveProject } from './database';

/**
 * Save the open project shortly after it changes. "Saved locally" only shows
 * once the write has succeeded. Returns a function that stops autosave.
 */
export function startAutosave(
  save: (project: Project) => Promise<void> = saveProject,
  delayMs = 400,
): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: Project | null = null;

  const flush = async () => {
    const project = pending;
    pending = null;
    if (!project) return;
    try {
      await save(project);
      // Only report "saved" if nothing newer is waiting.
      if (!pending) useEditor.getState().setSave({ state: 'saved' });
    } catch (error) {
      useEditor.getState().setSave({ state: 'error', message: describeSaveError(error) });
    }
  };

  const unsubscribe = useEditor.subscribe((state, previous) => {
    if (!state.project || state.project === previous.project) return;
    // Loading a different project is not an edit.
    if (!previous.project || previous.project.id !== state.project.id) return;
    pending = state.project;
    useEditor.getState().setSave({ state: 'saving' });
    clearTimeout(timer);
    timer = setTimeout(() => void flush(), delayMs);
  });

  // Write straight away if the tab is being hidden or closed with a save waiting.
  const onHide = () => {
    if (document.visibilityState === 'hidden' && pending) {
      clearTimeout(timer);
      void flush();
    }
  };
  document.addEventListener('visibilitychange', onHide);

  return () => {
    clearTimeout(timer);
    unsubscribe();
    document.removeEventListener('visibilitychange', onHide);
  };
}
