import { create } from 'zustand';
import { Page, PageNode, EditorJSData, ChangelogEntry } from '@shared/docs-types';
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
  updatePageContent: (pageId: string, content: EditorJSData, status: Page['status']) => Promise<void>;
  updatePageMeta: (pageId: string, meta: { title: string; slug: string }) => Promise<void>;
  addNewPage: (parentId: string | null) => Promise<void>;
  reorderPages: (updates: { id: string; parentId: string | null; order: number }[]) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  // Changelog state
  changelogEntries: ChangelogEntry[];
  changelogLoadingState: LoadingState;
  changelogError: string | null;
  fetchChangelogEntries: () => Promise<void>;
  addChangelogEntry: (entry: Omit<ChangelogEntry, 'id'>) => Promise<void>;
  updateChangelogEntry: (entry: ChangelogEntry) => Promise<void>;
  deleteChangelogEntry: (id: string) => Promise<void>;
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
  updatePageContent: async (pageId: string, content: EditorJSData, status: Page['status']) => {
    set({ isSaving: true });
    try {
      const updatedPage = await api<Page>(`/api/docs/pages/${pageId}`, {
        method: 'PUT',
        body: JSON.stringify({ content, status }),
      });
      const newTree = produce(get().pageTree, draft => {
        const page = findAndGetPage(draft, pageId);
        if (page) {
          page.content = updatedPage.content;
          page.status = updatedPage.status;
          page.lastUpdated = updatedPage.lastUpdated;
        }
      });
      set({ pageTree: newTree, isSaving: false, lastSaved: new Date() });
      toast.success(`Page ${status === 'Published' ? 'published' : 'saved'} successfully!`);
    } catch (error) {
      console.error("Failed to save page", error);
      set({ isSaving: false });
      toast.error('Failed to save page.');
    }
  },
  updatePageMeta: async (pageId: string, meta: { title: string; slug: string }) => {
    set({ isSaving: true });
    try {
        const updatedPage = await api<Page>(`/api/docs/pages/${pageId}`, {
            method: 'PUT',
            body: JSON.stringify(meta),
        });
        await get().fetchPageTree();
        set({ isSaving: false, lastSaved: new Date() });
        toast.success('Page settings saved.');
    } catch (error) {
        console.error("Failed to update page metadata", error);
        set({ isSaving: false });
        toast.error('Failed to save settings.');
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
    try {
      await api('/api/docs/pages/reorder', {
        method: 'POST',
        body: JSON.stringify(updates),
      });
      await get().fetchPageTree();
      toast.success('Page order saved.');
    } catch (error) {
      console.error("Failed to reorder pages", error);
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
  // Changelog implementation
  changelogEntries: [],
  changelogLoadingState: 'idle',
  changelogError: null,
  fetchChangelogEntries: async () => {
    set({ changelogLoadingState: 'loading' });
    try {
      const entries = await api<ChangelogEntry[]>('/api/docs/changelog');
      set({ changelogEntries: entries, changelogLoadingState: 'success' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch changelog';
      set({ changelogLoadingState: 'error', changelogError: msg });
      toast.error(msg);
    }
  },
  addChangelogEntry: async (entry) => {
    try {
      const newEntry = await api<ChangelogEntry>('/api/docs/changelog', {
        method: 'POST',
        body: JSON.stringify(entry),
      });
      set(state => ({ changelogEntries: [newEntry, ...state.changelogEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }));
      toast.success('Changelog entry created.');
    } catch (error) {
      toast.error('Failed to create changelog entry.');
      throw error;
    }
  },
  updateChangelogEntry: async (entry) => {
    try {
      const updatedEntry = await api<ChangelogEntry>(`/api/docs/changelog/${entry.id}`, {
        method: 'PUT',
        body: JSON.stringify(entry),
      });
      set(state => ({
        changelogEntries: state.changelogEntries.map(e => e.id === entry.id ? updatedEntry : e)
      }));
      toast.success('Changelog entry updated.');
    } catch (error) {
      toast.error('Failed to update changelog entry.');
      throw error;
    }
  },
  deleteChangelogEntry: async (id) => {
    try {
      await api(`/api/docs/changelog/${id}`, { method: 'DELETE' });
      set(state => ({
        changelogEntries: state.changelogEntries.filter(e => e.id !== id)
      }));
      toast.success('Changelog entry deleted.');
    } catch (error) {
      toast.error('Failed to delete changelog entry.');
      throw error;
    }
  },
}));
export const useCurrentPage = () => {
  const pageTree = useDocsStore(s => s.pageTree);
  const selectedPageId = useDocsStore(s => s.selectedPageId);
  if (!selectedPageId) return null;
  return findAndGetPage(pageTree, selectedPageId);
};