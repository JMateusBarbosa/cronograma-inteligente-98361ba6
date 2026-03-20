import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Save, X, Loader2, Search, ChevronLeft, ChevronRight, Clock, Layers } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getCursos,
  getModulos,
  getModulosByCurso,
  createCurso,
  updateCurso,
  deleteCurso,
  saveCursoModulos,
  createModulo,
  getAllCursoModulosSummary,
  hoursToMonths,
  type Curso,
} from "@/lib/database";

interface GradeRow {
  modulo_id: string;
  carga_horaria: number;
  tempId: string;
}

const PAGE_SIZE = 10;

const AdminCursos = () => {
  const queryClient = useQueryClient();
  const [selectedCursoId, setSelectedCursoId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isNewCurso, setIsNewCurso] = useState(false);
  const [grade, setGrade] = useState<GradeRow[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Curso | null>(null);
  const [newModuloName, setNewModuloName] = useState("");
  const [showNewModulo, setShowNewModulo] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const cursosQuery = useQuery({ queryKey: ["cursos"], queryFn: getCursos });
  const modulosQuery = useQuery({ queryKey: ["modulos-all"], queryFn: getModulos });
  const summaryQuery = useQuery({ queryKey: ["cursos-summary"], queryFn: getAllCursoModulosSummary });

  const cursoModulosQuery = useQuery({
    queryKey: ["curso-modulos-edit", selectedCursoId],
    queryFn: () => getModulosByCurso(selectedCursoId!),
    enabled: !!selectedCursoId && !isNewCurso,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["cursos"] });
    queryClient.invalidateQueries({ queryKey: ["curso-modulos-edit"] });
    queryClient.invalidateQueries({ queryKey: ["cursos-summary"] });
    queryClient.invalidateQueries({ queryKey: ["modulos"] });
  };

  const createCursoMut = useMutation({
    mutationFn: async () => {
      const curso = await createCurso(editName.trim());
      if (grade.length > 0) {
        await saveCursoModulos(curso.id, grade.map((g, i) => ({
          modulo_id: g.modulo_id,
          carga_horaria: g.carga_horaria,
          ordem: i + 1,
        })));
      }
      return curso;
    },
    onSuccess: () => {
      invalidateAll();
      setIsNewCurso(false);
      setSelectedCursoId(null);
      setGrade([]);
      toast.success("Curso criado com sucesso!");
    },
    onError: () => toast.error("Erro ao criar curso."),
  });

  const updateCursoMut = useMutation({
    mutationFn: async () => {
      if (!selectedCursoId) return;
      await updateCurso(selectedCursoId, editName.trim());
      await saveCursoModulos(selectedCursoId, grade.map((g, i) => ({
        modulo_id: g.modulo_id,
        carga_horaria: g.carga_horaria,
        ordem: i + 1,
      })));
    },
    onSuccess: () => {
      invalidateAll();
      toast.success("Curso atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar curso."),
  });

  const deleteCursoMut = useMutation({
    mutationFn: (id: string) => deleteCurso(id),
    onSuccess: () => {
      invalidateAll();
      setDeleteTarget(null);
      if (selectedCursoId === deleteTarget?.id) {
        setSelectedCursoId(null);
        setGrade([]);
      }
      toast.success("Curso excluído!");
    },
    onError: () => toast.error("Erro ao excluir curso."),
  });

  const createModuloMut = useMutation({
    mutationFn: (nome: string) => createModulo(nome),
    onSuccess: (modulo) => {
      queryClient.invalidateQueries({ queryKey: ["modulos-all"] });
      setShowNewModulo(false);
      setNewModuloName("");
      setGrade([...grade, { modulo_id: modulo.id, carga_horaria: 1, tempId: crypto.randomUUID() }]);
      toast.success("Módulo criado e adicionado!");
    },
    onError: () => toast.error("Erro ao criar módulo."),
  });

  const handleSelectCurso = (curso: Curso) => {
    setSelectedCursoId(curso.id);
    setEditName(curso.nome);
    setIsNewCurso(false);
  };

  useEffect(() => {
    if (cursoModulosQuery.data && selectedCursoId && !isNewCurso) {
      setGrade(cursoModulosQuery.data.map((m) => ({
        modulo_id: m.modulo_id,
        carga_horaria: m.carga_horaria,
        tempId: m.id,
      })));
    }
  }, [cursoModulosQuery.data, selectedCursoId, isNewCurso]);

  const handleNewCurso = () => {
    setIsNewCurso(true);
    setSelectedCursoId(null);
    setEditName("");
    setGrade([]);
  };

  const addGradeRow = () => {
    setGrade([...grade, { modulo_id: "", carga_horaria: 1, tempId: crypto.randomUUID() }]);
  };

  const updateGradeRow = (tempId: string, field: keyof GradeRow, value: string | number) => {
    setGrade(grade.map((g) => g.tempId === tempId ? { ...g, [field]: value } : g));
  };

  const removeGradeRow = (tempId: string) => {
    setGrade(grade.filter((g) => g.tempId !== tempId));
  };

  const moveRow = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= grade.length) return;
    const newGrade = [...grade];
    [newGrade[index], newGrade[newIndex]] = [newGrade[newIndex], newGrade[index]];
    setGrade(newGrade);
  };

  const totalCarga = grade.reduce((s, g) => s + (g.carga_horaria || 0), 0);
  const canSave = editName.trim().length > 0 && grade.every((g) => g.modulo_id && g.carga_horaria > 0);
  const allCursos = cursosQuery.data ?? [];
  const allModulos = modulosQuery.data ?? [];
  const summaryMap = summaryQuery.data ?? {};
  const isSaving = createCursoMut.isPending || updateCursoMut.isPending;

  const filtered = useMemo(() => {
    if (!search.trim()) return allCursos;
    const q = search.toLowerCase();
    return allCursos.filter((c) => c.nome.toLowerCase().includes(q));
  }, [allCursos, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const usedModuloIds = grade.map((g) => g.modulo_id).filter(Boolean);

  const getCursoInfo = (cursoId: string) => {
    const summary = summaryMap[cursoId];
    if (!summary) return { hours: 0, months: 0, modules: 0 };
    return {
      hours: summary.totalHours,
      months: hoursToMonths(summary.totalHours),
      modules: summary.moduleCount,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground shrink-0">
          {allCursos.length} curso{allCursos.length !== 1 ? "s" : ""} cadastrado{allCursos.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2 w-full sm:flex-1 sm:max-w-md sm:ml-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Pesquisar curso..."
              className="pl-9 bg-input border-border"
            />
          </div>
          <Button onClick={handleNewCurso} className="bg-accent text-accent-foreground hover:bg-accent/80 gap-2 shrink-0">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Novo curso</span><span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4">
        {/* Course list */}
        <div className="space-y-3">
          <Card className="overflow-hidden">
            {cursosQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                {search ? "Nenhum curso encontrado." : "Nenhum curso cadastrado."}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {paged.map((c) => {
                  const info = getCursoInfo(c.id);
                  return (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors hover:bg-muted/30 ${
                        selectedCursoId === c.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                      }`}
                      onClick={() => handleSelectCurso(c)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">{c.nome}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {info.hours}h
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {info.months} {info.months === 1 ? "mês" : "meses"}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {info.modules} mód.
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0 ml-2">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleSelectCurso(c); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-2">{currentPage}/{totalPages}</span>
                <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Editor panel */}
        {(selectedCursoId || isNewCurso) && (
          <Card className="p-4 sm:p-5 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome do curso</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ex: Informática Kids"
                className="bg-input border-border"
              />
            </div>

            {/* Grade curricular */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-medium text-foreground">Grade curricular</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Carga total: <strong className="text-foreground">{totalCarga}h</strong></span>
                  <span>Duração: <strong className="text-foreground">{hoursToMonths(totalCarga)} {hoursToMonths(totalCarga) === 1 ? "mês" : "meses"}</strong></span>
                </div>
              </div>

              {grade.length > 0 && (
                <div className="space-y-2">
                  {grade.map((row, i) => (
                    <div key={row.tempId} className="flex items-center gap-2 p-2 rounded border border-border bg-muted/20">
                      <div className="flex flex-col gap-0.5">
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => moveRow(i, -1)} disabled={i === 0}>
                          <span className="text-xs">▲</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => moveRow(i, 1)} disabled={i === grade.length - 1}>
                          <span className="text-xs">▼</span>
                        </Button>
                      </div>
                      <span className="text-xs text-muted-foreground w-6 text-center shrink-0">{i + 1}</span>
                      <Select value={row.modulo_id} onValueChange={(v) => updateGradeRow(row.tempId, "modulo_id", v)}>
                        <SelectTrigger className="flex-1 bg-input border-border text-sm min-w-0">
                          <SelectValue placeholder="Selecionar módulo" />
                        </SelectTrigger>
                        <SelectContent>
                          {allModulos
                            .filter((m) => m.id === row.modulo_id || !usedModuloIds.includes(m.id))
                            .map((m) => (
                              <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={1}
                        value={row.carga_horaria || ""}
                        onChange={(e) => updateGradeRow(row.tempId, "carga_horaria", parseInt(e.target.value) || 0)}
                        className="w-16 sm:w-20 bg-input border-border text-sm"
                        placeholder="h"
                      />
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive shrink-0" onClick={() => removeGradeRow(row.tempId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={addGradeRow} className="gap-1">
                  <Plus className="h-3 w-3" /> Adicionar módulo
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowNewModulo(true)} className="gap-1">
                  <Plus className="h-3 w-3" /> Criar novo módulo
                </Button>
              </div>

              {showNewModulo && (
                <div className="flex gap-2 p-3 rounded border border-border bg-muted/30">
                  <Input
                    value={newModuloName}
                    onChange={(e) => setNewModuloName(e.target.value)}
                    placeholder="Nome do novo módulo"
                    className="flex-1 bg-input border-border"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && newModuloName.trim() && createModuloMut.mutate(newModuloName.trim())}
                  />
                  <Button size="sm" onClick={() => newModuloName.trim() && createModuloMut.mutate(newModuloName.trim())} disabled={createModuloMut.isPending}>
                    {createModuloMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowNewModulo(false); setNewModuloName(""); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => isNewCurso ? createCursoMut.mutate() : updateCursoMut.mutate()}
                disabled={!canSave || isSaving}
                className="gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isNewCurso ? "Criar curso" : "Salvar alterações"}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setSelectedCursoId(null); setIsNewCurso(false); setGrade([]); }}
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir curso "{deleteTarget?.nome}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá o curso e todas as associações de módulos. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteCursoMut.mutate(deleteTarget.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCursos;
