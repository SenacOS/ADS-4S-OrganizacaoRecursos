import test from 'node:test';
import assert from 'node:assert/strict';
import { criarApi, ErroApi } from '../../../backend/src/main/resources/static/js/api.js';
import { criarAdministracao, dadosCadastro, dadosExpediente } from '../../../backend/src/main/resources/static/js/administracao-recursos.js';

const sala = { tipo: 'SALA', codigo: 'SALA-01', ativo: true, restrito: false, capacidade: 20, localizacao: 'Bloco A', tipoSala: 'Laboratório' };
const professor = { tipo: 'PROFESSOR', codigo: 'DOC-01', ativo: true, restrito: true, nome: 'Ana', competencias: [] };
const material = { tipo: 'MATERIAL', codigo: 'MAT-01', ativo: true, restrito: false, patrimonio: 'PAT-01', descricao: 'Projetor', condicao: 'Em avaliação' };
const janela = { dia: 'MONDAY', inicio: '07:00:00.123456789', fim: '12:00:00' };
const intervalo = { inicio: '2026-11-11T13:00:00-03:00', fim: '2026-11-13T14:00:00-03:00', motivo: 'Manutenção' };
const bloqueio = { id: 11, recurso_id: 7, inicio_utc: intervalo.inicio, fim_utc: intervalo.fim, motivo: intervalo.motivo, status: 'ATIVO' };
function cliente(resposta) {
  const chamadas = [];
  return { chamadas, admin: criarAdministracao({ limparCsrf() {}, async requisitar(url, opcoes) { chamadas.push({ url, ...opcoes }); return resposta; } }) };
}

