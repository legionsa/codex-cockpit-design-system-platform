import React, { useState, useEffect } from 'react';
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
import { getPageTree } from '@/lib/docs';
import { PageNode } from '@shared/docs-types';
import { GripVertical, FileText, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
interface SortableItemProps {
  id: string;
  node: PageNode;
  selectedPageId: string | null;
  onSelect: (id: string) => void;
  depth: number;
}
function SortableItem({ id, node, selectedPageId, onSelect, depth }: SortableItemProps) {
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
      onClick={() => onSelect(id)}
    >
      <button {...attributes} {...listeners} className="cursor-grab p-1">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <FileText className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm truncate">{node.title}</span>
    </div>
  );
}
interface PageTreeProps {
  selectedPageId: string | null;
  onSelectPage: (id: string) => void;
}
export function PageTree({ selectedPageId, onSelectPage }: PageTreeProps) {
  const [pageTree, setPageTree] = useState<PageNode[]>([]);
  const [flattenedTree, setFlattenedTree] = useState<{ id: string; depth: number; node: PageNode }[]>([]);
  useEffect(() => {
    getPageTree().then(tree => {
      setPageTree(tree);
    });
  }, []);
  useEffect(() => {
    const flatten = (nodes: PageNode[], depth = 0): { id: string; depth: number; node: PageNode }[] => {
      return nodes.flatMap(node => [
        { id: node.id, depth, node },
        ...flatten(node.children, depth + 1),
      ]);
    };
    setFlattenedTree(flatten(pageTree));
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
      setFlattenedTree((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      // In a real app, you would update the page order/parent on the backend here.
    }
  }
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Pages</h2>
        <p className="text-sm text-muted-foreground">Drag to reorder and nest pages.</p>
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
                depth={depth}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Page
        </Button>
      </div>
    </div>
  );
}