import type { Page, Project } from './schema';

/**
 * Structural checks the schema cannot express: references between nodes,
 * parent/child agreement, cycles, and active ids that point at real items.
 * Returns a list of problems; an empty list means the document is sound.
 */
export function findStructuralProblems(project: Project): string[] {
  const problems: string[] = [];

  if (!project.pages.some((page) => page.id === project.activePageId)) {
    problems.push(`activePageId "${project.activePageId}" does not match a page`);
  }
  if (!project.designSystems.some((system) => system.id === project.activeDesignSystemId)) {
    problems.push(
      `activeDesignSystemId "${project.activeDesignSystemId}" does not match a design system`,
    );
  }
  if (new Set(project.pages.map((page) => page.id)).size !== project.pages.length) {
    problems.push('page ids are not unique');
  }

  for (const page of project.pages) {
    problems.push(...findPageProblems(page).map((problem) => `page "${page.id}": ${problem}`));
  }
  return problems;
}

function findPageProblems(page: Page): string[] {
  const problems: string[] = [];
  const { nodes } = page;
  const seenAsChild = new Map<string, string | null>();

  const claim = (childId: string, parentId: string | null) => {
    if (seenAsChild.has(childId)) {
      problems.push(`node "${childId}" is listed under more than one parent`);
      return;
    }
    seenAsChild.set(childId, parentId);
  };

  for (const rootId of page.rootNodeIds) claim(rootId, null);
  for (const node of Object.values(nodes)) {
    for (const childId of node.childrenIds) claim(childId, node.id);
  }

  for (const [key, node] of Object.entries(nodes)) {
    if (key !== node.id) problems.push(`node key "${key}" does not match its id "${node.id}"`);
    if (!seenAsChild.has(node.id)) {
      problems.push(`node "${node.id}" is not reachable from the page roots`);
    } else if (seenAsChild.get(node.id) !== node.parentId) {
      problems.push(`node "${node.id}" has parentId that disagrees with its parent's children`);
    }
  }
  for (const childId of seenAsChild.keys()) {
    if (!nodes[childId]) problems.push(`node "${childId}" is referenced but missing`);
  }

  // Walking up from every node must reach a root without repeating a node.
  for (const node of Object.values(nodes)) {
    const visited = new Set<string>();
    let current: string | null = node.id;
    while (current !== null) {
      if (visited.has(current)) {
        problems.push(`node "${node.id}" is part of a cycle`);
        break;
      }
      visited.add(current);
      current = nodes[current]?.parentId ?? null;
    }
  }
  return problems;
}
