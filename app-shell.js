/**
 * Shell fintech — dados reais (diario.js) + sync automático Gist.
 */
const STORAGE_THEME = 'diario-financeiro-theme-v1';
const STORAGE_SYNC_PROMPT = 'diario-financeiro-sync-prompt-v1';
let promptInstalar = null;
let snapshotCache = null;

const VIEWS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'transacoes', label: 'Transações', icon: 'list' },
  { id: 'orcamentos', label: 'Orçamentos', icon: 'pie' },
  { id: 'contas', label: 'Contas e cartões', icon: 'card' },
  { id: 'metas', label: 'Metas', icon: 'target' },
  { id: 'relatorios', label: 'Relatórios', icon: 'chart' },
  { id: 'configuracoes', label: 'Configurações', icon: 'settings' }
];

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function api() {
  return window.DiarioFinanceiro;
}

function getData() {
  try {
    snapshotCache = api()?.getSnapshot?.() || snapshotCache;
  } catch (e) {
    console.warn('getSnapshot', e);
  }
  return snapshotCache || {
    userName: 'Você',
    balance: 0,
    month: { income: 0, expense: 0, savings: 0 },
    flow: [],
    budgets: [],
    transactions: [],
    bills: [],
    goals: [],
    rotuloMes: '',
    todasTransacoes: []
  };
}

function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function atualizarChipSync(estado) {
  const chip = $('#syncChip');
  if (!chip) return;
  const cfg = api()?.syncConfigurado?.();
  if (!cfg) {
    chip.textContent = 'Sync off';
    chip.className = 'sync-chip sync-chip--off';
    return;
  }
  if (estado === 'sync') {
    chip.textContent = 'Sincronizando…';
    chip.className = 'sync-chip sync-chip--sync';
  } else if (estado === 'erro') {
    chip.textContent = 'Sync erro';
    chip.className = 'sync-chip sync-chip--err';
  } else {
    chip.textContent = 'Sync ok';
    chip.className = 'sync-chip sync-chip--ok';
  }
}

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ICONS = {
  grid: '<path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" fill="currentColor"/>',
  list: '<path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z" fill="currentColor"/>',
  pie: '<path d="M12 2a10 10 0 1 0 10 10h-2A8 8 0 1 1 12 4V2zm0 0v8l6.9 4A8 8 0 0 0 12 2z" fill="currentColor"/>',
  card: '<path d="M4 6h16v12H4V6zm2 4h12v2H6v-2zm2 6h8v2H8v-2z" fill="currentColor"/>',
  target: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="currentColor"/>',
  chart: '<path d="M5 19V9h3v10H5zm6 0V5h3v14h-3zm6 0v-7h3v7h-3z" fill="currentColor"/>',
  settings: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.9 4a7.9 7.9 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a8 8 0 0 0-1.7-1l-.4-2.6H10l-.4 2.6a8 8 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.9 7.9 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 1.7 1l.4 2.6h4.8l.4-2.6a8 8 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z" fill="currentColor"/>',
  search: '<path d="M11 4a7 7 0 1 0 4.9 12.1l3.4 3.4 1.4-1.4-3.4-3.4A7 7 0 0 0 11 4zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" fill="currentColor"/>',
  plus: '<path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z" fill="currentColor"/>',
  bell: '<path d="M12 2a5 5 0 0 0-5 5v2.3l-1 2v1h12v-1l-1-2V7a5 5 0 0 0-5-5zm-2 16h4v2h-4v-2z" fill="currentColor"/>',
  moon: '<path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z" fill="currentColor"/>'
};

function icon(name) {
  const body = ICONS[name] || ICONS.grid;
  return `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">${body}</svg>`;
}

