import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import CourseForm from "@/components/CourseForm";
import ModulesSection from "@/components/ModulesSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 py-10">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary">
            Gerador de Cronograma de Curso
          </h2>
          <p className="mt-2 text-muted-foreground font-body">
            Preencha as informações abaixo para calcular automaticamente as datas de cada módulo.
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-6 md:p-8 shadow-md space-y-10">
          <CourseForm />
          <ModulesSection />
        </Card>

        {/* Generate Button — outside card */}
        <div className="mt-10 flex justify-center">
          <Button
            size="lg"
            className="w-full md:w-auto md:min-w-[320px] h-12 text-base font-heading font-semibold bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Gerar cronograma
          </Button>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default Index;
