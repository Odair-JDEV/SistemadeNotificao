import { useCallback } from "react";
import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { Irregularity } from "@/types/irregularity";

interface UpdateFileUploadProps {
  onFileUpdate: (newData: Irregularity[], newChartData: any[]) => void;
  currentData: Irregularity[];
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

export const UpdateFileUpload = ({ onFileUpdate, currentData }: UpdateFileUploadProps) => {
  const { toast } = useToast();

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const newFileData: any[] = XLSX.utils.sheet_to_json(worksheet);

        let newChartData: any[] = [];
        if (workbook.SheetNames.length > 1) {
          const secondSheetName = workbook.SheetNames[1];
          const chartSheet = workbook.Sheets[secondSheetName];
          const graficoJson = XLSX.utils.sheet_to_json(chartSheet) as any[];
          
          const months = ["Agosto", "Setembro", "Outubro", "Novembro", "Dezembro", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho"];
          newChartData = graficoJson.filter(row => {
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

        const existingMap = new Map<string, Irregularity>();
        currentData.forEach(item => {
          const key = `${item.numFormulario}_${item.numeroPoste}`;
          existingMap.set(key, item);
        });

        const mergedData: Irregularity[] = [];
        let addedCount = 0;
        let skippedCount = 0;

        newFileData.forEach((row) => {
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

          const newItem: Irregularity = {
            municipio: String(municipio || "").trim(),
            numFormulario: String(numFormulario || "").trim(),
            numeroPoste: String(numeroPoste || "").trim(),
            operadora: String(operadora || "").trim(),
            irregularidade: String(irregularidade || "").trim(),
            vencidas: typeof vencidas === 'number' ? vencidas : (parseInt(String(vencidas || "0")) || 0),
            noPrazo: String(noPrazo || "").trim(),
            emailEnviado: String(emailEnviado || "").trim(),
            dataEnvioEmail: String(dataEnvioEmail || "").trim(),
            regularizado: "Não",
            statusVerificacao: "normal",
            bairro: String(bairro || "").trim(),
            logradouro: String(logradouro || "").trim(),
            numLogradouro: String(numLogradouro || "").trim(),
          };

          if (!newItem.municipio || !newItem.numFormulario) return;
          if (newItem.municipio === "TOTAL GERAL") return;

          const key = `${newItem.numFormulario}_${newItem.numeroPoste}`;
          const existingItem = existingMap.get(key);

          if (existingItem) {
            if (existingItem.regularizado === "Sim") {
              newItem.statusVerificacao = "aguardando_verificacao_jvm";
              mergedData.push(newItem);
              addedCount++;
            } else {
              mergedData.push(newItem);
              addedCount++;
            }
            existingMap.delete(key);
          } else {
            mergedData.push(newItem);
            addedCount++;
          }
        });

        existingMap.forEach(item => {
          if (item.regularizado === "Sim") {
            mergedData.push(item);
            skippedCount++;
          }
        });

        onFileUpdate(mergedData, newChartData);

        toast({
          title: "Arquivo atualizado com sucesso!",
          description: `${addedCount} registros atualizados/adicionados, ${skippedCount} regularizados mantidos.`,
        });

        event.target.value = "";
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        toast({
          title: "Erro ao processar arquivo",
          description: "Verifique se o arquivo está no formato correto.",
          variant: "destructive",
        });
      }
    },
    [currentData, onFileUpdate, toast]
  );

  return (
    <Card className="border-2 border-dashed hover:border-primary/50 transition-colors" data-testid="card-update-file-upload">
      <label htmlFor="update-file-upload" className="cursor-pointer block p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="w-8 h-8 text-primary" data-testid="icon-update-upload" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium" data-testid="text-update-upload-title">Atualizar arquivo semanal</p>
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-update-upload-description">
              Clique para fazer upload do novo arquivo (.xlsx)
            </p>
            <p className="text-xs text-muted-foreground mt-2" data-testid="text-update-upload-note">
              Registros já regularizados que reaparecerem irão para "Aguardando JVM"
            </p>
          </div>
        </div>
        <input
          id="update-file-upload"
          type="file"
          accept=".xlsx"
          onChange={handleFileUpload}
          className="hidden"
          data-testid="input-update-file-upload"
        />
      </label>
    </Card>
  );
};
