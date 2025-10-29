import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMunicipio: string;
  onMunicipioChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  municipios: string[];
}

export const Filters = ({
  searchTerm,
  onSearchChange,
  selectedMunicipio,
  onMunicipioChange,
  selectedStatus,
  onStatusChange,
  municipios,
}: FiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por formulário, poste ou endereço..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={selectedMunicipio} onValueChange={onMunicipioChange}>
        <SelectTrigger>
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
        <SelectTrigger>
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
  );
};
