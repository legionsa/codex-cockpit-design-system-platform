import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPageBySlug, getPageTree, buildBreadcrumbs } from '@/lib/docs';
import { PageNode } from '@shared/docs-types';
import { EditorRenderer } from '@/components/docs/EditorRenderer';
import { Breadcrumbs } from '@/components/docs/Breadcrumbs';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { HomePageNotFound } from '@/components/docs/HomePageNotFound';
function DocsPageSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="h-6 w-1/2 mb-6" />
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-8 w-1/2 mt-4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    </div>
  );
}
export function DocsPage() {
  const params = useParams();
  const slug = params['*'] || 'home';
  const [page, setPage] = useState<PageNode | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<PageNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHomeNotFound, setIsHomeNotFound] = useState(false);
  useEffect(() => {
    async function loadPageData() {
      setLoading(true);
      setError(null);
      setIsHomeNotFound(false);
      try {
        const [pageData, treeData] = await Promise.all([
          getPageBySlug(slug),
          getPageTree(),
        ]);
        if (pageData) {
          setPage(pageData);
          setBreadcrumbs(buildBreadcrumbs(treeData, pageData.id));
        } else {
          if (slug === 'home') {
            setIsHomeNotFound(true);
          } else {
            setError(`The page for "${slug}" could not be found.`);
          }
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching the page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPageData();
  }, [slug]);
  if (loading) {
    return (
      <div className="flex-1 min-w-0">
        <DocsPageSkeleton />
      </div>
    );
  }
  if (isHomeNotFound) {
    return (
      <div className="flex-1 min-w-0">
        <HomePageNotFound />
      </div>
    );
  }
  return (
    <div className="flex-1 min-w-0">
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : page ? (
        <>
          <Breadcrumbs items={breadcrumbs} />
          <EditorRenderer data={page.content} />
        </>
      ) : null}
    </div>
  );
}