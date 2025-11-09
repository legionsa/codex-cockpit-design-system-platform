import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse, { type FuseResult } from 'fuse.js';
import { Page } from '@shared/docs-types';
import { getAllPages } from '@/lib/docs';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { FileText } from 'lucide-react';
export function Search({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [fuse, setFuse] = useState<Fuse<Page> | null>(null);
  const [results, setResults] = useState<FuseResult<Page>[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    getAllPages().then(data => {
      setPages(data);
      setFuse(new Fuse(data, {
        keys: ['title', 'content.blocks.data.text' as any],
        includeScore: true,
        threshold: 0.4,
      }));
    });
  }, []);
  const handleSearch = (query: string) => {
    if (fuse && query) {
      setResults(fuse.search(query));
    } else {
      setResults([]);
    }
  };
  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
  };
  // This is a helper to find the path. A better solution would be to have the path in the search data.
  const findPathForPage = (pageId: string, pages: Page[]): string => {
      const pageMap = new Map(pages.map(p => [p.id, p]));
      let current = pageMap.get(pageId);
      if (!current) return 'home';
      const pathParts: string[] = [current.slug];
      while(current?.parentId && pageMap.has(current.parentId)) {
          current = pageMap.get(current.parentId);
          if (current) {
            pathParts.unshift(current.slug);
          }
      }
      return pathParts.join('/');
  }
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search documentation..." onValueChange={handleSearch} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {results.map(({ item }) => (
            <CommandItem
              key={item.id}
              onSelect={() => handleSelect(`/docs/${findPathForPage(item.id, pages)}`)}
              value={item.title}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}