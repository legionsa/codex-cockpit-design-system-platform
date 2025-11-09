import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PageNode } from '@shared/docs-types';
import { GripVertical, FileText, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useDocsStore } from '@/hooks/use-docs-store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
interface SortableItemProps {
  id: string;
  node: PageNode;
  selectedPageId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  depth: number;
}
function SortableItem({ id, node, selectedPageId, onSelect, onDelete, depth }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${depth * 1.5}rem`,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 group p-2 rounded-md cursor-pointer transition-colors",
        selectedPageId === id ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab p-1 -ml-1" onClick={(e) => e.stopPropagation()}>
        <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
      </button>
      <div className="flex-1 flex items-center gap-2" onClick={() => onSelect(id)}>
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-sm truncate">{node.title}</span>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the page "{node.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
interface PageTreeProps {
  selectedPageId: string | null;
  onSelectPage: (id: string) => void;
}
export function PageTree({ selectedPageId, onSelectPage }: PageTreeProps) {
  const pageTree = useDocsStore(state => state.pageTree);
  const addNewPage = useDocsStore(state => state.addNewPage);
  const reorderPages = useDocsStore(state => state.reorderPages);
  const deletePage = useDocsStore(state => state.deletePage);
  const flattenedTree = React.useMemo(() => {
    const flatten = (nodes: PageNode[], depth = 0): { id: string; depth: number; node: PageNode }[] => {
      return nodes.flatMap(node => [
        { id: node.id, depth, node },
        ...flatten(node.children, depth + 1),
      ]);
    };
    return flatten(pageTree);
  }, [pageTree]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = flattenedTree.findIndex(item => item.id === active.id);
      const newIndex = flattenedTree.findIndex(item => item.id === over.id);
      const newItems = arrayMove(flattenedTree, oldIndex, newIndex);
      const updates = newItems.map((item, index) => ({
        id: item.id,
        parentId: item.node.parentId,
        order: index,
      }));
      reorderPages(updates);
    }
  }
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Pages</h2>
        <p className="text-sm text-muted-foreground">Drag to reorder pages.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={flattenedTree.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {flattenedTree.map(({ id, depth, node }) => (
              <SortableItem
                key={id}
                id={id}
                node={node}
                selectedPageId={selectedPageId}
                onSelect={onSelectPage}
                onDelete={deletePage}
                depth={depth}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" onClick={() => addNewPage(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Page
        </Button>
      </div>
    </div>
  );
}