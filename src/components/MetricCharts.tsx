import { useQueries } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  getEmissionSeries,
  getFuelSavingSeries,
  getPaperEmissionSeries,
  type CalcQuery,
} from "@/lib/api";

type Accent = "success" | "info" | "warning";

const ACCENT: Record<Accent, { stroke: string; fill: string }> = {
  success: { stroke: "var(--success)", fill: "var(--success)" },
  info: { stroke: "var(--info)", fill: "var(--info)" },
  warning: { stroke: "var(--warning)", fill: "var(--warning)" },
};

export function MetricCharts({ query, enabled }: { query: CalcQuery; enabled: boolean }) {
  const [emission, fuel, paper] = useQueries({
    queries: [
      { queryKey: ["emission-series", query], queryFn: () => getEmissionSeries(query), enabled },
      { queryKey: ["fuel-series", query], queryFn: () => getFuelSavingSeries(query), enabled },
      { queryKey: ["paper-series", query], queryFn: () => getPaperEmissionSeries(query), enabled },
    ],
  });

  console.log({
    emission: emission.data,
    fuel: fuel.data,
    paper: paper.data,
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <ChartCard
        title="Emissão evitada"
        unit="kg"
        accent="success"
        data={emission.data}
        loading={emission.isLoading}
      />
      <ChartCard
        title="Gasolina economizada"
        unit="L"
        accent="info"
        data={fuel.data}
        loading={fuel.isLoading}
      />
      <ChartCard
        title="Papel evitado"
        unit="g"
        accent="warning"
        data={paper.data}
        loading={paper.isLoading}
      />
    </div>
  );
}

function ChartCard({
  title,
  unit,
  accent,
  data,
  loading,
}: {
  title: string;
  unit: string;
  accent: Accent;
  data: { label: string; value: number }[] | undefined;
  loading: boolean;
}) {
  const c = ACCENT[accent];
  const gradId = `grad-${accent}`;

  return (
    <div className="rounded-l border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">acumulado ({unit})</span>
      </div>
      <div className="h-48 w-full">
        {loading || !data ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Carregando…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.stroke} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={c.stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v.toFixed(2)} ${unit}`, title]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={c.stroke}
                strokeWidth={2}
                fill={`url(#${gradId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
