import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const router = useRouter();
  const { isAuthenticated, loaded } = useAuth();

  useEffect(() => {
    if (!loaded) return;
    router.navigate({ to: isAuthenticated ? "/dashboard" : "/login" });
  }, [loaded, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-muted-foreground">Carregando…</div>
    </div>
  );
}
