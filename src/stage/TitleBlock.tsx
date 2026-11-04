import { activePage, useEditor, type SaveStatus } from '../editor/store';
import { FRAME_WIDTH } from './constants';

function statusText(save: SaveStatus): string {
  switch (save.state) {
    case 'saving':
      return 'Saving…';
    case 'saved':
      return 'Saved locally';
    case 'error':
      return `Not saved: ${save.message}`;
    case 'unavailable':
      return 'Not saving';
    case 'idle':
      return 'Not saved yet';
  }
}

/**
 * The drawing's title block. Every field shows a real value, so it replaces a
 * status bar: project, page, scale, viewport, revision and save state.
 */
export function TitleBlock({ zoom }: { zoom: number }) {
  const project = useEditor((state) => state.project);
  const save = useEditor((state) => state.save);
  if (!project) return null;
  const page = activePage(project);
  const pageIndex = project.pages.indexOf(page) + 1;
  const problem = save.state === 'error' || save.state === 'unavailable';

  return (
    <dl className="titleblock" aria-label="Project details">
      <div>
        <dt>Project</dt>
        <dd>{project.name}</dd>
      </div>
      <div>
        <dt>Sheet</dt>
        <dd>
          {page.name} ({pageIndex} of {project.pages.length})
        </dd>
      </div>
      <div>
        <dt>Scale</dt>
        <dd>{Math.round(zoom * 100)}%</dd>
      </div>
      <div>
        <dt>Viewport</dt>
        <dd>Desktop {FRAME_WIDTH}</dd>
      </div>
      <div>
        <dt>Revision</dt>
        <dd data-testid="revision">{project.revision}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd data-testid="save-status" data-problem={problem || undefined} aria-live="polite">
          {statusText(save)}
        </dd>
      </div>
    </dl>
  );
}
