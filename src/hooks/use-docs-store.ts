import { create } from 'zustand';
import { Page, PageNode, EditorJSData } from '@shared/docs-types';
import { api } from '@/lib/api-client';
import { produce } from 'immer';
import { toast } from 'sonner';
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
  deletePage: (pageId: string) => Promise<void>;
}
const findAndGetPage = (nodes: PageNode[], id: string): PageNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findAndGetPage(node.children, id);
    if (found) return found;
  }
  return null;
};
const findAndRemovePage = (nodes: PageNode[], id: string): PageNode[] => {
  return nodes.filter(node => node.id !== id).map(node => ({
    ...node,
    children: findAndRemovePage(node.children, id),
  }));
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
      toast.success('Page saved successfully!');
    } catch (error) {
      console.error("Failed to save page", error);
      set({ isSaving: false });
      toast.error('Failed to save page.');
    }
  },
  addNewPage: async (parentId: string | null) => {
    try {
      const newPage = await api<Page>('/api/docs/pages', {
        method: 'POST',
        body: JSON.stringify({ parentId, order: 999 }),
      });
      await get().fetchPageTree();
      set({ selectedPageId: newPage.id });
      toast.success('New page created.');
    } catch (error) {
      console.error("Failed to add new page", error);
      toast.error('Failed to create new page.');
    }
  },
  reorderPages: async (updates: { id: string; parentId: string | null; order: number }[]) => {
    const originalTree = get().pageTree;
    try {
      await api('/api/docs/pages/reorder', {
        method: 'POST',
        body: JSON.stringify(updates),
      });
      await get().fetchPageTree();
      toast.success('Page order saved.');
    } catch (error) {
      console.error("Failed to reorder pages", error);
      set({ pageTree: originalTree });
      toast.error('Failed to save new order.');
    }
  },
  deletePage: async (pageId: string) => {
    const originalTree = get().pageTree;
    const newTree = findAndRemovePage(originalTree, pageId);
    set({ pageTree: newTree });
    if (get().selectedPageId === pageId) {
      set({ selectedPageId: null });
    }
    try {
      await api(`/api/docs/pages/${pageId}`, { method: 'DELETE' });
      toast.success('Page deleted.');
    } catch (error) {
      console.error("Failed to delete page", error);
      set({ pageTree: originalTree });
      toast.error('Failed to delete page.');
    }
  },
}));
export const useCurrentPage = () => {
  const pageTree = useDocsStore(s => s.pageTree);
  const selectedPageId = useDocsStore(s => s.selectedPageId);
  if (!selectedPageId) return null;
  return findAndGetPage(pageTree, selectedPageId);
};