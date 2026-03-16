import { useState } from "react";
import { toast } from "sonner";
import CourseForm from "@/components/CourseForm";
import ModulesSection from "@/components/ModulesSection";
import type { ModuleRow } from "@/components/ModulesSection";
import ScheduleResultDialog from "@/components/ScheduleResultDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calcularCronograma, type ScheduleResult } from "@/lib/scheduleCalculator";

const ConsultaAvulsa = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [profile, setProfile] = useState<string>();
  const [modules, setModules] = useState<ModuleRow[]>([
    { id: 1, name: "", hours: "", isNew: false },
  ]);

  const [results, setResults] = useState<ScheduleResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = () => {
    if (!startDate) {
      toast.error("Selecione a data de início do curso.");
      return;
    }
    if (!profile) {
      toast.error("Selecione o perfil de dias de aula.");
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

    const schedule = calcularCronograma(startDate, profile, input);
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
          profile={profile}
          onProfileChange={setProfile}
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
      {startDate && profile && (
        <ScheduleResultDialog
          open={showResults}
          onOpenChange={setShowResults}
          results={results}
          profile={profile}
          startDate={startDate}
        />
      )}
    </div>
  );
};

export default ConsultaAvulsa;
