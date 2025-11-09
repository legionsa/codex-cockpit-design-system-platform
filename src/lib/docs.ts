import { api } from '@/lib/api-client';
import { PageNode } from '@shared/docs-types';
let pageTreeCache: PageNode[] | null = null;
export async function getPageTree(): Promise<PageNode[]> {
  if (pageTreeCache) {
    return pageTreeCache;
  }
  const tree = await api<PageNode[]>('/api/docs/tree');
  pageTreeCache = tree;
  return tree;
}
export async function getPageBySlug(slug: string): Promise<PageNode | null> {
  try {
    return await api<PageNode>(`/api/docs/page/${slug}`);
  } catch (error) {
    console.error(`Failed to fetch page for slug: ${slug}`, error);
    return null;
  }
}
export function findPageInTree(tree: PageNode[], path: string): PageNode | null {
  for (const node of tree) {
    if (node.path === path) {
      return node;
    }
    const found = findPageInTree(node.children, path);
    if (found) return found;
  }
  return null;
}
export function buildBreadcrumbs(tree: PageNode[], pageId: string): PageNode[] {
  const path: PageNode[] = [];
  function find(nodes: PageNode[], id: string): boolean {
    for (const node of nodes) {
      if (node.id === id) {
        path.unshift(node);
        return true;
      }
      if (node.children && node.children.length > 0) {
        if (find(node.children, id)) {
          path.unshift(node);
          return true;
        }
      }
    }
    return false;
  }
  find(tree, pageId);
  return path;
}