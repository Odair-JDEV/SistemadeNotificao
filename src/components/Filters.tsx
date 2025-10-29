import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, AlertTriangle } from "lucide-react";
import { Irregularity } from "@/types/irregularity";
import { useMemo } from "react";

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMunicipio: string;
  onMunicipioChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  municipios: string[];
  logradouroSearch?: string;
  onLogradouroSearchChange?: (value: string) => void;
  selectedIrregularidade?: string;
  onIrregularidadeChange?: (value: string) => void;
  data?: Irregularity[];
}

export const Filters = ({
  searchTerm,
  onSearchChange,
  selectedMunicipio,
  onMunicipioChange,
  selectedStatus,
  onStatusChange,
  municipios,
  logradouroSearch = "",
  onLogradouroSearchChange,
  selectedIrregularidade = "all",
  onIrregularidadeChange,
  data = [],
}: FiltersProps) => {
  const tiposIrregularidade = useMemo(() => {
    const tipos = new Set(data.map(item => item.irregularidade).filter(Boolean));
    return Array.from(tipos).sort();
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative" data-testid="filter-search">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por formulário, poste ou endereço..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        <Select value={selectedMunicipio} onValueChange={onMunicipioChange}>
          <SelectTrigger data-testid="select-municipio">
            <SelectValue placeholder="Todos os Municípios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Municípios</SelectItem>
            {municipios.map((municipio) => (
              <SelectItem key={municipio} value={municipio}>
                {municipio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger data-testid="select-status">
            <SelectValue placeholder="Todos os Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
            <SelectItem value="prazo">No Prazo</SelectItem>
            <SelectItem value="regularizado">Regularizados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {onLogradouroSearchChange && (
          <div className="relative" data-testid="filter-logradouro">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Filtrar por logradouro/rua..."
              value={logradouroSearch}
              onChange={(e) => onLogradouroSearchChange(e.target.value)}
              className="pl-10"
              data-testid="input-logradouro"
            />
          </div>
        )}

        {onIrregularidadeChange && tiposIrregularidade.length > 0 && (
          <Select value={selectedIrregularidade} onValueChange={onIrregularidadeChange}>
            <SelectTrigger data-testid="select-irregularidade">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <SelectValue placeholder="Todos os Tipos de Irregularidade" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {tiposIrregularidade.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo.length > 60 ? tipo.substring(0, 60) + '...' : tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};