function carregarTema() {
  try {
    return localStorage.getItem(STORAGE_THEME) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function aplicarTema(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#0b1120' : '#0d6e6e';
  const btn = $('#btnTheme');
  if (btn) btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
}

function alternarTema() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  aplicarTema(next);
  try {
    localStorage.setItem(STORAGE_THEME, next);
  } catch { /* ignore */ }
}

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function budgetPct(spent, limit) {
  return Math.min(100, Math.round((spent / limit) * 100));
}

function goalPct(current, target) {
  return Math.min(100, Math.round((current / target) * 100));
}

function refreshUi() {
  snapshotCache = null;
  renderDashboard();
  if (viewAtual === 'transacoes') renderTransacoesView(true);
  renderConfigSync();
}

function renderDashboard() {
  const d = getData();
  const greet = $('#topbarGreeting');
  if (greet) greet.textContent = `${saudacao()}, ${d.userName}`;
  const sub = $('#pageSubtitle');
  if (sub) sub.textContent = d.rotuloMes ? `Resumo de ${d.rotuloMes}` : 'Resumo financeiro';

  const bal = $('#dashBalance');
  if (bal) bal.textContent = fmt.format(d.balance);

  const inc = $('#statIncome');
  const exp = $('#statExpense');
  const sav = $('#statSavings');
  if (inc) inc.textContent = fmt.format(d.month.income);
  if (exp) exp.textContent = fmt.format(d.month.expense);
  if (sav) sav.textContent = fmt.format(d.month.savings);

  const chart = $('#chartBars');
  if (chart) {
    chart.innerHTML = d.flow
      .map(
        (m) => `
      <div class="chart-bar">
        <div class="chart-bar__fill" style="height:${m.pct}%"></div>
        <span class="chart-bar__label">${m.label}</span>
      </div>`
      )
      .join('');
  }

  const budgets = $('#budgetList');
  if (budgets) {
    budgets.innerHTML = d.budgets
      .map((b) => {
        const pct = budgetPct(b.spent, b.limit);
        const cls = pct > 100 ? 'progress__fill--over' : pct > 85 ? 'progress__fill--warn' : '';
        return `
        <li class="budget-item">
          <div class="budget-item__head">
            <span class="budget-item__name">${b.name}</span>
            <span class="budget-item__amount">${fmt.format(b.spent)} / ${fmt.format(b.limit)}</span>
          </div>
          <div class="progress"><div class="progress__fill ${cls}" style="width:${Math.min(pct, 100)}%"></div></div>
        </li>`;
      })
      .join('');
  }

  renderTxList(d.transactions);

  const bills = $('#billsList');
  if (bills) {
    bills.innerHTML = d.bills
      .map(
        (b) => `
      <div class="bill-item">
        <div>
          <strong style="font-size:var(--text-sm)">${b.name}</strong>
          <p style="margin:2px 0 0;font-size:var(--text-xs);color:var(--text-secondary)">Vence ${b.due}</p>
        </div>
        <div style="text-align:right">
          <div style="font-weight:600;font-size:var(--text-sm)">${fmt.format(b.amount)}</div>
          <span class="badge badge--${b.status === 'due' ? 'due' : 'ok'}">${b.status === 'due' ? 'A vencer' : 'Agendado'}</span>
        </div>
      </div>`
      )
      .join('');
  }

  const goals = $('#goalsList');
  if (goals) {
    goals.innerHTML = d.goals
      .map((g) => {
        const pct = goalPct(g.current, g.target);
        return `
        <div class="goal-item">
          <div class="goal-item__head">
            <p class="goal-item__title">${g.title}</p>
            <span style="color:var(--text-secondary);font-size:var(--text-xs)">${pct}%</span>
          </div>
          <div class="progress"><div class="progress__fill" style="width:${pct}%"></div></div>
          <p style="margin:var(--space-2) 0 0;font-size:var(--text-xs);color:var(--text-secondary)">${fmt.format(g.current)} de ${fmt.format(g.target)}</p>
        </div>`;
      })
      .join('');
  }
}

function renderTxList(items) {
  const list = $('#recentTxList');
  if (!list) return;
  list.innerHTML = items
    .map(
      (t) => `
    <li class="tx-item" data-tx-id="${t.id}">
      <div class="tx-item__icon">${t.emoji}</div>
      <div class="tx-item__body">
        <p class="tx-item__title">${t.title}</p>
        <p class="tx-item__meta">${t.cat} · ${t.date}</p>
      </div>
      <span class="tx-item__amount tx-item__amount--${t.type}">${t.type === 'in' ? '+' : ''}${fmt.format(t.amount)}</span>
    </li>`
    )
    .join('');
}

function renderSidebarNav() {
  const nav = $('#sidebarNav');
  if (!nav) return;
  nav.innerHTML = VIEWS.map(
    (v) => `
    <li>
      <button type="button" class="nav-item__btn" data-view="${v.id}" aria-current="false">
        ${icon(v.icon)}
        <span>${v.label}</span>
      </button>
    </li>`
  ).join('');
}

function renderBottomNav() {
  const mobile = [
    { id: 'dashboard', label: 'Início', icon: 'grid' },
    { id: 'transacoes', label: 'Transações', icon: 'list' },
    { id: 'orcamentos', label: 'Orçamentos', icon: 'pie' },
    { id: 'metas', label: 'Metas', icon: 'target' },
    { id: 'menu', label: 'Menu', icon: 'settings' }
  ];
  const nav = $('#bottomNav');
  if (!nav) return;
  nav.innerHTML = mobile
    .map(
      (m) => `
    <button type="button" class="bottom-nav__btn" data-view="${m.id}" aria-label="${m.label}">
      ${icon(m.icon)}
      <span>${m.label}</span>
    </button>`
    )
    .join('');
}

function renderMenuSheet() {
  const extra = VIEWS.filter((v) => ['contas', 'relatorios', 'configuracoes'].includes(v.id));
  const list = $('#menuSheetList');
  if (!list) return;
  list.innerHTML = extra
    .map(
      (v) => `
    <li>
      <button type="button" class="nav-item__btn" data-view="${v.id}" data-close-menu="1">
        ${icon(v.icon)}
        <span>${v.label}</span>
      </button>
    </li>`
    )
    .join('');
}

let viewAtual = 'dashboard';

function setView(id) {
  if (!VIEWS.some((v) => v.id === id)) return;
  viewAtual = id;
  $$('.view').forEach((el) => el.classList.toggle('is-active', el.id === `view-${id}`));
  $$('[data-view]').forEach((btn) => {
    if (btn.dataset.view === 'menu') return;
    const active = btn.dataset.view === id;
    btn.classList.toggle('is-active', active);
    if (btn.classList.contains('nav-item__btn')) {
      btn.setAttribute('aria-current', active ? 'page' : 'false');
    }
  });
  fecharMenuSheet();
  const titles = {
    dashboard: ['Visão geral', 'Resumo financeiro do mês'],
    transacoes: ['Transações', 'Histórico e lançamentos'],
    orcamentos: ['Orçamentos', 'Limites por categoria'],
    contas: ['Contas e cartões', 'Saldos e faturas'],
    metas: ['Metas', 'Objetivos financeiros'],
    relatorios: ['Relatórios', 'Análises e exportações'],
    configuracoes: ['Configurações', 'Preferências do app']
  };
  const [t, s] = titles[id] || ['', ''];
  const h = $('#pageTitle');
  const sub = $('#pageSubtitle');
  if (h) h.textContent = id === 'dashboard' ? '' : t;
  if (sub && id !== 'dashboard') sub.textContent = s;
  if (id === 'transacoes') renderTransacoesView(true);
  if (id === 'configuracoes') renderConfigSync();
  if (id === 'orcamentos') {
    const el = $('#budgetListOrcamentos');
    const src = $('#budgetList');
    if (el && src) el.innerHTML = src.innerHTML;
  }
  if (id === 'metas') {
    const el = $('#goalsListFull');
    const src = $('#goalsList');
    if (el && src) el.innerHTML = src.innerHTML;
  }
}

function renderTransacoesView(force = false) {
  const tbody = $('#txTableBody');
  if (!tbody) return;
  const d = getData();
  const rows = (d.todasTransacoes || []).map((l) => ({
    date: l.data,
    title: l.descricao,
    cat: l.categoria,
    amount: l.tipo === 'receita' ? Number(l.valor) : -Number(l.valor),
    type: l.tipo === 'receita' ? 'in' : 'out'
  }));
  tbody.innerHTML = rows.length
    ? rows
        .map(
          (t) => `
    <tr>
      <td>${t.date}</td>
      <td>${t.title}</td>
      <td>${t.cat}</td>
      <td style="text-align:right;font-weight:600" class="${t.type === 'in' ? 'stat-card__value--positive' : ''}">${fmt.format(t.amount)}</td>
    </tr>`
        )
        .join('')
    : '<tr><td colspan="4" style="text-align:center;color:var(--text-secondary)">Nenhum lançamento ainda.</td></tr>';
  if (force) tbody.dataset.filled = '1';
}

function renderConfigSync() {
  const st = api()?.statusSync?.();
  const el = $('#syncConfigText');
  if (!el || !st) return;
  const push = st.push ? new Date(st.push).toLocaleString('pt-BR') : '—';
  const pull = st.pull ? new Date(st.pull).toLocaleString('pt-BR') : '—';
  el.textContent = api()?.syncConfigurado?.()
    ? `Último envio: ${push} · Última baixa: ${pull}`
    : 'Configure Gist + token para celular e notebook iguais.';
  const tgl = $('#toggleSyncAuto');
  if (tgl) tgl.classList.toggle('is-on', st.auto !== false);
}

function abrirMenuSheet() {
  $('#menuSheet')?.classList.add('is-open');
}

function fecharMenuSheet() {
  $('#menuSheet')?.classList.remove('is-open');
}

function filtrarBusca(termo) {
  const q = termo.trim().toLowerCase();
  const d = getData();
  if (!q) {
    renderTxList(d.transactions);
    return;
  }
  const filtrado = (d.transactions || []).filter(
    (t) => t.title.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q)
  );
  renderTxList(filtrado);
}

