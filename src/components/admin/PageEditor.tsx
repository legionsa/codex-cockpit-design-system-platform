import React, { useEffect, useRef } from 'react';
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import CodeTool from '@editorjs/code';
// @ts-ignore
import Paragraph from '@editorjs/paragraph';
// @ts-ignore
import Embed from '@editorjs/embed';
// @ts-ignore
import Table from '@editorjs/table';
// @ts-ignore
import Checklist from '@editorjs/checklist';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import Warning from '@editorjs/warning';
// @ts-ignore
import Delimiter from '@editorjs/delimiter';
import { MOCK_PAGES } from '@shared/docs-mock-data';
import { Page } from '@shared/docs-types';
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
  pageId: string | null;
}
export function PageEditor({ pageId }: PageEditorProps) {
  const editorInstance = useRef<EditorJS | null>(null);
  const [pageData, setPageData] = React.useState<Page | null>(null);
  useEffect(() => {
    const data = MOCK_PAGES.find(p => p.id === pageId) || null;
    setPageData(data);
  }, [pageId]);
  useEffect(() => {
    if (pageData && !editorInstance.current) {
      const editor = new EditorJS({
        holder: 'editorjs',
        tools: EDITOR_JS_TOOLS,
        data: pageData.content,
        autofocus: true,
        placeholder: 'Let`s write an awesome story!',
      });
      editorInstance.current = editor;
    }
    return () => {
      if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, [pageData]);
  if (!pageId || !pageData) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a page from the sidebar to start editing.</p>
      </div>
    );
  }
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none mx-auto py-8 px-12">
      <div id="editorjs" />
    </div>
  );
}