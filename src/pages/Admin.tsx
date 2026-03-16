import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Layers, CalendarOff } from "lucide-react";
import AdminCursos from "@/components/admin/AdminCursos";
import AdminModulos from "@/components/admin/AdminModulos";
import AdminFeriados from "@/components/admin/AdminFeriados";

const Admin = () => {
  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary">
          Administração
        </h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie cursos, módulos e feriados do sistema.
        </p>
      </div>

      <Tabs defaultValue="cursos" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="cursos" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="modulos" className="gap-2">
            <Layers className="h-4 w-4" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="feriados" className="gap-2">
            <CalendarOff className="h-4 w-4" />
            Feriados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cursos">
          <AdminCursos />
        </TabsContent>

        <TabsContent value="modulos">
          <AdminModulos />
        </TabsContent>

        <TabsContent value="feriados">
          <AdminFeriados />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
