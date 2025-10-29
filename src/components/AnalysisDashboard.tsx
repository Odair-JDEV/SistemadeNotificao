import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Irregularity } from "@/types/irregularity";

interface AnalysisDashboardProps {
  data: Irregularity[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

export const AnalysisDashboard = ({ data }: AnalysisDashboardProps) => {
  const analysisData = useMemo(() => {
    const normalData = data.filter(item => item.statusVerificacao === "normal");
    
    const irregularidadeCount = normalData.reduce((acc, item) => {
      const type = item.irregularidade;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topIrregularidades = Object.entries(irregularidadeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({
        name: name.length > 30 ? name.substring(0, 30) + '...' : name,
        value,
        fullName: name
      }));

    const bairroCount = normalData.reduce((acc, item) => {
      if (item.bairro && item.bairro !== "NI") {
        acc[item.bairro] = (acc[item.bairro] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topBairros = Object.entries(bairroCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({
        name,
        total: value,
        vencidos: normalData.filter(i => i.bairro === name && i.vencidas < 0 && i.regularizado === "Não").length,
        regularizados: normalData.filter(i => i.bairro === name && i.regularizado === "Sim").length,
      }));

    const operadoraCount = normalData.reduce((acc, item) => {
      acc[item.operadora] = (acc[item.operadora] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const operadoraData = Object.entries(operadoraCount)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({
        name,
        total: value,
        vencidos: normalData.filter(i => i.operadora === name && i.vencidas < 0 && i.regularizado === "Não").length,
        regularizados: normalData.filter(i => i.operadora === name && i.regularizado === "Sim").length,
      }));

    const vencimentoDistribution = [
      { range: "0-30 dias vencido", count: normalData.filter(i => i.vencidas < 0 && i.vencidas >= -30 && i.regularizado === "Não").length },
      { range: "31-60 dias vencido", count: normalData.filter(i => i.vencidas < -30 && i.vencidas >= -60 && i.regularizado === "Não").length },
      { range: "61-90 dias vencido", count: normalData.filter(i => i.vencidas < -60 && i.vencidas >= -90 && i.regularizado === "Não").length },
      { range: "90+ dias vencido", count: normalData.filter(i => i.vencidas < -90 && i.regularizado === "Não").length },
      { range: "No prazo", count: normalData.filter(i => i.vencidas >= 0 && i.regularizado === "Não").length },
      { range: "Regularizados", count: normalData.filter(i => i.regularizado === "Sim").length },
    ];

    return {
      topIrregularidades,
      topBairros,
      operadoraData,
      vencimentoDistribution: vencimentoDistribution.filter(item => item.count > 0),
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card data-testid="card-irregularidades-chart">
        <CardHeader>
          <CardTitle>Top 8 Tipos de Irregularidades</CardTitle>
          <CardDescription>Distribuição dos tipos mais comuns</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analysisData.topIrregularidades}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analysisData.topIrregularidades.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name, props: any) => [value, props.payload.fullName]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card data-testid="card-vencimento-chart">
        <CardHeader>
          <CardTitle>Distribuição por Tempo de Vencimento</CardTitle>
          <CardDescription>Status das irregularidades por prazo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysisData.vencimentoDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="range" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card data-testid="card-bairros-chart">
        <CardHeader>
          <CardTitle>Top 10 Bairros com Mais Irregularidades</CardTitle>
          <CardDescription>Análise por localização</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysisData.topBairros} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fill: 'hsl(var(--foreground))' }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Total" />
              <Bar dataKey="vencidos" fill="#FF8042" name="Vencidos" />
              <Bar dataKey="regularizados" fill="#00C49F" name="Regularizados" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card data-testid="card-operadoras-chart">
        <CardHeader>
          <CardTitle>Análise por Operadora</CardTitle>
          <CardDescription>Status das irregularidades por operadora</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysisData.operadoraData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="total" fill="#0088FE" name="Total" radius={[4, 4, 0, 0]} />
              <Bar dataKey="vencidos" fill="#FF8042" name="Vencidos" radius={[4, 4, 0, 0]} />
              <Bar dataKey="regularizados" fill="#00C49F" name="Regularizados" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
