import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartData {
  semana: string;
  agosto: number | null;
  setembro: number | null;
  outubro: number | null;
}

interface FluxoChartProps {
  data: ChartData[];
}

export const FluxoChart = ({ data }: FluxoChartProps) => {
  // Transformar dados para o formato do recharts
  const chartData = data.map((item) => ({
    semana: item.semana,
    Agosto: item.agosto || 0,
    Setembro: item.setembro || 0,
    Outubro: item.outubro || 0,
  })).filter(item => item.Agosto > 0 || item.Setembro > 0 || item.Outubro > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de Fluxo Fora do Prazo</CardTitle>
        <CardDescription>Quantitativo semanal de irregularidades por mês</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="semana" 
              className="text-sm"
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <YAxis 
              className="text-sm"
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="Agosto" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Setembro" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Outubro" fill="hsl(var(--warning))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
