import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PageNode } from '@shared/docs-types';
import { getPageTree } from '@/lib/docs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, Loader2, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
interface NavLinkProps {
  node: PageNode;
  currentPath: string;
}
function NavLink({ node, currentPath }: NavLinkProps) {
  const isActive = currentPath === `/docs/${node.path}`;
  const hasChildren = node.children && node.children.length > 0;
  const isParentOfActive = currentPath.startsWith(`/docs/${node.path}/`);
  const [isOpen, setIsOpen] = useState(isParentOfActive);
  useEffect(() => {
    setIsOpen(isParentOfActive);
  }, [isParentOfActive]);
  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <Link
            to={`/docs/${node.path}`}
            className={cn(
              'flex-1 text-sm py-2 rounded-md transition-colors',
              isActive ? 'font-semibold text-primary' : 'text-foreground/80 hover:text-foreground'
            )}
          >
            {node.title}
          </Link>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ChevronRight className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-90')} />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="pl-4 border-l border-border ml-2">
          <div className="flex flex-col space-y-1 mt-1">
            {node.children.map(child => (
              <NavLink key={child.id} node={child} currentPath={currentPath} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }
  return (
    <Link
      to={`/docs/${node.path}`}
      className={cn(
        'block text-sm py-2 rounded-md transition-colors',
        isActive ? 'font-semibold text-primary' : 'text-foreground/80 hover:text-foreground'
      )}
    >
      {node.title}
    </Link>
  );
}
export function SidebarNav() {
  const [tree, setTree] = useState<PageNode[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  useEffect(() => {
    getPageTree()
      .then(data => {
        setTree(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load page tree", err);
        setLoading(false);
      });
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <nav className="flex flex-col space-y-1">
      {tree.map(node => (
        <NavLink key={node.id} node={node} currentPath={location.pathname} />
      ))}
      <Separator className="my-4" />
      <Link
        to="/docs/changelog"
        className={cn(
          'flex items-center gap-2 text-sm py-2 rounded-md transition-colors',
          location.pathname === '/docs/changelog' ? 'font-semibold text-primary' : 'text-foreground/80 hover:text-foreground'
        )}
      >
        <History className="h-4 w-4" />
        <span>Changelog</span>
      </Link>
    </nav>
  );
}