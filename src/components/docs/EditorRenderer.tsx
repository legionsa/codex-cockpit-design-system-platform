import React from 'react';
import { EditorJSData, EditorJSBlock } from '@shared/docs-types';
const renderBlock = (block: EditorJSBlock) => {
  switch (block.type) {
    case 'header': {
      const Tag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
      const id = block.data.text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      return <Tag key={block.id} id={id} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
    }
    case 'paragraph':
      return <p key={block.id} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
    case 'list': {
      const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag key={block.id}>
          {block.data.items.map((item: string, index: number) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ListTag>
      );
    }
    case 'code':
      return (
        <pre key={block.id} className="bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
          <code>{block.data.code}</code>
        </pre>
      );
    default:
      console.warn(`Unsupported block type: ${block.type}`);
      return null;
  }
};
interface EditorRendererProps {
  data: EditorJSData;
}
export function EditorRenderer({ data }: EditorRendererProps) {
  if (!data || !data.blocks) {
    return null;
  }
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {data.blocks.map(block => renderBlock(block))}
    </div>
  );
}