import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PerfilAula } from "@/lib/database";

interface Props {
  startDate: Date | undefined;
  onStartDateChange: (d: Date | undefined) => void;
  profileId: string | undefined;
  onProfileChange: (p: string) => void;
  perfis: PerfilAula[];
  isLoadingPerfis: boolean;
}

const CourseForm = ({ startDate, onStartDateChange, profileId, onProfileChange, perfis, isLoadingPerfis }: Props) => {
  return (
    <div className="space-y-6">
      {/* Data de início */}
      <div className="space-y-2">
        <label className="text-sm font-medium font-body text-foreground">
          Data de início do curso
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-input border-border",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate
                ? format(startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                : "Selecione a data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              locale={ptBR}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          Se a data informada não for um dia de aula ou coincidir com feriado, o sistema ajustará automaticamente para o próximo dia disponível.
        </p>
      </div>

      {/* Perfil de dias */}
      <div className="space-y-2">
        <label className="text-sm font-medium font-body text-foreground">
          Dias de aula do aluno
        </label>
        <Select value={profileId} onValueChange={onProfileChange}>
          <SelectTrigger className="w-full bg-input border-border">
            <SelectValue placeholder={isLoadingPerfis ? "Carregando perfis..." : "Selecione o perfil de aulas"} />
          </SelectTrigger>
          <SelectContent>
            {perfis.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {`${p.nome} (${p.horas_por_dia}h por dia)`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Escolha o padrão de dias em que o aluno frequenta as aulas.
        </p>
      </div>
    </div>
  );
};

export default CourseForm;
