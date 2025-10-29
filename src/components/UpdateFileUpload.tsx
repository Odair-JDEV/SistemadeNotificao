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

export const UpdateFileUpload = ({ onFileUpdate, currentData }: UpdateFileUploadProps) => {
  const { toast } = useToast();

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);

        // Ler dados da primeira planilha (registros)
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const newFileData: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Ler dados da segunda planilha (gráfico) se existir
        let newChartData: any[] = [];
        if (workbook.SheetNames.length > 1) {
          const secondSheetName = workbook.SheetNames[1];
          const chartSheet = workbook.Sheets[secondSheetName];
          newChartData = XLSX.utils.sheet_to_json(chartSheet);
        }

        // Criar um mapa dos registros existentes usando a chave composta
        const existingMap = new Map<string, Irregularity>();
        currentData.forEach(item => {
          const key = `${item.numFormulario}_${item.numeroPoste}`;
          existingMap.set(key, item);
        });

        // Processar novos dados
        const mergedData: Irregularity[] = [];
        let addedCount = 0;
        let skippedCount = 0;

        newFileData.forEach((row) => {
          const newItem: Irregularity = {
            municipio: String(row["Município"] ?? "").trim(),
            numFormulario: String(row["Nº Formulário"] ?? "").trim(),
            numeroPoste: String(row["Número do Poste"] ?? "").trim(),
            operadora: String(row["Operadora"] ?? "").trim(),
            irregularidade: String(row["Irregularidade"] ?? "").trim(),
            vencidas: typeof row["Vencidas"] === 'number' ? row["Vencidas"] : (parseInt(String(row["Vencidas"] ?? "0")) || 0),
            noPrazo: String(row["No Prazo"] ?? "").trim(),
            emailEnviado: String(row["Email Enviado"] ?? "").trim(),
            dataEnvioEmail: String(row["Data Envio Email"] ?? "").trim(),
            regularizado: "Não", // Novo arquivo sempre vem com status "Não"
            statusVerificacao: "normal",
            bairro: String(row["Bairro"] ?? "").trim(),
            logradouro: String(row["Logradouro"] ?? "").trim(),
            numLogradouro: String(row["Nº Logradouro"] ?? "").trim(),
          };

          const key = `${newItem.numFormulario}_${newItem.numeroPoste}`;
          const existingItem = existingMap.get(key);

          if (existingItem) {
            // Se o item existe E já está regularizado
            if (existingItem.regularizado === "Sim") {
              // Marcar como aguardando verificação JVM
              newItem.statusVerificacao = "aguardando_verificacao_jvm";
              mergedData.push(newItem);
              addedCount++;
            } else {
              // Se existe mas NÃO está regularizado, adicionar o novo registro
              mergedData.push(newItem);
              addedCount++;
            }
            // Remover do mapa para controlar o que sobra
            existingMap.delete(key);
          } else {
            // Se é um registro completamente novo, adicionar
            mergedData.push(newItem);
            addedCount++;
          }
        });

        // Adicionar os registros que estavam no arquivo antigo mas não vieram no novo
        // (apenas os que estão regularizados, para manter o histórico)
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

        // Resetar o input
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
    <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
      <label htmlFor="update-file-upload" className="cursor-pointer block p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium">Atualizar arquivo semanal</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique para fazer upload do novo arquivo (.xlsx)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
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
        />
      </label>
    </Card>
  );
};
