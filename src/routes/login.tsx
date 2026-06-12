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
    <div className="flex min-h-screen gap-0">
      {/* Left side - Branding */}
      <div className="hidden lg:flex w-150 items-center justify-center ml-100">
        <div className="space-y-8 text-center max-w-md">
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src={logo} alt="Taggy EcoCalc Logo" className="h-32 w-80" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EcoCalc
            </h1>
            <p className="text-xl text-muted-foreground">Simulador de Impacto Ambiental</p>
          </div>
          <div className="space-y-3 text-left">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/20 text-primary">
                  ✓
                </div>
              </div>
              <div>
                <p className="font-semibold">Calcule Emissões</p>
                <p className="text-sm text-muted-foreground">
                  Analise o impacto ambiental da sua frota
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/20 text-primary">
                  ✓
                </div>
              </div>
              <div>
                <p className="font-semibold">Economize Combustível</p>
                <p className="text-sm text-muted-foreground">
                  Otimize suas passagens automatizadas
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/20 text-primary">
                  ✓
                </div>
              </div>
              <div>
                <p className="font-semibold">Relatórios ESG</p>
                <p className="text-sm text-muted-foreground">
                  Acompanhe seus indicadores de sustentabilidade
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login/Register */}
      <div className="flex lg:w-1/5 mt-25 items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex flex-col items-center gap-3 text-center">
            <img src={logo} alt="Taggy EcoCalc Logo" className="h-20 w-48" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EcoCalc
            </h1>
          </div>

          <div className="bg-card rounded-2xl border-2 border-border p-8 shadow-xl">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="login" className="text-sm font-semibold">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="text-sm font-semibold">
                  Cadastrar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-5 mt-6">
                <form onSubmit={onLogin} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="você@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-semibold">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                    {loading ? "Entrando…" : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-5 mt-6">
                <form onSubmit={onRegister} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="rname" className="text-sm font-semibold">
                      Nome Completo
                    </Label>
                    <Input
                      id="rname"
                      required
                      placeholder="Seu Nome"
                      value={rName}
                      onChange={(e) => setRName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="remail" className="text-sm font-semibold">
                      E-mail
                    </Label>
                    <Input
                      id="remail"
                      type="email"
                      required
                      placeholder="você@example.com"
                      value={rEmail}
                      onChange={(e) => setREmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="rpassword" className="text-sm font-semibold">
                      Senha
                    </Label>
                    <Input
                      id="rpassword"
                      type="password"
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                      value={rPassword}
                      onChange={(e) => setRPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                    {loading ? "Criando…" : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Protegido por criptografia end-to-end
          </p>
        </div>
      </div>
    </div>
  );
}
