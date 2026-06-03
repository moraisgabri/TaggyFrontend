import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Leaf } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { login, register, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import logo from "@/assets/TAGGY_LOGO.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { signIn, isAuthenticated, loaded } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);

  // login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // register fields
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPassword, setRPassword] = useState("");

  useEffect(() => {
    if (loaded && isAuthenticated) router.navigate({ to: "/dashboard" });
  }, [loaded, isAuthenticated, router]);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await login({ email, password });
      signIn(token);
      toast.success("Bem-vindo!");
      router.navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ name: rName, email: rEmail, password: rPassword });
      toast.success("Conta criada! Faça login.");
      setEmail(rEmail);
      setPassword(rPassword);
      setTab("login");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Falha no cadastro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <img src={logo} alt="Taggy EcoCalc Logo" className="h-24 w-64" />
          <h1 className="text-2xl font-semibold ">EcoCalc</h1>
          <p className="text-sm text-muted-foreground">Acesse o simulador de impacto ambiental</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={onLogin} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando…" : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={onRegister} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rname">Nome</Label>
                  <Input
                    id="rname"
                    required
                    value={rName}
                    onChange={(e) => setRName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remail">E-mail</Label>
                  <Input
                    id="remail"
                    type="email"
                    required
                    value={rEmail}
                    onChange={(e) => setREmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rpassword">Senha</Label>
                  <Input
                    id="rpassword"
                    type="password"
                    required
                    minLength={6}
                    value={rPassword}
                    onChange={(e) => setRPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Criando…" : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
