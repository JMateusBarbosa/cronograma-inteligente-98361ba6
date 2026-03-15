const normalizeEnvValue = (value: string | undefined): string =>
  (value ?? "").replace(/\\n/g, "").trim();

const supabaseUrl = normalizeEnvValue(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = normalizeEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseConfigDiagnostics(): string[] {
  const diagnostics: string[] = [];

  if (!supabaseUrl) {
    diagnostics.push("VITE_SUPABASE_URL não foi definida no arquivo .env");
  }

  if (!supabaseAnonKey) {
    diagnostics.push("VITE_SUPABASE_ANON_KEY não foi definida no arquivo .env");
  }

  if (supabaseUrl && !supabaseUrl.startsWith("https://")) {
    diagnostics.push("VITE_SUPABASE_URL deve começar com https://");
  }

  if (supabaseAnonKey && supabaseAnonKey.split(".").length !== 3) {
    diagnostics.push(
      "VITE_SUPABASE_ANON_KEY parece inválida (JWT mal formatado). Remova caracteres extras como \\n"
    );
  }

  return diagnostics;
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
      "Supabase não configurado. Crie um arquivo .env (não .env.example), preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY e reinicie o npm run dev."
    );
  }

  const url = `${supabaseUrl}/rest/v1/${table}${buildQuery(params)}`;
  const response = await fetch(url, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: "application/json",
      "Content-Profile": "public",
      "Accept-Profile": "public",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Falha ao consultar ${table}. HTTP ${response.status}. Verifique chave/URL e políticas RLS. Resposta: ${body || "(vazia)"}`
    );
  }

  return (await response.json()) as T[];
}
