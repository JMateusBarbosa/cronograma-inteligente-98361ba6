import { supabaseSelect } from "@/lib/supabaseRest";

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

/** Flattened module info for UI consumption */
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

export async function getCursos(): Promise<Curso[]> {
  return supabaseSelect<Curso>("cursos", {
    select: "id,nome,carga_horaria_total",
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
