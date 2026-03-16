const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

type QueryValue = string | number | boolean;

function buildQuery(params: Record<string, QueryValue | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    query.set(key, String(value));
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function headers(extra?: Record<string, string>) {
  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function supabaseSelect<T>(
  table: string,
  params: Record<string, QueryValue | undefined> = {}
): Promise<T[]> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }

  const url = `${supabaseUrl}/rest/v1/${table}${buildQuery(params)}`;
  const response = await fetch(url, { headers: headers() });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao consultar ${table}. HTTP ${response.status}: ${body}`);
  }

  return (await response.json()) as T[];
}

export async function supabaseInsert<T>(
  table: string,
  data: Record<string, unknown> | Record<string, unknown>[],
  returnData = true
): Promise<T[]> {
  if (!isSupabaseConfigured()) throw new Error("Supabase não configurado.");

  const url = `${supabaseUrl}/rest/v1/${table}`;
  const response = await fetch(url, {
    method: "POST",
    headers: headers(returnData ? { Prefer: "return=representation" } : {}),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao inserir em ${table}. HTTP ${response.status}: ${body}`);
  }

  if (!returnData) return [] as T[];
  return (await response.json()) as T[];
}

export async function supabaseUpdate<T>(
  table: string,
  params: Record<string, QueryValue>,
  data: Record<string, unknown>
): Promise<T[]> {
  if (!isSupabaseConfigured()) throw new Error("Supabase não configurado.");

  const url = `${supabaseUrl}/rest/v1/${table}${buildQuery(params)}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: headers({ Prefer: "return=representation" }),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao atualizar ${table}. HTTP ${response.status}: ${body}`);
  }

  return (await response.json()) as T[];
}

export async function supabaseDelete(
  table: string,
  params: Record<string, QueryValue>
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Supabase não configurado.");

  const url = `${supabaseUrl}/rest/v1/${table}${buildQuery(params)}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: headers(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao deletar em ${table}. HTTP ${response.status}: ${body}`);
  }
}
