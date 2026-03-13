import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const Cursos = () => {
  return (
    <div className="max-w-[900px] mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary">
          Cursos
        </h2>
        <p className="mt-2 text-muted-foreground font-body">
          Gerencie os cursos cadastrados no sistema.
        </p>
      </div>

      <Card className="p-10 flex flex-col items-center gap-4 text-center">
        <BookOpen size={48} className="text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Esta funcionalidade será implementada em breve.
        </p>
      </Card>
    </div>
  );
};

export default Cursos;
