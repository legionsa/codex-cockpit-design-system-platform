import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from '@/components/docs/SidebarNav';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, SearchIcon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Search } from '@/components/search/Search';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
function SidebarContent({ onSearchClick }: { onSearchClick: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-4 px-4 md:px-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">Codex</h1>
        </div>
      </div>
      <div className="px-4 md:px-0">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground mb-4"
          onClick={onSearchClick}
        >
          <SearchIcon className="h-4 w-4 mr-2" />
          Search...
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)] px-4 md:px-0">
        <SidebarNav />
      </ScrollArea>
    </>
  );
}
export function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  const handleSearchClick = () => {
    setIsMobileNavOpen(false);
    setIsSearchOpen(true);
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle className="fixed top-4 right-4 z-50" />
      <Search open={isSearchOpen} setOpen={setIsSearchOpen} />
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 pt-8">
              <SidebarContent onSearchClick={handleSearchClick} />
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex">
          <aside className="sticky top-0 h-screen w-64 hidden md:block py-12 pr-8">
            <SidebarContent onSearchClick={() => setIsSearchOpen(true)} />
          </aside>
          <main className="flex-1 py-12 md:pl-8">
            <div className="flex justify-between">
              <Outlet />
              <TableOfContents />
            </div>
          </main>
        </div>
      </div>
      <footer className="text-center py-4 text-sm text-muted-foreground border-t">
        Built with ❤️ at Cloudflare
      </footer>
    </div>
  );
}