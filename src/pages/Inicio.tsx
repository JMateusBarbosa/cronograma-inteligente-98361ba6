import { useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  FileDown,
  Printer,
  RefreshCw,
  BookOpen,
  Clock,
  Layers,
  User,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Separator } from "@/components/ui/separator";
import {
  calcularCronograma,
  type HolidayConfig,
  type ScheduleResult,
} from "@/lib/scheduleCalculator";
import {
  getCursos,
  getFeriados,
  getModulosByCurso,
  getPerfilDias,
  getPerfisAula,
} from "@/lib/database";
import { getSupabaseConfigDiagnostics, isSupabaseConfigured } from "@/lib/supabaseRest";

const fmt = (d: Date) => format(d, "dd/MM/yyyy", { locale: ptBR });

const Inicio = () => {
  const [studentName, setStudentName] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
  const [profileId, setProfileId] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<Date>();
  const [results, setResults] = useState<ScheduleResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const cursosQuery = useQuery({
    queryKey: ["cursos"],
    queryFn: getCursos,
  });

  const perfisQuery = useQuery({
    queryKey: ["perfis-aula"],
    queryFn: getPerfisAula,
  });

  const feriadosQuery = useQuery({
    queryKey: ["feriados"],
    queryFn: getFeriados,
  });

  const modulosQuery = useQuery({
    queryKey: ["modulos", selectedCourseId],
    queryFn: () => getModulosByCurso(selectedCourseId!),
    enabled: !!selectedCourseId,
  });

  const perfilDiasQuery = useQuery({
    queryKey: ["perfil-dias", profileId],
    queryFn: () => getPerfilDias(profileId!),
    enabled: !!profileId,
  });

  const selectedCourse = useMemo(
    () => cursosQuery.data?.find((c) => c.id === selectedCourseId),
    [cursosQuery.data, selectedCourseId]
  );

  const selectedProfile = useMemo(
    () => perfisQuery.data?.find((p) => p.id === profileId),
    [perfisQuery.data, profileId]
  );

  const totalHours = useMemo(
    () => modulosQuery.data?.reduce((s, m) => s + m.carga_horaria, 0) ?? 0,
    [modulosQuery.data]
  );

  const canGenerate =
    !!selectedCourseId &&
    !!profileId &&
    !!startDate &&
    !modulosQuery.isLoading &&
    !perfilDiasQuery.isLoading;

  const handleGenerate = () => {
    if (!selectedCourseId || !profileId || !startDate) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const modulos = modulosQuery.data ?? [];
    const perfilDias = perfilDiasQuery.data ?? [];

    if (modulos.length === 0) {
      toast.error("Esse curso não possui módulos cadastrados.");
      return;
    }

    if (!selectedProfile || perfilDias.length === 0) {
      toast.error("O perfil selecionado não possui dias de aula configurados.");
      return;
    }

    const modulesInput = modulos.map((m) => ({
      name: m.nome,
      hours: m.carga_horaria,
    }));

    const holidays: HolidayConfig[] = (feriadosQuery.data ?? []).map((f) => ({
      date: f.data,
      isRecurring: f.is_recurring,
      month: f.month,
      day: f.day,
    }));

    const schedule = calcularCronograma(
      startDate,
      selectedProfile.nome,
      modulesInput,
      holidays,
      {
        daysOfWeek: perfilDias.map((d) => d.dia_semana),
        hoursPerDay: selectedProfile.horas_por_dia,
      }
    );

    setResults(schedule);
    setShowResults(true);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleNewQuery = () => {
    setStudentName("");
    setSelectedCourseId(undefined);
    setProfileId(undefined);
    setStartDate(undefined);
    setResults([]);
    setShowResults(false);
    setFormKey((k) => k + 1);
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const header = "Ordem;Módulo;Carga Horária;Data de Início;Data de Término\n";
    const rows = results
      .map(
        (r, i) =>
          `${i + 1};${r.module};${r.hours}h;${fmt(r.startDate)};${fmt(r.endDate)}`
      )
      .join("\n");

    const studentLine = studentName ? `Aluno: ${studentName}\n` : "";
    const courseLine = selectedCourse ? `Curso: ${selectedCourse.nome}\n` : "";
    const dateLine = startDate ? `Data de início: ${fmt(startDate)}\n` : "";
    const profileLine = selectedProfile
      ? `Dias de aula: ${selectedProfile.nome}\n`
      : "";

    const csv =
      studentLine + courseLine + dateLine + profileLine + "\n" + header + rows;

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cronograma-${selectedCourse?.nome.replace(/\s+/g, "-").toLowerCase() || "curso"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso!");
  };

  const handlePrint = () => {
    document.body.classList.add("printing-schedule");
    window.print();
    document.body.classList.remove("printing-schedule");
  };

  const totalClassDays = results.reduce((s, r) => s + r.classDaysUsed, 0);
  const totalResultHours = results.reduce((s, r) => s + r.hours, 0);

  const hasAnyQueryError =
    cursosQuery.isError || perfisQuery.isError || feriadosQuery.isError;

  const supabaseDiagnostics = getSupabaseConfigDiagnostics();

  const queryErrorMessage = [
    cursosQuery.error,
    perfisQuery.error,
    feriadosQuery.error,
  ]
    .filter((error): error is Error => Boolean(error))
    .map((error) => error.message)
    .join(" | ");

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary">
          Gerador de Cronograma de Curso
        </h1>
        <p className="mt-2 text-muted-foreground">
          Selecione o curso e informe os dados do aluno para gerar
          automaticamente o cronograma completo.
        </p>
      </div>

      {!isSupabaseConfigured() && (
        <Card className="p-4 mb-6 border-amber-500/40 bg-amber-500/5 space-y-2">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Crie um arquivo <code>.env</code> (não <code>.env.example</code>) e configure <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.
            Se você colou valores com <code>\n</code>, remova esses caracteres e reinicie o <code>npm run dev</code>.
          </p>
          {supabaseDiagnostics.length > 0 && (
            <ul className="text-xs text-amber-700 dark:text-amber-300 list-disc ml-4">
              {supabaseDiagnostics.map((diagnostic) => (
                <li key={diagnostic}>{diagnostic}</li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {hasAnyQueryError && (
        <Card className="p-4 mb-6 border-destructive/30 bg-destructive/5 space-y-2">
          <p className="text-sm text-destructive">
            Não foi possível carregar dados do banco. Verifique URL, chave, políticas RLS e se as tabelas estão no schema <code>public</code>.
          </p>
          {queryErrorMessage && (
            <p className="text-xs text-destructive/90 break-words">Detalhe: {queryErrorMessage}</p>
          )}
        </Card>
      )}

      <Card key={formKey} className="p-6 md:p-8 shadow-md">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Nome do aluno
            </label>
            <Input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Digite o nome do aluno"
              maxLength={100}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Curso <span className="text-destructive">*</span>
            </label>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-full bg-input border-border">
                <SelectValue
                  placeholder={cursosQuery.isLoading ? "Carregando cursos..." : "Selecione o curso"}
                />
              </SelectTrigger>
              <SelectContent>
                {(cursosQuery.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCourse && (
              <div className="flex flex-wrap gap-4 mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Carga horária total:</span>
                  <span className="font-semibold text-foreground">{totalHours}h</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Layers className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Quantidade de módulos:</span>
                  <span className="font-semibold text-foreground">
                    {modulosQuery.data?.length ?? 0}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Dias de aula <span className="text-destructive">*</span>
            </label>
            <Select value={profileId} onValueChange={setProfileId}>
              <SelectTrigger className="w-full bg-input border-border">
                <SelectValue
                  placeholder={perfisQuery.isLoading ? "Carregando perfis..." : "Selecione o perfil de aulas"}
                />
              </SelectTrigger>
              <SelectContent>
                {(perfisQuery.data ?? []).map((p) => (
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              Data de início <span className="text-destructive">*</span>
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
                  locale={ptBR}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full md:w-auto md:min-w-[320px] h-12 text-base font-heading font-semibold"
          >
            Gerar cronograma
          </Button>
        </div>
      </Card>

      {showResults && results.length > 0 && (
        <div ref={resultsRef} className="mt-10 print:mt-4" data-print-area>
          <h2 className="text-xl md:text-2xl font-heading font-bold text-primary mb-4">
            Cronograma do Curso
          </h2>

          <Card className="p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {studentName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Aluno:</span>
                  <span className="font-semibold text-foreground truncate">{studentName}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Curso:</span>
                <span className="font-semibold text-foreground truncate">{selectedCourse?.nome}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Carga total:</span>
                <span className="font-semibold text-foreground">{totalResultHours}h</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Início:</span>
                <span className="font-semibold text-foreground">{startDate && fmt(startDate)}</span>
              </div>
            </div>

            {results.length > 0 && (
              <>
                <Separator className="my-3" />
                <div className="grid grid-cols-3 gap-3">
                  <SummaryCard label="Total de Módulos" value={String(results.length)} />
                  <SummaryCard label="Dias de Aula" value={String(totalClassDays)} />
                  <SummaryCard
                    label="Previsão de Término"
                    value={fmt(results[results.length - 1].endDate)}
                  />
                </div>
              </>
            )}
          </Card>

          <Card className="shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="py-3 px-4 text-left font-medium">Ordem</th>
                    <th className="py-3 px-4 text-left font-medium">Módulo</th>
                    <th className="py-3 px-4 text-left font-medium">Carga Horária</th>
                    <th className="py-3 px-4 text-left font-medium">Data de Início</th>
                    <th className="py-3 px-4 text-left font-medium">Data de Término</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-border/50 transition-colors",
                        i % 2 === 0 ? "bg-card" : "bg-muted/30"
                      )}
                    >
                      <td className="py-3 px-4 text-muted-foreground font-medium">{i + 1}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{r.module}</td>
                      <td className="py-3 px-4">{r.hours}h</td>
                      <td className="py-3 px-4">{fmt(r.startDate)}</td>
                      <td className="py-3 px-4">{fmt(r.endDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <FileDown className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir cronograma
            </Button>
            <Button variant="outline" onClick={handleNewQuery} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Nova consulta
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-heading font-bold text-primary">{value}</p>
  </div>
);

export default Inicio;
