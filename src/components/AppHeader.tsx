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

export function AppHeader() {
  const { user, signOut, setUserState } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = user?.name?.trim() || user?.email || "Conta";

  return (
    <header className="bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <img src="@/assets/TAGGY_LOGO.png" alt="Taggy EcoCalc Logo" className="h-6 w-6" />
          Taggy EcoCalc
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="max-w-[180px] truncate">{displayName}</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
              <UserIcon className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                signOut();
                router.navigate({ to: "/login" });
              }}
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
