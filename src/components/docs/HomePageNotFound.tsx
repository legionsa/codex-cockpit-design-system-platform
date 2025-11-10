import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
export function HomePageNotFound() {
  return (
    <div className="flex items-center justify-center w-full py-20">
      <Card className="w-full max-w-lg text-center animate-fade-in">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BookOpen className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Codex!</CardTitle>
          <CardDescription className="text-muted-foreground">
            It looks like the home page for your design system hasn't been created yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            To get started, please log in to the admin dashboard and create your first page. This will become the landing page for your documentation site.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}