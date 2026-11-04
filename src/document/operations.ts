import { projectSchema, type DocumentNode, type Page, type Project } from './schema';
import { findStructuralProblems } from './validate';

/**
 * Every change to a project is an Operation. Manual edits and, later, AI
 * proposals use the same list, so both are validated and undone the same way.
 * Operations are plain data: no functions, no code, safe to store and review.
 */
export type Operation =
  | {
      type: 'addNode';
      pageId: string;
      node: Pick<DocumentNode, 'id' | 'type' | 'name' | 'props'>;
      parentId: string | null;
      /** Position among siblings. Omit to append. */
      index?: number;
    }
  | { type: 'removeNode'; pageId: string; nodeId: string }
  | { type: 'moveNode'; pageId: string; nodeId: string; parentId: string | null; index: number }
  | { type: 'updateNodeProps'; pageId: string; nodeId: string; props: Record<string, unknown> }
  | { type: 'renameNode'; pageId: string; nodeId: string; name: string };

export type ApplyResult = { ok: true; project: Project } | { ok: false; error: string };

/**
 * Apply operations as one transaction: all succeed, or the original project is
 * returned untouched with the first error. The input project is never mutated.
 */
export function applyOperations(project: Project, operations: Operation[]): ApplyResult {
  const draft = structuredClone(project);
  for (const [position, operation] of operations.entries()) {
    const error = applyOne(draft, operation);
    if (error) return { ok: false, error: `operation ${position} (${operation.type}): ${error}` };
  }
  // Operations are untrusted input too (later, AI proposals), so the result
  // must pass the same schema and structural checks as an imported file.
  const parsed = projectSchema.safeParse(draft);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: `${first?.path.join('.') || 'project'}: ${first?.message}` };
  }
  const problems = findStructuralProblems(draft);
  if (problems.length > 0) return { ok: false, error: problems.join('; ') };
  return { ok: true, project: draft };
}

/** Mutates the draft. Returns an error message, or null on success. */
function applyOne(draft: Project, operation: Operation): string | null {
  const page = draft.pages.find((candidate) => candidate.id === operation.pageId);
  if (!page) return `page "${operation.pageId}" not found`;

  switch (operation.type) {
    case 'addNode': {
      const { node, parentId, index } = operation;
      if (page.nodes[node.id]) return `node id "${node.id}" already exists`;
      const siblings = siblingList(page, parentId);
      if (!siblings) return `parent "${parentId}" not found`;
      page.nodes[node.id] = { ...node, parentId, childrenIds: [] };
      insertAt(siblings, node.id, index);
      return null;
    }
    case 'removeNode': {
      const node = page.nodes[operation.nodeId];
      if (!node) return `node "${operation.nodeId}" not found`;
      removeFromList(siblingList(page, node.parentId), node.id);
      for (const descendantId of [node.id, ...descendantsOf(page, node.id)]) {
        delete page.nodes[descendantId];
      }
      return null;
    }
    case 'moveNode': {
      const { nodeId, parentId, index } = operation;
      const node = page.nodes[nodeId];
      if (!node) return `node "${nodeId}" not found`;
      if (parentId === nodeId || (parentId && descendantsOf(page, nodeId).includes(parentId))) {
        return 'a node cannot move inside itself';
      }
      const target = siblingList(page, parentId);
      if (!target) return `parent "${parentId}" not found`;
      removeFromList(siblingList(page, node.parentId), nodeId);
      node.parentId = parentId;
      insertAt(target, nodeId, index);
      return null;
    }
    case 'updateNodeProps': {
      const node = page.nodes[operation.nodeId];
      if (!node) return `node "${operation.nodeId}" not found`;
      node.props = { ...node.props, ...operation.props };
      return null;
    }
    case 'renameNode': {
      const node = page.nodes[operation.nodeId];
      if (!node) return `node "${operation.nodeId}" not found`;
      const name = operation.name.trim();
      if (!name) return 'name cannot be empty';
      node.name = name;
      return null;
    }
  }
}

/** The ordered child list a node lives in: the page roots, or a parent's children. */
function siblingList(page: Page, parentId: string | null): string[] | undefined {
  return parentId === null ? page.rootNodeIds : page.nodes[parentId]?.childrenIds;
}

function insertAt(list: string[], value: string, index?: number) {
  const at = index === undefined ? list.length : Math.max(0, Math.min(index, list.length));
  list.splice(at, 0, value);
}

function removeFromList(list: string[] | undefined, value: string) {
  if (!list) return;
  const at = list.indexOf(value);
  if (at !== -1) list.splice(at, 1);
}

function descendantsOf(page: Page, nodeId: string): string[] {
  const result: string[] = [];
  const queue = [...(page.nodes[nodeId]?.childrenIds ?? [])];
  while (queue.length > 0) {
    const next = queue.shift() as string;
    result.push(next);
    queue.push(...(page.nodes[next]?.childrenIds ?? []));
  }
  return result;
}
