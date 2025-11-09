import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import EditorJS, { EditorConfig } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import CodeTool from '@editorjs/code';
import Paragraph from '@editorjs/paragraph';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import Warning from '@editorjs/warning';
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
      });
      editorInstance.current = editor;
    }
    return () => {
      if (editorInstance.current?.destroy) {
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