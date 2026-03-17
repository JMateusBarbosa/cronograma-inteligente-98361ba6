import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import CourseForm from "@/components/CourseForm";
import ModulesSection from "@/components/ModulesSection";
import type { ModuleRow } from "@/components/ModulesSection";
import ScheduleResultDialog from "@/components/ScheduleResultDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  calcularCronograma,
  type ScheduleResult,
  type HolidayConfig,
} from "@/lib/scheduleCalculator";
import { getFeriados, getPerfisAula, getPerfilDias } from "@/lib/database";

const ConsultaAvulsa = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [profileId, setProfileId] = useState<string>();
  const [modules, setModules] = useState<ModuleRow[]>([
    { id: 1, name: "", hours: "", isNew: false },
  ]);

  const [results, setResults] = useState<ScheduleResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const perfisQuery = useQuery({ queryKey: ["perfis-aula"], queryFn: getPerfisAula });
  const feriadosQuery = useQuery({ queryKey: ["feriados"], queryFn: getFeriados });
  const perfilDiasQuery = useQuery({
    queryKey: ["perfil-dias", profileId],
    queryFn: () => getPerfilDias(profileId!),
    enabled: !!profileId,
  });

  const selectedProfile = perfisQuery.data?.find((p) => p.id === profileId);

  const handleGenerate = () => {
    if (!startDate) {
      toast.error("Selecione a data de início do curso.");
      return;
    }
    if (!profileId || !selectedProfile) {
      toast.error("Selecione o perfil de dias de aula.");
      return;
    }

    const perfilDias = perfilDiasQuery.data ?? [];
    if (perfilDias.length === 0) {
      toast.error("O perfil selecionado não possui dias de aula configurados.");
      return;
    }

    const validModules = modules.filter(
      (m) => m.name.trim() && m.hours && Number(m.hours) > 0
    );

    if (validModules.length === 0) {
      toast.error("Adicione pelo menos um módulo com nome e carga horária.");
      return;
    }

    const input = validModules.map((m) => ({
      name: m.name.trim(),
      hours: Number(m.hours),
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
      input,
      holidays,
      {
        daysOfWeek: perfilDias.map((d) => d.dia_semana),
        hoursPerDay: selectedProfile.horas_por_dia,
      }
    );

    setResults(schedule);
    setShowResults(true);
  };

  return (
    <div>
      {/* Main Card */}
      <Card className="p-6 md:p-8 shadow-md space-y-10">
        <CourseForm
          startDate={startDate}
          onStartDateChange={setStartDate}
          profileId={profileId}
          onProfileChange={setProfileId}
          perfis={perfisQuery.data ?? []}
          isLoadingPerfis={perfisQuery.isLoading}
        />
        <ModulesSection modules={modules} onModulesChange={setModules} />
      </Card>

      {/* Generate Button */}
      <div className="mt-10 flex justify-center">
        <Button
          size="lg"
          onClick={handleGenerate}
          className="w-full md:w-auto md:min-w-[320px] h-12 text-base font-heading font-semibold"
        >
          Gerar cronograma
        </Button>
      </div>

      {/* Results dialog */}
      {startDate && selectedProfile && (
        <ScheduleResultDialog
          open={showResults}
          onOpenChange={setShowResults}
          results={results}
          profile={selectedProfile.nome}
          startDate={startDate}
        />
      )}
    </div>
  );
};

export default ConsultaAvulsa;
