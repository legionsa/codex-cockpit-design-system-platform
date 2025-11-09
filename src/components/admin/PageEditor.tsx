import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import EditorJS, { EditorConfig } from '@editorjs/editorjs';
// @ts-expect-error - No official types for this community plugin
import Header from '@editorjs/header';
// @ts-expect-error - No official types for this community plugin
import List from '@editorjs/list';
// @ts-expect-error - No official types for this community plugin
import CodeTool from '@editorjs/code';
// @ts-expect-error - No official types for this community plugin
import Paragraph from '@editorjs/paragraph';
// @ts-expect-error - No official types for this community plugin
import Embed from '@editorjs/embed';
// @ts-expect-error - No official types for this community plugin
import Table from '@editorjs/table';
// @ts-expect-error - No official types for this community plugin
import Checklist from '@editorjs/checklist';
// @ts-expect-error - No official types for this community plugin
import Quote from '@editorjs/quote';
// @ts-expect-error - No official types for this community plugin
import Warning from '@editorjs/warning';
// @ts-expect-error - No official types for this community plugin
import Delimiter from '@editorjs/delimiter';
import { PageNode, EditorJSData } from '@shared/docs-types';
const EDITOR_JS_TOOLS = {
  paragraph: { class: Paragraph, inlineToolbar: true },
  header: Header,
  list: List,
  code: CodeTool,
  embed: Embed,
  table: Table,
  checklist: Checklist,
  quote: Quote,
  warning: Warning,
  delimiter: Delimiter,
};
interface PageEditorProps {
  page: PageNode | null;
}
export const PageEditor = forwardRef<{ save: () => Promise<EditorJSData | undefined> }, PageEditorProps>(({ page }, ref) => {
  const editorInstance = useRef<EditorJS | null>(null);
  const editorHolderId = `editorjs-${page?.id || 'new'}`;
  useImperativeHandle(ref, () => ({
    save: async () => {
      if (editorInstance.current) {
        const outputData = await editorInstance.current.save();
        // Ensure the time property is always present
        return {
          ...outputData,
          time: outputData.time || Date.now(),
        } as EditorJSData;
      }
    },
  }));
  useEffect(() => {
    if (page && !editorInstance.current) {
      const editor = new EditorJS({
        holder: editorHolderId,
        tools: EDITOR_JS_TOOLS,
        data: page.content,
        autofocus: true,
        placeholder: 'Start writing your documentation...',
        onChange: () => {
          // Could implement auto-save here
        },
      });
      editorInstance.current = editor;
    }
    return () => {
      if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
        try {
          editorInstance.current.destroy();
        } catch (e) {
          console.error("Error destroying EditorJS instance:", e);
        }
        editorInstance.current = null;
      }
    };
  }, [page, editorHolderId]);
  if (!page) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-8">
        <p>Select a page from the sidebar to start editing, or create a new one.</p>
      </div>
    );
  }
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none mx-auto py-8 px-12">
      <div id={editorHolderId} />
    </div>
  );
});