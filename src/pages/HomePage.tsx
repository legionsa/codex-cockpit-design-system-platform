import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from '@/components/docs/SidebarNav';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen } from 'lucide-react';
export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle className="fixed top-4 right-4" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex">
          <aside className="sticky top-0 h-screen w-64 hidden md:block py-12 pr-8">
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold">Codex</h1>
            </div>
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <SidebarNav />
            </ScrollArea>
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
        Built with ❤�� at Cloudflare
      </footer>
    </div>
  );
}