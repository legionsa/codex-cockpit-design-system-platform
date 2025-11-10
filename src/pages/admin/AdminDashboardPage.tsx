import React, { useEffect, useRef, useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PageTree } from '@/components/admin/PageTree';
import { PageEditor } from '@/components/admin/PageEditor';
import { PageMetadataEditor } from '@/components/admin/PageMetadataEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDocsStore, useCurrentPage } from '@/hooks/use-docs-store';
import { Loader2 } from 'lucide-react';
import { EditorJSData, Page } from '@shared/docs-types';
import { ChangePasswordDialog } from '@/components/admin/ChangePasswordDialog';
import { EditorPlaceholder } from '@/components/admin/EditorPlaceholder';
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
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  useEffect(() => {
    fetchPageTree();
  }, [fetchPageTree]);
  const handleSave = async (status: Page['status'] = 'Draft') => {
    if (editorRef.current && selectedPageId) {
      const content = await editorRef.current.save();
      if (content) {
        await updatePageContent(selectedPageId, content, status);
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
        onOpenChangePassword={() => setIsPasswordDialogOpen(true)}
      />
      <ChangePasswordDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full flex flex-col">
                <ScrollArea className="flex-1">
                    <PageTree selectedPageId={selectedPageId} onSelectPage={selectPage} />
                </ScrollArea>
                <PageMetadataEditor />
            </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <ScrollArea className="h-full">
            {currentPage ? (
              <PageEditor
                key={selectedPageId} // Re-mount editor when page changes
                page={currentPage}
                ref={editorRef}
              />
            ) : (
              <EditorPlaceholder />
            )}
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}