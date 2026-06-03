import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, getUser, updateUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { StoredUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileModal({ open, onOpenChange }: Props) {
  const { user, isAuthenticated, setUserState } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    enabled: open && isAuthenticated && !!userId,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
      return;
    }
    if (data) {
      setName(data.name ?? "");
      setEmail(data.email ?? "");
    } else if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    }
  }, [open, data, user]);

  const mutation = useMutation({
    mutationFn: () =>
      updateUser({
        id: userId,
        name,
        email,
        ...(password ? { password } : {}),
      }),
    onSuccess: (data) => {
      toast.success("Perfil atualizado");
      qc.invalidateQueries({ queryKey: ["user", userId] });
      setUserState(data as StoredUser);
      setPassword("");
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Erro ao atualizar perfil");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Meu Perfil</DialogTitle>
          <DialogDescription>Atualize suas informações pessoais.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="profile-name">Nome</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">E-mail</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-password">Nova senha</Label>
            <Input
              id="profile-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Deixe em branco para manter a atual"
              autoComplete="new-password"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending || isLoading}>
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
