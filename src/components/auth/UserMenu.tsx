import { useState } from 'react';
import { LogOut, User, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserMenuProps {
  variant?: 'sidebar' | 'header';
  isCollapsed?: boolean;
}

export function UserMenu({ variant = 'sidebar', isCollapsed = false }: UserMenuProps) {
  const { user, profile, isAuthenticated, openAuthModal, signOut, credits, freeCredits, paidCredits } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated || !user) {
    // Not authenticated - show login button
    return (
      <Button
        variant="outline"
        size={variant === 'header' ? 'sm' : 'default'}
        onClick={openAuthModal}
        className={`
          ${variant === 'header' 
            ? 'border-amber-500/50 text-amber-700 hover:bg-amber-50 hover:border-amber-500' 
            : 'w-full border-slate-300 text-slate-600 hover:bg-slate-50'
          }
          ${isCollapsed ? 'px-2' : ''}
        `}
      >
        <User className="w-4 h-4" />
        {!isCollapsed && <span className="ml-2">Se connecter</span>}
      </Button>
    );
  }

  // Get user display info
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Utilisateur';
  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = displayName.substring(0, 2).toUpperCase();

  if (isCollapsed) {
    // Collapsed sidebar - just show avatar
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-center p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2">
            <p className="font-medium text-sm text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <div className="px-3 py-2 bg-amber-50 rounded-md mx-2 mb-2">
            <div className="flex items-center gap-2 text-amber-700">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{credits} crédits</span>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              {freeCredits > 0 && `${freeCredits} gratuits`}
              {freeCredits > 0 && paidCredits > 0 && ' + '}
              {paidCredits > 0 && `${paidCredits} payants`}
            </p>
          </div>
          <DropdownMenuItem 
            onClick={() => signOut()}
            className="text-red-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full sidebar or header view
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button 
          className={`
            flex items-center gap-3 w-full rounded-xl transition-all duration-200
            ${variant === 'header' 
              ? 'px-3 py-2 hover:bg-slate-100' 
              : 'px-4 py-3 hover:bg-slate-50 border border-slate-200'
            }
          `}
        >
          <Avatar className="w-9 h-9">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-amber-100 text-amber-700 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Sparkles className="w-3 h-3" />
              <span>{credits} crédits</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <p className="font-medium text-sm text-slate-900">{displayName}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <div className="px-3 py-2 bg-amber-50 rounded-md mx-2 mb-2">
          <div className="flex items-center gap-2 text-amber-700">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">{credits} crédits élèves</span>
          </div>
          <p className="text-xs text-amber-600 mt-1">
            {freeCredits > 0 && `${freeCredits} gratuits`}
            {freeCredits > 0 && paidCredits > 0 && ' + '}
            {paidCredits > 0 && `${paidCredits} payants`}
            {credits === 0 && 'Aucun crédit restant'}
          </p>
        </div>
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="text-red-600 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