function abrirModalLancamento() {
  const m = getData();
  const form = $('#formNovoLanc');
  if (!form) return;
  const data = document.querySelector('#formNovoLanc [name="data"]');
  if (data) data.value = new Date().toISOString().slice(0, 10);
  $('#modalNovo')?.classList.add('is-open');
}

function fecharModalLancamento() {
  $('#modalNovo')?.classList.remove('is-open');
}

function abrirModalSync() {
  const cfg = api()?.obterSyncConfig?.() || {};
  const form = $('#formSync');
  if (form) {
    const gid = form.querySelector('[name="gistId"]');
    if (gid) gid.value = cfg.gistId || '';
    const tok = form.querySelector('[name="token"]');
    if (tok) tok.value = '';
    if (tok && cfg.temToken) tok.placeholder = 'Token já salvo — cole só para trocar';
  }
  const st = $('#syncModalStatus');
  if (st) st.hidden = true;
  $('#modalSync')?.classList.add('is-open');
  setView('configuracoes');
}

function fecharModalSync() {
  $('#modalSync')?.classList.remove('is-open');
}

function talvezMostrarSyncInicial() {
  if (api()?.syncConfigurado?.()) return;
  try {
    if (localStorage.getItem(STORAGE_SYNC_PROMPT) === '1') return;
    localStorage.setItem(STORAGE_SYNC_PROMPT, '1');
  } catch { /* ignore */ }
  setTimeout(() => {
    toast('Configure o sync para igualar celular e notebook.');
    abrirModalSync();
  }, 900);
}

