import React, { useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PageTree } from '@/components/admin/PageTree';
import { PageEditor } from '@/components/admin/PageEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MOCK_PAGES } from '@shared/docs-mock-data';
export function AdminDashboardPage() {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(MOCK_PAGES[0]?.id || null);
  const currentPage = MOCK_PAGES.find(p => p.id === selectedPageId);
  return (
    <div className="h-screen w-screen flex flex-col bg-muted/40">
      <AdminHeader currentPageTitle={currentPage?.title || 'Dashboard'} />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <PageTree selectedPageId={selectedPageId} onSelectPage={setSelectedPageId} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <ScrollArea className="h-full">
            <PageEditor pageId={selectedPageId} />
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}