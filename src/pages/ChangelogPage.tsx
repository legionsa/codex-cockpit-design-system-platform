import React, { useEffect, useState } from 'react';
import { ChangelogEntry } from '@shared/docs-types';
import { api } from '@/lib/api-client';
import { EditorRenderer } from '@/components/docs/EditorRenderer';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, History } from 'lucide-react';
import { format } from 'date-fns';
function ChangelogSkeleton() {
  return (
    <div className="space-y-12">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-8 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/3 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
export function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function loadChangelog() {
      setLoading(true);
      setError(null);
      try {
        const data = await api<ChangelogEntry[]>('/api/docs/changelog');
        setEntries(data);
      } catch (err) {
        setError('An unexpected error occurred while fetching the changelog.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadChangelog();
  }, []);
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl flex items-center gap-3">
          <History className="h-10 w-10" />
          Changelog
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Stay up to date with the latest changes and improvements to the Cockpit Design System.
        </p>
      </div>
      {loading ? (
        <ChangelogSkeleton />
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-16">
          {entries.map(entry => (
            <article key={entry.id} className="relative">
              <div className="absolute -left-8 top-1 hidden md:block">
                <div className="h-4 w-4 rounded-full bg-primary" />
                <div className="h-full w-0.5 bg-border -translate-x-px translate-y-1" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Version {entry.version}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {format(new Date(entry.date), 'MMMM d, yyyy')}
                </p>
                <EditorRenderer data={entry.content} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}