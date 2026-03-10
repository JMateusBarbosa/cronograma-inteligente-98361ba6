import { useState } from "react";
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

const PERFIS = [
  "Segunda e Quarta (1h por dia)",
  "Terça e Quinta (1h por dia)",
  "Sábado (2h)",
  "Sexta-feira (2h)",
  "Segunda a Quinta (1h por dia)",
];

const CourseForm = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [profile, setProfile] = useState<string>();

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
              onSelect={setStartDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          Informe o primeiro dia em que o aluno iniciou as aulas.
        </p>
      </div>

      {/* Perfil de dias */}
      <div className="space-y-2">
        <label className="text-sm font-medium font-body text-foreground">
          Dias de aula do aluno
        </label>
        <Select value={profile} onValueChange={setProfile}>
          <SelectTrigger className="w-full bg-input border-border">
            <SelectValue placeholder="Selecione o perfil de aulas" />
          </SelectTrigger>
          <SelectContent>
            {PERFIS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
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
