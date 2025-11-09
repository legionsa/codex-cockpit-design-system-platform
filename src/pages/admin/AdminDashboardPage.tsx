import React, { useEffect, useRef } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PageTree } from '@/components/admin/PageTree';
import { PageEditor } from '@/components/admin/PageEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDocsStore, useCurrentPage } from '@/hooks/use-docs-store';
import { Loader2 } from 'lucide-react';
import { EditorJSData } from '@shared/docs-types';
export function AdminDashboardPage() {
  const fetchPageTree = useDocsStore(state => state.fetchPageTree);
  const loadingState = useDocsStore(state => state.loadingState);
  const selectedPageId = useDocsStore(state => state.selectedPageId);
  const selectPage = useDocsStore(state => state.selectPage);
  const updatePageContent = useDocsStore(state => state.updatePageContent);
  const isSaving = useDocsStore(state => state.isSaving);
  const lastSaved = useDocsStore(state => state.lastSaved);
  const currentPage = useCurrentPage();
  const editorRef = useRef<{ save: () => Promise<EditorJSData | undefined> }>(null);
  useEffect(() => {
    fetchPageTree();
  }, [fetchPageTree]);
  const handleSave = async () => {
    if (editorRef.current && selectedPageId) {
      const content = await editorRef.current.save();
      if (content) {
        await updatePageContent(selectedPageId, content);
      }
    }
  };
  if (loadingState === 'loading' || loadingState === 'idle') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="h-screen w-screen flex flex-col bg-muted/40">
      <AdminHeader
        currentPageTitle={currentPage?.title || 'Dashboard'}
        onSave={handleSave}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <PageTree selectedPageId={selectedPageId} onSelectPage={selectPage} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <ScrollArea className="h-full">
            <PageEditor
              key={selectedPageId} // Re-mount editor when page changes
              page={currentPage}
              ref={editorRef}
            />
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}