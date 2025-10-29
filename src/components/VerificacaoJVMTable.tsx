import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Irregularity } from "@/types/irregularity";
import { AlertCircle, CheckCircle, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

interface VerificacaoJVMTableProps {
  data: Irregularity[];
  onConfirmarVerificacao: (numFormulario: string, numeroPoste: string) => void;
}

interface GroupedIrregularity {
  numFormulario: string;
  items: Irregularity[];
  municipio: string;
  operadora: string;
  logradouro: string;
  numLogradouro: string;
}

export const VerificacaoJVMTable = ({ data, onConfirmarVerificacao }: VerificacaoJVMTableProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleConfirmar = (numFormulario: string, numeroPoste: string) => {
    onConfirmarVerificacao(numFormulario, numeroPoste);
  };

  const groupedData = useMemo(() => {
    const groups = new Map<string, GroupedIrregularity>();
    
    data.forEach((item) => {
      if (!groups.has(item.numFormulario)) {
        groups.set(item.numFormulario, {
          numFormulario: item.numFormulario,
          items: [],
          municipio: item.municipio,
          operadora: item.operadora,
          logradouro: item.logradouro,
          numLogradouro: item.numLogradouro,
        });
      }
      groups.get(item.numFormulario)!.items.push(item);
    });
    
    const groupsArray = Array.from(groups.values());
    
    // Sort groups: most overdue first
    return groupsArray.sort((a, b) => {
      const getMostOverdue = (group: GroupedIrregularity) => {
        return Math.min(...group.items.map(i => i.vencidas));
      };
      
      return getMostOverdue(a) - getMostOverdue(b);
    });
  }, [data]);

  const toggleGroup = (numFormulario: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(numFormulario)) {
      newExpanded.delete(numFormulario);
    } else {
      newExpanded.add(numFormulario);
    }
    setExpandedGroups(newExpanded);
  };

  const getStatusBadge = (vencidas: number) => {
    if (vencidas < 0) {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          <AlertCircle className="w-3 h-3 mr-1" />
          Vencido ({Math.abs(vencidas)}d)
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
        <Clock className="w-3 h-3 mr-1" />
        No Prazo
      </Badge>
    );
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Município</TableHead>
            <TableHead>Formulário</TableHead>
            <TableHead>Postes</TableHead>
            <TableHead>Operadora</TableHead>
            <TableHead>Irregularidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Data Email</TableHead>
            <TableHead className="w-32">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedData.map((group) => {
            const isExpanded = expandedGroups.has(group.numFormulario);
            const hasMultipleItems = group.items.length > 1;
            
            return (
              <>
                <TableRow 
                  key={group.numFormulario}
                  className={hasMultipleItems ? "cursor-pointer font-medium bg-orange-50/50 dark:bg-orange-950/20" : "bg-orange-50/50 dark:bg-orange-950/20"}
                  onClick={() => hasMultipleItems && toggleGroup(group.numFormulario)}
                >
                  <TableCell>
                    {hasMultipleItems && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{group.municipio}</TableCell>
                  <TableCell className="font-medium">{group.numFormulario}</TableCell>
                  <TableCell>
                    {hasMultipleItems ? (
                      <Badge variant="secondary" className="text-xs">
                        {group.items.length} postes
                      </Badge>
                    ) : (
                      group.items[0].numeroPoste
                    )}
                  </TableCell>
                  <TableCell>{group.operadora}</TableCell>
                  <TableCell className="max-w-xs truncate" title={group.items[0].irregularidade}>
                    {hasMultipleItems ? "Múltiplas irregularidades" : group.items[0].irregularidade}
                  </TableCell>
                  <TableCell>
                    {!hasMultipleItems && getStatusBadge(group.items[0].vencidas)}
                    {hasMultipleItems && (
                      <div className="flex gap-1 flex-wrap">
                        {group.items.some(i => i.vencidas < 0) && (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                            {group.items.filter(i => i.vencidas < 0).length}
                          </Badge>
                        )}
                        {group.items.some(i => i.vencidas >= 0) && (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                            {group.items.filter(i => i.vencidas >= 0).length}
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {group.logradouro}, {group.numLogradouro}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {!hasMultipleItems && group.items[0].dataEnvioEmail}
                  </TableCell>
                  <TableCell>
                    {!hasMultipleItems && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleConfirmar(group.numFormulario, group.items[0].numeroPoste)}
                      >
                        Confirmar Irregularidade
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                
                {isExpanded && hasMultipleItems && group.items.map((item, idx) => (
                  <TableRow key={`${group.numFormulario}-${item.numeroPoste}-${idx}`} className="bg-orange-100/30 dark:bg-orange-900/10">
                    <TableCell></TableCell>
                    <TableCell className="text-muted-foreground text-sm"></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{group.numFormulario}</TableCell>
                    <TableCell className="font-medium">Poste {item.numeroPoste}</TableCell>
                    <TableCell className="text-sm">{item.operadora}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm" title={item.irregularidade}>
                      {item.irregularidade}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.vencidas)}</TableCell>
                    <TableCell className="text-sm">{item.logradouro}, {item.numLogradouro}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.dataEnvioEmail}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleConfirmar(group.numFormulario, item.numeroPoste)}
                      >
                        Confirmar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
