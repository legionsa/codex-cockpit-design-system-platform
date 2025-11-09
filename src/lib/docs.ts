import { api } from '@/lib/api-client';
import { Page, PageNode } from '@shared/docs-types';
// Cached tree to avoid refetching on every navigation
let pageTreeCache: PageNode[] | null = null;
export async function getPageTree(forceRefresh = false): Promise<PageNode[]> {
  if (pageTreeCache && !forceRefresh) {
    return pageTreeCache;
  }
  try {
    const tree = await api<PageNode[]>('/api/docs/tree');
    pageTreeCache = tree;
    return tree;
  } catch (error) {
    console.error('Failed to fetch page tree:', error);
    return [];
  }
}
export async function getPageBySlug(slug: string): Promise<PageNode | null> {
  try {
    return await api<PageNode>(`/api/docs/page/${encodeURIComponent(slug)}`);
  } catch (error) {
    console.error(`Failed to fetch page by slug: ${slug}`, error);
    return null;
  }
}
export function buildBreadcrumbs(tree: PageNode[], pageId: string): PageNode[] {
  const path: PageNode[] = [];
  function findNode(nodes: PageNode[], id: string, currentPath: PageNode[]): boolean {
    for (const node of nodes) {
      const newPath = [...currentPath, node];
      if (node.id === id) {
        path.push(...newPath);
        return true;
      }
      if (node.children && findNode(node.children, id, newPath)) {
        return true;
      }
    }
    return false;
  }
  findNode(tree, pageId, []);
  return path;
}
export async function getAllPages(): Promise<Page[]> {
    try {
        return await api<Page[]>('/api/docs/pages');
    } catch (error) {
        console.error('Failed to fetch all pages:', error);
        return [];
    }
}