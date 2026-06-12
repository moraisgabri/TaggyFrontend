import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileModal } from "./ProfileModal";
import { ChevronDown, LogOut, UserIcon } from "lucide-react";
import logo from "@/assets/TAGGY_LOGO.png";

export function AppHeader() {
  const { user, signOut, setUserState } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = user?.name?.trim() || user?.email || "Conta";

  return (
    <header className="text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 pt-5 ">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 font-bold text-xl hover:opacity-90 transition-opacity"
        >
          <img src={logo} alt="Taggy EcoCalc Logo" className="h-10 w-30" />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="gap-2 font-semibold">
              <UserIcon className="h-4 w-4" />
              <span className="max-w-[180px] truncate text-sm">{displayName}</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="truncate font-semibold">{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setProfileOpen(true)} className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                signOut();
                router.navigate({ to: "/login" });
              }}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  );
}
