# Cronograma Inteligente

Aplicação React + Vite para gerar cronogramas de cursos com dados do Supabase.

## Requisitos

- Node.js 18+
- npm

## Instalação

```sh
npm install
```

## Configuração do Supabase

1. Copie o arquivo de exemplo para **.env**:

```sh
cp .env.example .env
```

> O Vite lê variáveis do arquivo `.env`. Se você editar só `.env.example` (ou `.env.exemple`), a aplicação **não** vai usar os valores.

2. Preencha no `.env` (cada variável em uma linha):

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

3. Reinicie o servidor após alterar `.env`:

```sh
npm run dev
```

## Checklist de erro de conexão

Se não carregar os dados do banco:

- confirme se `VITE_SUPABASE_URL` começa com `https://`;
- confirme se `VITE_SUPABASE_ANON_KEY` está completa (JWT com 3 partes separadas por ponto);
- remova `\n` colado no fim da chave;
- garanta permissões de leitura (RLS) para o papel `anon` nas tabelas:
  - `cursos`
  - `modulos`
  - `perfis_aula`
  - `perfil_dias`
  - `feriados`

## Estrutura do banco usada na tela inicial

A página inicial consulta:

- cursos disponíveis (`cursos`)
- módulos por curso (`modulos`)
- perfis de aula (`perfis_aula`)
- dias da semana por perfil (`perfil_dias`)
- feriados (`feriados`)

Com esses dados, o cálculo considera:

- dias de aula do perfil;
- horas por dia do perfil;
- feriados nacionais + feriados cadastrados no Supabase.

## Scripts úteis

```sh
npm run lint
npm run test
npm run build
```
