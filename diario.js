const STORAGE_V1 = 'diario-financeiro-v1';
const STORAGE_IDX = 'diario-financeiro-index-v3';
const STORAGE_IDX_V2 = 'diario-financeiro-index-v2';
const STORAGE_MES = (chave, perfilId = 'pessoal') => `diario-financeiro-mes-${perfilId}-${chave}`;
const STORAGE_EVOLUCAO_MODO = 'diario-financeiro-evolucao-modo-v1';
const STORAGE_PIN_HASH = 'diario-financeiro-pin-sha256-v1';
const STORAGE_PIN_IDLE_MIN = 'diario-financeiro-pin-idle-min-v1';
const STORAGE_AUTO_BACKUP_LAST_DAY = 'diario-financeiro-auto-backup-last-day-v1';
const STORAGE_AUTO_BACKUP_ENABLED = 'diario-financeiro-auto-backup-enabled-v1';
const STORAGE_CSV_MAPS = 'diario-financeiro-csv-maps-v1';
const STORAGE_META_NOTIFY_ENABLED = 'diario-financeiro-meta-notify-enabled-v1';
const STORAGE_META_NOTIFY_SENT = 'diario-financeiro-meta-notify-sent-v1';
const STORAGE_SYNC_GIST_ID = 'diario-financeiro-sync-gist-id-v1';
const STORAGE_SYNC_GH_TOKEN = 'diario-financeiro-sync-gh-token-v1';
const STORAGE_SYNC_LAST_PUSH_AT = 'diario-financeiro-sync-last-push-at-v1';
const STORAGE_SYNC_LAST_PULL_AT = 'diario-financeiro-sync-last-pull-at-v1';
const STORAGE_THEME = 'diario-financeiro-theme-v1';
const STORAGE_LOCAL_UPDATED_AT = 'diario-financeiro-local-updated-at-v1';
const STORAGE_AUTO_SYNC_ENABLED = 'diario-financeiro-auto-sync-v1';
const SYNC_GIST_FILE = 'diario-financeiro-backup.json';

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DIAS_SEMANA = [
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' }
];

const RECEITAS_PADRAO = [{ descricao: 'Salário', valor: 2500 }];
const GASTOS_PADRAO = [
  { descricao: 'Aluguel', valor: 700 },
  { descricao: 'Água / Luz / Gás', valor: 300 },
  { descricao: 'Internet', valor: 100 },
  { descricao: 'Mercado', valor: 650 },
  { descricao: 'Transporte (ônibus / combustível)', valor: 250 },
  { descricao: 'Saúde', valor: 150 },
  { descricao: 'Educação (escola e materiais)', valor: 200 },
  { descricao: 'Lazer', valor: 150 },
  { descricao: 'Roupas', valor: 150 },
  { descricao: 'Gastos pessoais', valor: 100 },
  { descricao: 'Reserva / Poupança', valor: 100 }
];

const ANOTACOES_PADRAO = [
  'Planejar as compras do mês.',
  'Evitar gastos por impulso.',
  'Guardar um pouco todo mês.',
  'Sempre orar e agradecer.'
];

const SONHOS_PADRAO = [
  { texto: 'Viajar em família.', meta: 8000, guardado: 0 },
  { texto: 'Comprar uma casa.', meta: 120000, guardado: 0 },
  { texto: 'Ter uma vida tranquila e com propósito.', meta: 0, guardado: 0 }
];

const CITACAO_PADRAO =
  '"Tudo posso naquele que me fortalece." — Filipenses 4:13';

const CATEGORIAS = [
  { id: 'mercado', label: 'Mercado / Alimentação', tipos: ['gasto'] },
  { id: 'transporte', label: 'Transporte', tipos: ['gasto'] },
  { id: 'saude', label: 'Saúde', tipos: ['gasto'] },
  { id: 'educacao', label: 'Educação', tipos: ['gasto'] },
  { id: 'lazer', label: 'Lazer', tipos: ['gasto'] },
  { id: 'casa', label: 'Casa / Contas', tipos: ['gasto'] },
  { id: 'roupas', label: 'Roupas', tipos: ['gasto'] },
  { id: 'pessoal', label: 'Pessoal', tipos: ['gasto'] },
  { id: 'outros-gasto', label: 'Outros gastos', tipos: ['gasto'] },
  { id: 'salario-extra', label: 'Salário / extra', tipos: ['receita'] },
  { id: 'presente', label: 'Presente / ajuda', tipos: ['receita'] },
  { id: 'outros-receita', label: 'Outras receitas', tipos: ['receita'] }
];

let filtroCategoria = null;
let promptInstalar = null;
let lancamentoEditId = null;
let lancamentoDuplicarId = null;
let evolucaoModo = 'saldo';
let appBloqueado = false;
let pinIdleTimer = null;
let lancBuscaTermo = '';
let csvImportPreview = null;
let painelAnoAtivo = '';
let temaAtual = 'light';

const PERFIS_PADRAO = [
  { id: 'pessoal', nome: 'Pessoal' },
  { id: 'familia', nome: 'Família' },
  { id: 'negocio', nome: 'Negócio' }
];

function carregarModoEvolucao() {
  try {
    const raw = localStorage.getItem(STORAGE_EVOLUCAO_MODO);
    return ['saldo', 'receita', 'gasto'].includes(raw) ? raw : 'saldo';
  } catch {
    return 'saldo';
  }
}

function salvarModoEvolucao(modo) {
  try {
    localStorage.setItem(STORAGE_EVOLUCAO_MODO, modo);
  } catch {
    // Sem bloqueio: app segue funcionando sem persistir preferência.
  }
}

