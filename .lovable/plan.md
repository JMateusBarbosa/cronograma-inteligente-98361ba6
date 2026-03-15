

## Plano: Conectar a tela "Gerador de Cronograma" ao Supabase

### Pré-requisito

Primeiro precisamos conectar o projeto ao Supabase. Você ainda não tem uma conexão configurada. Vou solicitar a conexão antes de implementar.

### Alterações planejadas

**1. Conectar Supabase ao projeto**
- Vincular a conexão Supabase para que o client fique disponível.

**2. Criar client Supabase e tipos**
- Gerar o arquivo de integração com o Supabase client (se ainda não existir).
- Criar tipos TypeScript que espelhem as tabelas: `cursos`, `modulos`, `perfis_aula`, `perfil_dias`, `feriados`.

**3. Criar hooks de dados com React Query**
- `useCursos()` — busca todos os cursos
- `useModulosByCurso(cursoId)` — busca módulos de um curso ordenados por `ordem`
- `usePerfisAula()` — busca perfis com seus dias (`perfis_aula` + `perfil_dias`)
- `useFeriados()` — busca feriados cadastrados

**4. Atualizar `scheduleCalculator.ts`**
- Modificar `calcularCronograma` para aceitar feriados do banco (além dos nacionais automáticos).
- Modificar para aceitar perfil baseado em `{ dias: number[], horasPorDia: number }` em vez de strings hardcoded.
- Manter retrocompatibilidade com a Consulta Avulsa (que ainda usa strings).

**5. Atualizar `Inicio.tsx`**
- Remover `MOCK_COURSES` e `PERFIS` hardcoded.
- Usar os hooks para carregar cursos e perfis do Supabase.
- O select de cursos lista dados do banco; ao selecionar, carrega módulos via `useModulosByCurso`.
- O select de perfil lista `perfis_aula` do banco.
- Na geração, passar feriados do banco + nacionais ao calculador.
- Adicionar estados de loading/empty para cada select.

**6. Habilitar RLS (políticas básicas)**
- Criar migration com políticas de leitura pública para as tabelas de referência (`cursos`, `modulos`, `perfis_aula`, `perfil_dias`, `feriados`), já que o sistema é interno por enquanto.

### O que NÃO muda
- A lógica de exportar CSV, imprimir e nova consulta permanece igual.
- A tela de Consulta Avulsa continua funcionando com dados manuais.
- As tabelas `cronogramas` e `cronograma_modulos` não serão usadas agora (salvar cronogramas será uma etapa futura).

