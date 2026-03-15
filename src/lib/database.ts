import { supabaseSelect } from "@/lib/supabaseRest";

export interface Curso {
  id: string;
  nome: string;
  carga_horaria_total: number | null;
}

export interface Modulo {
  id: string;
  curso_id: string;
  nome: string;
  ordem: number;
  carga_horaria: number;
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

export async function getModulosByCurso(cursoId: string): Promise<Modulo[]> {
  return supabaseSelect<Modulo>("modulos", {
    select: "id,curso_id,nome,ordem,carga_horaria",
    curso_id: `eq.${cursoId}`,
    order: "ordem.asc",
  });
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
