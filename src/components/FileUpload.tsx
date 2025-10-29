import { useCallback } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import * as XLSX from "xlsx";
import { Irregularity } from "@/types/irregularity";

interface FileUploadProps {
  onFileUpload: (data: Irregularity[], chartData: any[]) => void;
}

const normalizeColumnName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '');
};

const findColumn = (row: any, possibleNames: string[]): any => {
  for (const name of possibleNames) {
    if (row[name] !== undefined) return row[name];
  }
  
  const normalizedPossibleNames = possibleNames.map(normalizeColumnName);
  
  for (const key of Object.keys(row)) {
    const normalizedKey = normalizeColumnName(key);
    if (normalizedPossibleNames.includes(normalizedKey)) {
      return row[key];
    }
  }
  return "";
};

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
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

        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const registrosSheet = workbook.Sheets[workbook.SheetNames[0]];
        const registrosJson = XLSX.utils.sheet_to_json(registrosSheet) as any[];
        
        const registros: Irregularity[] = registrosJson.map((row: any) => {
          const municipio = findColumn(row, ["Município", "MUNICÍPIO", "Municipio", "municipio"]);
          const numFormulario = findColumn(row, ["Núm. Formulário", "Nº Formulário", "Num. Formulário", "NUM. FORMULÁRIO", "Numero Formulario", "Num Formulario"]);
          const numeroPoste = findColumn(row, ["Número do Poste", "Numero do Poste", "NÚMERO DO POSTE", "Numero Poste"]);
          const operadora = findColumn(row, ["Operadora", "OPERADORA", "operadora"]);
          const irregularidade = findColumn(row, ["Irregularidade", "IRREGULARIDADE", "irregularidade"]);
          const vencidas = findColumn(row, ["Vencidas", "Vencidas ", "VENCIDAS", "vencidas"]);
          const noPrazo = findColumn(row, ["No Prazo", "No Prazo ", "NO PRAZO", "NoPrazo"]);
          const emailEnviado = findColumn(row, ["E-mail Enviado?", "Email Enviado?", "E-mail Enviado", "EMAIL ENVIADO?", "Email Enviado"]);
          const dataEnvioEmail = findColumn(row, ["Data Envio E-mail", "Data Envio Email", "DATA ENVIO E-MAIL", "Data Envio Email"]);
          const regularizado = findColumn(row, ["Regularizado?", "Regularizado", "REGULARIZADO?", "regularizado"]);
          const bairro = findColumn(row, ["Bairro", "BAIRRO", "bairro"]);
          const logradouro = findColumn(row, ["Logradouro", "LOGRADOURO", "logradouro"]);
          const numLogradouro = findColumn(row, ["Núm. Logradouro", "Nº Logradouro", "Num. Logradouro", "NUM. LOGRADOURO", "Num Logradouro", "Numero Logradouro"]);

          return {
            municipio: String(municipio || "").trim(),
            numFormulario: String(numFormulario || "").trim(),
            numeroPoste: String(numeroPoste || "").trim(),
            operadora: String(operadora || "").trim(),
            irregularidade: String(irregularidade || "").trim(),
            vencidas: typeof vencidas === 'number' ? vencidas : (parseInt(String(vencidas || "0")) || 0),
            noPrazo: String(noPrazo || "").trim(),
            emailEnviado: String(emailEnviado || "").trim(),
            dataEnvioEmail: String(dataEnvioEmail || "").trim(),
            regularizado: String(regularizado || "Não").trim(),
            statusVerificacao: "normal" as const,
            bairro: String(bairro || "").trim(),
            logradouro: String(logradouro || "").trim(),
            numLogradouro: String(numLogradouro || "").trim(),
          };
        }).filter(item => item.municipio && item.municipio !== "TOTAL GERAL" && item.numFormulario);

        let chartData: any[] = [];
        if (workbook.SheetNames.length > 1) {
          const graficoSheet = workbook.Sheets[workbook.SheetNames[1]];
          const graficoJson = XLSX.utils.sheet_to_json(graficoSheet) as any[];
          
          const months = ["Agosto", "Setembro", "Outubro", "Novembro", "Dezembro", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho"];
          chartData = graficoJson.filter(row => {
            const firstCol = Object.values(row)[0];
            return months.some(month => String(firstCol).includes(month.toUpperCase()) || String(firstCol).includes(month));
          }).map((row: any) => {
            const values = Object.values(row);
            const monthName = String(values[0]).trim();
            return {
              semana1: values[1] === "*" || !values[1] ? null : (typeof values[1] === 'number' ? values[1] : parseInt(String(values[1])) || null),
              semana2: values[2] === "*" || !values[2] ? null : (typeof values[2] === 'number' ? values[2] : parseInt(String(values[2])) || null),
              semana3: values[3] === "*" || !values[3] ? null : (typeof values[3] === 'number' ? values[3] : parseInt(String(values[3])) || null),
              semana4: values[4] === "*" || !values[4] ? null : (typeof values[4] === 'number' ? values[4] : parseInt(String(values[4])) || null),
              mes: monthName,
            };
          });
        }

        onFileUpload(registros, chartData);

        toast({
          title: "Arquivo processado com sucesso!",
          description: `${registros.length} registros importados de ${file.name}`,
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

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, [toast, onFileUpload]);

  return (
    <Card className="p-8 border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer" data-testid="card-file-upload">
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="w-8 h-8 text-primary" data-testid="icon-upload" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium" data-testid="text-upload-title">Upload de Arquivo</p>
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-upload-description">
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
          data-testid="input-file-upload"
        />
      </label>
    </Card>
  );
};
