import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDocsStore, useCurrentPage } from '@/hooks/use-docs-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
const metadataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});
type MetadataFormValues = z.infer<typeof metadataSchema>;
export function PageMetadataEditor() {
  const currentPage = useCurrentPage();
  const updatePageMeta = useDocsStore(state => state.updatePageMeta);
  const isSaving = useDocsStore(state => state.isSaving);
  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      title: '',
      slug: '',
    },
  });
  useEffect(() => {
    if (currentPage) {
      form.reset({
        title: currentPage.title,
        slug: currentPage.slug,
      });
    }
  }, [currentPage, form]);
  const onSubmit = (data: MetadataFormValues) => {
    if (currentPage) {
      updatePageMeta(currentPage.id, data);
    }
  };
  if (!currentPage) {
    return null;
  }
  return (
    <div className="p-4 border-t">
      <h3 className="text-md font-semibold mb-4">Page Settings</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSaving || !form.formState.isDirty} className="w-full">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Settings'}
          </Button>
        </form>
      </Form>
    </div>
  );
}