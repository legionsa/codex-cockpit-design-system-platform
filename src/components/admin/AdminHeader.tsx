import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useDocsStore, useCurrentPage } from '@/hooks/use-docs-store';
import { useNavigate } from 'react-router-dom';
import { Save, Send, ChevronDown, Loader2, MoreVertical, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Page } from '@shared/docs-types';
interface AdminHeaderProps {
  currentPageTitle: string;
  onSave: (status: Page['status']) => void;
  isSaving: boolean;
  lastSaved: Date | null;
}
export function AdminHeader({ currentPageTitle, onSave, isSaving, lastSaved }: AdminHeaderProps) {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const deletePage = useDocsStore(state => state.deletePage);
  const selectedPageId = useDocsStore(state => state.selectedPageId);
  const currentPage = useCurrentPage();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  const handleDelete = () => {
    if (selectedPageId) {
      deletePage(selectedPageId);
    }
  };
  const getSaveStatus = () => {
    if (isSaving) return 'Saving...';
    if (lastSaved) return `Saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}`;
    return 'Not saved yet';
  };
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-background sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-foreground truncate max-w-xs md:max-w-md">{currentPageTitle}</h1>
        <p className="text-sm text-muted-foreground">{getSaveStatus()}</p>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="outline" onClick={() => onSave('Draft')} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Draft
        </Button>
        <Button onClick={() => onSave('Published')} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Publish
        </Button>
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Page Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem disabled={!selectedPageId} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Page
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the page "{currentPage?.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`} />
                <AvatarFallback>{user?.name?.charAt(0) ?? 'A'}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{user?.name}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}