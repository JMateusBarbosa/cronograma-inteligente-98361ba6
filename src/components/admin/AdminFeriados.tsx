import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
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

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface FeriadoForm {
  descricao: string;
  tipo: "recorrente" | "pontual";
  month: string;
  day: string;
  data: string;
}

const emptyForm: FeriadoForm = { descricao: "", tipo: "recorrente", month: "", day: "", data: "" };

const AdminFeriados = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FeriadoForm>(emptyForm);
  const [showNew, setShowNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Feriado | null>(null);

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

  const feriados = feriadosQuery.data ?? [];

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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {feriados.length} feriado{feriados.length !== 1 ? "s" : ""} cadastrado{feriados.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={() => { setShowNew(true); setForm(emptyForm); }} className="bg-accent text-accent-foreground hover:bg-accent/80 gap-2">
          <Plus className="h-4 w-4" /> Novo feriado
        </Button>
      </div>

      {showNew && !editingId && (
        <FormFields onSave={() => createMut.mutate()} saving={createMut.isPending} />
      )}

      {feriadosQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : feriados.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">Nenhum feriado cadastrado.</Card>
      ) : (
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
              {feriados.map((f) => (
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