function carregarMapasCsv() {
  try {
    const raw = localStorage.getItem(STORAGE_CSV_MAPS);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

function salvarMapasCsv(maps) {
  try {
    localStorage.setItem(STORAGE_CSV_MAPS, JSON.stringify(maps || {}));
  } catch {
    // Sem bloqueio: app segue sem cache de mapeamento CSV.
  }
}

function limparMapasCsv() {
  try {
    localStorage.removeItem(STORAGE_CSV_MAPS);
  } catch {
    // Sem bloqueio: apenas mantém os mapas atuais.
  }
}

function assinaturaHeadersCsv(headersOriginais) {
  return (headersOriginais || [])
    .map((h) => normalizarChaveCsv(h))
    .join('|');
}

function carregarMapaCsvPorHeaders(headersOriginais) {
  const assinatura = assinaturaHeadersCsv(headersOriginais);
  if (!assinatura) return null;
  const maps = carregarMapasCsv();
  return maps[assinatura] || null;
}

function salvarMapaCsvPorHeaders(headersOriginais, mapa) {
  const assinatura = assinaturaHeadersCsv(headersOriginais);
  if (!assinatura) return;
  const maps = carregarMapasCsv();
  maps[assinatura] = {
    data: Number(mapa?.data ?? -1),
    desc: Number(mapa?.desc ?? -1),
    valor: Number(mapa?.valor ?? -1),
    tipo: Number(mapa?.tipo ?? -1),
    categoria: Number(mapa?.categoria ?? -1),
    entrada: Number(mapa?.entrada ?? -1),
    saida: Number(mapa?.saida ?? -1)
  };
  salvarMapasCsv(maps);
}

function carregarIdleMinutos() {
  const raw = Number(localStorage.getItem(STORAGE_PIN_IDLE_MIN));
  if ([1, 5, 10, 15].includes(raw)) return raw;
  return 0; // 0 = desativado
}

function salvarIdleMinutos(min) {
  if (!min) {
    localStorage.removeItem(STORAGE_PIN_IDLE_MIN);
    return;
  }
  localStorage.setItem(STORAGE_PIN_IDLE_MIN, String(min));
}

function autoBackupHabilitado() {
  const raw = localStorage.getItem(STORAGE_AUTO_BACKUP_ENABLED);
  if (raw == null) return true; // padrão ligado
  return raw === '1';
}

function setAutoBackupHabilitado(flag) {
  localStorage.setItem(STORAGE_AUTO_BACKUP_ENABLED, flag ? '1' : '0');
}

function autoSyncHabilitado() {
  const raw = localStorage.getItem(STORAGE_AUTO_SYNC_ENABLED);
  if (raw == null) return true;
  return raw === '1';
}

function setAutoSyncHabilitado(flag) {
  localStorage.setItem(STORAGE_AUTO_SYNC_ENABLED, flag ? '1' : '0');
}

function registrarAtualizacaoLocal() {
  localStorage.setItem(STORAGE_LOCAL_UPDATED_AT, new Date().toISOString());
}

function carregarAtualizacaoLocal() {
  return localStorage.getItem(STORAGE_LOCAL_UPDATED_AT) || '';
}

function carregarSyncConfig() {
  return {
    gistId: localStorage.getItem(STORAGE_SYNC_GIST_ID) || '',
    token: localStorage.getItem(STORAGE_SYNC_GH_TOKEN) || ''
  };
}

function salvarSyncConfig({ gistId, token }) {
  if (gistId != null) localStorage.setItem(STORAGE_SYNC_GIST_ID, String(gistId).trim());
  if (token != null) localStorage.setItem(STORAGE_SYNC_GH_TOKEN, String(token).trim());
}

function limparTokenSync() {
  localStorage.removeItem(STORAGE_SYNC_GH_TOKEN);
}

function registrarSyncPush() {
  localStorage.setItem(STORAGE_SYNC_LAST_PUSH_AT, new Date().toISOString());
}

function registrarSyncPull() {
  localStorage.setItem(STORAGE_SYNC_LAST_PULL_AT, new Date().toISOString());
}

function fmtSyncMomento(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR');
}

function atualizarStatusSync() {
  const el = $('syncStatus');
  if (!el) return;
  const { gistId, token } = carregarSyncConfig();
  if (!gistId || !token) {
    el.textContent = 'Sync: não configurado';
    return;
  }
  const pushAt = fmtSyncMomento(localStorage.getItem(STORAGE_SYNC_LAST_PUSH_AT));
  const pullAt = fmtSyncMomento(localStorage.getItem(STORAGE_SYNC_LAST_PULL_AT));
  el.textContent = `Sync ok • envio: ${pushAt} • baixa: ${pullAt}`;
}

function carregarTema() {
  const raw = localStorage.getItem(STORAGE_THEME);
  return raw === 'dark' ? 'dark' : 'light';
}

function aplicarTema(tema) {
  temaAtual = tema === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', temaAtual);
  localStorage.setItem(STORAGE_THEME, temaAtual);
  const btn = $('btnTema');
  if (btn) btn.textContent = `Tema: ${temaAtual === 'dark' ? 'escuro' : 'claro'}`;
}

function alternarTema() {
  aplicarTema(temaAtual === 'dark' ? 'light' : 'dark');
}

async function gistRequest(path, { method = 'GET', body } = {}) {
  const { token } = carregarSyncConfig();
  if (!token) throw new Error('sem-token');
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('auth');
    throw new Error(`http-${res.status}`);
  }
  return res.json();
}

async function syncConfigurarFluxo() {
  const atual = carregarSyncConfig();
  const gistId = prompt('ID do Gist para sincronização:', atual.gistId || '');
  if (!gistId) return;
  const token = prompt('Token GitHub (escopo gist):', atual.token || '');
  if (!token) return;
  salvarSyncConfig({ gistId, token });
  atualizarStatusSync();
  toast('Sync configurado.');
}

async function syncEnviarFluxo() {
  persistir();
  const { gistId } = carregarSyncConfig();
  if (!gistId) {
    toast('Configure o Sync primeiro.');
    return;
  }
  const backup = exportarBackup();
  await gistRequest(`/gists/${gistId}`, {
    method: 'PATCH',
    body: {
      files: {
        [SYNC_GIST_FILE]: {
          content: JSON.stringify(backup, null, 2)
        }
      }
    }
  });
  registrarSyncPush();
  atualizarStatusSync();
  toast('Backup enviado para o Gist.');
}

async function syncBaixarFluxo({ silencioso = false } = {}) {
  const { gistId } = carregarSyncConfig();
  if (!gistId) {
    if (!silencioso) toast('Configure o Sync primeiro.');
    return false;
  }
  const gist = await gistRequest(`/gists/${gistId}`);
  const arquivo = gist?.files?.[SYNC_GIST_FILE] || Object.values(gist?.files || {})[0];
  if (!arquivo?.content) throw new Error('sem-arquivo');
  const data = JSON.parse(arquivo.content);
  if (!aplicarBackupRemoto(data)) throw new Error('formato');
  if (typeof render === 'function') render();
  registrarSyncPull();
  atualizarStatusSync();
  if (!silencioso) toast('Backup baixado e aplicado.');
  if (window.__DIARIO_UI_SHELL__ && window.DiarioFinanceiro) {
    window.DiarioFinanceiro._notifyChange();
  }
  return true;
}

let _syncImportando = false;

function aplicarBackupRemoto(data) {
  const remoto = data?.updatedAt || '';
  const local = carregarAtualizacaoLocal();
  if (remoto && local && new Date(remoto) <= new Date(local)) {
    return false;
  }
  _syncImportando = true;
  try {
    const ok = importarBackup(data);
    if (ok && remoto) localStorage.setItem(STORAGE_LOCAL_UPDATED_AT, remoto);
    return ok;
  } finally {
    _syncImportando = false;
  }
}

async function syncEnviarSilencioso() {
  if (_syncImportando) return false;
  const { gistId, token } = carregarSyncConfig();
  if (!gistId || !token || !autoSyncHabilitado()) return false;
  persistir();
  const backup = exportarBackup();
  await gistRequest(`/gists/${gistId}`, {
    method: 'PATCH',
    body: {
      files: {
        [SYNC_GIST_FILE]: { content: JSON.stringify(backup, null, 2) }
      }
    }
  });
  registrarSyncPush();
  atualizarStatusSync();
  return true;
}

let syncPushTimer = null;
function agendarSyncPush() {
  if (_syncImportando) return;
  clearTimeout(syncPushTimer);
  syncPushTimer = setTimeout(() => {
    syncEnviarSilencioso().catch((e) => {
      console.warn('sync push', e);
      if (window.DiarioFinanceiro?._syncStatus) {
        window.DiarioFinanceiro._syncStatus('erro');
      }
    });
  }, 2200);
}

async function syncAutoNaAbertura() {
  const { gistId, token } = carregarSyncConfig();
  if (!gistId || !token || !autoSyncHabilitado()) return;
  try {
    if (window.DiarioFinanceiro?._syncStatus) window.DiarioFinanceiro._syncStatus('sync');
    await syncBaixarFluxo({ silencioso: true });
    await syncEnviarSilencioso();
    if (window.DiarioFinanceiro?._syncStatus) window.DiarioFinanceiro._syncStatus('ok');
  } catch (e) {
    console.warn('sync abertura', e);
    if (window.DiarioFinanceiro?._syncStatus) window.DiarioFinanceiro._syncStatus('erro');
  }
}

function tratarErroSync(e) {
  if (e?.message === 'sem-token') toast('Token não configurado.');
  else if (e?.message === 'auth') toast('Token inválido ou sem permissão de gist.');
  else if (e?.message === 'sem-arquivo') toast('Gist sem arquivo de backup.');
  else if (e?.message === 'formato') toast('Backup remoto inválido.');
  else toast('Falha na sincronização.');
}

function suporteNotificacao() {
  return typeof Notification !== 'undefined';
}

function notificacaoMetaHabilitada() {
  const raw = localStorage.getItem(STORAGE_META_NOTIFY_ENABLED);
  if (raw == null) return false;
  return raw === '1';
}

function setNotificacaoMetaHabilitada(flag) {
  localStorage.setItem(STORAGE_META_NOTIFY_ENABLED, flag ? '1' : '0');
}

function carregarMetaNotifySent() {
  try {
    const raw = localStorage.getItem(STORAGE_META_NOTIFY_SENT);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

function salvarMetaNotifySent(data) {
  try {
    localStorage.setItem(STORAGE_META_NOTIFY_SENT, JSON.stringify(data || {}));
  } catch {
    // Sem bloqueio: app segue sem histórico de notificações.
  }
}

function marcarMetaNotificada(chaveMesRef, catId) {
  if (!chaveMesRef || !catId) return;
  const sent = carregarMetaNotifySent();
  if (!Array.isArray(sent[chaveMesRef])) sent[chaveMesRef] = [];
  if (!sent[chaveMesRef].includes(catId)) sent[chaveMesRef].push(catId);
  salvarMetaNotifySent(sent);
}

function jaNotificouMeta(chaveMesRef, catId) {
  const sent = carregarMetaNotifySent();
  return Array.isArray(sent[chaveMesRef]) && sent[chaveMesRef].includes(catId);
}

function notificarMetaEstourada(catLabel, gasto, limite) {
  if (!suporteNotificacao() || Notification.permission !== 'granted') return;
  const body = `${catLabel}: ${fmt.format(gasto)} de ${fmt.format(limite)}.`;
  try {
    new Notification('EcoMaestro • Meta estourada', { body, tag: `meta-${index.mesAtivo}-${catLabel}` });
  } catch {
    // Sem bloqueio: toast da interface continua cobrindo o alerta.
  }
}

async function alternarNotificacaoMeta() {
  if (!suporteNotificacao()) {
    toast('Este navegador não suporta notificações.');
    return;
  }
  const ligado = notificacaoMetaHabilitada();
  if (ligado) {
    setNotificacaoMetaHabilitada(false);
    toast('Notificação de meta estourada desligada.');
    return;
  }
  const perm = Notification.permission;
  if (perm === 'granted') {
    setNotificacaoMetaHabilitada(true);
    toast('Notificação de meta estourada ligada.');
    return;
  }
  if (perm === 'denied') {
    toast('Notificações bloqueadas no navegador.');
    return;
  }
  try {
    const r = await Notification.requestPermission();
    if (r === 'granted') {
      setNotificacaoMetaHabilitada(true);
      toast('Notificação de meta estourada ligada.');
    } else {
      toast('Permissão de notificação não concedida.');
    }
  } catch {
    toast('Não foi possível pedir permissão de notificação.');
  }
}

function atualizarLabelNotifMeta() {
  const btn = $('btnToggleNotifMeta');
  if (!btn) return;
  btn.textContent = `Notificação meta: ${notificacaoMetaHabilitada() ? 'on' : 'off'}`;
}

const fmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

async function hashPin(pin) {
  if (!crypto?.subtle?.digest) {
    toast('PIN indisponível nesta conexão. Use https:// ou http://127.0.0.1:8786/');
    throw new Error('crypto.subtle indisponível');
  }
  const dados = new TextEncoder().encode(String(pin));
  const digest = await crypto.subtle.digest('SHA-256', dados);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function removerPinEmergencia() {
  if (!confirm('Remover o PIN? Qualquer pessoa com acesso ao navegador poderá ver seus dados.')) return;
  localStorage.removeItem(STORAGE_PIN_HASH);
  setBloqueioAtivo(false);
  toast('Proteção por PIN removida.');
}

function temPinConfigurado() {
  return Boolean(localStorage.getItem(STORAGE_PIN_HASH));
}

function setBloqueioAtivo(ativo) {
  appBloqueado = ativo;
  const overlay = $('pinOverlay');
  if (overlay) overlay.hidden = !ativo;
  if (!ativo) {
    $('pinErro')?.setAttribute('hidden', 'hidden');
    const pinInput = $('pinInput');
    if (pinInput) pinInput.value = '';
  }
  resetAutoBloqueio();
}

async function desbloquearComPin() {
  const pin = $('pinInput')?.value?.trim();
  if (!pin) return;
  const esperado = localStorage.getItem(STORAGE_PIN_HASH);
  const atual = await hashPin(pin);
  if (esperado && atual === esperado) {
    setBloqueioAtivo(false);
    tentarBackupAutomaticoDiario();
    toast('Desbloqueado.');
  } else {
    const erro = $('pinErro');
    if (erro) erro.hidden = false;
  }
}

async function configurarPinFluxo() {
  const novo = prompt('Defina um PIN numérico (mínimo 4 dígitos):', '');
  if (!novo) return;
  if (!/^\d{4,12}$/.test(novo)) {
    toast('PIN inválido. Use 4 a 12 números.');
    return;
  }
  const confirma = prompt('Confirme o PIN:', '');
  if (novo !== confirma) {
    toast('PIN não confere.');
    return;
  }
  localStorage.setItem(STORAGE_PIN_HASH, await hashPin(novo));
  toast('PIN configurado.');
}

async function alterarPinFluxo() {
  const atual = prompt('Digite o PIN atual:', '');
  if (!atual) return;
  const ok = await hashPin(atual);
  if (ok !== localStorage.getItem(STORAGE_PIN_HASH)) {
    toast('PIN atual inválido.');
    return;
  }
  const novo = prompt('Novo PIN (4 a 12 números):', '');
  if (!novo || !/^\d{4,12}$/.test(novo)) {
    toast('Novo PIN inválido.');
    return;
  }
  const confirma = prompt('Confirme o novo PIN:', '');
  if (novo !== confirma) {
    toast('Confirmação não confere.');
    return;
  }
  localStorage.setItem(STORAGE_PIN_HASH, await hashPin(novo));
  toast('PIN alterado.');
}

async function removerPinFluxo() {
  const atual = prompt('Digite seu PIN para remover a proteção:', '');
  if (!atual) return;
  const ok = await hashPin(atual);
  if (ok !== localStorage.getItem(STORAGE_PIN_HASH)) {
    toast('PIN inválido.');
    return;
  }
  localStorage.removeItem(STORAGE_PIN_HASH);
  setBloqueioAtivo(false);
  toast('Proteção por PIN removida.');
}

async function abrirMenuPin() {
  if (!temPinConfigurado()) {
    await configurarPinFluxo();
    return;
  }
  const atualIdle = carregarIdleMinutos();
  const acao = prompt(
    `PIN: 1=Bloquear agora, 2=Alterar PIN, 3=Remover PIN, 4=Auto-bloqueio (${atualIdle || 'off'} min), 5=Backup auto diário (${autoBackupHabilitado() ? 'on' : 'off'}), 6=Limpar mapas CSV, 7=Notificação de meta (${notificacaoMetaHabilitada() ? 'on' : 'off'})`,
    '1'
  );
  if (!acao) return;
  if (acao === '1') {
    setBloqueioAtivo(true);
  } else if (acao === '2') {
    await alterarPinFluxo();
  } else if (acao === '3') {
    await removerPinFluxo();
  } else if (acao === '4') {
    const escolha = prompt('Auto-bloqueio em minutos: 0 (off), 1, 5, 10, 15', String(atualIdle || 5));
    if (escolha == null) return;
    const min = Number(escolha);
    if (![0, 1, 5, 10, 15].includes(min)) {
      toast('Valor inválido. Use 0, 1, 5, 10 ou 15.');
      return;
    }
    salvarIdleMinutos(min);
    resetAutoBloqueio();
    toast(min ? `Auto-bloqueio: ${min} min.` : 'Auto-bloqueio desativado.');
  } else if (acao === '5') {
    const ligado = autoBackupHabilitado();
    setAutoBackupHabilitado(!ligado);
    toast(!ligado ? 'Backup automático diário ligado.' : 'Backup automático diário desligado.');
  } else if (acao === '6') {
    const ok = confirm('Deseja limpar todos os mapeamentos CSV salvos?');
    if (!ok) return;
    limparMapasCsv();
    toast('Mapeamentos CSV limpos.');
  } else if (acao === '7') {
    await alternarNotificacaoMeta();
  }
}

function resetAutoBloqueio() {
  if (pinIdleTimer) {
    clearTimeout(pinIdleTimer);
    pinIdleTimer = null;
  }
  const min = carregarIdleMinutos();
  if (!min || !temPinConfigurado() || appBloqueado) return;
  pinIdleTimer = setTimeout(() => {
    setBloqueioAtivo(true);
    toast('Bloqueado por inatividade.');
  }, min * 60 * 1000);
}

function instalarMonitorInatividade() {
  const eventos = ['click', 'keydown', 'mousemove', 'touchstart', 'scroll'];
  eventos.forEach((ev) => {
    window.addEventListener(ev, () => {
      resetAutoBloqueio();
    }, { passive: true });
  });
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function chaveMes(iso = hojeISO()) {
  return String(iso).slice(0, 7);
}

function rotuloMes(chave) {
  const [y, m] = chave.split('-').map(Number);
  if (!y || !m) return chave;
  return `${MESES_PT[m - 1]} ${y}`;
}

function proximaChaveMes(chave) {
  const [y, m] = chave.split('-').map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function normalizarSonho(s) {
  if (!s || typeof s === 'string') {
    return { id: uid(), texto: s || '', meta: 0, guardado: 0 };
  }
  return {
    id: s.id || uid(),
    texto: s.texto || '',
    meta: Math.max(0, Number(s.meta) || 0),
    guardado: Math.max(0, Number(s.guardado) || 0)
  };
}

function globalPadrao() {
  return {
    meta: 'Organizar um salário de R$ 2.500,00 para marido, esposa e duas crianças.',
    objetivo: 'Ter controle, viver em paz e realizar nossos sonhos.',
    anotacoes: ANOTACOES_PADRAO.map((t) => ({ id: uid(), texto: t })),
    sonhos: SONHOS_PADRAO.map((s) => ({ id: uid(), ...s })),
    citacao: CITACAO_PADRAO
  };
}

function perfilPadrao(id = 'pessoal', nome = 'Pessoal') {
  const chave = chaveMes();
  return {
    id,
    nome,
    mesAtivo: chave,
    meses: [chave],
    global: globalPadrao()
  };
}

function mesPadrao(chave = chaveMes()) {
  const [y, m] = chave.split('-');
  const dia = `${y}-${m}-01`;
  return {
    dataRef: dia,
    receitas: RECEITAS_PADRAO.map((r) => ({ id: uid(), ...r })),
    gastos: GASTOS_PADRAO.map((g) => ({ id: uid(), ...g })),
    semana: Object.fromEntries(
      DIAS_SEMANA.map((d) => [d.key, { receita: 0, gastos: 0 }])
    ),
    lancamentos: [],
    metasCategorias: metasCategoriasPadrao()
  };
}

function mesclarMes(parsed) {
  const base = mesPadrao(chaveMes(parsed?.dataRef));
  return {
    ...base,
    ...parsed,
    receitas: Array.isArray(parsed?.receitas) && parsed.receitas.length
      ? parsed.receitas
      : base.receitas,
    gastos: Array.isArray(parsed?.gastos) && parsed.gastos.length
      ? parsed.gastos
      : base.gastos,
    semana: { ...base.semana, ...(parsed?.semana || {}) },
    lancamentos: Array.isArray(parsed?.lancamentos) ? parsed.lancamentos : [],
    metasCategorias: {
      ...base.metasCategorias,
      ...(parsed?.metasCategorias || {})
    }
  };
}

function mesclarGlobal(parsed) {
  const base = globalPadrao();
  const sonhosRaw = Array.isArray(parsed?.sonhos) && parsed.sonhos.length
    ? parsed.sonhos
    : base.sonhos;
  return {
    ...base,
    ...parsed,
    anotacoes: Array.isArray(parsed?.anotacoes) && parsed.anotacoes.length
      ? parsed.anotacoes
      : base.anotacoes,
    sonhos: sonhosRaw.map(normalizarSonho)
  };
}

function migrarV1() {
  try {
    const raw = localStorage.getItem(STORAGE_V1);
    if (!raw) return null;
    const old = JSON.parse(raw);
    const chave = chaveMes(old.dataRef || hojeISO());
    const index = {
      activeProfileId: 'pessoal',
      profiles: {
        pessoal: {
          ...perfilPadrao('pessoal', 'Pessoal'),
          mesAtivo: chave,
          meses: [chave],
          global: mesclarGlobal({
            meta: old.meta,
            objetivo: old.objetivo,
            anotacoes: old.anotacoes,
            sonhos: old.sonhos,
            citacao: old.citacao
          })
        }
      }
    };
    localStorage.setItem(STORAGE_IDX, JSON.stringify(index));
    localStorage.setItem(
      STORAGE_MES(chave, 'pessoal'),
      JSON.stringify(mesclarMes(old))
    );
    localStorage.removeItem(STORAGE_V1);
    return index;
  } catch {
    return null;
  }
}

function normalizarPerfis(indexRaw) {
  const hoje = chaveMes();
  const out = indexRaw && typeof indexRaw === 'object' ? { ...indexRaw } : {};
  const perfis = {};

  if (out.profiles && typeof out.profiles === 'object') {
    Object.entries(out.profiles).forEach(([id, p]) => {
      const base = perfilPadrao(id, p?.nome || id);
      perfis[id] = {
        ...base,
        ...p,
        id,
        nome: p?.nome || base.nome,
        meses: Array.isArray(p?.meses) && p.meses.length ? [...new Set(p.meses)] : [p?.mesAtivo || hoje],
        mesAtivo: p?.mesAtivo || (Array.isArray(p?.meses) && p.meses[p.meses.length - 1]) || hoje,
        global: mesclarGlobal(p?.global)
      };
      if (!perfis[id].meses.includes(perfis[id].mesAtivo)) perfis[id].meses.push(perfis[id].mesAtivo);
      perfis[id].meses.sort();
    });
  }

  if (!Object.keys(perfis).length) {
    const legacy = {
      id: 'pessoal',
      nome: 'Pessoal',
      mesAtivo: out.mesAtivo || hoje,
      meses: Array.isArray(out.meses) && out.meses.length ? out.meses : [out.mesAtivo || hoje],
      global: mesclarGlobal(out.global)
    };
    perfis.pessoal = legacy;
  }

  PERFIS_PADRAO.forEach((p) => {
    if (!perfis[p.id]) perfis[p.id] = perfilPadrao(p.id, p.nome);
  });

  const activeProfileId = perfis[out.activeProfileId] ? out.activeProfileId : Object.keys(perfis)[0];
  return { activeProfileId, profiles: perfis };
}

function perfilAtual() {
  if (!index?.profiles) return null;
  return index.profiles[index.activeProfileId] || null;
}

function sincronizarLegacyComPerfil() {
  const p = perfilAtual();
  if (!p) return;
  index.mesAtivo = p.mesAtivo;
  index.meses = p.meses;
  index.global = p.global;
}

function salvarPerfilAtualFromLegacy() {
  const p = perfilAtual();
  if (!p) return;
  p.mesAtivo = index.mesAtivo;
  p.meses = Array.isArray(index.meses) ? [...new Set(index.meses)] : [chaveMes()];
  p.meses.sort();
  p.global = mesclarGlobal(index.global);
}

function aplicarCamposLegacyDoPerfil(idx) {
  const p = idx.profiles?.[idx.activeProfileId] || Object.values(idx.profiles || {})[0];
  if (!p) {
    const hoje = chaveMes();
    idx.mesAtivo = idx.mesAtivo || hoje;
    idx.meses = idx.meses || [hoje];
    idx.global = idx.global || globalPadrao();
    return idx;
  }
  idx.mesAtivo = p.mesAtivo || chaveMes();
  idx.meses = Array.isArray(p.meses) && p.meses.length ? p.meses : [idx.mesAtivo];
  idx.global = p.global || globalPadrao();
  return idx;
}

function carregarIndex() {
  const migrado = migrarV1();
  if (migrado) {
    return aplicarCamposLegacyDoPerfil(normalizarPerfis(migrado));
  }
  try {
    const raw = localStorage.getItem(STORAGE_IDX) || localStorage.getItem(STORAGE_IDX_V2);
    if (!raw) {
      return aplicarCamposLegacyDoPerfil(normalizarPerfis({}));
    }
    return aplicarCamposLegacyDoPerfil(normalizarPerfis(JSON.parse(raw)));
  } catch {
    return aplicarCamposLegacyDoPerfil(normalizarPerfis({}));
  }
}

function carregarMes(chave, perfilId = index?.activeProfileId || 'pessoal') {
  try {
    let raw = localStorage.getItem(STORAGE_MES(chave, perfilId));
    if (!raw && perfilId === 'pessoal') raw = localStorage.getItem(`diario-financeiro-mes-${chave}`);
    if (!raw) return mesPadrao(chave);
    return mesclarMes(JSON.parse(raw));
  } catch {
    return mesPadrao(chave);
  }
}

let index = carregarIndex();
sincronizarLegacyComPerfil();
let estado = { ...index.global, ...carregarMes(index.mesAtivo) };
let saveTimer = null;

function renderSelPerfil() {
  const sel = $('selPerfil');
  if (!sel || !index?.profiles) return;
  const perfis = Object.values(index.profiles);
  sel.replaceChildren(
    ...perfis.map((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nome || p.id;
      if (p.id === index.activeProfileId) opt.selected = true;
      return opt;
    })
  );
}

function trocarPerfil(id) {
  if (!id || id === index.activeProfileId || !index.profiles?.[id]) return;
  persistir();
  index.activeProfileId = id;
  sincronizarLegacyComPerfil();
  estado = { ...index.global, ...carregarMes(index.mesAtivo, id) };
  localStorage.setItem(STORAGE_IDX, JSON.stringify(index));
  render();
  toast(`Perfil: ${index.profiles[id].nome || id}`);
}

function criarPerfilFluxo() {
  const nome = prompt('Nome do novo perfil (ex.: Casa, Empresa):', '');
  if (!nome) return;
  const base = normalizarChaveCsv(nome).replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || `perfil-${Date.now()}`;
  let id = base;
  let i = 2;
  while (index.profiles[id]) {
    id = `${base}-${i}`;
    i += 1;
  }
  index.profiles[id] = perfilPadrao(id, nome.trim());
  index.activeProfileId = id;
  sincronizarLegacyComPerfil();
  estado = { ...index.global, ...carregarMes(index.mesAtivo, id) };
  persistir();
  render();
  toast(`Perfil "${nome.trim()}" criado.`);
}

function duplicarPerfilFluxo() {
  const origem = perfilAtual();
  if (!origem) return;
  const nomeNovo = prompt('Nome do perfil duplicado:', `${origem.nome || origem.id} (cópia)`);
  if (!nomeNovo || !nomeNovo.trim()) return;
  const base = normalizarChaveCsv(nomeNovo).replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || `perfil-${Date.now()}`;
  let idNovo = base;
  let i = 2;
  while (index.profiles[idNovo]) {
    idNovo = `${base}-${i}`;
    i += 1;
  }

  const novo = {
    id: idNovo,
    nome: nomeNovo.trim(),
    mesAtivo: origem.mesAtivo,
    meses: [...(origem.meses || [])],
    global: mesclarGlobal(JSON.parse(JSON.stringify(origem.global || {})))
  };
  index.profiles[idNovo] = novo;

  (origem.meses || []).forEach((ch) => {
    const mes = carregarMes(ch, origem.id);
    localStorage.setItem(STORAGE_MES(ch, idNovo), JSON.stringify(mesclarMes(JSON.parse(JSON.stringify(mes)))));
  });

  index.activeProfileId = idNovo;
  sincronizarLegacyComPerfil();
  estado = { ...index.global, ...carregarMes(index.mesAtivo, idNovo) };
  persistir();
  render();
  toast(`Perfil "${origem.nome || origem.id}" duplicado.`);
}

function renomearPerfilFluxo() {
  const atual = perfilAtual();
  if (!atual) return;
  const nome = prompt('Novo nome do perfil atual:', atual.nome || atual.id);
  if (!nome || !nome.trim()) return;
  atual.nome = nome.trim();
  persistir();
  renderSelPerfil();
  toast(`Perfil renomeado para "${atual.nome}".`);
}

function removerPerfilFluxo() {
  const ids = Object.keys(index.profiles || {});
  if (ids.length <= 1) {
    toast('Não é possível remover o único perfil.');
    return;
  }
  const atual = perfilAtual();
  if (!atual) return;
  const ok = confirm(`Deseja remover o perfil "${atual.nome || atual.id}" e todos os meses dele?`);
  if (!ok) return;

  (atual.meses || []).forEach((ch) => {
    try {
      localStorage.removeItem(STORAGE_MES(ch, atual.id));
    } catch {
      // Sem bloqueio: segue removendo as outras chaves.
    }
  });
  delete index.profiles[atual.id];
  index.activeProfileId = Object.keys(index.profiles)[0];
  sincronizarLegacyComPerfil();
  estado = { ...index.global, ...carregarMes(index.mesAtivo, index.activeProfileId) };
  persistir();
  render();
  toast('Perfil removido.');
}

function persistir() {
  try {
    const {
      meta, objetivo, anotacoes, sonhos, citacao,
      dataRef, receitas, gastos, semana, lancamentos, metasCategorias
    } = estado;
    index.global = mesclarGlobal({ meta, objetivo, anotacoes, sonhos, citacao });
    salvarPerfilAtualFromLegacy();
    const chave = index.mesAtivo || chaveMes();
    index.mesAtivo = chave;
    localStorage.setItem(
      STORAGE_MES(chave, index.activeProfileId),
      JSON.stringify(
        mesclarMes({ dataRef, receitas, gastos, semana, lancamentos, metasCategorias })
      )
    );
    if (!index.meses.includes(chave)) {
      index.meses.push(chave);
      index.meses.sort();
    }
    localStorage.setItem(STORAGE_IDX, JSON.stringify(index));
    if (!_syncImportando) registrarAtualizacaoLocal();
    if (window.__DIARIO_UI_SHELL__ && window.DiarioFinanceiro && !_syncImportando) {
      window.DiarioFinanceiro._notifyChange();
      window.DiarioFinanceiro._scheduleSyncPush();
    }
    return true;
  } catch (err) {
    console.error('persistir', err);
    toast('Não foi possível salvar. Libere espaço ou use outro navegador.');
    return false;
  }
}

function agendarSalvar() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persistir, 280);
}

function somaItens(itens) {
  return itens.reduce((acc, i) => acc + (Number(i.valor) || 0), 0);
}

function labelCategoria(id, tipo = 'gasto') {
  const cat = CATEGORIAS.find((c) => c.id === id);
  if (cat) return cat.label;
  return tipo === 'receita' ? 'Outras receitas' : 'Outros gastos';
}

function categoriaPadrao(tipo) {
  return tipo === 'receita' ? 'outros-receita' : 'outros-gasto';
}

function metasCategoriasPadrao() {
  const metas = {};
  CATEGORIAS.filter((c) => c.tipos.includes('gasto')).forEach((c) => {
    metas[c.id] = 0;
  });
  return metas;
}

function normalizarLancamento(l) {
  const tipo = l.tipo === 'receita' ? 'receita' : 'gasto';
  let cat = l.categoria || categoriaPadrao(tipo);
  if (!CATEGORIAS.some((c) => c.id === cat && c.tipos.includes(tipo))) {
    cat = categoriaPadrao(tipo);
  }
  return { ...l, tipo, categoria: cat };
}

function categoriasPorTipo(tipo) {
  return CATEGORIAS.filter((c) => c.tipos.includes(tipo));
}

function popularSelectCategorias() {
  const tipo = $('lancTipo')?.value || 'gasto';
  const sel = $('lancCategoria');
  if (!sel) return;
  const atual = sel.value;
  sel.replaceChildren(
    ...categoriasPorTipo(tipo).map((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.label;
      return opt;
    })
  );
  const ids = categoriasPorTipo(tipo).map((c) => c.id);
  sel.value = ids.includes(atual) ? atual : ids[0];
}

function limparFormLancamento() {
  lancamentoEditId = null;
  lancamentoDuplicarId = null;
  $('lancDesc').value = '';
  $('lancValor').value = '';
  const btn = $('formLancamento')?.querySelector('button[type="submit"]');
  if (btn) btn.textContent = 'Registrar';
  const cancel = $('btnCancelarLancEdicao');
  if (cancel) cancel.hidden = true;
}

function iniciarEdicaoLancamento(item) {
  lancamentoEditId = item.id;
  lancamentoDuplicarId = null;
  $('lancData').value = item.data || `${index.mesAtivo}-01`;
  $('lancTipo').value = item.tipo;
  popularSelectCategorias();
  $('lancCategoria').value = item.categoria || categoriaPadrao(item.tipo);
  $('lancDesc').value = item.descricao || '';
  $('lancValor').value = item.valor ?? '';
  const btn = $('formLancamento')?.querySelector('button[type="submit"]');
  if (btn) btn.textContent = 'Salvar edição';
  const cancel = $('btnCancelarLancEdicao');
  if (cancel) cancel.hidden = false;
}

function iniciarDuplicarLancamento(item) {
  lancamentoEditId = null;
  lancamentoDuplicarId = item.id;
  const hoje = hojeISO();
  const dataSug = chaveMes(hoje) === index.mesAtivo ? hoje : item.data || `${index.mesAtivo}-01`;
  $('lancData').value = dataSug;
  $('lancTipo').value = item.tipo;
  popularSelectCategorias();
  $('lancCategoria').value = item.categoria || categoriaPadrao(item.tipo);
  $('lancDesc').value = item.descricao || '';
  $('lancValor').value = item.valor ?? '';
  const btn = $('formLancamento')?.querySelector('button[type="submit"]');
  if (btn) btn.textContent = 'Duplicar';
  const cancel = $('btnCancelarLancEdicao');
  if (cancel) cancel.hidden = false;
}

function lancamentosDoMes() {
  const chave = index.mesAtivo;
  let lista = (estado.lancamentos || [])
    .map(normalizarLancamento)
    .filter((l) => chaveMes(l.data || estado.dataRef) === chave);
  if (filtroCategoria) {
    lista = lista.filter((l) => l.categoria === filtroCategoria);
  }
  if (lancBuscaTermo.trim()) {
    const q = lancBuscaTermo.trim().toLowerCase();
    lista = lista.filter((l) => {
      const data = formatarDataCurta(l.data).toLowerCase();
      const desc = String(l.descricao || '').toLowerCase();
      const cat = String(labelCategoria(l.categoria, l.tipo) || '').toLowerCase();
      return data.includes(q) || desc.includes(q) || cat.includes(q);
    });
  }
  return lista;
}

function lancamentosDoMesTodos() {
  const chave = index.mesAtivo;
  return (estado.lancamentos || [])
    .map(normalizarLancamento)
    .filter((l) => chaveMes(l.data || estado.dataRef) === chave);
}

function totaisLancamentos() {
  const lista = lancamentosDoMesTodos();
  let rec = 0;
  let gasto = 0;
  for (const l of lista) {
    const v = Number(l.valor) || 0;
    if (l.tipo === 'receita') rec += v;
    else gasto += v;
  }
  return { lista, rec, gasto, saldo: rec - gasto };
}

function totaisLancamentosLista(lista) {
  let rec = 0;
  let gasto = 0;
  for (const l of lista || []) {
    const v = Number(l.valor) || 0;
    if (l.tipo === 'receita') rec += v;
    else gasto += v;
  }
  return { rec, gasto, saldo: rec - gasto };
}

function escaparHtml(texto) {
  return String(texto ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function destacarTermo(texto, termo) {
  const base = String(texto ?? '');
  const q = String(termo ?? '').trim();
  if (!q) return escaparHtml(base);
  const lowBase = base.toLowerCase();
  const lowQ = q.toLowerCase();
  const i = lowBase.indexOf(lowQ);
  if (i < 0) return escaparHtml(base);
  const antes = base.slice(0, i);
  const match = base.slice(i, i + q.length);
  const depois = base.slice(i + q.length);
  return `${escaparHtml(antes)}<mark>${escaparHtml(match)}</mark>${escaparHtml(depois)}`;
}

function normalizarChaveCsv(chave) {
  return String(chave || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function detectarDelimitadorCsv(linha) {
  const semicolons = (linha.match(/;/g) || []).length;
  const commas = (linha.match(/,/g) || []).length;
  return semicolons >= commas ? ';' : ',';
}

function parseLinhaCsv(linha, delimitador) {
  const cols = [];
  let atual = '';
  let inQuotes = false;
  for (let i = 0; i < linha.length; i += 1) {
    const ch = linha[i];
    if (ch === '"') {
      const next = linha[i + 1];
      if (inQuotes && next === '"') {
        atual += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimitador && !inQuotes) {
      cols.push(atual.trim());
      atual = '';
    } else {
      atual += ch;
    }
  }
  cols.push(atual.trim());
  return cols;
}

function normalizarDataCsv(valor, fallbackMes) {
  const v = String(valor || '').trim();
  if (!v) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const dmY = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (dmY) {
    const d = dmY[1].padStart(2, '0');
    const m = dmY[2].padStart(2, '0');
    const yRaw = dmY[3];
    const y = yRaw.length === 2 ? `20${yRaw}` : yRaw;
    return `${y}-${m}-${d}`;
  }
  const dm = v.match(/^(\d{1,2})[/-](\d{1,2})$/);
  if (dm && /^\d{4}-\d{2}$/.test(fallbackMes)) {
    const d = dm[1].padStart(2, '0');
    const m = dm[2].padStart(2, '0');
    return `${fallbackMes.slice(0, 4)}-${m}-${d}`;
  }
  return '';
}

function prepararCsvImportacao(textoCsv) {
  const linhas = String(textoCsv || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim());
  if (linhas.length < 2) return null;

  const delimitador = detectarDelimitadorCsv(linhas[0]);
  const headersOriginais = parseLinhaCsv(linhas[0], delimitador);
  const headers = headersOriginais.map(normalizarChaveCsv);
  const linhasDados = linhas.slice(1).map((l) => parseLinhaCsv(l, delimitador));
  return { headersOriginais, headers, linhasDados };
}

function mapearCsvAutomatico(headers) {
  const idx = (alternativas) => headers.findIndex((h) => alternativas.includes(h));
  return {
    data: idx(['data', 'date', 'dt']),
    desc: idx(['descricao', 'description', 'historico', 'memo', 'detalhe']),
    valor: idx(['valor', 'amount', 'total']),
    tipo: idx(['tipo', 'type', 'natureza']),
    categoria: idx(['categoria', 'category']),
    entrada: idx(['entrada', 'credito', 'credit']),
    saida: idx(['saida', 'debito', 'debit'])
  };
}

function preencherSelectMapaCsv(selectId, headersOriginais, selecionado = -1) {
  const el = $(selectId);
  if (!el) return;
  el.innerHTML = '';
  const optVazio = document.createElement('option');
  optVazio.value = '-1';
  optVazio.textContent = 'Nao usar';
  el.appendChild(optVazio);
  headersOriginais.forEach((h, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = h || `(coluna ${i + 1})`;
    el.appendChild(opt);
  });
  el.value = String(selecionado >= 0 ? selecionado : -1);
}

function abrirModalMapaCsv(preview) {
  const mapaSalvo = carregarMapaCsvPorHeaders(preview.headersOriginais);
  const sugestao = mapaSalvo || mapearCsvAutomatico(preview.headers);
  preencherSelectMapaCsv('csvMapData', preview.headersOriginais, sugestao.data);
  preencherSelectMapaCsv('csvMapDesc', preview.headersOriginais, sugestao.desc);
  preencherSelectMapaCsv('csvMapValor', preview.headersOriginais, sugestao.valor);
  preencherSelectMapaCsv('csvMapTipo', preview.headersOriginais, sugestao.tipo);
  preencherSelectMapaCsv('csvMapCategoria', preview.headersOriginais, sugestao.categoria);
  preencherSelectMapaCsv('csvMapEntrada', preview.headersOriginais, sugestao.entrada);
  preencherSelectMapaCsv('csvMapSaida', preview.headersOriginais, sugestao.saida);
  const resumo = $('csvMapResumo');
  if (resumo) {
    resumo.textContent = `Arquivo com ${preview.linhasDados.length} linhas de dados. Mês ativo: ${rotuloMes(index.mesAtivo)}.${mapaSalvo ? ' Mapeamento salvo reaplicado.' : ''}`;
  }
  const overlay = $('csvMapOverlay');
  if (overlay) overlay.hidden = false;
}

function fecharModalMapaCsv() {
  const overlay = $('csvMapOverlay');
  if (overlay) overlay.hidden = true;
}

function lerMapaCsvUi() {
  const toIdx = (id) => Number($(id)?.value ?? -1);
  return {
    data: toIdx('csvMapData'),
    desc: toIdx('csvMapDesc'),
    valor: toIdx('csvMapValor'),
    tipo: toIdx('csvMapTipo'),
    categoria: toIdx('csvMapCategoria'),
    entrada: toIdx('csvMapEntrada'),
    saida: toIdx('csvMapSaida')
  };
}

function importarCsvLancamentos(preview, mapa) {
  if (!preview || !Array.isArray(preview.linhasDados)) return { importados: 0, ignorados: 0 };

  let importados = 0;
  let ignorados = 0;
  if (!Array.isArray(estado.lancamentos)) estado.lancamentos = [];
  const parseNum = (v) => Number(String(v || '').replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
  const valorIdx = mapa?.valor ?? -1;
  const entradaIdx = mapa?.entrada ?? -1;
  const saidaIdx = mapa?.saida ?? -1;

  for (let i = 0; i < preview.linhasDados.length; i += 1) {
    const cols = preview.linhasDados[i];
    const dataRaw = mapa?.data >= 0 ? cols[mapa.data] : '';
    const data = normalizarDataCsv(dataRaw, index.mesAtivo) || `${index.mesAtivo}-01`;
    if (chaveMes(data) !== index.mesAtivo) {
      ignorados += 1;
      continue;
    }

    const desc = (mapa?.desc >= 0 ? cols[mapa.desc] : '').trim() || 'Importado CSV';
    const categoriaCsv = mapa?.categoria >= 0 ? cols[mapa.categoria] : '';
    const tipoTexto = mapa?.tipo >= 0 ? String(cols[mapa.tipo] || '').toLowerCase() : '';
    let valor = 0;
    let tipo = 'gasto';

    if (entradaIdx >= 0 || saidaIdx >= 0) {
      const entrada = entradaIdx >= 0 ? parseNum(cols[entradaIdx]) : 0;
      const saida = saidaIdx >= 0 ? parseNum(cols[saidaIdx]) : 0;
      if (entrada > 0) {
        tipo = 'receita';
        valor = entrada;
      } else {
        tipo = 'gasto';
        valor = Math.abs(saida);
      }
    } else if (valorIdx >= 0) {
      const bruto = parseNum(cols[valorIdx]);
      if (tipoTexto.includes('rec') || tipoTexto.includes('cred')) tipo = 'receita';
      else if (tipoTexto.includes('gas') || tipoTexto.includes('deb')) tipo = 'gasto';
      else tipo = bruto < 0 ? 'gasto' : 'receita';
      valor = Math.abs(bruto);
    } else {
      ignorados += 1;
      continue;
    }

    if (!valor || valor <= 0) {
      ignorados += 1;
      continue;
    }

    let categoria = categoriaPadrao(tipo);
    const cand = normalizarChaveCsv(categoriaCsv);
    const encontrada = CATEGORIAS.find((c) => c.tipos.includes(tipo) && normalizarChaveCsv(c.label).includes(cand));
    if (cand && encontrada) categoria = encontrada.id;

    estado.lancamentos.push(
      normalizarLancamento({
        id: uid(),
        data,
        tipo,
        categoria,
        descricao: desc,
        valor
      })
    );
    importados += 1;
  }

  if (importados > 0) agendarSalvar();
  return { importados, ignorados };
}

function resumoDoMes(chave) {
  const mes = carregarMes(chave);
  const totalR = somaItens(mes.receitas || []);
  const totalG = somaItens(mes.gastos || []);
  const extras = totaisLancamentosLista((mes.lancamentos || []).map(normalizarLancamento));
  const saldoFixos = totalR - totalG;
  const saldoGeral = saldoFixos + extras.saldo;
  return { totalR, totalG, extras, saldoFixos, saldoGeral, mes };
}

function gerarRelatorioMensalPdf(modo = 'completo') {
  const chave = index.mesAtivo;
  const rotulo = rotuloMes(chave);
  const { totalR, totalG, extras, saldoFixos, saldoGeral, mes } = resumoDoMes(chave);
  const metas = mes.metasCategorias || metasCategoriasPadrao();

  const gastosAvulsos = (mes.lancamentos || [])
    .map(normalizarLancamento)
    .filter((l) => l.tipo === 'gasto');
  const porCategoria = {};
  for (const g of gastosAvulsos) {
    porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + (Number(g.valor) || 0);
  }

  const metasRows = CATEGORIAS.filter((c) => c.tipos.includes('gasto')).map((cat) => {
    const gasto = Number(porCategoria[cat.id]) || 0;
    const limite = Math.max(0, Number(metas[cat.id]) || 0);
    const pct = limite > 0 ? (gasto / limite) * 100 : 0;
    const status = limite <= 0
      ? 'Sem meta'
      : gasto > limite
        ? 'Estourou'
        : `${pct.toFixed(0)}%`;
    return `<tr>
      <td>${escaparHtml(cat.label)}</td>
      <td>${fmt.format(gasto)}</td>
      <td>${fmt.format(limite)}</td>
      <td>${status}</td>
    </tr>`;
  }).join('');

  const topCategorias = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, valor]) => `<li>${escaparHtml(labelCategoria(id))}: <strong>${fmt.format(valor)}</strong></li>`)
    .join('') || '<li>Sem gastos avulsos no mês.</li>';

  const evolucao = [...index.meses].sort().slice(-6).map((ch) => {
    const r = resumoDoMes(ch);
    return `<tr>
      <td>${escaparHtml(rotuloMes(ch))}</td>
      <td>${fmt.format(r.totalR + r.extras.rec)}</td>
      <td>${fmt.format(r.totalG + r.extras.gasto)}</td>
      <td>${fmt.format(r.saldoGeral)}</td>
    </tr>`;
  }).join('');

  const win = window.open('', '_blank', 'width=960,height=720');
  if (!win) {
    toast('Permita pop-up para gerar o relatório.');
    return;
  }

  const isLimpo = modo === 'limpo';

  win.document.write(`<!doctype html>
  <html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Relatório ${escaparHtml(rotulo)}</title>
    <style>
      body{font-family:Arial,sans-serif;color:#1f2937;padding:24px}
      h1{margin:0 0 6px}
      .sub{color:#6b7280;margin:0 0 18px}
      .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
      .card{border:1px solid #d1d5db;border-radius:8px;padding:10px}
      .card small{color:#6b7280;display:block}
      .card strong{font-size:18px}
      table{width:100%;border-collapse:collapse;margin:10px 0 18px}
      th,td{border:1px solid #d1d5db;padding:8px;text-align:left;font-size:13px}
      th{background:#f3f4f6}
      ul{margin:8px 0 18px}
      @media print { body{padding:0} }
    </style>
  </head>
  <body>
    <h1>Relatório Mensal - ${escaparHtml(rotulo)}</h1>
    <p class="sub">Gerado em ${escaparHtml(new Date().toLocaleString('pt-BR'))}</p>

    <div class="grid">
      <div class="card"><small>Receitas fixas</small><strong>${fmt.format(totalR)}</strong></div>
      <div class="card"><small>Gastos fixos</small><strong>${fmt.format(totalG)}</strong></div>
      <div class="card"><small>Extras (saldo)</small><strong>${fmt.format(extras.saldo)}</strong></div>
      <div class="card"><small>Saldo geral</small><strong>${fmt.format(saldoGeral)}</strong></div>
    </div>

    ${isLimpo ? '' : `
    <h2>Metas por categoria</h2>
    <table>
      <thead><tr><th>Categoria</th><th>Gasto</th><th>Meta</th><th>Status</th></tr></thead>
      <tbody>${metasRows}</tbody>
    </table>

    <h2>Top categorias (gastos avulsos)</h2>
    <ul>${topCategorias}</ul>

    <h2>Evolução últimos meses</h2>
    <table>
      <thead><tr><th>Mês</th><th>Receitas</th><th>Gastos</th><th>Saldo geral</th></tr></thead>
      <tbody>${evolucao}</tbody>
    </table>
    `}

    <script>window.onload = () => { window.focus(); window.print(); };</script>
  </body>
  </html>`);
  win.document.close();
}

function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) {
    console.warn(msg);
    return;
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

function mostrarErroBoot(msg) {
  const el = $('bootErro');
  if (el) {
    el.hidden = false;
    el.textContent = msg;
  } else {
    console.error(msg);
  }
}

const $ = (id) => document.getElementById(id);

function trocarMes(chave) {
  if (chave === index.mesAtivo) return;
  persistir();
  index.mesAtivo = chave;
  if (!index.meses.includes(chave)) index.meses.push(chave);
  index.meses.sort();
  estado = { ...index.global, ...carregarMes(chave) };
  localStorage.setItem(STORAGE_IDX, JSON.stringify(index));
  render();
  toast(rotuloMes(chave));
}

function renderSelMes() {
  const sel = $('selMes');
  if (!sel) return;
  index.meses.sort();
  sel.replaceChildren(
    ...index.meses.map((ch) => {
      const opt = document.createElement('option');
      opt.value = ch;
      opt.textContent = rotuloMes(ch);
      if (ch === index.mesAtivo) opt.selected = true;
      return opt;
    })
  );
}

function criarLinhaFinanceira(item, tipo) {
  const li = document.createElement('li');
  li.className = 'linha-item';
  li.dataset.id = item.id;

  const desc = document.createElement('input');
  desc.type = 'text';
  desc.value = item.descricao || '';
  desc.placeholder = 'Descrição';
  desc.addEventListener('input', () => {
    const alvo = estado[tipo].find((x) => x.id === item.id);
    if (alvo) alvo.descricao = desc.value;
    agendarSalvar();
    renderGrafico();
  });

  const val = document.createElement('input');
  val.type = 'number';
  val.min = '0';
  val.step = '0.01';
  val.value = item.valor ?? 0;
  val.addEventListener('input', () => {
    const alvo = estado[tipo].find((x) => x.id === item.id);
    if (alvo) alvo.valor = parseFloat(val.value) || 0;
    agendarSalvar();
    atualizarTotais();
  });

  const rm = document.createElement('button');
  rm.type = 'button';
  rm.className = 'btn-remove';
  rm.title = 'Remover';
  rm.textContent = '×';
  rm.addEventListener('click', () => {
    estado[tipo] = estado[tipo].filter((x) => x.id !== item.id);
    agendarSalvar();
    render();
  });

  li.append(desc, val, rm);
  return li;
}

function renderLinhasFinanceiras() {
  const listaR = $('listaReceitas');
  const listaG = $('listaGastos');
  if (!listaR || !listaG) return;
  listaR.replaceChildren(
    ...estado.receitas.map((i) => criarLinhaFinanceira(i, 'receitas'))
  );
  listaG.replaceChildren(
    ...estado.gastos.map((i) => criarLinhaFinanceira(i, 'gastos'))
  );
}

function criarLinhaTexto(item, tipo) {
  const li = document.createElement('li');
  li.dataset.id = item.id;

  const inp = document.createElement('input');
  inp.type = 'text';
  inp.value = item.texto || '';
  inp.placeholder = tipo === 'anotacoes' ? 'Nova anotação…' : 'Novo sonho…';
  inp.addEventListener('input', () => {
    const alvo = estado[tipo].find((x) => x.id === item.id);
    if (alvo) alvo.texto = inp.value;
    agendarSalvar();
  });

  const rm = document.createElement('button');
  rm.type = 'button';
  rm.className = 'btn-remove';
  rm.title = 'Remover';
  rm.textContent = '×';
  rm.style.marginLeft = 'auto';
  rm.addEventListener('click', () => {
    estado[tipo] = estado[tipo].filter((x) => x.id !== item.id);
    agendarSalvar();
    render();
  });

  li.append(inp, rm);
  return li;
}

function renderListasTexto() {
  $('listaAnotacoes').replaceChildren(
    ...estado.anotacoes.map((i) => criarLinhaTexto(i, 'anotacoes'))
  );
}

function criarLinhaSonho(item) {
  const li = document.createElement('li');
  li.className = 'sonho-item';
  li.dataset.id = item.id;

  const topo = document.createElement('div');
  topo.className = 'sonho-topo';

  const titulo = document.createElement('input');
  titulo.type = 'text';
  titulo.value = item.texto || '';
  titulo.placeholder = 'Descreva o sonho…';
  titulo.addEventListener('input', () => {
    const alvo = estado.sonhos.find((x) => x.id === item.id);
    if (alvo) alvo.texto = titulo.value;
    agendarSalvar();
  });

  const meta = document.createElement('input');
  meta.type = 'number';
  meta.min = '0';
  meta.step = '100';
  meta.value = item.meta ?? 0;
  meta.title = 'Meta (R$)';
  meta.placeholder = 'Meta';
  meta.addEventListener('input', () => {
    const alvo = estado.sonhos.find((x) => x.id === item.id);
    if (alvo) alvo.meta = Math.max(0, parseFloat(meta.value) || 0);
    agendarSalvar();
    renderSonhos();
  });

  const guardado = document.createElement('input');
  guardado.type = 'number';
  guardado.min = '0';
  guardado.step = '50';
  guardado.value = item.guardado ?? 0;
  guardado.title = 'Já guardado (R$)';
  guardado.placeholder = 'Guardado';
  guardado.addEventListener('input', () => {
    const alvo = estado.sonhos.find((x) => x.id === item.id);
    if (alvo) alvo.guardado = Math.max(0, parseFloat(guardado.value) || 0);
    agendarSalvar();
    renderSonhos();
  });

  const rm = document.createElement('button');
  rm.type = 'button';
  rm.className = 'btn-remove';
  rm.textContent = '×';
  rm.setAttribute('aria-label', 'Remover lançamento');
  rm.addEventListener('click', () => {
    estado.sonhos = estado.sonhos.filter((x) => x.id !== item.id);
    agendarSalvar();
    render();
  });

  topo.append(titulo, meta, guardado, rm);

  const track = document.createElement('div');
  track.className = 'sonho-progresso';
  const fill = document.createElement('div');
  fill.className = 'sonho-progresso-fill';
  const m = Number(item.meta) || 0;
  const g = Number(item.guardado) || 0;
  const pct = m > 0 ? Math.min(100, (g / m) * 100) : (g > 0 ? 100 : 0);
  fill.style.width = `${pct}%`;
  track.append(fill);

  const rodape = document.createElement('div');
  rodape.className = 'sonho-rodape';
  const esq = document.createElement('span');
  esq.textContent = m > 0 ? `${pct.toFixed(0)}% da meta` : 'Sem meta em R$';
  const dir = document.createElement('span');
  dir.textContent = m > 0 ? `${fmt.format(g)} / ${fmt.format(m)}` : fmt.format(g);
  rodape.append(esq, dir);

  li.append(topo, track, rodape);
  return li;
}

function renderSonhos() {
  $('listaSonhos').replaceChildren(
    ...estado.sonhos.map((i) => criarLinhaSonho(i))
  );

  const sobraFixa = somaItens(estado.receitas) - somaItens(estado.gastos);
  const sug = $('sonhoSugestao');
  if (sobraFixa > 0) {
    sug.hidden = false;
    sug.innerHTML = '';
    sug.append(`Sobra ${fmt.format(sobraFixa)} nos gastos fixos deste mês. `);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Somar à reserva/poupança';
    btn.addEventListener('click', () => {
      const alvo =
        estado.sonhos.find((s) => (Number(s.meta) || 0) > 0) || estado.sonhos[0];
      if (!alvo) {
        toast('Adicione um sonho primeiro.');
        return;
      }
      alvo.guardado = (Number(alvo.guardado) || 0) + sobraFixa;
      agendarSalvar();
      renderSonhos();
      toast(`${fmt.format(sobraFixa)} adicionado.`);
    });
    sug.append(btn);
  } else {
    sug.hidden = true;
  }
}

function formatarDataCurta(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function criarItemLancamento(l) {
  const li = document.createElement('li');
  li.className = 'lanc-item';
  li.dataset.id = l.id;

  const data = document.createElement('span');
  data.textContent = formatarDataCurta(l.data);

  const tipo = document.createElement('span');
  tipo.className = `tag-tipo ${l.tipo}`;
  tipo.textContent = l.tipo === 'receita' ? 'Receita' : 'Gasto';

  const cat = document.createElement('span');
  cat.className = 'tag-cat';
  cat.textContent = labelCategoria(l.categoria, l.tipo);

  const desc = document.createElement('span');
  desc.className = 'desc';
  desc.innerHTML = destacarTermo(l.descricao || '—', lancBuscaTermo);

  const valor = document.createElement('span');
  valor.className = `valor ${l.tipo}`;
  valor.textContent = fmt.format(Number(l.valor) || 0);

  const rm = document.createElement('button');
  rm.type = 'button';
  rm.className = 'btn-remove';
  rm.textContent = '×';
  rm.addEventListener('click', () => {
    estado.lancamentos = estado.lancamentos.filter((x) => x.id !== l.id);
    agendarSalvar();
    renderLancamentos();
    atualizarResumoGeral();
  });

  const edit = document.createElement('button');
  edit.type = 'button';
  edit.className = 'btn-edit';
  edit.textContent = '✎';
  edit.title = 'Editar lançamento';
  edit.setAttribute('aria-label', 'Editar lançamento');
  edit.addEventListener('click', () => iniciarEdicaoLancamento(l));

  const dup = document.createElement('button');
  dup.type = 'button';
  dup.className = 'btn-dup';
  dup.textContent = '⧉';
  dup.title = 'Duplicar lançamento';
  dup.setAttribute('aria-label', 'Duplicar lançamento');
  dup.addEventListener('click', () => iniciarDuplicarLancamento(l));

  li.append(data, tipo, cat, desc, valor, dup, edit, rm);
  return li;
}

function renderFiltrosCategorias() {
  const wrap = $('lancFiltros');
  const todos = lancamentosDoMesTodos();
  const gastos = todos.filter((l) => l.tipo === 'gasto');
  if (!gastos.length) {
    wrap.hidden = true;
    return;
  }

  const porCat = {};
  for (const g of gastos) {
    porCat[g.categoria] = (porCat[g.categoria] || 0) + (Number(g.valor) || 0);
  }

  wrap.hidden = false;
  wrap.replaceChildren();

  const btnTodos = document.createElement('button');
  btnTodos.type = 'button';
  btnTodos.className = `chip-filtro${filtroCategoria ? '' : ' ativo'}`;
  btnTodos.textContent = 'Todos';
  btnTodos.addEventListener('click', () => {
    filtroCategoria = null;
    renderLancamentos();
  });
  wrap.append(btnTodos);

  Object.entries(porCat)
    .sort((a, b) => b[1] - a[1])
    .forEach(([id, total]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip-filtro${filtroCategoria === id ? ' ativo' : ''}`;
      btn.textContent = `${labelCategoria(id)} · ${fmt.format(total)}`;
      btn.addEventListener('click', () => {
        filtroCategoria = filtroCategoria === id ? null : id;
        renderLancamentos();
      });
      wrap.append(btn);
    });
}

function renderResumoCategorias() {
  const box = $('resumoCategorias');
  const gastos = lancamentosDoMesTodos().filter((l) => l.tipo === 'gasto');
  if (!gastos.length) {
    box.hidden = true;
    return;
  }

  const porCat = {};
  for (const g of gastos) {
    porCat[g.categoria] = (porCat[g.categoria] || 0) + (Number(g.valor) || 0);
  }
  const total = Object.values(porCat).reduce((a, b) => a + b, 0);
  const ordenados = Object.entries(porCat).sort((a, b) => b[1] - a[1]);

  box.hidden = false;
  box.replaceChildren(
    ...ordenados.map(([id, valor]) => {
      const row = document.createElement('div');
      row.className = 'cat-resumo-linha';
      const pct = total ? (valor / total) * 100 : 0;

      const nome = document.createElement('span');
      nome.className = 'nome';
      nome.textContent = labelCategoria(id);

      const track = document.createElement('div');
      track.className = 'barra-track';
      const fill = document.createElement('div');
      fill.className = 'barra-fill';
      fill.style.width = `${pct}%`;
      track.append(fill);

      const val = document.createElement('span');
      val.className = 'val';
      val.textContent = fmt.format(valor);

      row.append(nome, track, val);
      return row;
    })
  );
}

function renderMetasCategorias() {
  if (!estado.metasCategorias) estado.metasCategorias = metasCategoriasPadrao();
  const wrap = $('metasCategorias');
  const alerta = $('metaAlerta');
  if (!wrap || !alerta) return;

  const gastos = lancamentosDoMesTodos().filter((l) => l.tipo === 'gasto');
  const gastosPorCategoria = {};
  for (const g of gastos) {
    gastosPorCategoria[g.categoria] = (gastosPorCategoria[g.categoria] || 0) + (Number(g.valor) || 0);
  }

  const categoriasGasto = CATEGORIAS.filter((c) => c.tipos.includes('gasto'));
  const estouradas = [];
  const estouradasInfo = [];

  wrap.replaceChildren(
    ...categoriasGasto.map((cat) => {
      const limite = Math.max(0, Number(estado.metasCategorias[cat.id]) || 0);
      const gasto = Number(gastosPorCategoria[cat.id]) || 0;
      const pct = limite > 0 ? (gasto / limite) * 100 : 0;
      const excedeu = limite > 0 && gasto > limite;
      if (excedeu) {
        estouradas.push(cat.label);
        estouradasInfo.push({ id: cat.id, label: cat.label, gasto, limite });
      }

      const li = document.createElement('li');
      li.className = `meta-item${excedeu ? ' excedeu' : ''}`;

      const topo = document.createElement('div');
      topo.className = 'meta-topo';

      const nome = document.createElement('span');
      nome.className = 'nome';
      nome.textContent = cat.label;

      const gastoEl = document.createElement('span');
      gastoEl.className = 'gasto';
      gastoEl.textContent = fmt.format(gasto);

      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = '10';
      input.placeholder = 'Limite';
      input.value = limite || '';
      input.title = `Meta mensal para ${cat.label}`;
      input.addEventListener('input', () => {
        estado.metasCategorias[cat.id] = Math.max(0, parseFloat(input.value) || 0);
        agendarSalvar();
        renderMetasCategorias();
      });

      topo.append(nome, gastoEl, input);

      const track = document.createElement('div');
      track.className = 'sonho-progresso';
      const fill = document.createElement('div');
      fill.className = 'sonho-progresso-fill';
      fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
      if (excedeu) fill.style.background = 'linear-gradient(90deg, #c45a4a, var(--alerta))';
      track.append(fill);

      const rodape = document.createElement('div');
      rodape.className = 'meta-rodape';
      const esq = document.createElement('span');
      esq.textContent = limite > 0 ? `${pct.toFixed(0)}% usado` : 'Sem limite definido';
      const dir = document.createElement('span');
      dir.textContent = limite > 0 ? `${fmt.format(gasto)} / ${fmt.format(limite)}` : fmt.format(gasto);
      rodape.append(esq, dir);

      li.append(topo, track, rodape);
      return li;
    })
  );

  if (estouradas.length) {
    alerta.hidden = false;
    alerta.textContent = `Atenção: meta estourada em ${estouradas.join(', ')}.`;
  } else {
    alerta.hidden = true;
    alerta.textContent = '';
  }

  if (estouradasInfo.length && notificacaoMetaHabilitada()) {
    estouradasInfo.forEach((info) => {
      if (jaNotificouMeta(index.mesAtivo, info.id)) return;
      notificarMetaEstourada(info.label, info.gasto, info.limite);
      marcarMetaNotificada(index.mesAtivo, info.id);
    });
  }
}

function sugerirMetasPorHistorico() {
  if (!estado.metasCategorias) estado.metasCategorias = metasCategoriasPadrao();
  const ordenados = [...index.meses].sort();
  const idxAtual = ordenados.indexOf(index.mesAtivo);
  const anteriores = idxAtual > 0 ? ordenados.slice(0, idxAtual) : [];
  const base = anteriores.slice(-3);

  if (!base.length) {
    toast('Sem histórico anterior suficiente para sugerir metas.');
    return;
  }

  const somaPorCategoria = {};
  const qtdMesesComCategoria = {};
  const categoriasGasto = CATEGORIAS.filter((c) => c.tipos.includes('gasto'));
  categoriasGasto.forEach((c) => {
    somaPorCategoria[c.id] = 0;
    qtdMesesComCategoria[c.id] = 0;
  });

  for (const chave of base) {
    const mes = carregarMes(chave);
    const gastosMes = (mes.lancamentos || [])
      .map(normalizarLancamento)
      .filter((l) => l.tipo === 'gasto');

    const totalCategoria = {};
    for (const g of gastosMes) {
      totalCategoria[g.categoria] = (totalCategoria[g.categoria] || 0) + (Number(g.valor) || 0);
    }

    categoriasGasto.forEach((c) => {
      const valor = Number(totalCategoria[c.id]) || 0;
      if (valor > 0) {
        somaPorCategoria[c.id] += valor;
        qtdMesesComCategoria[c.id] += 1;
      }
    });
  }

  let alteradas = 0;
  categoriasGasto.forEach((c) => {
    const qtd = qtdMesesComCategoria[c.id];
    if (!qtd) return;
    const media = somaPorCategoria[c.id] / qtd;
    // Folga de 10% para reduzir alertas falsos e arredonda para dezenas.
    const sugerida = Math.ceil((media * 1.1) / 10) * 10;
    estado.metasCategorias[c.id] = sugerida;
    alteradas += 1;
  });

  if (!alteradas) {
    toast('Não encontrei gastos históricos para sugerir metas.');
    return;
  }

  agendarSalvar();
  renderMetasCategorias();
  toast(`Metas sugeridas aplicadas (${alteradas} categorias).`);
}

function renderLancamentos() {
  if (!Array.isArray(estado.lancamentos)) estado.lancamentos = [];
  popularSelectCategorias();

  const lista = lancamentosDoMes();
  const { rec, gasto, saldo } = totaisLancamentos();
  const ordenados = [...lista].sort((a, b) =>
    (b.data || '').localeCompare(a.data || '')
  );

  $('listaLancamentos').replaceChildren(
    ...ordenados.map(criarItemLancamento)
  );
  renderFiltrosCategorias();
  renderResumoCategorias();
  const btnLimpar = $('btnLimparBusca');
  if (btnLimpar) btnLimpar.hidden = !lancBuscaTermo.trim();
  $('lancVazio').hidden = ordenados.length > 0;
  if (lancBuscaTermo.trim()) {
    $('lancVazio').textContent = 'Nenhum lançamento para esta busca.';
  } else {
    $('lancVazio').textContent = filtroCategoria
      ? 'Nenhum lançamento nesta categoria.'
      : 'Nenhum lançamento neste mês.';
  }
  $('lancTotRec').textContent = fmt.format(rec);
  $('lancTotGasto').textContent = fmt.format(gasto);
  $('lancSaldoExtra').textContent = fmt.format(saldo);
  $('lancSaldoExtra').style.color =
    saldo < 0 ? 'var(--alerta)' : 'var(--destaque)';
  renderMetasCategorias();

  const dataInput = $('lancData');
  if (dataInput) {
    const hoje = hojeISO();
    dataInput.value =
      chaveMes(hoje) === index.mesAtivo ? hoje : `${index.mesAtivo}-01`;
    dataInput.min = `${index.mesAtivo}-01`;
    const [y, m] = index.mesAtivo.split('-').map(Number);
    const ultimo = new Date(y, m, 0).getDate();
    dataInput.max = `${index.mesAtivo}-${String(ultimo).padStart(2, '0')}`;
  }
}

function atualizarResumoGeral() {
  const saldoFixo = somaItens(estado.receitas) - somaItens(estado.gastos);
  const { rec, gasto, saldo: saldoExtra } = totaisLancamentos();
  const saldoGeral = saldoFixo + saldoExtra;
  const temExtras = rec > 0 || gasto > 0;

  $('wrapResumoExtras').hidden = !temExtras;
  $('extraReceitas').textContent = fmt.format(rec);
  $('extraGastos').textContent = fmt.format(gasto);
  $('saldoGeral').textContent = fmt.format(saldoGeral);
  $('wrapSaldoGeral').classList.toggle('negativo', saldoGeral < 0);
}

function renderSemana() {
  const tbody = $('corpoSemana');
  if (!tbody) return;
  tbody.replaceChildren();

  for (const dia of DIAS_SEMANA) {
    if (!estado.semana[dia.key]) {
      estado.semana[dia.key] = { receita: 0, gastos: 0 };
    }
    const dados = estado.semana[dia.key];
    const tr = document.createElement('tr');

    const tdDia = document.createElement('td');
    tdDia.textContent = dia.label;

    const tdR = document.createElement('td');
    const inR = document.createElement('input');
    inR.type = 'number';
    inR.min = '0';
    inR.step = '0.01';
    inR.value = dados.receita ?? 0;
    inR.addEventListener('input', () => {
      estado.semana[dia.key].receita = parseFloat(inR.value) || 0;
      agendarSalvar();
      atualizarSemanaFooter();
      atualizarCelulasSaldoSemana();
    });
    tdR.append(inR);

    const tdG = document.createElement('td');
    const inG = document.createElement('input');
    inG.type = 'number';
    inG.min = '0';
    inG.step = '0.01';
    inG.value = dados.gastos ?? 0;
    inG.addEventListener('input', () => {
      estado.semana[dia.key].gastos = parseFloat(inG.value) || 0;
      agendarSalvar();
      atualizarSemanaFooter();
      atualizarCelulasSaldoSemana();
    });
    tdG.append(inG);

    const tdS = document.createElement('td');
    tdS.className = 'cel-saldo';
    tdS.dataset.dia = dia.key;

    tr.append(tdDia, tdR, tdG, tdS);
    tbody.append(tr);
  }

  atualizarSemanaFooter();
  atualizarCelulasSaldoSemana();
}

function atualizarCelulasSaldoSemana() {
  document.querySelectorAll('.cel-saldo').forEach((td) => {
    const key = td.dataset.dia;
    if (!key) return;
    const d = estado.semana[key] || { receita: 0, gastos: 0 };
    const s = (Number(d.receita) || 0) - (Number(d.gastos) || 0);
    td.textContent = fmt.format(s);
    td.classList.toggle('neg', s < 0);
  });
}

function atualizarSemanaFooter() {
  let totR = 0;
  let totG = 0;
  for (const dia of DIAS_SEMANA) {
    const d = estado.semana[dia.key] || { receita: 0, gastos: 0 };
    totR += Number(d.receita) || 0;
    totG += Number(d.gastos) || 0;
  }
  $('semReceita').textContent = fmt.format(totR);
  $('semGastos').textContent = fmt.format(totG);
  const saldoSem = totR - totG;
  $('semSaldo').textContent = fmt.format(saldoSem);
  $('semSaldo').classList.toggle('neg', saldoSem < 0);
}

function renderGrafico() {
  const totalR = somaItens(estado.receitas);
  const gastos = estado.gastos.filter((g) => (Number(g.valor) || 0) > 0);
  const wrap = $('graficoBarras');
  const vazio = $('graficoVazio');
  if (!wrap || !vazio) return;

  if (!totalR || !gastos.length) {
    wrap.replaceChildren();
    vazio.hidden = false;
    return;
  }

  vazio.hidden = true;
  const ordenados = [...gastos].sort(
    (a, b) => (Number(b.valor) || 0) - (Number(a.valor) || 0)
  );

  wrap.replaceChildren(
    ...ordenados.map((g) => {
      const valor = Number(g.valor) || 0;
      const pct = Math.min(100, (valor / totalR) * 100);
      const linha = document.createElement('div');
      linha.className = 'barra-linha';
      if (pct > 35) linha.classList.add('alerta');

      const nome = document.createElement('span');
      nome.className = 'nome';
      nome.textContent = g.descricao || 'Sem nome';
      nome.title = `${g.descricao} — ${fmt.format(valor)}`;

      const track = document.createElement('div');
      track.className = 'barra-track';
      const fill = document.createElement('div');
      fill.className = 'barra-fill';
      fill.style.width = `${pct}%`;
      track.append(fill);

      const pctEl = document.createElement('span');
      pctEl.className = 'barra-pct';
      pctEl.textContent = `${pct.toFixed(0)}%`;

      linha.append(nome, track, pctEl);
      return linha;
    })
  );
}

function renderEvolucaoMensal() {
  const wrap = $('evolucaoBarras');
  const vazio = $('evolucaoVazio');
  if (!wrap || !vazio) return;

  document.querySelectorAll('[data-modo-evolucao]').forEach((btn) => {
    btn.classList.toggle('ativo', btn.dataset.modoEvolucao === evolucaoModo);
  });

  const meses = [...index.meses].sort();
  if (meses.length < 2) {
    wrap.replaceChildren();
    vazio.hidden = false;
    return;
  }

  const ultimos = meses.slice(-8);
  const hint = $('evolucaoHint');
  if (hint) {
    hint.textContent =
      evolucaoModo === 'saldo'
        ? 'Saldo geral (fixos + lançamentos avulsos) dos últimos meses.'
        : evolucaoModo === 'receita'
          ? 'Receitas totais (fixas + avulsas) dos últimos meses.'
          : 'Gastos totais (fixos + avulsos) dos últimos meses.';
  }

  const serie = ultimos.map((ch) => {
    const mes = carregarMes(ch);
    const totalR = somaItens(mes.receitas || []);
    const totalG = somaItens(mes.gastos || []);
    const saldoFixos = totalR - totalG;
    const extras = totaisLancamentosLista(
      (mes.lancamentos || []).map(normalizarLancamento)
    );
    const saldoGeral = saldoFixos + extras.saldo;
    const receitaTotal = totalR + extras.rec;
    const gastosTotal = totalG + extras.gasto;
    const valor =
      evolucaoModo === 'receita'
        ? receitaTotal
        : evolucaoModo === 'gasto'
          ? gastosTotal
          : saldoGeral;
    return { chave: ch, valor };
  });

  const maxAbs = Math.max(1, ...serie.map((s) => Math.abs(s.valor)));
  vazio.hidden = true;
  wrap.replaceChildren(
    ...serie.map((item) => {
      const row = document.createElement('div');
      row.className = 'evolucao-linha';

      const mes = document.createElement('span');
      mes.className = 'evolucao-mes';
      mes.textContent = rotuloMes(item.chave);

      const track = document.createElement('div');
      track.className = 'evolucao-track';
      const fill = document.createElement('div');
      const classeModo = evolucaoModo === 'saldo'
        ? (item.valor < 0 ? ' neg' : '')
        : evolucaoModo === 'receita'
          ? ' receita'
          : ' gasto';
      fill.className = `evolucao-fill${classeModo}`;
      fill.style.width = `${Math.max(2, (Math.abs(item.valor) / maxAbs) * 100)}%`;
      track.append(fill);

      const val = document.createElement('span');
      val.className = `evolucao-valor${item.valor < 0 ? ' neg' : ''}`;
      val.textContent = fmt.format(item.valor);

      row.append(mes, track, val);
      return row;
    })
  );
}

function renderPainelAnual() {
  const sel = $('selAnoPainel');
  const body = $('painelAnualBody');
  const vazio = $('painelAnualVazio');
  if (!sel || !body || !vazio) return;

  const anos = [...new Set((index.meses || []).map((ch) => String(ch).slice(0, 4)).filter(Boolean))].sort();
  if (!anos.length) {
    sel.replaceChildren();
    body.replaceChildren();
    vazio.hidden = false;
    return;
  }

  const anoPadrao = String(index.mesAtivo || '').slice(0, 4);
  if (!painelAnoAtivo || !anos.includes(painelAnoAtivo)) {
    painelAnoAtivo = anos.includes(anoPadrao) ? anoPadrao : anos[anos.length - 1];
  }

  sel.replaceChildren(
    ...anos.map((ano) => {
      const opt = document.createElement('option');
      opt.value = ano;
      opt.textContent = ano;
      if (ano === painelAnoAtivo) opt.selected = true;
      return opt;
    })
  );

  let totalRec = 0;
  let totalGasto = 0;
  let totalSaldo = 0;
  let temDados = false;

  body.replaceChildren(
    ...Array.from({ length: 12 }, (_, i) => {
      const mes = `${painelAnoAtivo}-${String(i + 1).padStart(2, '0')}`;
      const tr = document.createElement('tr');
      const nomeMes = MESES_PT[i];

      let rec = 0;
      let gasto = 0;
      let saldo = 0;
      const existe = (index.meses || []).includes(mes);

      if (existe) {
        const resumo = resumoDoMes(mes);
        rec = resumo.totalR + resumo.extras.rec;
        gasto = resumo.totalG + resumo.extras.gasto;
        saldo = resumo.saldoGeral;
        totalRec += rec;
        totalGasto += gasto;
        totalSaldo += saldo;
        if (rec > 0 || gasto > 0 || saldo !== 0) temDados = true;
        tr.style.cursor = 'pointer';
        tr.title = `Abrir ${rotuloMes(mes)}`;
        tr.addEventListener('click', () => trocarMes(mes));
      }

      tr.innerHTML = `<th>${nomeMes}</th><td>${fmt.format(rec)}</td><td>${fmt.format(gasto)}</td><td>${fmt.format(saldo)}</td>`;
      if (!existe) {
        const mesCell = tr.querySelector('th');
        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'btn-mini-add-mes';
        addBtn.textContent = '+ Novo mês';
        addBtn.title = `Criar ${rotuloMes(mes)}`;
        addBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          persistir();
          if (!index.meses.includes(mes)) index.meses.push(mes);
          index.meses.sort();
          index.mesAtivo = mes;
          localStorage.setItem(STORAGE_MES(mes, index.activeProfileId), JSON.stringify(mesPadrao(mes)));
          localStorage.setItem(STORAGE_IDX, JSON.stringify(index));
          estado = { ...index.global, ...carregarMes(mes, index.activeProfileId) };
          render();
          toast(`${rotuloMes(mes)} criado.`);
        });
        mesCell.append(' ', addBtn);
      }
      return tr;
    })
  );

  const anualRecEl = $('anualRec');
  const anualGastoEl = $('anualGasto');
  const anualSaldoEl = $('anualSaldo');
  if (anualRecEl) anualRecEl.textContent = fmt.format(totalRec);
  if (anualGastoEl) anualGastoEl.textContent = fmt.format(totalGasto);
  if (anualSaldoEl) {
    anualSaldoEl.textContent = fmt.format(totalSaldo);
    anualSaldoEl.style.color = totalSaldo < 0 ? 'var(--alerta)' : 'var(--destaque)';
  }

  const prevAno = String(Number(painelAnoAtivo) - 1);
  let prevRec = 0;
  let prevGasto = 0;
  let prevSaldo = 0;
  if (anos.includes(prevAno)) {
    for (let i = 0; i < 12; i += 1) {
      const mes = `${prevAno}-${String(i + 1).padStart(2, '0')}`;
      if (!(index.meses || []).includes(mes)) continue;
      const resumo = resumoDoMes(mes);
      prevRec += resumo.totalR + resumo.extras.rec;
      prevGasto += resumo.totalG + resumo.extras.gasto;
      prevSaldo += resumo.saldoGeral;
    }
  }

  const deltaPct = (atual, anterior) => {
    if (!anterior) return null;
    return ((atual - anterior) / Math.abs(anterior)) * 100;
  };
  const fmtDelta = (pct) => (pct == null ? 'Sem base' : `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`);

  const compRec = deltaPct(totalRec, prevRec);
  const compGasto = deltaPct(totalGasto, prevGasto);
  const compSaldo = deltaPct(totalSaldo, prevSaldo);
  const compRecEl = $('anualCompRec');
  const compGastoEl = $('anualCompGasto');
  const compSaldoEl = $('anualCompSaldo');
  if (compRecEl) {
    compRecEl.textContent = fmtDelta(compRec);
    compRecEl.style.color = compRec == null ? 'var(--tinta-suave)' : (compRec >= 0 ? 'var(--destaque)' : 'var(--alerta)');
  }
  if (compGastoEl) {
    compGastoEl.textContent = fmtDelta(compGasto);
    compGastoEl.style.color = compGasto == null ? 'var(--tinta-suave)' : (compGasto <= 0 ? 'var(--destaque)' : 'var(--alerta)');
  }
  if (compSaldoEl) {
    compSaldoEl.textContent = fmtDelta(compSaldo);
    compSaldoEl.style.color = compSaldo == null ? 'var(--tinta-suave)' : (compSaldo >= 0 ? 'var(--destaque)' : 'var(--alerta)');
  }

  vazio.hidden = temDados;
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[;"\n\r,]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function exportarPainelAnualCsv() {
  if (!painelAnoAtivo) {
    toast('Selecione um ano no dashboard anual.');
    return;
  }
  const linhas = [['mes', 'receitas', 'gastos', 'saldo']];
  let totalRec = 0;
  let totalGasto = 0;
  let totalSaldo = 0;

  for (let i = 0; i < 12; i += 1) {
    const mes = `${painelAnoAtivo}-${String(i + 1).padStart(2, '0')}`;
    let rec = 0;
    let gasto = 0;
    let saldo = 0;
    if ((index.meses || []).includes(mes)) {
      const resumo = resumoDoMes(mes);
      rec = resumo.totalR + resumo.extras.rec;
      gasto = resumo.totalG + resumo.extras.gasto;
      saldo = resumo.saldoGeral;
    }
    totalRec += rec;
    totalGasto += gasto;
    totalSaldo += saldo;
    linhas.push([rotuloMes(mes), rec.toFixed(2), gasto.toFixed(2), saldo.toFixed(2)]);
  }

  linhas.push(['TOTAL', totalRec.toFixed(2), totalGasto.toFixed(2), totalSaldo.toFixed(2)]);
  const csv = linhas.map((cols) => cols.map(csvEscape).join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const perfilNome = (perfilAtual()?.nome || index.activeProfileId || 'perfil').replace(/[^\w-]+/g, '-');
  a.download = `diario-anual-${perfilNome}-${painelAnoAtivo}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('CSV anual exportado.');
}

function exportarPainelAnualPdf() {
  if (!painelAnoAtivo) {
    toast('Selecione um ano no dashboard anual.');
    return;
  }
  const perfilNome = perfilAtual()?.nome || index.activeProfileId || 'Perfil';
  const linhas = [];
  let totalRec = 0;
  let totalGasto = 0;
  let totalSaldo = 0;

  for (let i = 0; i < 12; i += 1) {
    const mes = `${painelAnoAtivo}-${String(i + 1).padStart(2, '0')}`;
    let rec = 0;
    let gasto = 0;
    let saldo = 0;
    if ((index.meses || []).includes(mes)) {
      const resumo = resumoDoMes(mes);
      rec = resumo.totalR + resumo.extras.rec;
      gasto = resumo.totalG + resumo.extras.gasto;
      saldo = resumo.saldoGeral;
    }
    totalRec += rec;
    totalGasto += gasto;
    totalSaldo += saldo;
    linhas.push(
      `<tr><td>${escaparHtml(MESES_PT[i])}</td><td>${fmt.format(rec)}</td><td>${fmt.format(gasto)}</td><td>${fmt.format(saldo)}</td></tr>`
    );
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard anual ${painelAnoAtivo}</title>
  <style>
    body{font-family:Arial,sans-serif;padding:18px;color:#111827}
    h1{margin:0 0 4px;font-size:22px}
    p{margin:0 0 12px;color:#4b5563}
    .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0 14px}
    .card{border:1px solid #d1d5db;border-radius:8px;padding:8px 10px}
    .card small{display:block;color:#6b7280}
    .card strong{font-size:18px}
    table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #d1d5db;padding:7px;text-align:left;font-size:13px}
    th{background:#f3f4f6}
  </style>
</head>
<body>
  <h1>Dashboard anual ${escaparHtml(painelAnoAtivo)}</h1>
  <p>Perfil: ${escaparHtml(perfilNome)} • Gerado em ${escaparHtml(new Date().toLocaleString('pt-BR'))}</p>
  <div class="cards">
    <div class="card"><small>Receitas</small><strong>${fmt.format(totalRec)}</strong></div>
    <div class="card"><small>Gastos</small><strong>${fmt.format(totalGasto)}</strong></div>
    <div class="card"><small>Saldo</small><strong>${fmt.format(totalSaldo)}</strong></div>
  </div>
  <table>
    <thead><tr><th>Mês</th><th>Receitas</th><th>Gastos</th><th>Saldo</th></tr></thead>
    <tbody>
      ${linhas.join('')}
      <tr><th>Total</th><th>${fmt.format(totalRec)}</th><th>${fmt.format(totalGasto)}</th><th>${fmt.format(totalSaldo)}</th></tr>
    </tbody>
  </table>
  <script>window.onload=()=>{window.focus();window.print();};</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    toast('Não foi possível abrir a janela de impressão.');
    return;
  }
  win.document.write(html);
  win.document.close();
}

function atualizarTotais() {
  const totalR = somaItens(estado.receitas);
  const totalG = somaItens(estado.gastos);
  const saldo = totalR - totalG;

  $('totalReceita').textContent = fmt.format(totalR);
  $('totalGastos').textContent = fmt.format(totalG);
  $('resumoReceita').textContent = fmt.format(totalR);
  $('resumoGastos').textContent = fmt.format(totalG);
  $('resumoSaldo').textContent = fmt.format(saldo);

  $('wrapSaldo').classList.toggle('negativo', saldo < 0);

  const alerta = $('alertaSaldo');
  if (saldo < 0) {
    alerta.hidden = false;
    alerta.textContent = `Atenção: gastos fixos ultrapassam a receita em ${fmt.format(Math.abs(saldo))}.`;
    alerta.style.color = 'var(--alerta)';
  } else if (saldo === 0) {
    alerta.hidden = false;
    alerta.textContent = 'Receita e gastos equilibrados — use o controle diário na semana.';
    alerta.style.color = 'var(--destaque)';
  } else {
    alerta.hidden = false;
    alerta.textContent = `Sobra ${fmt.format(saldo)} após gastos fixos.`;
    alerta.style.color = 'var(--positivo)';
  }

  renderGrafico();
  renderEvolucaoMensal();
  atualizarResumoGeral();
}

function renderCamposFixos() {
  const dataRef = $('dataRef');
  const meta = $('meta');
  const objetivo = $('objetivo');
  const citacao = $('citacaoTexto');
  if (dataRef) dataRef.value = estado.dataRef || hojeISO();
  if (meta) meta.value = estado.meta || '';
  if (objetivo) objetivo.value = estado.objetivo || '';
  if (citacao) citacao.value = estado.citacao || '';
}

function render() {
  renderSelPerfil();
  renderSelMes();
  renderCamposFixos();
  renderLinhasFinanceiras();
  renderSemana();
  renderLancamentos();
  renderListasTexto();
  renderSonhos();
  atualizarTotais();
  renderPainelAnual();
  atualizarLabelNotifMeta();
  atualizarStatusSync();
  aplicarTema(temaAtual);
}

function mesAnteriorChave() {
  const i = index.meses.indexOf(index.mesAtivo);
  if (i > 0) return index.meses[i - 1];
  return null;
}

function exportarBackup() {
  const perfis = {};
  Object.entries(index.profiles || {}).forEach(([pid, p]) => {
    const meses = {};
    (p.meses || []).forEach((ch) => {
      meses[ch] = carregarMes(ch, pid);
    });
    perfis[pid] = meses;
  });
  return {
    versao: 3,
    updatedAt: carregarAtualizacaoLocal() || new Date().toISOString(),
    index,
    perfis
  };
}

function importarBackupV3(data) {
  index = normalizarPerfis(data.index || {});
  Object.entries(data.perfis || {}).forEach(([pid, meses]) => {
    Object.entries(meses || {}).forEach(([ch, mes]) => {
      localStorage.setItem(STORAGE_MES(ch, pid), JSON.stringify(mesclarMes(mes)));
      if (!index.profiles[pid]) index.profiles[pid] = perfilPadrao(pid, pid);
      if (!index.profiles[pid].meses.includes(ch)) index.profiles[pid].meses.push(ch);
    });
    index.profiles[pid].meses.sort();
  });
  sincronizarLegacyComPerfil();
  estado = { ...index.global, ...carregarMes(index.mesAtivo, index.activeProfileId) };
  persistir();
  return true;
}

function importarBackupV2(data) {
  index = normalizarPerfis({
    activeProfileId: 'pessoal',
    profiles: {
      pessoal: {
        ...perfilPadrao('pessoal', 'Pessoal'),
        mesAtivo: data.index?.mesAtivo || chaveMes(),
        meses: [...(data.index?.meses || [])],
        global: mesclarGlobal(data.index?.global)
      }
    }
  });
  for (const [ch, mes] of Object.entries(data.meses || {})) {
    localStorage.setItem(STORAGE_MES(ch, 'pessoal'), JSON.stringify(mesclarMes(mes)));
    if (!index.profiles.pessoal.meses.includes(ch)) index.profiles.pessoal.meses.push(ch);
  }
  index.profiles.pessoal.meses.sort();
  sincronizarLegacyComPerfil();
  estado = { ...index.global, ...carregarMes(index.mesAtivo, index.activeProfileId) };
  persistir();
  return true;
}

function baixarBackupJson(nomeArquivo, dados) {
  const blob = new Blob([JSON.stringify(dados, null, 2)], {
    type: 'application/json'
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(a.href);
}

function tentarBackupAutomaticoDiario() {
  if (!autoBackupHabilitado()) return;
  if (appBloqueado) return;
  const hoje = hojeISO();
  const ultima = localStorage.getItem(STORAGE_AUTO_BACKUP_LAST_DAY);
  if (ultima === hoje) return;
  // Pequeno atraso para não competir com render inicial.
  setTimeout(() => {
    if (appBloqueado) return;
    const nome = `diario-financeiro-auto-${hoje}.json`;
    baixarBackupJson(nome, exportarBackup());
    localStorage.setItem(STORAGE_AUTO_BACKUP_LAST_DAY, hoje);
    toast('Backup automático diário gerado.');
  }, 1200);
}

function importarBackup(data) {
  if (data.versao === 3 && data.index && data.perfis) {
    return importarBackupV3(data);
  }
  if (data.versao === 2 && data.index && data.meses) {
    return importarBackupV2(data);
  }
  if (data.receitas || data.gastos) {
    estado = { ...index.global, ...mesclarMes(data) };
    persistir();
    return true;
  }
  return false;
}

function bindEventos() {
  $('selPerfil')?.addEventListener('change', (e) => trocarPerfil(e.target.value));
  $('btnNovoPerfil')?.addEventListener('click', () => criarPerfilFluxo());
  $('btnDuplicarPerfil')?.addEventListener('click', () => duplicarPerfilFluxo());
  $('btnRenomearPerfil')?.addEventListener('click', () => renomearPerfilFluxo());
  $('btnRemoverPerfil')?.addEventListener('click', () => removerPerfilFluxo());
  $('selMes').addEventListener('change', (e) => trocarMes(e.target.value));
  $('selAnoPainel')?.addEventListener('change', (e) => {
    painelAnoAtivo = String(e.target.value || '');
    renderPainelAnual();
  });
  $('btnTema')?.addEventListener('click', () => alternarTema());
  $('btnExportarAnualCsv')?.addEventListener('click', () => {
    exportarPainelAnualCsv();
  });
  $('btnExportarAnualPdf')?.addEventListener('click', () => {
    exportarPainelAnualPdf();
  });

  $('dataRef').addEventListener('change', (e) => {
    estado.dataRef = e.target.value;
    const novaChave = chaveMes(e.target.value);
    if (novaChave !== index.mesAtivo && !index.meses.includes(novaChave)) {
      persistir();
      index.meses.push(novaChave);
      index.mesAtivo = novaChave;
      localStorage.setItem(STORAGE_IDX, JSON.stringify(index));
    }
    agendarSalvar();
    renderSelMes();
  });

  $('meta').addEventListener('input', (e) => {
    estado.meta = e.target.value;
    agendarSalvar();
  });

  $('objetivo').addEventListener('input', (e) => {
    estado.objetivo = e.target.value;
    agendarSalvar();
  });

  $('citacaoTexto').addEventListener('input', (e) => {
    estado.citacao = e.target.value;
    agendarSalvar();
  });

  $('btnAddReceita').addEventListener('click', () => {
    estado.receitas.push({ id: uid(), descricao: '', valor: 0 });
    agendarSalvar();
    render();
  });

  $('btnAddGasto').addEventListener('click', () => {
    estado.gastos.push({ id: uid(), descricao: '', valor: 0 });
    agendarSalvar();
    render();
  });

  $('btnAddAnotacao').addEventListener('click', () => {
    estado.anotacoes.push({ id: uid(), texto: '' });
    agendarSalvar();
    render();
  });

  $('btnAddSonho').addEventListener('click', () => {
    estado.sonhos.push({ id: uid(), texto: '', meta: 0, guardado: 0 });
    agendarSalvar();
    render();
  });

  $('lancBusca')?.addEventListener('input', (e) => {
    lancBuscaTermo = String(e.target.value || '');
    renderLancamentos();
  });
  $('btnLimparBusca')?.addEventListener('click', () => {
    lancBuscaTermo = '';
    const busca = $('lancBusca');
    if (busca) {
      busca.value = '';
      busca.focus();
    }
    renderLancamentos();
  });

  $('formLancamento').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = $('lancData').value;
    const tipo = $('lancTipo').value;
    const categoria = $('lancCategoria').value || categoriaPadrao(tipo);
    const descricao = $('lancDesc').value.trim();
    const valor = parseFloat($('lancValor').value);
    if (!data || !descricao || !valor || valor <= 0) {
      toast('Preencha data, descrição e valor.');
      return;
    }
    if (chaveMes(data) !== index.mesAtivo) {
      toast('A data deve ser do mês selecionado.');
      return;
    }
    if (!Array.isArray(estado.lancamentos)) estado.lancamentos = [];
    const wasEditing = Boolean(lancamentoEditId);
    const isDuplicating = Boolean(lancamentoDuplicarId);
    const payload = normalizarLancamento({
      id: wasEditing ? lancamentoEditId : uid(),
      data,
      tipo,
      categoria,
      descricao,
      valor
    });
    if (lancamentoEditId) {
      const idx = estado.lancamentos.findIndex((x) => x.id === lancamentoEditId);
      if (idx >= 0) estado.lancamentos[idx] = payload;
      else estado.lancamentos.push(payload);
    } else {
      estado.lancamentos.push(payload);
    }
    agendarSalvar();
    limparFormLancamento();
    renderLancamentos();
    atualizarResumoGeral();
    toast(wasEditing ? 'Lançamento atualizado.' : (isDuplicating ? 'Lançamento duplicado.' : 'Lançamento registrado.'));
  });

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.id = 'btnCancelarLancEdicao';
  cancel.className = 'btn-icon';
  cancel.textContent = 'Cancelar edição';
  cancel.hidden = true;
  cancel.addEventListener('click', () => limparFormLancamento());
  $('formLancamento').append(cancel);

  // Atalho: Ctrl+Enter (ou Cmd+Enter) salva/registrar
  const atalhos = ['lancData', 'lancTipo', 'lancCategoria', 'lancDesc', 'lancValor'];
  atalhos.forEach((id) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('keydown', (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
        ev.preventDefault();
        $('formLancamento').requestSubmit();
      }
    });
  });

  $('btnNovoMes').addEventListener('click', () => {
    const nova = proximaChaveMes(index.mesAtivo);
    if (index.meses.includes(nova)) {
      trocarMes(nova);
      toast('Mês já existe — aberto.');
      return;
    }
    persistir();
    index.meses.push(nova);
    index.mesAtivo = nova;
    localStorage.setItem(STORAGE_MES(nova, index.activeProfileId), JSON.stringify(mesPadrao(nova)));
    localStorage.setItem(STORAGE_IDX, JSON.stringify(index));
    estado = { ...index.global, ...carregarMes(nova) };
    render();
    toast(`${rotuloMes(nova)} criado.`);
  });

  $('btnDuplicarMes').addEventListener('click', () => {
    const ant = mesAnteriorChave();
    if (!ant) {
      toast('Não há mês anterior.');
      return;
    }
    const origem = carregarMes(ant);
    estado.receitas = origem.receitas.map((r) => ({ ...r, id: uid() }));
    estado.gastos = origem.gastos.map((g) => ({ ...g, id: uid() }));
    estado.semana = JSON.parse(JSON.stringify(origem.semana));
    estado.lancamentos = (origem.lancamentos || []).map((l) => ({ ...l, id: uid() }));
    agendarSalvar();
    render();
    toast(`Copiado de ${rotuloMes(ant)}.`);
  });

  $('btnSugerirMetas')?.addEventListener('click', () => {
    sugerirMetasPorHistorico();
  });

  document.querySelectorAll('[data-modo-evolucao]').forEach((btn) => {
    btn.addEventListener('click', () => {
      evolucaoModo = btn.dataset.modoEvolucao || 'saldo';
      salvarModoEvolucao(evolucaoModo);
      document.querySelectorAll('[data-modo-evolucao]').forEach((b) => {
        b.classList.toggle('ativo', b === btn);
      });
      renderEvolucaoMensal();
    });
  });

  $('lancTipo').addEventListener('change', () => popularSelectCategorias());

  $('btnImportarCsv')?.addEventListener('click', () => {
    $('inputImportarCsv')?.click();
  });
  $('btnToggleNotifMeta')?.addEventListener('click', async () => {
    await alternarNotificacaoMeta();
    atualizarLabelNotifMeta();
  });
  $('btnLimparMapasCsv')?.addEventListener('click', () => {
    const ok = confirm('Deseja limpar todos os mapeamentos CSV salvos?');
    if (!ok) return;
    limparMapasCsv();
    toast('Mapeamentos CSV limpos.');
  });
  $('inputImportarCsv')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const txt = await file.text();
      const preview = prepararCsvImportacao(txt);
      if (!preview) {
        toast('CSV vazio ou sem linhas suficientes.');
      } else {
        csvImportPreview = preview;
        abrirModalMapaCsv(preview);
      }
    } catch {
      toast('Falha ao importar CSV.');
    }
    e.target.value = '';
  });

  $('btnCsvMapCancelar')?.addEventListener('click', () => {
    csvImportPreview = null;
    fecharModalMapaCsv();
  });
  $('btnCsvMapFechar')?.addEventListener('click', () => {
    csvImportPreview = null;
    fecharModalMapaCsv();
  });
  $('btnCsvMapConfirmar')?.addEventListener('click', () => {
    if (!csvImportPreview) return;
    const mapa = lerMapaCsvUi();
    if (mapa.valor < 0 && mapa.entrada < 0 && mapa.saida < 0) {
      toast('Mapeie "Valor" ou "Entrada/Saída" para importar.');
      return;
    }
    salvarMapaCsvPorHeaders(csvImportPreview.headersOriginais, mapa);
    const { importados, ignorados } = importarCsvLancamentos(csvImportPreview, mapa);
    csvImportPreview = null;
    fecharModalMapaCsv();
    renderLancamentos();
    atualizarResumoGeral();
    if (!importados) toast('Nenhuma linha válida para o mês selecionado.');
    else toast(`CSV importado: ${importados} lançamentos${ignorados ? `, ${ignorados} ignorados` : ''}.`);
  });
  $('csvMapOverlay')?.addEventListener('click', (e) => {
    if (e.target?.id === 'csvMapOverlay') {
      csvImportPreview = null;
      fecharModalMapaCsv();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('csvMapOverlay')?.hidden) {
      csvImportPreview = null;
      fecharModalMapaCsv();
    }
  });

  $('btnPin')?.addEventListener('click', async () => {
    await abrirMenuPin();
  });

  $('btnDesbloquearPin')?.addEventListener('click', async () => {
    await desbloquearComPin();
  });
  $('btnEsqueciPin')?.addEventListener('click', () => removerPinEmergencia());
  $('pinInput')?.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await desbloquearComPin();
    }
  });

  $('btnRelatorioPdf')?.addEventListener('click', () => {
    gerarRelatorioMensalPdf('completo');
  });

  $('btnRelatorioPdfLimpo')?.addEventListener('click', () => {
    gerarRelatorioMensalPdf('limpo');
  });

  $('btnImprimir').addEventListener('click', () => window.print());

  $('btnExportar').addEventListener('click', () => {
    persistir();
    baixarBackupJson(`diario-financeiro-${index.mesAtivo}.json`, exportarBackup());
    toast('Backup exportado.');
  });
  $('btnSyncConfig')?.addEventListener('click', async () => {
    const { token } = carregarSyncConfig();
    const acao = prompt(
      `Sync config: 1=Configurar/atualizar, 2=Limpar token (${token ? 'set' : 'vazio'})`,
      '1'
    );
    if (!acao) return;
    try {
      if (acao === '1') await syncConfigurarFluxo();
      else if (acao === '2') {
        const ok = confirm('Remover token GitHub salvo neste navegador?');
        if (!ok) return;
        limparTokenSync();
        atualizarStatusSync();
        toast('Token removido.');
      }
    } catch (e) {
      tratarErroSync(e);
    }
  });
  $('btnSyncPush')?.addEventListener('click', async () => {
    try {
      await syncEnviarFluxo();
    } catch (e) {
      tratarErroSync(e);
    }
  });
  $('btnSyncPull')?.addEventListener('click', async () => {
    try {
      await syncBaixarFluxo();
    } catch (e) {
      tratarErroSync(e);
    }
  });

  $('inputImportar').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!importarBackup(data)) throw new Error('formato');
      render();
      toast('Dados importados.');
    } catch {
      toast('Arquivo inválido.');
    }
    e.target.value = '';
  });
}

function initPwa() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    promptInstalar = e;
    const btn = $('btnInstalar');
    if (btn) btn.hidden = false;
  });

  $('btnInstalar')?.addEventListener('click', async () => {
    if (!promptInstalar) {
      toast('Use o menu do navegador: Instalar app / Adicionar à tela inicial.');
      return;
    }
    promptInstalar.prompt();
    await promptInstalar.userChoice;
    promptInstalar = null;
    $('btnInstalar').hidden = true;
  });

  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

