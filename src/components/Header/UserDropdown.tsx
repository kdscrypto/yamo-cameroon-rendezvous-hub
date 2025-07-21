
import { Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User as UserIcon, LogOut, LayoutDashboard, Gift, BarChart3 } from "lucide-react";
import { NotificationBadge } from "@/components/ui/notification-badge";

interface UserDropdownProps {
  user: User;
  unreadCount: number;
  onLogout: () => void;
}

const UserDropdown = ({ user, unreadCount, onLogout }: UserDropdownProps) => {
  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user?.email?.split("@")[0] || "Utilisateur";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-yellow-400 text-black font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          {unreadCount > 0 && (
            <NotificationBadge count={unreadCount} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-neutral-800 border-yellow-400/30 shadow-lg" 
        align="end" 
        forceMount
      >
        <DropdownMenuLabel className="font-normal bg-neutral-750 border-b border-yellow-400/20 pb-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-yellow-300">
              {getUserDisplayName()}
            </p>
            <p className="text-xs leading-none text-yellow-400/80">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-yellow-400/20" />
        <DropdownMenuItem asChild>
          <Link 
            to="/dashboard" 
            className="cursor-pointer text-yellow-200 hover:text-yellow-100 hover:bg-yellow-400/10 focus:bg-yellow-400/10 focus:text-yellow-100 transition-colors"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span className="font-medium">Tableau de bord</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link 
            to="/profile" 
            className="cursor-pointer text-yellow-200 hover:text-yellow-100 hover:bg-yellow-400/10 focus:bg-yellow-400/10 focus:text-yellow-100 transition-colors"
          >
            <UserIcon className="mr-2 h-4 w-4" />
            <span className="font-medium">Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link 
            to="/referral" 
            className="cursor-pointer text-yellow-200 hover:text-yellow-100 hover:bg-yellow-400/10 focus:bg-yellow-400/10 focus:text-yellow-100 transition-colors"
          >
            <Gift className="mr-2 h-4 w-4" />
            <span className="font-medium">Parrainage</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link 
            to="/analytics" 
            className="cursor-pointer text-yellow-200 hover:text-yellow-100 hover:bg-yellow-400/10 focus:bg-yellow-400/10 focus:text-yellow-100 transition-colors"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span className="font-medium">Analytics</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-yellow-400/20" />
        <DropdownMenuItem 
          onClick={onLogout} 
          className="cursor-pointer text-red-300 hover:text-red-200 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-200 transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-medium">Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