function bindNav() {
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-view]');
    if (!btn) return;
    const id = btn.dataset.view;
    if (id === 'menu') {
      abrirMenuSheet();
      return;
    }
    setView(id);
    if (btn.dataset.closeMenu) fecharMenuSheet();
  });

  $('#menuSheetBackdrop')?.addEventListener('click', fecharMenuSheet);
  $('#btnTheme')?.addEventListener('click', alternarTema);
  $('#toggleDark')?.addEventListener('click', () => {
    alternarTema();
    $('#toggleDark')?.classList.toggle('is-on', document.documentElement.getAttribute('data-theme') === 'dark');
  });

  $('#globalSearch')?.addEventListener('input', (e) => {
    filtrarBusca(e.target.value);
    if (viewAtual !== 'dashboard' && e.target.value) setView('dashboard');
  });

  $$('[data-go]').forEach((el) => {
    el.addEventListener('click', () => setView(el.dataset.go));
  });

  $('#btnNovo')?.addEventListener('click', abrirModalLancamento);
  $('#btnModalFechar')?.addEventListener('click', fecharModalLancamento);
  $('#modalNovoBackdrop')?.addEventListener('click', fecharModalLancamento);
  $('#formNovoLanc')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const ok = api()?.adicionarLancamento?.({
      data: fd.get('data'),
      descricao: fd.get('descricao'),
      valor: parseFloat(fd.get('valor')),
      tipo: fd.get('tipo'),
      categoria: fd.get('categoria')
    });
    if (!ok) {
      toast('Preencha data (mês ativo), descrição e valor.');
      return;
    }
    fecharModalLancamento();
    e.target.reset();
    refreshUi();
    toast('Lançamento salvo.');
  });

  $('#btnSyncConfig')?.addEventListener('click', abrirModalSync);
  $('#btnSyncModalFechar')?.addEventListener('click', fecharModalSync);
  $('#modalSyncBackdrop')?.addEventListener('click', fecharModalSync);
  $('#formSync')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const st = $('#syncModalStatus');
    const btn = e.target.querySelector('[type="submit"]');
    const fd = new FormData(e.target);
    const token = String(fd.get('token') || '').trim();
    const gistId = String(fd.get('gistId') || '').trim();
    const cfg = api()?.obterSyncConfig?.() || {};
    if (!token && !cfg.temToken) {
      toast('Cole o token GitHub com permissão gist.');
      return;
    }
    if (btn) btn.disabled = true;
    if (st) {
      st.hidden = false;
      st.className = 'sync-modal-status';
      st.textContent = 'Sincronizando…';
    }
    try {
      const id = await api()?.salvarSync?.({
        token,
        gistId,
        criarGistSeVazio: true
      });
      if (st) {
        st.className = 'sync-modal-status ok';
        st.textContent = `Pronto. Gist: ${id?.slice(0, 8)}… — use o mesmo ID no outro aparelho.`;
      }
      refreshUi();
      atualizarChipSync('ok');
      toast('Sync ativo em todos os aparelhos com o mesmo Gist.');
      setTimeout(fecharModalSync, 1800);
    } catch (err) {
      if (st) {
        st.className = 'sync-modal-status err';
        st.textContent =
          err?.message === 'sem-token'
            ? 'Informe o token GitHub.'
            : err?.message === 'auth'
              ? 'Token inválido ou sem permissão gist.'
              : 'Não foi possível sincronizar. Verifique token e internet.';
      }
      atualizarChipSync('erro');
    } finally {
      if (btn) btn.disabled = false;
    }
  });
  $('#btnSyncManual')?.addEventListener('click', async () => {
    try {
      atualizarChipSync('sync');
      await api()?.syncBaixar?.({ silencioso: false });
      await api()?.syncEnviar?.();
      refreshUi();
      atualizarChipSync('ok');
    } catch {
      atualizarChipSync('erro');
    }
  });
  $('#toggleSyncAuto')?.addEventListener('click', () => {
    const on = !$('#toggleSyncAuto')?.classList.contains('is-on');
    api()?.setSyncAuto?.(on);
    $('#toggleSyncAuto')?.classList.toggle('is-on', on);
    toast(on ? 'Sync automático ligado.' : 'Sync automático desligado.');
  });
  $('#btnExportar')?.addEventListener('click', () => api()?.exportarBackup?.());
  $('#btnRelatorio')?.addEventListener('click', () => api()?.gerarPdf?.());
  $('#btnImportarRow')?.addEventListener('click', () => $('#inputImportar')?.click());
  $('#inputImportar')?.addEventListener('change', async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      await api()?.importarArquivo?.(file);
      refreshUi();
      toast('Backup importado.');
    } catch {
      toast('Arquivo inválido.');
    }
    ev.target.value = '';
  });
  $('#btnInstalar')?.addEventListener('click', async () => {
    if (!promptInstalar) {
      toast('Menu do navegador → Instalar app / Adicionar à tela inicial.');
      return;
    }
    promptInstalar.prompt();
    await promptInstalar.userChoice;
    promptInstalar = null;
  });
}

