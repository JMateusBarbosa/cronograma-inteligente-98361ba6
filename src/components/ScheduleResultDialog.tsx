import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarX2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const totalHours = results.reduce((s, r) => s + r.hours, 0);
  const totalClassDays = results.reduce((s, r) => s + r.classDaysUsed, 0);
  const totalHolidays = results.reduce((s, r) => s + r.holidaysImpacted.length, 0);

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          <SummaryCard label="Módulos" value={String(results.length)} />
          <SummaryCard label="Carga total" value={`${totalHours}h`} />
          <SummaryCard label="Dias de aula" value={String(totalClassDays)} />
          <SummaryCard label="Feriados" value={String(totalHolidays)} />
        </div>

        {/* Results */}
        <div className="mt-4">
          {isMobile ? (
            /* Mobile: card-based */
            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">#{i + 1}</span>
                    {r.holidaysImpacted.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-destructive">
                        <CalendarX2 className="h-3 w-3" />
                        {r.holidaysImpacted.length}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-foreground">{r.module}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Carga</p>
                      <p className="font-medium">{r.hours}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Aulas</p>
                      <p className="font-medium">{r.classDaysUsed} dias</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Início</p>
                      <p className="font-medium">{fmt(r.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Término</p>
                      <p className="font-medium">{fmt(r.endDate)}</p>
                    </div>
                  </div>
                  {r.holidaysImpacted.length > 0 && (
                    <div className="pt-1">
                      <p className="text-xs text-muted-foreground mb-1">Feriados:</p>
                      <div className="flex flex-wrap gap-1">
                        {r.holidaysImpacted.map((h, j) => (
                          <span key={j} className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                            {fmt(h)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Desktop: table */
            <div className="overflow-x-auto">
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
                              <p className="font-medium mb-1">Feriados no período:</p>
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
          )}
        </div>

        {results.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Previsão de término do curso: <strong>{fmtLong(results[results.length - 1].endDate)}</strong>
          </p>
        )}

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-heading"
          >
            <X className="h-4 w-4 mr-1" />
            Fechar
          </Button>
        </DialogFooter>
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
