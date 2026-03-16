import { supabaseSelect, supabaseInsert, supabaseUpdate, supabaseDelete } from "@/lib/supabaseRest";

// ── Types ──────────────────────────────────────────────────────────

export interface Curso {
  id: string;
  nome: string;
  carga_horaria_total: number | null;
}

export interface Modulo {
  id: string;
  nome: string;
}

export interface CursoModulo {
  id: string;
  curso_id: string;
  modulo_id: string;
  ordem: number;
  carga_horaria: number;
  modulos: { nome: string };
}

export interface CursoModuloFlat {
  id: string;
  curso_id: string;
  modulo_id: string;
  ordem: number;
  carga_horaria: number;
  nome: string;
}

export interface PerfilAula {
  id: string;
  nome: string;
  horas_por_dia: number;
}

export interface PerfilDia {
  id: string;
  perfil_id: string;
  dia_semana: number;
}

export interface Feriado {
  id: string;
  data: string;
  descricao: string | null;
  is_recurring: boolean | null;
  month: number | null;
  day: number | null;
}

// ── Reads ──────────────────────────────────────────────────────────

export async function getCursos(): Promise<Curso[]> {
  return supabaseSelect<Curso>("cursos", {
    select: "id,nome,carga_horaria_total",
    order: "nome.asc",
  });
}

export async function getModulos(): Promise<Modulo[]> {
  return supabaseSelect<Modulo>("modulos", {
    select: "id,nome",
    order: "nome.asc",
  });
}

export async function getModulosByCurso(cursoId: string): Promise<CursoModuloFlat[]> {
  const rows = await supabaseSelect<CursoModulo>("curso_modulos", {
    select: "id,curso_id,modulo_id,ordem,carga_horaria,modulos(nome)",
    curso_id: `eq.${cursoId}`,
    order: "ordem.asc",
  });

  return rows.map((r) => ({
    id: r.id,
    curso_id: r.curso_id,
    modulo_id: r.modulo_id,
    ordem: r.ordem,
    carga_horaria: r.carga_horaria,
    nome: r.modulos?.nome ?? "Módulo sem nome",
  }));
}

export async function getPerfisAula(): Promise<PerfilAula[]> {
  return supabaseSelect<PerfilAula>("perfis_aula", {
    select: "id,nome,horas_por_dia",
    order: "nome.asc",
  });
}

export async function getPerfilDias(perfilId: string): Promise<PerfilDia[]> {
  return supabaseSelect<PerfilDia>("perfil_dias", {
    select: "id,perfil_id,dia_semana",
    perfil_id: `eq.${perfilId}`,
    order: "dia_semana.asc",
  });
}

export async function getFeriados(): Promise<Feriado[]> {
  return supabaseSelect<Feriado>("feriados", {
    select: "id,data,descricao,is_recurring,month,day",
    order: "data.asc",
  });
}

// ── Mutations: Módulos ─────────────────────────────────────────────

export async function createModulo(nome: string): Promise<Modulo> {
  const rows = await supabaseInsert<Modulo>("modulos", { nome });
  return rows[0];
}

export async function updateModulo(id: string, nome: string): Promise<Modulo> {
  const rows = await supabaseUpdate<Modulo>("modulos", { id: `eq.${id}` }, { nome });
  return rows[0];
}

export async function deleteModulo(id: string): Promise<void> {
  await supabaseDelete("modulos", { id: `eq.${id}` });
}

// ── Mutations: Cursos ──────────────────────────────────────────────

export async function createCurso(nome: string): Promise<Curso> {
  const rows = await supabaseInsert<Curso>("cursos", { nome });
  return rows[0];
}

export async function updateCurso(id: string, nome: string): Promise<Curso> {
  const rows = await supabaseUpdate<Curso>("cursos", { id: `eq.${id}` }, { nome });
  return rows[0];
}

export async function deleteCurso(id: string): Promise<void> {
  // Delete associated curso_modulos first
  await supabaseDelete("curso_modulos", { curso_id: `eq.${id}` });
  await supabaseDelete("cursos", { id: `eq.${id}` });
}

export async function saveCursoModulos(
  cursoId: string,
  modulos: { modulo_id: string; carga_horaria: number; ordem: number }[]
): Promise<void> {
  // Delete existing
  await supabaseDelete("curso_modulos", { curso_id: `eq.${cursoId}` });
  // Insert new
  if (modulos.length > 0) {
    await supabaseInsert("curso_modulos", modulos.map((m) => ({
      curso_id: cursoId,
      modulo_id: m.modulo_id,
      carga_horaria: m.carga_horaria,
      ordem: m.ordem,
    })), false);
  }
}

// ── Mutations: Feriados ────────────────────────────────────────────

export async function createFeriado(data: Omit<Feriado, "id">): Promise<Feriado> {
  const rows = await supabaseInsert<Feriado>("feriados", data as Record<string, unknown>);
  return rows[0];
}

export async function updateFeriado(id: string, data: Partial<Omit<Feriado, "id">>): Promise<Feriado> {
  const rows = await supabaseUpdate<Feriado>("feriados", { id: `eq.${id}` }, data as Record<string, unknown>);
  return rows[0];
}

export async function deleteFeriado(id: string): Promise<void> {
  await supabaseDelete("feriados", { id: `eq.${id}` });
}

// ── Count curso_modulos for a modulo ───────────────────────────────

export async function countCursoModulosByModulo(moduloId: string): Promise<number> {
  const rows = await supabaseSelect<{ id: string }>("curso_modulos", {
    select: "id",
    modulo_id: `eq.${moduloId}`,
  });
  return rows.length;
}
