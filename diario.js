const STORAGE_KEY = 'diario-financeiro-v1';

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
  'Viajar em família.',
  'Comprar uma casa.',
  'Ter uma vida tranquila e com propósito.'
];

const CITACAO_PADRAO =
  '"Tudo posso naquele que me fortalece." — Filipenses 4:13';

const fmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function estadoPadrao() {
  return {
    dataRef: hojeISO(),
    meta: 'Organizar um salário de R$ 2.500,00 para marido, esposa e duas crianças.',
    objetivo: 'Ter controle, viver em paz e realizar nossos sonhos.',
    receitas: RECEITAS_PADRAO.map((r) => ({ id: uid(), ...r })),
    gastos: GASTOS_PADRAO.map((g) => ({ id: uid(), ...g })),
    semana: Object.fromEntries(
      DIAS_SEMANA.map((d) => [d.key, { receita: 0, gastos: 0 }])
    ),
    anotacoes: ANOTACOES_PADRAO.map((t) => ({ id: uid(), texto: t })),
    sonhos: SONHOS_PADRAO.map((t) => ({ id: uid(), texto: t })),
    citacao: CITACAO_PADRAO
  };
}

function carregar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return estadoPadrao();
    const parsed = JSON.parse(raw);
    return mesclarEstado(parsed);
  } catch {
    return estadoPadrao();
  }
}

function mesclarEstado(parsed) {
  const base = estadoPadrao();
  return {
    ...base,
    ...parsed,
    receitas: Array.isArray(parsed.receitas) && parsed.receitas.length
      ? parsed.receitas
      : base.receitas,
    gastos: Array.isArray(parsed.gastos) && parsed.gastos.length
      ? parsed.gastos
      : base.gastos,
    semana: { ...base.semana, ...(parsed.semana || {}) },
    anotacoes: Array.isArray(parsed.anotacoes) && parsed.anotacoes.length
      ? parsed.anotacoes
      : base.anotacoes,
    sonhos: Array.isArray(parsed.sonhos) && parsed.sonhos.length
      ? parsed.sonhos
      : base.sonhos
  };
}

let estado = carregar();
let saveTimer = null;

function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

function agendarSalvar() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(salvar, 280);
}

function somaItens(itens) {
  return itens.reduce((acc, i) => acc + (Number(i.valor) || 0), 0);
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

const $ = (id) => document.getElementById(id);

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
  const ulR = $('listaReceitas');
  const ulG = $('listaGastos');
  ulR.replaceChildren(...estado.receitas.map((i) => criarLinhaFinanceira(i, 'receitas')));
  ulG.replaceChildren(...estado.gastos.map((i) => criarLinhaFinanceira(i, 'gastos')));
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
  $('listaSonhos').replaceChildren(
    ...estado.sonhos.map((i) => criarLinhaTexto(i, 'sonhos'))
  );
}

function renderSemana() {
  const tbody = $('corpoSemana');
  tbody.replaceChildren();

  let totR = 0;
  let totG = 0;

  for (const dia of DIAS_SEMANA) {
    const dados = estado.semana[dia.key] || { receita: 0, gastos: 0 };
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

    totR += Number(dados.receita) || 0;
    totG += Number(dados.gastos) || 0;
  }

  $('semReceita').textContent = fmt.format(totR);
  $('semGastos').textContent = fmt.format(totG);
  const saldoSem = totR - totG;
  $('semSaldo').textContent = fmt.format(saldoSem);
  $('semSaldo').classList.toggle('neg', saldoSem < 0);

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

  const wrap = $('wrapSaldo');
  wrap.classList.toggle('negativo', saldo < 0);

  const alerta = $('alertaSaldo');
  if (saldo < 0) {
    alerta.hidden = false;
    alerta.textContent = `Atenção: seus gastos fixos ultrapassam a receita em ${fmt.format(Math.abs(saldo))}. Revise categorias ou busque nova receita.`;
  } else if (saldo === 0) {
    alerta.hidden = false;
    alerta.textContent = 'Receita e gastos estão equilibrados — ótimo para começar o controle diário.';
    alerta.style.color = 'var(--destaque)';
  } else {
    alerta.hidden = false;
    alerta.textContent = `Sobra ${fmt.format(saldo)} após os gastos fixos. Considere aumentar a reserva ou investir nos sonhos.`;
    alerta.style.color = 'var(--positivo)';
  }
}

function renderCamposFixos() {
  $('dataRef').value = estado.dataRef || hojeISO();
  $('meta').value = estado.meta || '';
  $('objetivo').value = estado.objetivo || '';
  $('citacaoTexto').value = estado.citacao || '';
}

function render() {
  renderCamposFixos();
  renderLinhasFinanceiras();
  renderSemana();
  renderListasTexto();
  atualizarTotais();
}

function bindEventos() {
  $('dataRef').addEventListener('change', (e) => {
    estado.dataRef = e.target.value;
    agendarSalvar();
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
    estado.sonhos.push({ id: uid(), texto: '' });
    agendarSalvar();
    render();
  });

  $('btnNovoMes').addEventListener('click', () => {
    if (!confirm('Iniciar novo mês? Receitas e gastos voltam ao modelo padrão; metas, sonhos e citação são mantidos.')) return;
    const meta = estado.meta;
    const objetivo = estado.objetivo;
    const anotacoes = estado.anotacoes;
    const sonhos = estado.sonhos;
    const citacao = estado.citacao;
    estado = estadoPadrao();
    estado.meta = meta;
    estado.objetivo = objetivo;
    estado.anotacoes = anotacoes;
    estado.sonhos = sonhos;
    estado.citacao = citacao;
    estado.dataRef = hojeISO();
    salvar();
    render();
    toast('Novo mês iniciado.');
  });

  $('btnExportar').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `diario-financeiro-${estado.dataRef || 'backup'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Backup exportado.');
  });

  $('inputImportar').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      estado = mesclarEstado(JSON.parse(text));
      salvar();
      render();
      toast('Dados importados.');
    } catch {
      toast('Arquivo inválido.');
    }
    e.target.value = '';
  });
}

bindEventos();
render();
