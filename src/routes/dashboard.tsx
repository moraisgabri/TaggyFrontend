import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Car, Leaf, Fuel, FileText, Settings2, Download } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  listVehicles,
  getEmission,
  getFuelSaving,
  getPaperEmission,
  type Timescale,
} from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";
import { MetricCharts } from "@/components/MetricCharts";
import { VehiclesModal } from "@/components/VehiclesModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { exportDashboardPdf } from "@/lib/pdf-export";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { isAuthenticated, loaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loaded && !isAuthenticated) router.navigate({ to: "/login" });
  }, [loaded, isAuthenticated, router]);

  const [frequency, setFrequency] = useState<number>(5);
  const [timescaleValue, setTimescaleValue] = useState<number>(1);
  const [timescale, setTimescale] = useState<Timescale>("D");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [vehiclesOpen, setVehiclesOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: listVehicles,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!vehicleId && vehicles.length > 0) setVehicleId(vehicles[0].id);
  }, [vehicles, vehicleId]);

  const query = useMemo(
    () => ({ Timescale: timescale, Frequency: frequency, TimescaleValue: timescaleValue }),
    [timescale, frequency, timescaleValue],
  );

  const valid = frequency > 0 && timescaleValue > 0;

  const results = useQueries({
    queries: [
      {
        queryKey: ["emission", query],
        queryFn: () => getEmission(query),
        enabled: isAuthenticated && valid,
      },
      {
        queryKey: ["fuel-saving", query],
        queryFn: () => getFuelSaving(query),
        enabled: isAuthenticated && valid,
      },
      {
        queryKey: ["paper-emission", query],
        queryFn: () => getPaperEmission(query),
        enabled: isAuthenticated && valid,
      },
    ],
  });

  const [emissionQ, fuelQ, paperQ] = results;

  if (!loaded || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">Carregando…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="rounded-l border bg-card p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-primary">
                Simulador de Impacto Ambiental
              </h1>
              <p className="text-sm text-muted-foreground">
                Calcule a economia gerada pela automação de passagens.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="default" onClick={() => setVehiclesOpen(true)}>
                <Settings2 className="mr-2 h-4 w-4" /> Gerenciar veículos
              </Button>

              <Button
                variant="outline"
                onClick={() => exportDashboardPdf(exportRef.current, "dashboard-taggy.pdf")}
              >
                <Download className="mr-2 h-4 w-4" /> Exportar Dashboard
              </Button>

              <Button
                variant="outline"
                onClick={() => exportDashboardPdf(exportRef.current, "esg-report.pdf")}
              >
                <Download className="mr-2 h-4 w-4" /> Relatório ESG
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Veículo</Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.length === 0 ? (
                    <div className="px-2 py-3 text-xs text-muted-foreground">
                      Nenhum veículo. Crie um para começar.
                    </div>
                  ) : (
                    vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        <span className="flex items-center gap-2">
                          <Car className="h-3.5 w-3.5" />
                          {v.name} <span className="text-muted-foreground">· {v.engineType}</span>
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="freq">Passagens por Dia (Frequência)</Label>
              <Input
                id="freq"
                type="number"
                min={1}
                value={frequency}
                onChange={(e) => setFrequency(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tval">Quantidade de Tempo</Label>
              <Input
                id="tval"
                type="number"
                min={1}
                value={timescaleValue}
                onChange={(e) => setTimescaleValue(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>

            <div className="space-y-2">
              <Label>Escala Temporal</Label>
              <Select value={timescale} onValueChange={(v) => setTimescale(v as Timescale)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="D">Dias (D)</SelectItem>
                  <SelectItem value="M">Meses (M)</SelectItem>
                  <SelectItem value="Y">Anos (Y)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <div ref={exportRef} className="space-y-6 mt-6">
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <MetricCard
              accent="success"
              icon={<Leaf className="h-5 w-5" />}
              label="Emissão evitada por frequência"
              value={emissionQ.data?.totalValue}
              unit="kg"
              loading={emissionQ.isLoading}
              error={emissionQ.error}
              description="CO₂ deixado de ser emitido pela passagem automatizada."
            />
            <MetricCard
              accent="info"
              icon={<Fuel className="h-5 w-5" />}
              label="Gasolina economizada por frequência"
              value={fuelQ.data?.totalValue}
              unit="L"
              loading={fuelQ.isLoading}
              error={fuelQ.error}
              description="Evita o desperdício em marcha lenta nas cabines manuais."
            />
            <MetricCard
              accent="warning"
              icon={<FileText className="h-5 w-5" />}
              label="Emissão de papel por frequência"
              value={paperQ.data?.totalValue}
              unit="g"
              loading={paperQ.isLoading}
              error={paperQ.error}
              description="Redução de cupons térmicos impressos (8x7.5cm)."
            />
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-foreground">Progressão acumulada</h2>
              <span className="text-xs text-muted-foreground">
                Evolução estimada ao longo do período selecionado
              </span>
            </div>
            <MetricCharts query={query} enabled={isAuthenticated && valid} />
          </section>
        </div>
      </main>

      <VehiclesModal open={vehiclesOpen} onOpenChange={setVehiclesOpen} />
    </div>
  );
}

function MetricCard({
  accent,
  icon,
  label,
  value,
  unit,
  loading,
  error,
  description,
}: {
  accent: "success" | "info" | "warning";
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  unit: string;
  loading: boolean;
  error: unknown;
  description: string;
}) {
  const colorMap = {
    success: { border: "border-success", text: "text-success", bg: "bg-success/10" },
    info: { border: "border-info", text: "text-info", bg: "bg-info/10" },
    warning: { border: "border-warning", text: "text-warning", bg: "bg-warning/10" },
  } as const;
  const c = colorMap[accent];

  return (
    <div className={`rounded-l border border-l-4 ${c.border} bg-card p-5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </h3>
        <span className={`rounded-full p-2 ${c.bg} ${c.text}`}>{icon}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        {loading ? (
          <span className="text-2xl text-muted-foreground">…</span>
        ) : error ? (
          <span className="text-sm text-destructive">Erro ao carregar</span>
        ) : (
          <>
            <span className={`text-4xl font-semibold ${c.text}`}>{formatNumber(value ?? 0)}</span>
            <span className="text-base text-muted-foreground">{unit}</span>
          </>
        )}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function formatNumber(n: number) {
  if (Math.abs(n) >= 100) return n.toFixed(2);
  if (Math.abs(n) >= 1) return n.toFixed(2);
  return n.toFixed(4);
}
