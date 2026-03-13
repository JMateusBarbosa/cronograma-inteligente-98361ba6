import { Card } from "@/components/ui/card";
import { Layers } from "lucide-react";

const Modulos = () => {
  return (
    <div className="max-w-[900px] mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary">
          Módulos
        </h2>
        <p className="mt-2 text-muted-foreground font-body">
          Gerencie os módulos cadastrados no sistema.
        </p>
      </div>

      <Card className="p-10 flex flex-col items-center gap-4 text-center">
        <Layers size={48} className="text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Esta funcionalidade será implementada em breve.
        </p>
      </Card>
    </div>
  );
};

export default Modulos;
