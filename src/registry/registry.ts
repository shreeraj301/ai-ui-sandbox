import type { Operation } from '../document/operations';
import type { Project } from '../document/schema';
import { definitions } from './definitions';
import type { ComponentDefinition } from './types';

const byType = new Map(definitions.map((definition) => [definition.type, definition]));

export const componentList: readonly ComponentDefinition[] = definitions;

export function getDefinition(type: string): ComponentDefinition | undefined {
  return byType.get(type);
}

export type PropsCheck = { ok: true } | { ok: false; error: string; key?: string };

/** Check a full prop set against its component's schema. */
export function checkProps(type: string, props: Record<string, unknown>): PropsCheck {
  const definition = getDefinition(type);
  if (!definition) return { ok: false, error: `Unknown component type "${type}"` };
  const result = definition.schema.safeParse(props);
  if (result.success) return { ok: true };
  const issue = result.error.issues[0];
  const key = issue?.path[0] === undefined ? undefined : String(issue.path[0]);
  return { ok: false, error: issue?.message ?? 'Invalid value', key };
}

/**
 * Registry rules the document layer does not know about: component types must
 * exist and props must match their schema. Run before applyOperations.
 */
export function checkOperations(project: Project, operations: Operation[]): PropsCheck {
  const merged = new Map<string, { type: string; props: Record<string, unknown> }>();
  for (const operation of operations) {
    if (operation.type === 'addNode') {
      const check = checkProps(operation.node.type, operation.node.props);
      if (!check.ok) return check;
      merged.set(operation.node.id, { type: operation.node.type, props: operation.node.props });
    }
    if (operation.type === 'updateNodeProps') {
      const page = project.pages.find((candidate) => candidate.id === operation.pageId);
      const current = merged.get(operation.nodeId) ?? page?.nodes[operation.nodeId];
      if (!current) continue; // applyOperations reports the missing node
      const props = { ...current.props, ...operation.props };
      const check = checkProps(current.type, props);
      if (!check.ok) return check;
      merged.set(operation.nodeId, { type: current.type, props });
    }
  }
  return { ok: true };
}
