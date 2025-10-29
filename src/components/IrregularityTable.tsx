import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Irregularity } from "@/types/irregularity";
import { AlertCircle, CheckCircle, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface IrregularityTableProps {
  data: Irregularity[];
  onUpdateRegularizado?: (numFormulario: string, numeroPoste: string, regularizado: boolean) => void;
}

interface GroupedIrregularity {
  numFormulario: string;
  items: Irregularity[];
  municipio: string;
  operadora: string;
  logradouro: string;
  numLogradouro: string;
}

export const IrregularityTable = ({ data, onUpdateRegularizado }: IrregularityTableProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleCheckboxChange = (numFormulario: string, numeroPoste: string, checked: boolean) => {
    if (onUpdateRegularizado) {
      onUpdateRegularizado(numFormulario, numeroPoste, checked);
    }

    toast({
      title: checked ? "Marcado como regularizado" : "Desmarcado",
      description: `Formulário ${numFormulario}, Poste ${numeroPoste}`,
    });
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
    
    // Sort groups: overdue first (most overdue first), then on-time, then regularized
    return groupsArray.sort((a, b) => {
      const getMostCriticalStatus = (group: GroupedIrregularity) => {
        // Find the most critical item in the group
        const mostOverdue = Math.min(...group.items.map(i => i.vencidas));
        const hasRegularized = group.items.some(i => i.regularizado === "Sim");
        const allRegularized = group.items.every(i => i.regularizado === "Sim");
        
        return { mostOverdue, hasRegularized, allRegularized };
      };
      
      const statusA = getMostCriticalStatus(a);
      const statusB = getMostCriticalStatus(b);
      
      // If all regularized, put at the end
      if (statusA.allRegularized && !statusB.allRegularized) return 1;
      if (!statusA.allRegularized && statusB.allRegularized) return -1;
      
      // Sort by most overdue (most negative first)
      return statusA.mostOverdue - statusB.mostOverdue;
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

  const getStatusBadge = (regularizado: string, vencidas: number) => {
    if (regularizado === "Sim") {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Regularizado
        </Badge>
      );
    }
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
            <TableHead className="w-20">Marcar</TableHead>
            <TableHead>Município</TableHead>
            <TableHead>Formulário</TableHead>
            <TableHead>Postes</TableHead>
            <TableHead>Operadora</TableHead>
            <TableHead>Irregularidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Logradouro</TableHead>
            <TableHead>Nº Logradouro</TableHead>
            <TableHead>Data Email</TableHead>
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
                  className={hasMultipleItems ? "cursor-pointer font-medium" : ""}
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
                  <TableCell>
                    {!hasMultipleItems && (
                      <Checkbox
                        checked={group.items[0].regularizado === "Sim"}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange(group.numFormulario, group.items[0].numeroPoste, checked === true)
                        }
                        disabled={group.items[0].regularizado === "Sim"}
                      />
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
                    {!hasMultipleItems && getStatusBadge(group.items[0].regularizado, group.items[0].vencidas)}
                    {hasMultipleItems && (
                      <div className="flex gap-1 flex-wrap">
                        {group.items.some(i => i.regularizado === "Sim") && (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                            {group.items.filter(i => i.regularizado === "Sim").length}
                          </Badge>
                        )}
                        {group.items.some(i => i.vencidas < 0 && i.regularizado === "Não") && (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                            {group.items.filter(i => i.vencidas < 0 && i.regularizado === "Não").length}
                          </Badge>
                        )}
                        {group.items.some(i => i.vencidas >= 0 && i.regularizado === "Não") && (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                            {group.items.filter(i => i.vencidas >= 0 && i.regularizado === "Não").length}
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {group.logradouro}
                  </TableCell>
                  <TableCell>
                    {group.numLogradouro}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {!hasMultipleItems && group.items[0].dataEnvioEmail}
                  </TableCell>
                </TableRow>
                
                {isExpanded && hasMultipleItems && group.items.map((item, idx) => (
                  <TableRow key={`${group.numFormulario}-${item.numeroPoste}-${idx}`} className="bg-muted/30">
                    <TableCell></TableCell>
                    <TableCell>
                      <Checkbox
                        checked={item.regularizado === "Sim"}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange(group.numFormulario, item.numeroPoste, checked === true)
                        }
                        disabled={item.regularizado === "Sim"}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm"></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{group.numFormulario}</TableCell>
                    <TableCell className="font-medium">Poste {item.numeroPoste}</TableCell>
                    <TableCell className="text-sm">{item.operadora}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm" title={item.irregularidade}>
                      {item.irregularidade}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.regularizado, item.vencidas)}</TableCell>
                    <TableCell className="text-sm">{item.logradouro}</TableCell>
                    <TableCell className="text-sm">{item.numLogradouro}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.dataEnvioEmail}</TableCell>
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
