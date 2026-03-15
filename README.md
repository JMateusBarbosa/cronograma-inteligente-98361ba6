# Cronograma Inteligente

Aplicação React + Vite para gerar cronogramas de cursos, agora preparada para consumir dados reais do Supabase.

## Requisitos

- Node.js 18+
- npm

## Instalação

```sh
npm install
```

## Configuração do Supabase

1. Copie o arquivo de exemplo:

```sh
cp .env.example .env
```

2. Preencha no `.env`:

- `VITE_SUPABASE_URL`: URL do projeto Supabase (`https://<project-ref>.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: chave pública anon

3. Garanta políticas de leitura (RLS) para as tabelas:

- `cursos`
- `modulos`
- `perfis_aula`
- `perfil_dias`
- `feriados`

## Rodando o projeto

```sh
npm run dev
```

## Estrutura do banco esperada

A tela inicial consulta:

- cursos disponíveis (`cursos`)
- módulos por curso (`modulos`)
- perfis de aula (`perfis_aula`)
- dias da semana por perfil (`perfil_dias`)
- feriados (`feriados`)

Com esses dados, o cálculo de cronograma considera:

- dias de aula do perfil
- horas por dia do perfil
- feriados nacionais + feriados cadastrados no Supabase

## Scripts úteis

```sh
npm run lint
npm run test
npm run build
```
