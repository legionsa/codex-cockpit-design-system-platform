import { create } from 'zustand';
import { Page, PageNode, EditorJSData } from '@shared/docs-types';
import { api } from '@/lib/api-client';
import { produce } from 'immer';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
interface DocsState {
  pageTree: PageNode[];
  loadingState: LoadingState;
  error: string | null;
  selectedPageId: string | null;
  isSaving: boolean;
  lastSaved: Date | null;
  fetchPageTree: () => Promise<void>;
  selectPage: (id: string | null) => void;
  updatePageContent: (pageId: string, content: EditorJSData) => Promise<void>;
  addNewPage: (parentId: string | null) => Promise<void>;
  reorderPages: (updates: { id: string; parentId: string | null; order: number }[]) => Promise<void>;
}
const findAndGetPage = (nodes: PageNode[], id: string): PageNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findAndGetPage(node.children, id);
    if (found) return found;
  }
  return null;
};
export const useDocsStore = create<DocsState>((set, get) => ({
  pageTree: [],
  loadingState: 'idle',
  error: null,
  selectedPageId: null,
  isSaving: false,
  lastSaved: null,
  fetchPageTree: async () => {
    set({ loadingState: 'loading', error: null });
    try {
      const tree = await api<PageNode[]>('/api/docs/tree');
      set({ pageTree: tree, loadingState: 'success' });
      if (!get().selectedPageId && tree.length > 0) {
        const findFirstPage = (nodes: PageNode[]): PageNode | null => {
          if (nodes.length === 0) return null;
          return nodes[0];
        };
        const firstPage = findFirstPage(tree);
        if (firstPage) {
          set({ selectedPageId: firstPage.id });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch page tree';
      set({ loadingState: 'error', error: errorMessage });
    }
  },
  selectPage: (id: string | null) => {
    set({ selectedPageId: id });
  },
  updatePageContent: async (pageId: string, content: EditorJSData) => {
    set({ isSaving: true });
    try {
      const updatedPage = await api<Page>(`/api/docs/pages/${pageId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
      const newTree = produce(get().pageTree, draft => {
        const page = findAndGetPage(draft, pageId);
        if (page) {
          page.content = updatedPage.content;
          page.lastUpdated = updatedPage.lastUpdated;
        }
      });
      set({ pageTree: newTree, isSaving: false, lastSaved: new Date() });
    } catch (error) {
      console.error("Failed to save page", error);
      set({ isSaving: false });
    }
  },
  addNewPage: async (parentId: string | null) => {
    try {
      const newPage = await api<Page>('/api/docs/pages', {
        method: 'POST',
        body: JSON.stringify({ parentId, order: 999 }), // Order will be fixed on reorder
      });
      await get().fetchPageTree(); // Refetch tree to get correct structure
      set({ selectedPageId: newPage.id });
    } catch (error) {
      console.error("Failed to add new page", error);
    }
  },
  reorderPages: async (updates: { id: string; parentId: string | null; order: number }[]) => {
    // Optimistic update
    const originalTree = get().pageTree;
    try {
      // This is complex to do optimistically, so we'll just refetch
      await api('/api/docs/pages/reorder', {
        method: 'POST',
        body: JSON.stringify(updates),
      });
      await get().fetchPageTree();
    } catch (error) {
      console.error("Failed to reorder pages", error);
      set({ pageTree: originalTree }); // Revert on error
    }
  },
}));
// Selector to get the current page object
export const useCurrentPage = () => {
  const pageTree = useDocsStore(s => s.pageTree);
  const selectedPageId = useDocsStore(s => s.selectedPageId);
  if (!selectedPageId) return null;
  return findAndGetPage(pageTree, selectedPageId);
};