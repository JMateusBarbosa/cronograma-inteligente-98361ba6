import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ModuleRow {
  id: number;
  name: string;
  hours: string;
  isNew: boolean;
}

interface Props {
  modules: ModuleRow[];
  onModulesChange: (modules: ModuleRow[]) => void;
}

let nextModuleId = Date.now();

const ModulesSection = ({ modules, onModulesChange }: Props) => {
  const addModule = () => {
    nextModuleId++;
    onModulesChange([...modules, { id: nextModuleId, name: "", hours: "", isNew: true }]);
  };

  const removeModule = (id: number) => {
    onModulesChange(modules.filter((m) => m.id !== id));
  };

  const updateModule = (id: number, field: "name" | "hours", value: string) => {
    if (field === "hours") {
      // Only allow positive integers
      const cleaned = value.replace(/[^0-9]/g, "");
      onModulesChange(
        modules.map((m) => (m.id === id ? { ...m, hours: cleaned, isNew: false } : m))
      );
      return;
    }
    onModulesChange(
      modules.map((m) => (m.id === id ? { ...m, [field]: value, isNew: false } : m))
    );
  };

  const totalHours = modules.reduce((sum, m) => sum + (parseInt(m.hours) || 0), 0);

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
            {modules.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-muted-foreground text-sm">
                  Nenhum módulo adicionado. Clique em "Adicionar módulo" para começar.
                </td>
              </tr>
            ) : (
              modules.map((mod) => (
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
                      maxLength={100}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ex: 8, 16, 24"
                      value={mod.hours}
                      onChange={(e) => updateModule(mod.id, "hours", e.target.value)}
                      className="bg-input border-border"
                      maxLength={4}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          onClick={addModule}
          className="bg-accent text-accent-foreground hover:bg-accent/80 font-heading font-semibold"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar módulo
        </Button>

        {totalHours > 0 && (
          <span className="text-sm text-muted-foreground font-body">
            Carga total: <strong className="text-foreground">{totalHours}h</strong>
          </span>
        )}
      </div>
    </div>
  );
};

export default ModulesSection;
