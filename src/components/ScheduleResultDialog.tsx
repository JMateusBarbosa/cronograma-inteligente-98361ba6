import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarX2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ScheduleResult } from "@/lib/scheduleCalculator";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: ScheduleResult[];
  profile: string;
  startDate: Date;
}

const fmt = (d: Date) => format(d, "dd/MM/yyyy", { locale: ptBR });
const fmtLong = (d: Date) => format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

const ScheduleResultDialog = ({ open, onOpenChange, results, profile, startDate }: Props) => {
  const totalHours = results.reduce((s, r) => s + r.hours, 0);
  const totalClassDays = results.reduce((s, r) => s + r.classDaysUsed, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading text-primary">
            Cronograma Gerado
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Início: {fmtLong(startDate)} · Perfil: {profile}
          </DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          <SummaryCard label="Módulos" value={String(results.length)} />
          <SummaryCard label="Carga total" value={`${totalHours}h`} />
          <SummaryCard label="Dias de aula" value={String(totalClassDays)} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">#</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Módulo</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Horas</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Início</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Término</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Aulas</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Feriados</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-2 text-muted-foreground">{i + 1}</td>
                  <td className="py-2.5 px-2 font-medium text-foreground">{r.module}</td>
                  <td className="py-2.5 px-2">{r.hours}h</td>
                  <td className="py-2.5 px-2">{fmt(r.startDate)}</td>
                  <td className="py-2.5 px-2">{fmt(r.endDate)}</td>
                  <td className="py-2.5 px-2">{r.classDaysUsed}</td>
                  <td className="py-2.5 px-2 text-center">
                    {r.holidaysImpacted.length > 0 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 text-destructive cursor-help">
                            <CalendarX2 className="h-3.5 w-3.5" />
                            {r.holidaysImpacted.length}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="font-medium mb-1">Feriados impactados:</p>
                          {r.holidaysImpacted.map((h, j) => (
                            <p key={j} className="text-xs">{fmtLong(h)}</p>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {results.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Previsão de término do curso: <strong>{fmtLong(results[results.length - 1].endDate)}</strong>
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-heading font-bold text-primary">{value}</p>
  </div>
);

export default ScheduleResultDialog;
