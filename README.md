# Meu Diário Financeiro

Aplicativo web pessoal inspirado no caderno **Meu Diário Financeiro**: receitas, gastos fixos, resumo mensal, controle semanal, anotações e sonhos.

Repositório: [github.com/RivasCode-Ops/diario-financeiro](https://github.com/RivasCode-Ops/diario-financeiro)

## Como usar

| Forma | Ação |
|-------|------|
| **Recomendado** | `Iniciar-Diario-Financeiro.bat` ou `Abrir-Diario-Financeiro.bat` |
| Navegador local | http://127.0.0.1:8790/ (com o servidor do `.bat` ligado) |
| GitHub Pages | https://rivascode-ops.github.io/diario-financeiro/ (após Actions verde) |

**Não abra** `index.html` com duplo clique (`file://`) — o JavaScript não carrega e nada funciona (data, descrição, salvar).

Não precisa de Node nem banco. Os dados ficam no `localStorage` do navegador.

## Funcionalidades

- Receitas e gastos fixos com totais automáticos
- Resumo (receita − gastos = saldo) com alertas
- Controle diário (segunda a domingo)
- Anotações, sonhos e citação motivacional
- Exportar / importar backup JSON
- **Novo mês** — reinicia a planilha mantendo metas e sonhos

## Estrutura

```text
diario-financeiro/
├── index.html
├── diario.css
├── diario.js
├── Abrir-Diario-Financeiro.bat
├── Iniciar-Diario-Financeiro.bat
├── Servidor-local.ps1
└── LEIA-ME.md
```

## Privacidade

Nenhum dado sai do seu computador. Faça backup com **Exportar** antes de limpar o cache do navegador.

## EcoMaestro

Este app é um produto independente em `c:\_PROJETOS\diario-financeiro`. O EcoMaestro pode referenciá-lo na lista de projetos do condomínio ECO; não é necessário rodar a API do maestro para usar o diário.

## Licença

Uso livre no ecossistema RivasCode-Ops. Contribuições via issues e pull requests no GitHub.
