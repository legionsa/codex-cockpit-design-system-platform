import React from 'react';
import { Link } from 'react-router-dom';
import { PageNode } from '@shared/docs-types';
import { ChevronRight } from 'lucide-react';
interface BreadcrumbsProps {
  items: PageNode[];
}
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <li>
              {index < items.length - 1 ? (
                <Link to={`/docs/${item.path}`} className="hover:text-foreground transition-colors">
                  {item.title}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{item.title}</span>
              )}
            </li>
            {index < items.length - 1 && (
              <li>
                <ChevronRight className="h-4 w-4" />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}