function iniciarApp() {
  if (location.protocol === 'file:') return;

  try {
    bindEventos();
    initPwa();
    evolucaoModo = carregarModoEvolucao();
    temaAtual = carregarTema();
    popularSelectCategorias();
    instalarMonitorInatividade();
    if (!localStorage.getItem(STORAGE_MES(index.mesAtivo, index.activeProfileId))) {
      persistir();
    }
    render();
    if (temPinConfigurado()) {
      setBloqueioAtivo(true);
    } else {
      resetAutoBloqueio();
      tentarBackupAutomaticoDiario();
    }
  } catch (err) {
    console.error('iniciarApp', err);
    mostrarErroBoot(`Erro ao iniciar o app: ${err.message || err}. Tente Ctrl+F5 ou limpe o cache.`);
  }
}

function formatarDataTx(iso) {
  if (!iso) return '';
  const hoje = hojeISO();
  if (iso === hoje) return 'Hoje';
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  const o = ontem.toISOString().slice(0, 10);
  if (iso === o) return 'Ontem';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function emojiCategoria(catId, tipo) {
  const map = {
    mercado: '🛒',
    transporte: '🚗',
    saude: '💊',
    educacao: '📚',
    lazer: '🎬',
    casa: '🏠',
    'salario-extra': '💼',
    'outros-receita': '↗',
    'outros-gasto': '💳'
  };
  return map[catId] || (tipo === 'receita' ? '↗' : '💳');
}

function getSnapshotUi() {
  const chave = index.mesAtivo;
  const resumo = resumoDoMes(chave);
  const perfil = perfilAtual();
  const mes = carregarMes(chave, index.activeProfileId);
  const sonhos = mesclarGlobal(index.global).sonhos || [];
  const guardadoSonhos = sonhos.reduce((a, s) => a + (Number(s.guardado) || 0), 0);

  const month = {
    income: resumo.totalR + resumo.extras.rec,
    expense: resumo.totalG + resumo.extras.gasto,
    savings: resumo.saldoGeral
  };

  const meses = [...(index.meses || [])].sort().slice(-6);
  const saldos = meses.map((m) => Math.abs(resumoDoMes(m).saldoGeral));
  const maxSaldo = Math.max(...saldos, 1);
  const flow = meses.map((m) => {
    const mm = Number(m.split('-')[1]);
    return {
      label: MESES_PT[mm - 1]?.slice(0, 3) || m,
      pct: Math.round((Math.abs(resumoDoMes(m).saldoGeral) / maxSaldo) * 100)
    };
  });

  const metas = mes.metasCategorias || metasCategoriasPadrao();
  const lancs = (mes.lancamentos || []).map(normalizarLancamento);
  const budgets = CATEGORIAS.filter((c) => c.tipos.includes('gasto'))
    .map((cat) => {
      const spent = lancs
        .filter((l) => l.tipo === 'gasto' && l.categoria === cat.id)
        .reduce((a, l) => a + (Number(l.valor) || 0), 0);
      const limit = Math.max(0, Number(metas[cat.id]) || 0);
      return { name: cat.label, spent, limit: limit || Math.max(spent, 1) };
    })
    .filter((b) => b.spent > 0 || b.limit > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6);

  const transactions = lancamentosDoMesTodos()
    .sort((a, b) => String(b.data).localeCompare(String(a.data)))
    .slice(0, 8)
    .map((l) => ({
      id: l.id,
      title: l.descricao,
      cat: labelCategoria(l.categoria, l.tipo),
      date: formatarDataTx(l.data),
      amount: l.tipo === 'receita' ? Number(l.valor) : -Number(l.valor),
      type: l.tipo === 'receita' ? 'in' : 'out',
      emoji: emojiCategoria(l.categoria, l.tipo)
    }));

  const bills = (mes.gastos || [])
    .filter((g) => (Number(g.valor) || 0) > 0)
    .slice(0, 4)
    .map((g) => ({
      name: g.descricao || 'Conta',
      due: rotuloMes(chave).split(' ')[0],
      amount: Number(g.valor) || 0,
      status: 'due'
    }));

  const goals = sonhos
    .filter((s) => s.texto)
    .map((s) => ({
      title: s.texto,
      current: Number(s.guardado) || 0,
      target: Number(s.meta) || 0
    }));

  const todasTx = [];
  (index.meses || []).forEach((m) => {
    const mm = carregarMes(m, index.activeProfileId);
    (mm.lancamentos || []).forEach((l) => {
      const n = normalizarLancamento(l);
      todasTx.push({ ...n, mes: m });
    });
  });

  return {
    userName: perfil?.nome || 'Você',
    balance: resumo.saldoGeral + guardadoSonhos,
    month,
    flow,
    budgets,
    transactions,
    bills,
    goals,
    mesAtivo: chave,
    rotuloMes: rotuloMes(chave),
    todasTransacoes: todasTx.sort((a, b) => String(b.data).localeCompare(String(a.data)))
  };
}

function adicionarLancamentoRapido({ data, descricao, valor, tipo, categoria }) {
  if (!data || !descricao || !valor || valor <= 0) return false;
  if (chaveMes(data) !== index.mesAtivo) return false;
  if (!Array.isArray(estado.lancamentos)) estado.lancamentos = [];
  estado.lancamentos.push(
    normalizarLancamento({
      id: uid(),
      data,
      descricao: descricao.trim(),
      tipo: tipo === 'receita' ? 'receita' : 'gasto',
      categoria: categoria || categoriaPadrao(tipo),
      valor: Number(valor)
    })
  );
  agendarSalvar();
  return true;
}

function exportarBackupArquivo() {
  const nome = `diario-financeiro-${hojeISO()}.json`;
  baixarBackupJson(nome, exportarBackup());
}

window.DiarioFinanceiro = {
  init: async () => {
    if (!localStorage.getItem(STORAGE_MES(index.mesAtivo, index.activeProfileId))) {
      persistir();
    }
    await syncAutoNaAbertura();
  },
  getSnapshot: getSnapshotUi,
  persistir,
  agendarSalvar,
  adicionarLancamento: adicionarLancamentoRapido,
  exportarBackup: exportarBackupArquivo,
  importarArquivo: async (file) => {
    const data = JSON.parse(await file.text());
    if (!importarBackup(data)) throw new Error('formato');
    return true;
  },
  syncConfigurar: syncConfigurarFluxo,
  syncEnviar: syncEnviarFluxo,
  syncBaixar: (opts) => syncBaixarFluxo(opts || {}),
  syncAutoHabilitado: autoSyncHabilitado,
  setSyncAuto: setAutoSyncHabilitado,
  syncConfigurado: () => {
    const { gistId, token } = carregarSyncConfig();
    return Boolean(gistId && token);
  },
  statusSync: () => {
    const push = localStorage.getItem(STORAGE_SYNC_LAST_PUSH_AT);
    const pull = localStorage.getItem(STORAGE_SYNC_LAST_PULL_AT);
    return { push, pull, auto: autoSyncHabilitado() };
  },
  gerarPdf: () => gerarRelatorioMensalPdf('completo'),
  _notifyChange: () => {},
  _scheduleSyncPush: agendarSyncPush,
  _syncStatus: () => {}
};

if (!window.__DIARIO_UI_SHELL__) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarApp);
  } else {
    iniciarApp();
  }
}
