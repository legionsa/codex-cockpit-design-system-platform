import React, { useState } from 'react';
import { EditorJSData, EditorJSBlock } from '@shared/docs-types';
import { Button } from '@/components/ui/button';
import { Check, Clipboard, AlertTriangle } from 'lucide-react';
import { useCopyToClipboard } from 'react-use';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
const CodeBlock = ({ code }: { code: string }) => {
  const [, copyToClipboard] = useCopyToClipboard();
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
    case 'table': {
      const { withHeadings, content } = block.data;
      const head = withHeadings ? content[0] : null;
      const body = withHeadings ? content.slice(1) : content;
      return (
        <div key={block.id} className="my-6 overflow-x-auto">
          <Table>
            {head && (
              <TableHeader>
                <TableRow>
                  {head.map((cell: string, i: number) => <TableHead key={i} dangerouslySetInnerHTML={{ __html: cell }} />)}
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {body.map((row: string[], i: number) => (
                <TableRow key={i}>
                  {row.map((cell: string, j: number) => <TableCell key={j} dangerouslySetInnerHTML={{ __html: cell }} />)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    case 'quote':
      return (
        <blockquote key={block.id} className="border-l-4 pl-4 italic my-4">
          <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
          {block.data.caption && <footer className="text-sm text-muted-foreground mt-2" dangerouslySetInnerHTML={{ __html: block.data.caption }} />}
        </blockquote>
      );
    case 'warning':
      return (
        <Alert key={block.id} variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{block.data.title}</AlertTitle>
          <AlertDescription dangerouslySetInnerHTML={{ __html: block.data.message }} />
        </Alert>
      );
    case 'checklist':
      return (
        <div key={block.id} className="space-y-2 my-4">
          {block.data.items.map((item: { text: string; checked: boolean }, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <Checkbox checked={item.checked} disabled />
              <span className={item.checked ? 'line-through text-muted-foreground' : ''} dangerouslySetInnerHTML={{ __html: item.text }} />
            </div>
          ))}
        </div>
      );
    case 'delimiter':
      return <hr key={block.id} className="my-8 border-dashed" />;
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