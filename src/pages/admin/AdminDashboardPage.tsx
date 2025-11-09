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
import { Loader2, Book, History } from 'lucide-react';
import { EditorJSData, Page } from '@shared/docs-types';
import { ChangePasswordDialog } from '@/components/admin/ChangePasswordDialog';
import { EditorPlaceholder } from '@/components/admin/EditorPlaceholder';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChangelogManager } from './ChangelogManager';
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
  const [mode, setMode] = useState<'pages' | 'changelog'>('pages');
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
        currentPageTitle={mode === 'pages' ? (currentPage?.title || 'Dashboard') : 'Changelog'}
        onSave={handleSave}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onOpenChangePassword={() => setIsPasswordDialogOpen(true)}
      />
      <ChangePasswordDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} />
      {mode === 'pages' ? (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full flex flex-col">
              <div className="p-2 border-b">
                <ToggleGroup type="single" value={mode} onValueChange={(value: 'pages' | 'changelog') => value && setMode(value)} className="w-full">
                  <ToggleGroupItem value="pages" aria-label="Manage Pages" className="w-1/2">
                    <Book className="h-4 w-4 mr-2" /> Pages
                  </ToggleGroupItem>
                  <ToggleGroupItem value="changelog" aria-label="Manage Changelog" className="w-1/2">
                    <History className="h-4 w-4 mr-2" /> Changelog
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
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
      ) : (
        <div className="flex-1 flex">
          <aside className="w-[20%] min-w-[250px] max-w-[400px] bg-background border-r">
            <div className="h-full flex flex-col">
              <div className="p-2 border-b">
                <ToggleGroup type="single" value={mode} onValueChange={(value: 'pages' | 'changelog') => value && setMode(value)} className="w-full">
                  <ToggleGroupItem value="pages" aria-label="Manage Pages" className="w-1/2">
                    <Book className="h-4 w-4 mr-2" /> Pages
                  </ToggleGroupItem>
                  <ToggleGroupItem value="changelog" aria-label="Manage Changelog" className="w-1/2">
                    <History className="h-4 w-4 mr-2" /> Changelog
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold">Changelog</h2>
                <p className="text-sm text-muted-foreground">Manage version history.</p>
              </div>
            </div>
          </aside>
          <main className="flex-1">
            <ChangelogManager />
          </main>
        </div>
      )}
    </div>
  );
}