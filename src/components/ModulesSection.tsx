import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ModuleRow {
  id: number;
  name: string;
  hours: string;
  isNew: boolean;
}

const ModulesSection = () => {
  const [modules, setModules] = useState<ModuleRow[]>([
    { id: 1, name: "", hours: "", isNew: false },
  ]);
  const [nextId, setNextId] = useState(2);

  const addModule = () => {
    setModules((prev) => [...prev, { id: nextId, name: "", hours: "", isNew: true }]);
    setNextId((prev) => prev + 1);
  };

  const removeModule = (id: number) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  const updateModule = (id: number, field: "name" | "hours", value: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value, isNew: false } : m))
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-heading font-semibold text-primary">
          Módulos do Curso
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione os módulos do curso e informe a carga horária de cada um.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground font-body">
                Nome do módulo
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground font-body w-[160px]">
                Carga horária (horas)
              </th>
              <th className="py-3 px-2 w-[60px]" />
            </tr>
          </thead>
          <tbody>
            {modules.map((mod) => (
              <tr
                key={mod.id}
                className={mod.isNew ? "animate-module-row" : ""}
              >
                <td className="py-2 px-2">
                  <Input
                    placeholder="Ex: Windows, Word, Excel"
                    value={mod.name}
                    onChange={(e) => updateModule(mod.id, "name", e.target.value)}
                    className="bg-input border-border"
                  />
                </td>
                <td className="py-2 px-2">
                  <Input
                    type="number"
                    placeholder="Ex: 8, 16, 24"
                    value={mod.hours}
                    onChange={(e) => updateModule(mod.id, "hours", e.target.value)}
                    className="bg-input border-border"
                  />
                </td>
                <td className="py-2 px-2 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeModule(mod.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Remover módulo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        onClick={addModule}
        className="bg-accent text-accent-foreground hover:bg-accent/80 font-heading font-semibold"
      >
        Adicionar módulo
      </Button>
    </div>
  );
};

export default ModulesSection;
