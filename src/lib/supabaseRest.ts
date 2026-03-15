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

export async function supabaseSelect<T>(
  table: string,
  params: Record<string, QueryValue | undefined> = {}
): Promise<T[]> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
    );
  }

  const url = `${supabaseUrl}/rest/v1/${table}${buildQuery(params)}`;
  const response = await fetch(url, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Falha ao consultar ${table}. HTTP ${response.status}: ${body}`
    );
  }

  return (await response.json()) as T[];
}

