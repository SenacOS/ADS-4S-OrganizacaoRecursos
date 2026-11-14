import { ErroApi } from './api.js';
import { criarConsultaReservas, podeEditarReserva, podeCancelarReserva, exigeJustificativaCancelamento, paraCampoReserva, horarioDaEdicao } from './consulta-reservas.js';
import { recursos, identificarRecurso } from './recursos.js';
import { apresentarData, intervaloDoFormulario, instanteComPrecisao } from './datas.js';
import { iniciarPaginaAutenticada } from './sessao-page.js';
import { criarEnvioUnico } from './forms.js';
import { elemento, mostrarMensagem, mostrarErro } from './ui.js';

/** @param {string} id */
const campo=(id)=>/** @type {HTMLInputElement} */(elemento(id));
/** @param {string} id */
const form=(id)=>/** @type {HTMLFormElement} */(elemento(id));
/** @param {string} id */
const botao=(id)=>/** @type {HTMLButtonElement} */(elemento(id));
/** @template {keyof HTMLElementTagNameMap} T @param {T} tag @param {string} valor @param {string} [classe] */
function texto(tag,valor,classe){const el=document.createElement(tag);el.textContent=valor;if(classe)el.className=classe;return el;}
/** @param {string} area @param {string} mensagem @param {'info'|'success'} [estado] */
const aviso=(area,mensagem,estado='info')=>mostrarMensagem(elemento('feedback-'+area),elemento('referencia-'+area),mensagem,estado);