for (const dados of [sala, professor, material]) {
  test('cadastro ' + dados.tipo + ' usa somente campos de domínio e aceita seu retorno', async () => {
    const { admin, chamadas } = cliente({ id: 7, dados, disponivel: null });
    await admin.salvar({ ...dados, usuarioId: 999, papel: 'ADMINISTRADOR', id: 99, dados: {}, nome: dados.nome, capacidade: dados.capacidade, descricao: dados.descricao });
    assert.deepEqual(chamadas, [{ url: '/api/recursos', method: 'POST', body: dados }]);
  });
}
test('PUT preserva cadastro completo e tipo imutável; normalização de competências é permitida', async () => {
  const dados = { ...professor, competencias: ['java', 'banco de dados'] };
  const { admin, chamadas } = cliente({ id: 7, dados, disponivel: null });
  await admin.salvar({ ...professor, competencias: ['Java', 'Banco de Dados', 'Java'] }, { id: 7, dados: professor, disponivel: null });
  assert.equal(chamadas[0].method, 'PUT'); assert.equal(chamadas[0].url, '/api/recursos/7');
  assert.equal(chamadas[0].body.restrito, true);
  await assert.rejects(admin.salvar(sala, { id: 7, dados: professor, disponivel: null }), /tipo/);
  assert.equal(chamadas.length, 1);
});
test('confirma competências reordenadas sem confundir textos Unicode distintos', async () => {
  const entrada = { ...professor, competencias: ['Ética', 'e\u0301tica', 'Tecnologia 10', 'Tecnologia 2'] };
  const dados = { ...professor, competencias: ['tecnologia 2', 'ética', 'tecnologia 10', 'e\u0301tica'] };
  const { admin, chamadas } = cliente({ id: 7, dados, disponivel: null });
  assert.deepEqual((await admin.salvar(entrada)).dados.competencias, dados.competencias);
  assert.deepEqual(chamadas[0].body.competencias, entrada.competencias);
  const incompleto = { ...dados, competencias: ['tecnologia 2', 'ética', 'tecnologia 10'] };
  await assert.rejects(cliente({ id: 7, dados: incompleto, disponivel: null }).admin.salvar(entrada), { codigo: 'RESPOSTA_INVALIDA' });
});
test('validação recusa campos inválidos antes do HTTP, sem impor enum de condição ou competências obrigatórias', async () => {
  const { admin, chamadas } = cliente(null);
  for (const dados of [{ ...sala, capacidade: 0 }, { ...sala, capacidade: 1.5 }, { ...sala, tipoSala: '' },
    { ...sala, codigo: 'x'.repeat(81) }, { ...professor, competencias: ['x'.repeat(121)] },
    { ...professor, competencias: null }, { ...material, condicao: '' }, { ...sala, ativo: 'true' }]) {
    await assert.rejects(admin.salvar(dados), { codigo: 'REQUISICAO_INVALIDA' });
  }
  assert.equal(chamadas.length, 0);
  assert.deepEqual(dadosCadastro(professor).competencias, []);
  assert.equal(dadosCadastro(material).condicao, 'Em avaliação');
});
test('detalhe e retornos de escrita exigem identidade, subtipo e conteúdo coerentes', async () => {
  for (const resposta of [{ id: 8, dados: sala, disponivel: null }, { id: 7, dados: { ...sala, capacidade: 0 }, disponivel: null }, null]) {
    const { admin, chamadas } = cliente(resposta);
    await assert.rejects(admin.obter(7), { codigo: 'RESPOSTA_INVALIDA' }); assert.equal(chamadas.length, 1);
  }
  const { admin } = cliente({ id: 7, dados: { ...sala, ativo: false }, disponivel: null });
  await assert.rejects(admin.salvar(sala), { codigo: 'RESPOSTA_INVALIDA' });
});
test('desativação aceita somente o retorno sem corpo e valida ID sem HTTP', async () => {
  const { admin, chamadas } = cliente(null); await admin.desativar(7);
  assert.deepEqual(chamadas, [{ url: '/api/recursos/7', method: 'DELETE' }]);
  await assert.rejects(admin.desativar(0), { codigo: 'REQUISICAO_INVALIDA' });
  await assert.rejects(cliente({}).admin.desativar(7), { codigo: 'RESPOSTA_INVALIDA' });
});
test('bloqueio aceita intervalo multidia e projeta retorno snake_case sem metadados privados', async () => {
  const { admin, chamadas } = cliente({ ...bloqueio, autor_id: 9 });
  assert.deepEqual(await admin.bloquear(7, { ...intervalo, usuarioId: 999 }), bloqueio);
  assert.deepEqual(chamadas, [{ url: '/api/recursos/7/bloqueios', method: 'POST', body: intervalo }]);
});
test('bloqueios rejeitam offset ausente, fim inválido, motivo vazio e retorno de outro recurso', async () => {
  const { admin, chamadas } = cliente(bloqueio);
  for (const dados of [{ ...intervalo, inicio: '2026-11-11T13:00' }, { ...intervalo, fim: intervalo.inicio }, { ...intervalo, motivo: ' ' }]) {
    await assert.rejects(admin.bloquear(7, dados), { codigo: 'REQUISICAO_INVALIDA' });
  }
  assert.equal(chamadas.length, 0);
  await assert.rejects(cliente([bloqueio]).admin.bloqueios(8), { codigo: 'RESPOSTA_INVALIDA' });
  await assert.rejects(cliente([bloqueio, bloqueio]).admin.bloqueios(7), { codigo: 'RESPOSTA_INVALIDA' });
});
test('cancelamento exige resposta CANCELADO do mesmo bloqueio/recurso', async () => {
  const { admin, chamadas } = cliente({ ...bloqueio, status: 'CANCELADO' });
  assert.equal((await admin.cancelarBloqueio(11, 7)).status, 'CANCELADO');
  assert.deepEqual(chamadas, [{ url: '/api/bloqueios/11/cancelamento', method: 'POST' }]);
  await assert.rejects(cliente(bloqueio).admin.cancelarBloqueio(11, 7), { codigo: 'RESPOSTA_INVALIDA' });
});
test('expediente preserva frações, todas as janelas e aceita adjacência e lista vazia', async () => {
  const janelas = [janela, { dia: 'MONDAY', inicio: '12:00', fim: '17:30' }, { dia: 'FRIDAY', inicio: '08:00', fim: '18:00' }];
  const { admin, chamadas } = cliente({ zona: 'America/Sao_Paulo', janelas });
  assert.deepEqual(await admin.salvarExpediente(janelas), { zona: 'America/Sao_Paulo', janelas });
  assert.deepEqual(chamadas[0].body, { janelas });
  assert.deepEqual(dadosExpediente([]), { janelas: [] });
});
test('confirma expediente retornado em outra ordem e rejeita horário diferente', async () => {
  const janelas = [janela, { dia: 'MONDAY', inicio: '12:00', fim: '17:30' }, { dia: 'FRIDAY', inicio: '08:00', fim: '18:00' }];
  const retorno = [...janelas].reverse();
  const { admin, chamadas } = cliente({ zona: 'America/Sao_Paulo', janelas: retorno });
  assert.deepEqual(await admin.salvarExpediente(janelas), { zona: 'America/Sao_Paulo', janelas: retorno });
  assert.deepEqual(chamadas[0].body, { janelas });
  const diferente = retorno.map((j) => j.dia === 'FRIDAY' ? { ...j, fim: '17:00' } : j);
  await assert.rejects(cliente({ zona: 'America/Sao_Paulo', janelas: diferente }).admin.salvarExpediente(janelas), { codigo: 'RESPOSTA_INVALIDA' });
});
test('expediente recusa sobreposição, janela invertida, 24h e dias não contratados antes do HTTP', async () => {
  const { admin, chamadas } = cliente(null);
  for (const janelas of [[janela, janela], [{ ...janela, fim: '07:00' }], [{ ...janela, dia: 'SEGUNDA' }], [{ ...janela, fim: '24:00' }]]) {
    await assert.rejects(admin.salvarExpediente(janelas), { codigo: 'REQUISICAO_INVALIDA' });
  }
  assert.equal(chamadas.length, 0);
  await assert.rejects(cliente({ zona: 'America/Sao_Paulo', janelas: [] }).admin.salvarExpediente([janela]), { codigo: 'RESPOSTA_INVALIDA' });
});
test('escritas administrativas compartilham sessão e CSRF, sem retry após 409', async () => {
  const chamadas = [];
  const admin = criarAdministracao(criarApi({ aoExpirarSessao() {}, fetchImpl: async (url, opcoes) => {
    chamadas.push({ url, ...opcoes });
    if (url === '/api/auth/csrf') return Response.json({ header: 'X-CSRF-TESTE', token: 'token' });
    return Response.json({ codigo: 'RECURSO_INDISPONIVEL', mensagem: 'Possui compromisso.', correlationId: 'admin-ref' }, { status: 409 });
  } }));
  await assert.rejects(admin.desativar(7), (e) => e instanceof ErroApi && e.status === 409 && e.correlationId === 'admin-ref');
  assert.equal(chamadas.length, 2); assert.equal(chamadas[1].credentials, 'same-origin');
  assert.equal(chamadas[1].headers.get('X-CSRF-TESTE'), 'token');
});