function initPwa() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    promptInstalar = e;
    $('#btnInstalar')?.removeAttribute('hidden');
  });
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw?.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          toast('Nova versão disponível — recarregue a página.');
        }
      });
    });
  }).catch(() => {});
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !api()?.syncConfigurado?.()) return;
    atualizarChipSync('sync');
    api()
      ?.syncBaixar?.({ silencioso: true })
      .then(() => refreshUi())
      .then(() => atualizarChipSync('ok'))
      .catch(() => atualizarChipSync('erro'));
  });
}

async function iniciarApp() {
  if (location.protocol === 'file:') return;
  if (!api()) {
    mostrarErroBoot('Erro: diario.js não carregou. Use o servidor local (porta 8786).');
    return;
  }
  api()._notifyChange = refreshUi;
  api()._syncStatus = atualizarChipSync;
  api()._abrirModalSync = abrirModalSync;
  aplicarTema(carregarTema());
  renderSidebarNav();
  renderBottomNav();
  renderMenuSheet();
  bindNav();
  initPwa();
  atualizarChipSync('sync');
  try {
    await api().init();
  } catch (e) {
    console.warn('init', e);
    atualizarChipSync('erro');
  }
  refreshUi();
  setView('dashboard');
  const toggle = $('#toggleDark');
  if (toggle) toggle.classList.toggle('is-on', document.documentElement.getAttribute('data-theme') === 'dark');
  renderConfigSync();
  talvezMostrarSyncInicial();
}

function mostrarErroBoot(msg) {
  const el = $('#bootErro');
  if (el) {
    el.hidden = false;
    el.textContent = msg;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarApp);
} else {
  iniciarApp();
}