iniciarPaginaAutenticada('Reservas',(usuario)=>{
  const cliente=criarConsultaReservas(usuario);
  elemento('escopo-reservas').textContent=usuario.papel === 'SOLICITANTE' ? 'Consulte suas reservas e acompanhe cada solicitação.'
    : usuario.papel === 'RESPONSAVEL' ? 'Consulte reservas em que todos os recursos estão sob sua responsabilidade.' : 'Consulte as reservas para acompanhar o uso dos recursos.';
  const controles=/** @type {HTMLFieldSetElement} */(elemento('controles-reservas'));
  const motivoCancelar=/** @type {HTMLTextAreaElement} */(elemento('motivo-cancelar'));
  motivoCancelar.addEventListener('input',()=>{campo('confirmar-cancelar').checked=false;});
  let ocupado=false,incerta=false,alvoId=0,versaoLista=0,versaoRecursos=0;
  /** @type {import('./consulta-reservas.js').PaginaReservas|undefined} */ let pagina;
  /** @type {import('./consulta-reservas.js').FiltrosReservas} */ let consulta={};
  /** @type {import('./consulta-reservas.js').ReservaConsulta|undefined} */ let detalhe;
  /** @type {Map<number,import('./consulta-reservas.js').ResumoRecurso>} */ let selecionados=new Map();
  let horarioInicial='',horarioFinal='';
  /** @type {import('./recursos.js').PaginaRecursos|undefined} */ let paginaRecursos;
  const guards=new Map(['form-busca-reservas','form-edicao-reserva','form-cancelar-reserva','form-recursos-edicao'].map(id=>[id,criarEnvioUnico(form(id))]));

  function ajustar(){
    botao('anterior-reservas').disabled=ocupado||!pagina||pagina.pagina===0;
    botao('seguinte-reservas').disabled=ocupado||!pagina||(pagina.pagina+1)*pagina.tamanho>=pagina.total;
    botao('anterior-edicao').disabled=ocupado||!paginaRecursos||paginaRecursos.pagina===0;
    botao('seguinte-edicao').disabled=ocupado||!paginaRecursos||(paginaRecursos.pagina+1)*paginaRecursos.tamanho>=paginaRecursos.total;
    /** @type {HTMLFieldSetElement} */(elemento('campos-edicao')).disabled=incerta||!detalhe||!podeEditarReserva(detalhe,usuario);
    botao('salvar-reserva').disabled=incerta||selecionados.size===0;
    botao('cancelar-reserva').disabled=incerta||!detalhe||!podeCancelarReserva(detalhe,usuario);
  }
  /** @param {string} area @param {()=>Promise<void>} acao */
  async function executar(area,acao){
    if(ocupado)return;ocupado=true;controles.disabled=true;
    try{await acao();}catch(e){mostrarErro(e,elemento('feedback-'+area),elemento('referencia-'+area));}
    finally{ocupado=false;controles.disabled=false;ajustar();}
  }
  /** @param {string} id @param {string} area @param {()=>Promise<void>} acao */
  function aoEnviar(id,area,acao){form(id).addEventListener('submit',evento=>{
    evento.preventDefault();if(ocupado||!form(id).reportValidity())return;
    void executar(area,async()=>{await guards.get(id)?.(acao);});
  });}
  function fechar(){detalhe=undefined;alvoId=0;incerta=false;selecionados.clear();elemento('detalhe-reserva').hidden=true;elemento('reconsultar-reserva').hidden=true;}
  function invalidarSelecao(){campo('confirmar-edicao').checked=false;campo('confirmar-cancelar').checked=false;}
  function desenharSelecionados(){
    const lista=elemento('selecionados-edicao');lista.replaceChildren();
    for(const r of selecionados.values()){
      const li=texto('li',''),span=texto('span',r.identificacao+(r.patrimonio?' · '+r.patrimonio:'')),remover=texto('button','Remover');
      remover.type='button';remover.className='button button-secondary';remover.setAttribute('aria-label','Remover recurso '+r.id);
      remover.addEventListener('click',()=>{if(ocupado||incerta)return;selecionados.delete(r.id);invalidarSelecao();desenharSelecionados();elemento('resultados-edicao').replaceChildren();ajustar();});
      li.append(span,remover);lista.append(li);
    }
  }
  /** @param {import('./consulta-reservas.js').ReservaConsulta} r */
  function mostrarDetalhe(r){
    detalhe=r;incerta=false;selecionados=new Map(r.recursos.map(rec=>[rec.id,rec]));
    elemento('detalhe-title').textContent='Reserva #'+r.id;
    const dl=elemento('dados-reserva');dl.replaceChildren();
    for(const [titulo,valor]of[['Estado',r.status],['Solicitante',r.solicitante.identificacao],['Início',apresentarData(r.inicio)],['Fim',apresentarData(r.fim)]])dl.append(texto('dt',titulo),texto('dd',valor));
    const lista=elemento('recursos-reserva');lista.replaceChildren();r.recursos.forEach(rec=>lista.append(texto('li',rec.tipo+': '+rec.identificacao+(rec.patrimonio?' · '+rec.patrimonio:''))));
    elemento('motivo-reserva').textContent=r.motivoDecisao?'Motivo da decisão: '+r.motivoDecisao:'';elemento('motivo-reserva').hidden=!r.motivoDecisao;
    const edita=podeEditarReserva(r,usuario),cancela=podeCancelarReserva(r,usuario);
    form('form-edicao-reserva').hidden=!edita;elemento('busca-recursos-edicao').hidden=!edita;form('form-cancelar-reserva').hidden=!cancela;
    elemento('acoes-reserva').textContent=edita?'Confira o período e todos os recursos antes de salvar.':cancela?'Seu usuário pode cancelar esta reserva, mediante confirmação.':'Consulta disponível. Esta reserva não permite edição ou cancelamento pelo seu usuário no estado atual.';
    form('form-edicao-reserva').reset();form('form-cancelar-reserva').reset();form('form-recursos-edicao').reset();
    const justifica=cancela&&exigeJustificativaCancelamento(r,usuario);
    elemento('justificativa-cancelamento').hidden=!justifica;motivoCancelar.required=justifica;motivoCancelar.disabled=!justifica;
    campo('editar-inicio').value=paraCampoReserva(r.inicio);campo('editar-fim').value=paraCampoReserva(r.fim);
    horarioInicial=campo('editar-inicio').value;horarioFinal=campo('editar-fim').value;
    elemento('alvo-cancelamento-reserva').textContent=`Reserva #${r.id}: ${apresentarData(r.inicio)} até ${apresentarData(r.fim)}. ${r.recursos.length} recurso(s).`;
    paginaRecursos=undefined;elemento('resultados-edicao').replaceChildren();elemento('pagina-edicao').textContent='Nenhuma pesquisa';
    elemento('resumo-recursos-edicao').textContent='Pesquise para adicionar recursos ao período informado.';
    desenharSelecionados();elemento('detalhe-reserva').hidden=false;ajustar();
  }
  /** @param {number} id */
  async function carregarDetalhe(id){
    detalhe=undefined;elemento('detalhe-reserva').hidden=true;incerta=true;alvoId=id;elemento('reconsultar-reserva').hidden=false;
    const r=await cliente.detalhe(id);mostrarDetalhe(r);
  }
  /** @param {number} id */
  function abrir(id){void executar('detalhe',async()=>{aviso('detalhe','Consultando reserva…');await carregarDetalhe(id);aviso('detalhe','');elemento('detalhe-reserva').focus();});}
  /** @returns {import('./consulta-reservas.js').FiltrosReservas} */
  function filtros(){return {...intervaloDoFormulario(campo('filtro-inicio').value,campo('filtro-fim').value,false,false),
    status:campo('filtro-status').value||undefined,recursoId:campo('filtro-recurso').value?Number(campo('filtro-recurso').value):undefined,tamanho:Number(campo('filtro-tamanho').value)};}
  /** @param {number} [numero] @param {import('./consulta-reservas.js').FiltrosReservas} [f] */
  async function pesquisar(numero=0,f=filtros()){
    const versao=versaoLista;pagina=undefined;elemento('lista-reservas').replaceChildren();elemento('resumo-reservas').textContent='Consultando reservas…';ajustar();
    try{
      const r=await cliente.listar({...f,pagina:numero});if(versao!==versaoLista)return;pagina=r;consulta=f;
      elemento('resumo-reservas').textContent=r.total?(r.itens.length?`${r.total} reserva(s) encontrada(s)`:`Nenhuma reserva nesta página. Total: ${r.total}.`):'Nenhuma reserva para estes filtros.';
      elemento('pagina-reservas').textContent=`Página ${r.pagina+1} · ${r.total} reserva(s)`;
      for(const res of r.itens){
        const card=texto('article','');card.className='resource-card';const btn=texto('button','Consultar detalhes');btn.type='button';btn.className='button button-secondary';btn.setAttribute('aria-label','Consultar reserva '+res.id);
        btn.addEventListener('click',()=>abrir(res.id));
        card.append(texto('p',res.status,'eyebrow'),texto('h3','Reserva #'+res.id),texto('p',res.solicitante.identificacao),texto('p',apresentarData(res.inicio)+' até '+apresentarData(res.fim)),texto('p',res.recursos.map(rec=>rec.identificacao).join('; ')),btn);
        elemento('lista-reservas').append(card);
      }
      aviso('lista','');
    }catch(e){if(versao===versaoLista){elemento('resumo-reservas').textContent='Consulta não concluída. Tente novamente.';elemento('pagina-reservas').textContent='Consulta não concluída';}throw e;}
  }
  function filtrosAlterados(){versaoLista++;pagina=undefined;elemento('lista-reservas').replaceChildren();elemento('resumo-reservas').textContent='Filtros alterados. Consulte novamente.';ajustar();}
  form('form-busca-reservas').addEventListener('input',filtrosAlterados);
  form('form-busca-reservas').addEventListener('reset',()=>queueMicrotask(filtrosAlterados));
  aoEnviar('form-busca-reservas','lista',()=>pesquisar());
  botao('atualizar-lista').addEventListener('click',()=>{void executar('lista',()=>pesquisar(0));});
  botao('anterior-reservas').addEventListener('click',()=>{const n=pagina?.pagina;if(n!==undefined)void executar('lista',()=>pesquisar(n-1,consulta));});
  botao('seguinte-reservas').addEventListener('click',()=>{const n=pagina?.pagina;if(n!==undefined)void executar('lista',()=>pesquisar(n+1,consulta));});
  botao('reconsultar-reserva').addEventListener('click',()=>{if(alvoId)abrir(alvoId);});
  botao('fechar-reserva').addEventListener('click',()=>{if(!ocupado){fechar();aviso('detalhe','');botao('atualizar-lista').focus();}});

  /** @param {boolean} [exigirSelecao] @returns {import('./reservas.js').DadosReserva} */
  function envioEditor(exigirSelecao=true){
    if(!detalhe||incerta)throw new ErroApi(409,'TENTE_NOVAMENTE','Atualize o detalhe e confira a reserva antes de tentar outra operação.');
    const inicio=horarioDaEdicao(campo('editar-inicio').value,horarioInicial,detalhe.inicio),fim=horarioDaEdicao(campo('editar-fim').value,horarioFinal,detalhe.fim);
    if(paraCampoReserva(inicio).slice(0,10)!==paraCampoReserva(fim).slice(0,10)||instanteComPrecisao(fim)<=instanteComPrecisao(inicio))throw new ErroApi(400,'REQUISICAO_INVALIDA','Use início e fim no mesmo dia, com fim posterior.');
    if(exigirSelecao&&!selecionados.size)throw new ErroApi(400,'REQUISICAO_INVALIDA','Selecione ao menos um recurso.');
    return {inicio,fim,recursosIds:[...selecionados.keys()]};
  }
  /** @param {string} mensagem */
  async function reconciliar(mensagem){
    try{await carregarDetalhe(alvoId);aviso('detalhe',mensagem,'success');elemento('detalhe-reserva').focus();}
    catch(e){aviso('detalhe',mensagem+' Atualize o detalhe para conferir os dados.','success');mostrarErro(e,elemento('feedback-lista'),elemento('referencia-lista'));}
    try{await pesquisar(0,consulta);}catch(e){mostrarErro(e,elemento('feedback-lista'),elemento('referencia-lista'));}
  }
  /** @param {unknown} erro */
  function falhaEscrita(erro){
    if(!(erro instanceof ErroApi)||erro.status!==400){incerta=true;invalidarSelecao();}
    mostrarErro(erro,elemento('feedback-detalhe'),elemento('referencia-detalhe'));
    if(incerta)elemento('feedback-detalhe').append(document.createTextNode(' Atualize o detalhe antes de tentar outra operação.'));
  }
  aoEnviar('form-edicao-reserva','detalhe',async()=>{
    if(!detalhe||incerta||!campo('confirmar-edicao').checked)return;const envio=envioEditor();
    try{await cliente.editar(detalhe,envio);}catch(e){falhaEscrita(e);return;}
    incerta=true;invalidarSelecao();await reconciliar('Alteração confirmada pelo servidor.');
  });
  aoEnviar('form-cancelar-reserva','detalhe',async()=>{
    if(!detalhe||incerta||!campo('confirmar-cancelar').checked)return;
    try{await cliente.cancelar(detalhe,motivoCancelar.disabled?undefined:motivoCancelar.value);}catch(e){falhaEscrita(e);return;}
    incerta=true;invalidarSelecao();await reconciliar('Cancelamento confirmado pelo servidor.');
  });
  function invalidarRecursos(){versaoRecursos++;invalidarSelecao();paginaRecursos=undefined;elemento('resultados-edicao').replaceChildren();elemento('resumo-recursos-edicao').textContent='Consulte novamente os recursos para o período e filtros atuais.';ajustar();}
  form('form-edicao-reserva').addEventListener('input',evento=>{if(evento.target===campo('editar-inicio')||evento.target===campo('editar-fim'))invalidarRecursos();});
  form('form-recursos-edicao').addEventListener('input',invalidarRecursos);
  /** @param {number} [numero] */
  async function pesquisarRecursos(numero=0){
    const p=envioEditor(false),versao=versaoRecursos;
    const r=await recursos.pesquisar({inicio:p.inicio,fim:p.fim,tipo:campo('edicao-tipo').value,patrimonio:campo('edicao-patrimonio').value,pagina:numero,tamanho:20});
    if(versao!==versaoRecursos)return;
    paginaRecursos=r;elemento('resultados-edicao').replaceChildren();
    elemento('resumo-recursos-edicao').textContent=r.total?`${r.total} recurso(s) encontrado(s)`:'Nenhum recurso encontrado.';
    elemento('pagina-edicao').textContent='Página '+(r.pagina+1);
    for(const rec of r.itens){
      const card=texto('article','');card.className='resource-card';card.append(texto('h4',identificarRecurso(rec)));
      const original=!!detalhe?.recursosIds.includes(rec.id),mudaAprovacao=!detalhe?.restrita&&rec.dados.restrito;
      const permitido=original||(rec.dados.ativo&&rec.disponivel===true&&!mudaAprovacao);
      card.append(texto('p',original?'Recurso atual; disponibilidade revalidada ao salvar.':mudaAprovacao?'Este recurso exige aprovação. Para mudar essa condição, cancele e faça uma nova solicitação.':rec.disponivel===true&&rec.dados.ativo?'Disponível para seleção.':'Indisponível para adicionar.'));
      const escolha=document.createElement('input');escolha.type='checkbox';escolha.checked=selecionados.has(rec.id);escolha.disabled=!permitido;
      escolha.setAttribute('aria-label','Selecionar recurso '+rec.id);const label=texto('label','');label.className='resource-choice';label.append(escolha,document.createTextNode('Selecionar'));
      escolha.addEventListener('change',()=>{
        if(ocupado||incerta)return;if(escolha.checked)selecionados.set(rec.id,{id:rec.id,tipo:rec.dados.tipo,identificacao:identificarRecurso(rec),...(rec.dados.patrimonio?{patrimonio:rec.dados.patrimonio}:{})});else selecionados.delete(rec.id);
        invalidarSelecao();desenharSelecionados();ajustar();
      });card.append(label);elemento('resultados-edicao').append(card);
    }aviso('recursos','');
  }
  aoEnviar('form-recursos-edicao','recursos',()=>pesquisarRecursos());
  botao('anterior-edicao').addEventListener('click',()=>{const n=paginaRecursos?.pagina;if(n!==undefined)void executar('recursos',()=>pesquisarRecursos(n-1));});
  botao('seguinte-edicao').addEventListener('click',()=>{const n=paginaRecursos?.pagina;if(n!==undefined)void executar('recursos',()=>pesquisarRecursos(n+1));});
  window.addEventListener('pagehide',()=>{versaoLista++;fechar();});
  void executar('lista',()=>pesquisar());
});
