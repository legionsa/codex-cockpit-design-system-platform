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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useNavigate } from 'react-router-dom';
import { Save, Send, ChevronDown } from 'lucide-react';
interface AdminHeaderProps {
  currentPageTitle: string;
}
export function AdminHeader({ currentPageTitle }: AdminHeaderProps) {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-background sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{currentPageTitle}</h1>
        <p className="text-sm text-muted-foreground">Last saved: 2 minutes ago</p>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Publish
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`} />
                <AvatarFallback>{user?.name?.charAt(0) ?? 'A'}</AvatarFallback>
              </Avatar>
              <span>{user?.name}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
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