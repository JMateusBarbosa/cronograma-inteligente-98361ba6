import { useState, useRef } from "react";
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
  type ScheduleResult,
} from "@/lib/scheduleCalculator";

// ── Mock data (será substituído pelo banco de dados) ───────────────
interface MockModule {
  name: string;
  hours: number;
}

interface MockCourse {
  id: string;
  name: string;
  modules: MockModule[];
}

const MOCK_COURSES: MockCourse[] = [
  {
    id: "1",
    name: "Informática Básica",
    modules: [
      { name: "Digitação", hours: 8 },
      { name: "IPD", hours: 8 },
      { name: "Windows", hours: 16 },
      { name: "Word", hours: 16 },
      { name: "Excel", hours: 16 },
      { name: "PowerPoint", hours: 8 },
      { name: "Internet", hours: 16 },
      { name: "Redes Sociais", hours: 8 },
    ],
  },
  {
    id: "2",
    name: "Informática Completa",
    modules: [
      { name: "Digitação", hours: 8 },
      { name: "IPD", hours: 8 },
      { name: "Windows", hours: 16 },
      { name: "Word", hours: 24 },
      { name: "Excel", hours: 24 },
      { name: "PowerPoint", hours: 16 },
      { name: "Internet", hours: 16 },
      { name: "Access", hours: 16 },
      { name: "Redes Sociais", hours: 8 },
      { name: "Manutenção", hours: 16 },
    ],
  },
  {
    id: "3",
    name: "Excel Avançado",
    modules: [
      { name: "Revisão Excel Básico", hours: 8 },
      { name: "Fórmulas Avançadas", hours: 16 },
      { name: "Tabelas Dinâmicas", hours: 12 },
      { name: "Macros e VBA", hours: 16 },
      { name: "Dashboards", hours: 12 },
    ],
  },
];

const PERFIS = [
  "Segunda e Quarta (1h por dia)",
  "Terça e Quinta (1h por dia)",
  "Sexta-feira (2h)",
  "Sábado (2h)",
  "Segunda a Quinta (1h por dia)",
];

const fmt = (d: Date) => format(d, "dd/MM/yyyy", { locale: ptBR });
const fmtLong = (d: Date) =>
  format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

// ── Component ──────────────────────────────────────────────────────
const Inicio = () => {
  const [studentName, setStudentName] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
  const [profile, setProfile] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<Date>();
  const [results, setResults] = useState<ScheduleResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const selectedCourse = MOCK_COURSES.find((c) => c.id === selectedCourseId);
  const totalHours = selectedCourse
    ? selectedCourse.modules.reduce((s, m) => s + m.hours, 0)
    : 0;

  const canGenerate = !!selectedCourseId && !!profile && !!startDate;

  const handleGenerate = () => {
    if (!selectedCourse || !profile || !startDate) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const schedule = calcularCronograma(
      startDate,
      profile,
      selectedCourse.modules
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
    setProfile(undefined);
    setStartDate(undefined);
    setResults([]);
    setShowResults(false);
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
    const courseLine = selectedCourse ? `Curso: ${selectedCourse.name}\n` : "";
    const dateLine = startDate ? `Data de início: ${fmt(startDate)}\n` : "";
    const profileLine = profile ? `Dias de aula: ${profile}\n` : "";

    const csv =
      studentLine + courseLine + dateLine + profileLine + "\n" + header + rows;

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cronograma-${selectedCourse?.name.replace(/\s+/g, "-").toLowerCase() || "curso"}.csv`;
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

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary">
          Gerador de Cronograma de Curso
        </h1>
        <p className="mt-2 text-muted-foreground">
          Selecione o curso e informe os dados do aluno para gerar
          automaticamente o cronograma completo.
        </p>
      </div>

      {/* Form Card */}
      <Card className="p-6 md:p-8 shadow-md">
        <div className="space-y-6">
          {/* Student Name */}
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

          {/* Course Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Curso <span className="text-destructive">*</span>
            </label>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
            >
              <SelectTrigger className="w-full bg-input border-border">
                <SelectValue placeholder="Selecione o curso" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_COURSES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Course Info */}
            {selectedCourse && (
              <div className="flex flex-wrap gap-4 mt-3 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    Carga horária total:
                  </span>
                  <span className="font-semibold text-foreground">
                    {totalHours}h
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Layers className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    Quantidade de módulos:
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedCourse.modules.length}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Profile Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Dias de aula <span className="text-destructive">*</span>
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

          {/* Start Date */}
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
                    ? format(startDate, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })
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
            <p className="text-xs text-muted-foreground">
              Se a data informada não for um dia de aula ou coincidir com feriado, o sistema ajustará automaticamente para o próximo dia disponível.
            </p>
          </div>
        </div>

        {/* Generate Button */}
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

      {/* Results Section */}
      {showResults && results.length > 0 && (
        <div ref={resultsRef} className="mt-10 print:mt-4" data-print-area>
          <h2 className="text-xl md:text-2xl font-heading font-bold text-primary mb-4">
            Cronograma do Curso
          </h2>

          {/* Summary Info */}
          <Card className="p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {studentName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">Aluno:</span>
                  <span className="font-semibold text-foreground truncate">
                    {studentName}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Curso:</span>
                <span className="font-semibold text-foreground truncate">
                  {selectedCourse?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Carga total:</span>
                <span className="font-semibold text-foreground">
                  {totalResultHours}h
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Início:</span>
                <span className="font-semibold text-foreground">
                  {startDate && fmt(startDate)}
                </span>
              </div>
            </div>

            {results.length > 0 && (
              <>
                <Separator className="my-3" />
                <div className="grid grid-cols-3 gap-3">
                  <SummaryCard
                    label="Total de Módulos"
                    value={String(results.length)}
                  />
                  <SummaryCard
                    label="Dias de Aula"
                    value={String(totalClassDays)}
                  />
                  <SummaryCard
                    label="Previsão de Término"
                    value={fmt(results[results.length - 1].endDate)}
                  />
                </div>
              </>
            )}
          </Card>

          {/* Schedule Table */}
          <Card className="shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="py-3 px-4 text-left font-medium">Ordem</th>
                    <th className="py-3 px-4 text-left font-medium">Módulo</th>
                    <th className="py-3 px-4 text-left font-medium">
                      Carga Horária
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      Data de Início
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      Data de Término
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-border/50 transition-colors",
                        i % 2 === 0
                          ? "bg-card"
                          : "bg-muted/30"
                      )}
                    >
                      <td className="py-3 px-4 text-muted-foreground font-medium">
                        {i + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {r.module}
                      </td>
                      <td className="py-3 px-4">{r.hours}h</td>
                      <td className="py-3 px-4">{fmt(r.startDate)}</td>
                      <td className="py-3 px-4">{fmt(r.endDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir cronograma
            </Button>
            <Button
              variant="outline"
              onClick={handleNewQuery}
              className="gap-2"
            >
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
