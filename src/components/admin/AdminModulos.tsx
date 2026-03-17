import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Save, X, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
  getModulos,
  createModulo,
  updateModulo,
  deleteModulo,
  countCursoModulosByModulo,
  type Modulo,
} from "@/lib/database";

const PAGE_SIZE = 10;

const AdminModulos = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Modulo | null>(null);
  const [deleteUsageCount, setDeleteUsageCount] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const modulosQuery = useQuery({ queryKey: ["modulos-all"], queryFn: getModulos });

  const filtered = useMemo(() => {
    const all = modulosQuery.data ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter((m) => m.nome.toLowerCase().includes(q));
  }, [modulosQuery.data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page when search changes
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const createMut = useMutation({
    mutationFn: (nome: string) => createModulo(nome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modulos-all"] });
      setNewName("");
      setShowNew(false);
      toast.success("Módulo criado com sucesso!");
    },
    onError: () => toast.error("Erro ao criar módulo."),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, nome }: { id: string; nome: string }) => updateModulo(id, nome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modulos-all"] });
      setEditingId(null);
      toast.success("Módulo atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar módulo."),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteModulo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modulos-all"] });
      setDeleteTarget(null);
      toast.success("Módulo excluído!");
    },
    onError: () => toast.error("Erro ao excluir módulo."),
  });

  const handleStartEdit = (m: Modulo) => {
    setEditingId(m.id);
    setEditName(m.nome);
  };

  const handleConfirmDelete = async (m: Modulo) => {
    const count = await countCursoModulosByModulo(m.id);
    setDeleteUsageCount(count);
    setDeleteTarget(m);
  };

  const modulos = modulosQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground shrink-0">
          {modulos.length} módulo{modulos.length !== 1 ? "s" : ""} cadastrado{modulos.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2 flex-1 max-w-md ml-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Pesquisar módulo..."
              className="pl-9 bg-input border-border"
            />
          </div>
          <Button onClick={() => setShowNew(true)} className="bg-accent text-accent-foreground hover:bg-accent/80 gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Novo módulo
          </Button>
        </div>
      </div>

      {showNew && (
        <Card className="p-4 flex items-center gap-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do módulo"
            className="flex-1 bg-input border-border"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && newName.trim() && createMut.mutate(newName.trim())}
          />
          <Button size="sm" onClick={() => newName.trim() && createMut.mutate(newName.trim())} disabled={createMut.isPending || !newName.trim()}>
            {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setShowNew(false); setNewName(""); }}>
            <X className="h-4 w-4" />
          </Button>
        </Card>
      )}

      {modulosQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          {search ? "Nenhum módulo encontrado para esta pesquisa." : "Nenhum módulo cadastrado."}
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
                  <th className="py-3 px-4 w-[120px] text-right font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((m) => (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      {editingId === m.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-input border-border"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && editName.trim() && updateMut.mutate({ id: m.id, nome: editName.trim() })}
                        />
                      ) : (
                        <span className="font-medium text-foreground">{m.nome}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {editingId === m.id ? (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => editName.trim() && updateMut.mutate({ id: m.id, nome: editName.trim() })} disabled={updateMut.isPending}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleStartEdit(m)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleConfirmDelete(m)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-xs text-muted-foreground px-1">…</span>
                      )}
                      <Button
                        size="sm"
                        variant={p === currentPage ? "default" : "outline"}
                        onClick={() => setPage(p)}
                        className="h-8 w-8 p-0 text-xs"
                      >
                        {p}
                      </Button>
                    </span>
                  ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir módulo "{deleteTarget?.nome}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteUsageCount > 0
                ? `Este módulo está associado a ${deleteUsageCount} curso(s). A exclusão removerá essas associações.`
                : "Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminModulos;
