import { Card } from "@/components/ui/card";
import { BookOpen, Calculator, Layers, CalendarOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const shortcuts = [
  { label: "Consulta Avulsa", icon: Calculator, to: "/consulta-avulsa", description: "Calcular cronograma manualmente" },
  { label: "Cursos", icon: BookOpen, to: "/cursos", description: "Gerenciar cursos cadastrados" },
  { label: "Módulos", icon: Layers, to: "/modulos", description: "Gerenciar módulos" },
  { label: "Feriados", icon: CalendarOff, to: "/feriados", description: "Gerenciar feriados" },
];

const Inicio = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary">
          Gerador de Cronograma de Cursos
        </h2>
        <p className="mt-2 text-muted-foreground font-body">
          Utilize o menu lateral para acessar as ferramentas do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {shortcuts.map((s) => (
          <Card
            key={s.to}
            onClick={() => navigate(s.to)}
            className="p-6 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-accent transition-all group"
          >
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <s.icon size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">{s.label}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Inicio;
