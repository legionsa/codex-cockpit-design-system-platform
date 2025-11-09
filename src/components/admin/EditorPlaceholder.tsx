import React from 'react';
import { FilePlus2, MousePointerClick } from 'lucide-react';
import { useDocsStore } from '@/hooks/use-docs-store';
export function EditorPlaceholder() {
  const addNewPage = useDocsStore(state => state.addNewPage);
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
      <div className="p-4 bg-muted rounded-full mb-4">
        <MousePointerClick className="h-10 w-10 text-foreground" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">Select a page to edit</h2>
      <p className="max-w-md mb-6">
        Choose a page from the sidebar on the left to begin editing its content. Your changes will be saved automatically as you work.
      </p>
      <div className="flex items-center justify-center text-sm">
        <span className="mr-4">Or create a new one</span>
        <button
          onClick={() => addNewPage(null)}
          className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <FilePlus2 className="h-4 w-4" />
          New Page
        </button>
      </div>
    </div>
  );
}