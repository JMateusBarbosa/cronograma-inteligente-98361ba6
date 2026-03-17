import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Calculator } from "lucide-react";
import Inicio from "./Inicio";
import ConsultaAvulsa from "./ConsultaAvulsa";

const Home = () => {
  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary">
          Gerador de Cronograma
        </h1>
        <p className="mt-2 text-muted-foreground">
          Gere cronogramas completos a partir de cursos cadastrados ou crie consultas avulsas.
        </p>
      </div>

      <Tabs defaultValue="curso" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-6 h-12 bg-muted/60 p-1">
          <TabsTrigger
            value="curso"
            className="gap-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold data-[state=active]:tab-active-indicator transition-all"
          >
            <GraduationCap className="h-4 w-4" />
            Gerador por Curso
          </TabsTrigger>
          <TabsTrigger
            value="avulsa"
            className="gap-2 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold data-[state=active]:tab-active-indicator transition-all"
          >
            <Calculator className="h-4 w-4" />
            Consulta Avulsa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="curso">
          <Inicio />
        </TabsContent>

        <TabsContent value="avulsa">
          <ConsultaAvulsa />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;
