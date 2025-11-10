import React, { useState } from 'react';
import { EditorJSData, EditorJSBlock } from '@shared/docs-types';
import { Button } from '@/components/ui/button';
import { Check, Clipboard } from 'lucide-react';
import { useCopyToClipboard } from 'react-use';
const CodeBlock = ({ code }: { code: string }) => {
  const [state, copyToClipboard] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative my-4 rounded-lg bg-muted font-mono text-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <p className="text-xs text-muted-foreground">CODE</p>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};
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
      return <CodeBlock key={block.id} code={block.data.code} />;
    case 'embed': {
      if (block.data.service === 'figma') {
        return (
          <div key={block.id} className="my-4 aspect-video w-full overflow-hidden rounded-lg border">
            <iframe
              style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
              width="100%"
              height="100%"
              src={block.data.source}
              allowFullScreen
              sandbox="allow-scripts allow-same-origin"
            ></iframe>
          </div>
        );
      }
      return null;
    }
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