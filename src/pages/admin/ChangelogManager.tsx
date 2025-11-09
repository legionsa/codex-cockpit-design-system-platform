import React, { useEffect, useState, useRef } from 'react';
import { useDocsStore } from '@/hooks/use-docs-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle, Trash2, Edit, Save } from 'lucide-react';
import { ChangelogEntry, EditorJSData } from '@shared/docs-types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
const EDITOR_TOOLS = {
  paragraph: { class: Paragraph, inlineToolbar: true },
  header: Header,
  list: List,
};
function ChangelogEditor({ data, editorRef, holderId }: { data: EditorJSData, editorRef: React.MutableRefObject<EditorJS | null>, holderId: string }) {
  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: holderId,
        tools: EDITOR_TOOLS,
        data: data,
        minHeight: 150,
        placeholder: 'Describe the changes for this version...',
      });
      editorRef.current = editor;
    }
    return () => {
      if (editorRef.current?.destroy) {
        try {
          editorRef.current.destroy();
        } catch (e) {
          console.error("Error destroying EditorJS instance:", e);
        }
        editorRef.current = null;
      }
    };
  }, [data, editorRef, holderId]);
  return <div id={holderId} className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-4 min-h-[150px]" />;
}
export function ChangelogManager() {
  const {
    changelogEntries,
    changelogLoadingState,
    fetchChangelogEntries,
    addChangelogEntry,
    updateChangelogEntry,
    deleteChangelogEntry,
  } = useDocsStore(state => ({
    changelogEntries: state.changelogEntries,
    changelogLoadingState: state.changelogLoadingState,
    fetchChangelogEntries: state.fetchChangelogEntries,
    addChangelogEntry: state.addChangelogEntry,
    updateChangelogEntry: state.updateChangelogEntry,
    deleteChangelogEntry: state.deleteChangelogEntry,
  }));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<ChangelogEntry> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const editorInstance = useRef<EditorJS | null>(null);
  useEffect(() => {
    fetchChangelogEntries();
  }, [fetchChangelogEntries]);
  const handleOpenDialog = (entry: Partial<ChangelogEntry> | null = null) => {
    setEditingEntry(entry || { version: '', date: new Date().toISOString().split('T')[0] });
    setIsDialogOpen(true);
  };
  const handleSave = async () => {
    if (!editingEntry) return;
    setIsSaving(true);
    const content = await editorInstance.current?.save();
    if (!content) {
      toast.error("Could not save editor content.");
      setIsSaving(false);
      return;
    }
    const entryData = {
      ...editingEntry,
      content: {
        ...content,
        time: content.time || Date.now(),
      } as EditorJSData,
    };
    try {
      if (entryData.id) {
        await updateChangelogEntry(entryData as ChangelogEntry);
      } else {
        await addChangelogEntry(entryData as Omit<ChangelogEntry, 'id'>);
      }
      setIsDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await deleteChangelogEntry(id);
    }
  };
  return (
    <div className="h-full p-6 bg-muted/40">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Changelog Management</CardTitle>
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </CardHeader>
        <CardContent>
          {changelogLoadingState === 'loading' && <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />}
          {changelogLoadingState === 'success' && (
            <div className="space-y-4">
              {changelogEntries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                  <div>
                    <p className="font-semibold">Version {entry.version}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(entry.date), 'MMMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleOpenDialog(entry)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingEntry?.id ? 'Edit' : 'Create'} Changelog Entry</DialogTitle>
            <DialogDescription>
              Manage version information for the design system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="version" className="text-right">Version</Label>
              <Input id="version" value={editingEntry?.version || ''} onChange={e => setEditingEntry(p => ({ ...p, version: e.target.value }))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input id="date" type="date" value={editingEntry?.date ? format(new Date(editingEntry.date), 'yyyy-MM-dd') : ''} onChange={e => setEditingEntry(p => ({ ...p, date: new Date(e.target.value).toISOString() }))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Content</Label>
              <div className="col-span-3">
                {isDialogOpen && (
                  <ChangelogEditor
                    data={editingEntry?.content || { time: Date.now(), blocks: [], version: "2.29.0" }}
                    editorRef={editorInstance}
                    holderId={`changelog-editor-${editingEntry?.id || 'new'}`}
                  />
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}