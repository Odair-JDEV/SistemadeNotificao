import { useCallback } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import * as XLSX from "xlsx";
import { Irregularity } from "@/types/irregularity";

interface FileUploadProps {
  onFileUpload: (data: Irregularity[], chartData: any[]) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Verificar se é JSON
        if (file.name.endsWith('.json')) {
          const jsonContent = e.target?.result as string;
          const jsonData = JSON.parse(jsonContent);
          
          onFileUpload(jsonData.registros || [], jsonData.chartData || []);
          
          toast({
            title: "Arquivo JSON carregado com sucesso!",
            description: `${jsonData.registros?.length || 0} registros importados.`,
          });
          return;
        }

        // Processar Excel
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Processar Page 1 - Registros
        const registrosSheet = workbook.Sheets[workbook.SheetNames[0]];
        const registrosJson = XLSX.utils.sheet_to_json(registrosSheet, { header: 1 }) as any[];
        
        // Converter dados de registros
        const registros: Irregularity[] = registrosJson.slice(1).map((row: any) => ({
          municipio: row[0] || "",
          numFormulario: row[1]?.toString() || "",
          numeroPoste: row[2]?.toString() || "",
          operadora: row[3] || "",
          irregularidade: row[4] || "",
          vencidas: parseInt(row[5]) || 0,
          noPrazo: row[6]?.toString() || "",
          emailEnviado: row[7] || "",
          dataEnvioEmail: row[8] || "",
          regularizado: row[9] || "",
          statusVerificacao: (row[10] === "aguardando_verificacao_jvm" ? "aguardando_verificacao_jvm" : "normal") as "normal" | "aguardando_verificacao_jvm",
          bairro: row[11] || "",
          logradouro: row[12] || "",
          numLogradouro: row[13]?.toString() || "",
        })).filter(item => item.municipio && item.municipio !== "TOTAL GERAL");

        // Processar Page 2 - Gráfico (se existir)
        let chartData: any[] = [];
        if (workbook.SheetNames.length > 1) {
          const graficoSheet = workbook.Sheets[workbook.SheetNames[1]];
          const graficoJson = XLSX.utils.sheet_to_json(graficoSheet, { header: 1 }) as any[];
          
          // Processar dados do gráfico
          chartData = graficoJson.slice(3, 6).map((row: any, idx: number) => {
            const mes = ["Agosto", "Setembro", "Outubro"][idx];
            return {
              semana1: row[1] === "*" ? null : parseInt(row[1]) || null,
              semana2: row[2] === "*" ? null : parseInt(row[2]) || null,
              semana3: row[3] === "*" ? null : parseInt(row[3]) || null,
              semana4: row[4] === "*" ? null : parseInt(row[4]) || null,
              mes,
            };
          });
        }

        onFileUpload(registros, chartData);

        toast({
          title: "Arquivo processado com sucesso!",
          description: `${registros.length} registros importados.`,
        });
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        toast({
          title: "Erro ao processar arquivo",
          description: "Verifique se o arquivo está no formato correto.",
          variant: "destructive",
        });
      }
    };

    // Ler como texto se for JSON, como ArrayBuffer se for Excel
    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, [toast, onFileUpload]);

  return (
    <Card className="p-8 border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer">
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium">Upload de Arquivo</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique ou arraste um arquivo .xlsx ou .json aqui
            </p>
          </div>
        </div>
        <input
          id="file-upload"
          type="file"
          accept=".xlsx,.xls,.json"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
    </Card>
  );
};
