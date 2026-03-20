import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Save, X, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import { getFeriados, createFeriado, updateFeriado, deleteFeriado, type Feriado } from "@/lib/database";
import { useIsMobile } from "@/hooks/use-mobile";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const PAGE_SIZE = 10;

interface FeriadoForm {
  descricao: string;
  tipo: "recorrente" | "pontual";
  month: string;
  day: string;
  data: string;
}

const emptyForm: FeriadoForm = { descricao: "", tipo: "recorrente", month: "", day: "", data: "" };

const AdminFeriados = () => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FeriadoForm>(emptyForm);
  const [showNew, setShowNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Feriado | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const feriadosQuery = useQuery({ queryKey: ["feriados"], queryFn: getFeriados });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["feriados"] });

  const createMut = useMutation({
    mutationFn: () => {
      const payload = buildPayload();
      return createFeriado(payload);
    },
    onSuccess: () => { invalidate(); setShowNew(false); setForm(emptyForm); toast.success("Feriado criado!"); },
    onError: () => toast.error("Erro ao criar feriado."),
  });

  const updateMut = useMutation({
    mutationFn: (id: string) => {
      const payload = buildPayload();
      return updateFeriado(id, payload);
    },
    onSuccess: () => { invalidate(); setEditingId(null); toast.success("Feriado atualizado!"); },
    onError: () => toast.error("Erro ao atualizar feriado."),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFeriado(id),
    onSuccess: () => { invalidate(); setDeleteTarget(null); toast.success("Feriado excluído!"); },
    onError: () => toast.error("Erro ao excluir feriado."),
  });

  function buildPayload() {
    if (form.tipo === "recorrente") {
      const month = parseInt(form.month);
      const day = parseInt(form.day);
      return {
        descricao: form.descricao || null,
        is_recurring: true,
        month,
        day,
        data: `2024-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      };
    }
    return {
      descricao: form.descricao || null,
      is_recurring: false,
      month: null,
      day: null,
      data: form.data,
    };
  }

  const isFormValid = () => {
    if (form.tipo === "recorrente") return !!form.month && !!form.day;
    return !!form.data;
  };

  const handleEdit = (f: Feriado) => {
    setEditingId(f.id);
    setForm({
      descricao: f.descricao ?? "",
      tipo: f.is_recurring ? "recorrente" : "pontual",
      month: f.month ? String(f.month) : "",
      day: f.day ? String(f.day) : "",
      data: f.data,
    });
  };

  const allFeriados = feriadosQuery.data ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return allFeriados;
    const q = search.toLowerCase();
    return allFeriados.filter((f) =>
      (f.descricao ?? "").toLowerCase().includes(q) ||
      f.data.includes(q)
    );
  }, [allFeriados, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const FormFields = ({ onSave, saving }: { onSave: () => void; saving: boolean }) => (
    <Card className="p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          placeholder="Descrição (ex: Natal)"
          className="bg-input border-border"
        />
        <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as "recorrente" | "pontual" })}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recorrente">Recorrente (anual)</SelectItem>
            <SelectItem value="pontual">Pontual (data fixa)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {form.tipo === "recorrente" ? (
        <div className="grid grid-cols-2 gap-3">
          <Select value={form.month} onValueChange={(v) => setForm({ ...form, month: v })}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MESES.map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min={1}
            max={31}
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value })}
            placeholder="Dia"
            className="bg-input border-border"
          />
        </div>
      ) : (
        <Input
          type="date"
          value={form.data}
          onChange={(e) => setForm({ ...form, data: e.target.value })}
          className="bg-input border-border"
        />
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={saving || !isFormValid()} className="gap-1">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setShowNew(false); setEditingId(null); setForm(emptyForm); }}>
          <X className="h-4 w-4 mr-1" /> Cancelar
        </Button>
      </div>
    </Card>
  );

  const formatFeriadoDate = (f: Feriado) => {
    if (f.is_recurring && f.month && f.day) {
      return `${String(f.day).padStart(2, "0")}/${String(f.month).padStart(2, "0")} (anual)`;
    }
    if (f.data) {
      const [y, m, d] = f.data.split("-");
      return `${d}/${m}/${y}`;
    }
    return "—";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground shrink-0">
          {allFeriados.length} feriado{allFeriados.length !== 1 ? "s" : ""} cadastrado{allFeriados.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2 w-full sm:flex-1 sm:max-w-md sm:ml-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Pesquisar feriado..."
              className="pl-9 bg-input border-border"
            />
          </div>
          <Button onClick={() => { setShowNew(true); setForm(emptyForm); }} className="bg-accent text-accent-foreground hover:bg-accent/80 gap-2 shrink-0">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Novo feriado</span><span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {showNew && !editingId && (
        <FormFields onSave={() => createMut.mutate()} saving={createMut.isPending} />
      )}

      {feriadosQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          {search ? "Nenhum feriado encontrado para esta pesquisa." : "Nenhum feriado cadastrado."}
        </Card>
      ) : isMobile ? (
        /* Mobile: card-based list */
        <div className="space-y-2">
          {paged.map((f) => (
            <Card key={f.id} className="p-3">
              {editingId === f.id ? (
                <FormFields onSave={() => updateMut.mutate(f.id)} saving={updateMut.isPending} />
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm">{f.descricao ?? "Sem descrição"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{formatFeriadoDate(f)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${f.is_recurring ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {f.is_recurring ? "Recorrente" : "Pontual"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(f)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(f)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        /* Desktop: table */
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Data</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Descrição</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                <th className="py-3 px-4 w-[120px] text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((f) => (
                <tr key={f.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  {editingId === f.id ? (
                    <td colSpan={4} className="p-3">
                      <FormFields onSave={() => updateMut.mutate(f.id)} saving={updateMut.isPending} />
                    </td>
                  ) : (
                    <>
                      <td className="py-3 px-4 font-medium text-foreground">{formatFeriadoDate(f)}</td>
                      <td className="py-3 px-4 text-foreground">{f.descricao ?? "—"}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${f.is_recurring ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {f.is_recurring ? "Recorrente" : "Pontual"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(f)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(f)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="h-8 w-8 p-0">
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
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir feriado "{deleteTarget?.descricao}"?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
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

export default AdminFeriados;
