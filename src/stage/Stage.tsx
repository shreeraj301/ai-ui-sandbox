import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { DocumentNode } from '../document/schema';
import { activePage, useEditor } from '../editor/store';
import { getDefinition } from '../registry/registry';
import { FRAME_WIDTH } from './constants';
import { TitleBlock } from './TitleBlock';

/**
 * The stage shows the frame at 100% for now: components stay readable and the
 * dimension lines match CSS pixels. Fit-to-width zoom comes with viewports in
 * sub-milestone 4.
 */
const zoom = 1;

type Box = { left: number; top: number; width: number; height: number };

export function Stage({ userVars }: { userVars: CSSProperties }) {
  const project = useEditor((state) => state.project);
  const selectedId = useEditor((state) => state.selectedId);
  const select = useEditor((state) => state.select);

  const layerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameHeight, setFrameHeight] = useState(0);
  const [box, setBox] = useState<Box | null>(null);

  const hasProject = project !== null;

  // Track the frame's height so the slot around the scaled frame matches it.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setFrameHeight(frame.offsetHeight);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [hasProject]);

  // Measure the selected component as rendered, for the outline and dimension lines.
  const measureSelection = useCallback(() => {
    const layer = layerRef.current;
    const wrapper = selectedId
      ? Array.from(layer?.querySelectorAll<HTMLElement>('[data-node-id]') ?? []).find(
          (element) => element.dataset.nodeId === selectedId,
        )
      : undefined;
    const target = wrapper?.querySelector<HTMLElement>('.stage-node__content > *') ?? null;
    if (!layer || !target) {
      setBox(null);
      return;
    }
    const layerRect = layer.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    setBox({
      left: rect.left - layerRect.left,
      top: rect.top - layerRect.top,
      width: rect.width,
      height: rect.height,
    });
  }, [selectedId]);

  useLayoutEffect(() => {
    measureSelection();
  }, [measureSelection, project]);

  // Bring a newly selected component into view, for example one just added at the end.
  useLayoutEffect(() => {
    if (!selectedId) return;
    const wrapper = Array.from(
      layerRef.current?.querySelectorAll<HTMLElement>('[data-node-id]') ?? [],
    ).find((element) => element.dataset.nodeId === selectedId);
    wrapper?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [selectedId]);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measureSelection());
    observer.observe(frame);
    // The viewport resizes with the window; padding changes there move the selection.
    const viewport = layerRef.current?.parentElement;
    if (viewport) observer.observe(viewport);
    return () => observer.disconnect();
  }, [measureSelection]);

  if (!project) return null;
  const page = activePage(project);
  const nodes = page.rootNodeIds
    .map((id) => page.nodes[id])
    .filter((node): node is DocumentNode => Boolean(node));

  return (
    <main className="stage" aria-label="Stage">
      <div
        className="stage__viewport"
        style={{ '--ed-zoom': zoom } as CSSProperties}
        onClick={() => select(null)}
      >
        <div className="stage__layer" ref={layerRef}>
          <p className="frame-label">Desktop</p>
          <div
            className="frame-slot"
            style={{ width: FRAME_WIDTH * zoom, height: frameHeight * zoom }}
          >
            <div
              className="frame"
              ref={frameRef}
              style={{ ...userVars, width: FRAME_WIDTH, transform: `scale(${zoom})` }}
            >
              {nodes.length === 0 ? (
                <p className="frame__empty">
                  This page is empty. Pick a component from the library to place it here.
                </p>
              ) : (
                nodes.map((node) => (
                  <StageNode
                    key={node.id}
                    node={node}
                    selected={node.id === selectedId}
                    onSelect={() => select(node.id)}
                  />
                ))
              )}
            </div>
          </div>
          {box ? <Selection box={box} zoom={zoom} /> : null}
        </div>
      </div>
      <TitleBlock zoom={zoom} />
    </main>
  );
}

function StageNode({
  node,
  selected,
  onSelect,
}: {
  node: DocumentNode;
  selected: boolean;
  onSelect: () => void;
}) {
  const definition = getDefinition(node.type);
  if (!definition) return null;
  const { Render } = definition;
  const stretch = node.type === 'button' && node.props.fullWidth === true;
  return (
    <div
      className="stage-node"
      data-node-id={node.id}
      data-stretch={stretch || undefined}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${definition.name}: ${node.name}`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      {/* The user's component is shown, not operated, while editing. */}
      <div className="stage-node__content" inert>
        <Render props={node.props} />
      </div>
    </div>
  );
}

function Selection({ box, zoom }: { box: Box; zoom: number }) {
  const width = Math.round(box.width / zoom);
  const height = Math.round(box.height / zoom);
  return (
    <div
      className="selection"
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
      aria-hidden="true"
    >
      <span className="dim dim--w">
        <span className="dim__value" data-testid="dim-width">
          {width}
        </span>
      </span>
      <span className="dim dim--h">
        <span className="dim__value" data-testid="dim-height">
          {height}
        </span>
      </span>
      <span className="handle handle--tl" />
      <span className="handle handle--tr" />
      <span className="handle handle--bl" />
      <span className="handle handle--br" />
    </div>
  );
}
