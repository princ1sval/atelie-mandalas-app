/* ==========================================================================
   SITE — catálogo, detalhe, encomenda, dúvidas e animações de rolagem.
   Mesmas regras do app (MandalaService, EncomendaService, FaqService),
   em JS puro. Os dados vêm de js/dados.js (window.ATELIE).
   ========================================================================== */
(() => {
  'use strict';

  const D = window.ATELIE;
  if (!D) return;

  const html = document.documentElement;
  const $ = (s, raiz = document) => raiz.querySelector(s);
  const $$ = (s, raiz = document) => [...raiz.querySelectorAll(s)];
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
  const animar = () => !reduzir.matches && 'animate' in Element.prototype;
  const css = getComputedStyle(html);
  const token = (nome) => css.getPropertyValue(nome).trim();
  const EASE = { entrada: 'cubic-bezier(0.16, 1, 0.3, 1)', meio: 'cubic-bezier(0.65, 0, 0.35, 1)', pouso: 'cubic-bezier(0.34, 1.56, 0.64, 1)' };

  /* ---------- Utilidades (as mesmas do app: utils/texto e utils/formatters) */
  // "Céu Azul" -> "ceu azul": busca sem acento e sem maiúscula
  const normalizar = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const moedaInteira = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const faixaPreco = (min, max) => `${moedaInteira.format(min)} a ${moedaInteira.format(max)}`;
  const linkWhats = (mensagem) => `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(mensagem)}`;
  const imagem = (nome, lado) => `assets/img/mandalas/${nome}-${lado}.webp`;
  const porId = new Map(D.mandalas.map((m) => [m.id, m]));
  const descreverOrigem = (m) => (m.origem === 'prontaEntrega' ? 'Pronta entrega' : `Encomenda · ${D.temas[m.tema]}`);

  /* ---------- Detalhes pequenos ------------------------------------------- */
  const ano = $('[data-ano]');
  if (ano) ano.textContent = String(new Date().getFullYear());
  const logo = $('[data-abertura-logo]');
  $$('[data-copia-logo]').forEach((svg) => { if (logo) svg.innerHTML = logo.innerHTML; });

  /* ==========================================================================
     CATÁLOGO
     ========================================================================== */
  function criarCartao(m) {
    const li = document.createElement('li');
    li.className = 'cartao-mandala';
    li.dataset.id = m.id;
    li.dataset.revela = '';
    li.dataset.busca = normalizar([m.nome, ...m.cores].join(' '));
    const info = m.origem === 'prontaEntrega'
      ? `${m.tamanhoCm} cm · <strong>${moeda.format(m.preco)}</strong>`
      : `${m.tamanhoCm} cm · ${m.subtitulo}`;
    li.innerHTML = `
      <button class="cartao-mandala__botao" type="button" aria-haspopup="dialog">
        <span class="cartao-mandala__imagem">
          <img src="${imagem(m.imagem, 400)}" srcset="${imagem(m.imagem, 400)} 400w, ${imagem(m.imagem, 800)} 800w"
               sizes="(min-width: 1240px) 340px, (min-width: 760px) 28vw, 42vw"
               width="400" height="400" alt="" loading="lazy" decoding="async">
        </span>
        ${m.origem === 'encomenda' ? `<span class="cartao-mandala__origem">${D.temas[m.tema]}</span>` : ''}
        <span class="cartao-mandala__nome">${m.nome}</span>
        <span class="cartao-mandala__info">${info}</span>
      </button>`;
    $('button', li).addEventListener('click', () => abrirDetalhe(m.id, li));
    return li;
  }

  const grades = {};
  $$('[data-grade]').forEach((ul) => {
    const origem = ul.dataset.grade;
    D.mandalas.filter((m) => m.origem === origem).forEach((m) => ul.append(criarCartao(m)));
    grades[origem] = ul;
  });

  // FLIP: os cartões que ficam deslizam até o lugar novo; os que voltam, surgem
  function animarGrade(ul, mudar) {
    const itens = [...ul.children];
    const antes = new Map(itens.map((li) => [li, li.hidden ? null : li.getBoundingClientRect()]));
    mudar();
    if (!animar()) return;
    itens.forEach((li) => {
      if (li.hidden) return;
      const a = antes.get(li);
      const d = li.getBoundingClientRect();
      if (!a) {
        li.animate([{ opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1 }], { duration: 420, easing: EASE.entrada });
        return;
      }
      const dx = a.left - d.left, dy = a.top - d.top;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        li.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: 520, easing: EASE.meio });
      }
    });
  }

  function mostrarVazio(origem, vazio) {
    const aviso = $(`[data-vazio="${origem}"]`);
    if (aviso) aviso.hidden = !vazio;
  }

  // Pronta entrega: busca por nome ou cor (MandalaService.filtrarPorBusca)
  const buscaPronta = $('[data-busca-pronta]');
  if (buscaPronta && grades.prontaEntrega) {
    buscaPronta.addEventListener('input', () => {
      const termo = normalizar(buscaPronta.value);
      let algum = false;
      animarGrade(grades.prontaEntrega, () => {
        [...grades.prontaEntrega.children].forEach((li) => {
          li.hidden = termo !== '' && !li.dataset.busca.includes(termo);
          if (!li.hidden) { algum = true; li.classList.add('revelado'); }
        });
      });
      mostrarVazio('prontaEntrega', !algum);
    });
  }

  // "Me surpreenda": o chacoalhar do app vira um botão. Não repete a última sorteada.
  let ultimaSorteada = '';
  const botaoSortear = $('[data-sortear]');
  if (botaoSortear && grades.prontaEntrega) {
    botaoSortear.addEventListener('click', () => {
      const visiveis = [...grades.prontaEntrega.children].filter((li) => !li.hidden);
      const opcoes = visiveis.length > 1 ? visiveis.filter((li) => li.dataset.id !== ultimaSorteada) : visiveis;
      if (!opcoes.length) return;
      const li = opcoes[Math.floor(Math.random() * opcoes.length)];
      ultimaSorteada = li.dataset.id;
      li.classList.add('revelado');
      li.scrollIntoView({ block: 'center', behavior: animar() ? 'smooth' : 'auto' });
      li.classList.remove('cartao-mandala--sorteada');
      void li.offsetWidth; // reinicia a animação do brilho
      li.classList.add('cartao-mandala--sorteada');
      setTimeout(() => abrirDetalhe(li.dataset.id, li), animar() ? 650 : 0);
    });
  }

  // Portfólio: filtro por tema (MandalaService.opcoesDeFiltro + filtrarPorTema)
  const filtros = $('[data-filtros]');
  if (filtros && grades.encomenda) {
    const opcoes = [['todos', 'Todos'], ...Object.entries(D.temas)];
    opcoes.forEach(([valor, rotulo]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = rotulo;
      b.dataset.tema = valor;
      b.setAttribute('aria-pressed', String(valor === 'todos'));
      filtros.append(b);
    });
    filtros.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-tema]');
      if (!b || b.getAttribute('aria-pressed') === 'true') return;
      $$('[data-tema]', filtros).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      let algum = false;
      animarGrade(grades.encomenda, () => {
        [...grades.encomenda.children].forEach((li) => {
          const m = porId.get(li.dataset.id);
          li.hidden = b.dataset.tema !== 'todos' && m.tema !== b.dataset.tema;
          if (!li.hidden) { algum = true; li.classList.add('revelado'); }
        });
      });
      mostrarVazio('encomenda', !algum);
    });
  }

  /* ==========================================================================
     DETALHE DA MANDALA — <dialog>, com a imagem voando do cartão até a janela
     ========================================================================== */
  const dialogo = $('[data-detalhe]');
  const caixa = dialogo && $('.detalhe__caixa', dialogo);
  const campo = (nome) => $(`[data-detalhe-${nome}]`, dialogo);
  let cartaoAberto = null;
  let mandalaAberta = null;
  let fechando = false;

  // Regra do Detalhe (MandalaService.obterAcaoDetalhe)
  function acaoDetalhe(m) {
    if (m.origem === 'prontaEntrega') {
      return {
        rotulo: 'Tenho interesse',
        ajuda: 'Abre uma conversa com o ateliê no WhatsApp.',
        href: linkWhats(`Olá, Malu! Vi a mandala "${m.nome}" no site e tenho interesse. Ela ainda está disponível?`),
        externo: true,
      };
    }
    return {
      rotulo: 'Quero uma assim',
      ajuda: `Leva ao pedido com o tema ${D.temas[m.tema]} já escolhido.`,
      href: '#encomenda',
      externo: false,
    };
  }

  // Uma cópia da imagem voa entre dois retângulos (fica dentro do <dialog>, que está na camada de cima)
  function voar(src, de, para, duracao) {
    const voo = document.createElement('img');
    voo.src = src;
    voo.alt = '';
    voo.style.cssText = `position:fixed;left:${para.left}px;top:${para.top}px;width:${para.width}px;height:${para.height}px;`
      + 'border-radius:50%;z-index:5;pointer-events:none;transform-origin:0 0;';
    dialogo.append(voo);
    const s = de.width / para.width;
    const a = voo.animate([
      { transform: `translate(${de.left - para.left}px, ${de.top - para.top}px) scale(${s})` },
      { transform: 'none' },
    ], { duration: duracao, easing: EASE.meio, fill: 'both' });
    return a.finished.then(() => voo.remove(), () => voo.remove());
  }

  const naTela = (r) => r.width > 0 && r.bottom > 0 && r.top < innerHeight;

  function abrirDetalhe(id, li) {
    const m = porId.get(id);
    if (!m || !dialogo || dialogo.open) return;
    mandalaAberta = m;
    cartaoAberto = li || null;

    const img = campo('img');
    img.src = imagem(m.imagem, 800);
    img.alt = m.descricaoImagem;
    campo('origem').textContent = descreverOrigem(m);
    campo('nome').textContent = m.nome;
    campo('subtitulo').textContent = m.subtitulo;
    campo('descricao').textContent = m.descricao;
    campo('tecnica').textContent = m.tecnica;
    campo('base').textContent = m.base;
    campo('tamanho').textContent = `${m.tamanhoCm} cm de diâmetro`;
    campo('preco-linha').hidden = m.origem !== 'prontaEntrega';
    campo('preco').textContent = m.preco ? moeda.format(m.preco) : '';
    const acao = acaoDetalhe(m);
    const botao = campo('acao');
    botao.textContent = acao.rotulo;
    botao.href = acao.href;
    if (acao.externo) { botao.target = '_blank'; botao.rel = 'noopener'; } else { botao.removeAttribute('target'); botao.removeAttribute('rel'); }
    campo('ajuda').textContent = acao.ajuda;
    $('[data-compartilhar-texto]', dialogo).textContent = 'Compartilhar';

    html.classList.add('travado');
    dialogo.showModal();
    caixa.scrollTop = 0;

    if (!animar()) return;
    caixa.animate([{ opacity: 0, transform: 'translateY(18px) scale(0.98)' }, { opacity: 1, transform: 'none' }],
      { duration: 460, easing: EASE.entrada });
    const origemImg = li && $('img', li);
    const de = origemImg && origemImg.getBoundingClientRect();
    if (de && naTela(de)) {
      const para = img.getBoundingClientRect();
      img.style.visibility = 'hidden';
      voar(origemImg.currentSrc || origemImg.src, de, para, 560).then(() => { img.style.visibility = ''; });
    }
  }

  function fecharDetalhe(depois) {
    if (!dialogo || !dialogo.open || fechando) return;
    const terminar = () => {
      fechando = false;
      dialogo.close();
      html.classList.remove('travado');
      campo('img').style.visibility = '';
      if (typeof depois === 'function') depois();
      else if (cartaoAberto) $('button', cartaoAberto).focus({ preventScroll: true }); // teclado volta ao cartão
    };
    if (!animar()) return terminar();
    fechando = true;
    // volta: a imagem encolhe da janela até o cartão (se o cartão estiver na tela)
    const img = campo('img');
    const destino = cartaoAberto && $('img', cartaoAberto);
    const para = destino && destino.getBoundingClientRect();
    const DUR = 440;
    if (para && naTela(para) && typeof depois !== 'function') {
      const de = img.getBoundingClientRect();
      img.style.visibility = 'hidden';
      voar(img.currentSrc || img.src, de, para, DUR);
    }
    caixa.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(12px) scale(0.98)' }],
      { duration: 260, easing: EASE.entrada, fill: 'forwards' });
    dialogo.classList.add('detalhe--saindo'); // o fundo escurecido some (transição no CSS)
    setTimeout(() => {
      dialogo.classList.remove('detalhe--saindo');
      caixa.getAnimations().forEach((a) => a.cancel());
      terminar();
    }, DUR);
  }

  if (dialogo) {
    $('[data-fechar]', dialogo).addEventListener('click', () => fecharDetalhe());
    dialogo.addEventListener('cancel', (ev) => { ev.preventDefault(); fecharDetalhe(); }); // Esc
    dialogo.addEventListener('click', (ev) => { if (ev.target === dialogo) fecharDetalhe(); }); // clique fora
    dialogo.addEventListener('close', () => html.classList.remove('travado'));

    campo('acao').addEventListener('click', (ev) => {
      const m = mandalaAberta;
      if (!m || m.origem !== 'encomenda') return; // "Tenho interesse" segue para o WhatsApp
      ev.preventDefault();
      fecharDetalhe(() => {
        encomenda.inspirarEm(m);
        const alvo = $('#encomenda');
        alvo.scrollIntoView({ behavior: animar() ? 'smooth' : 'auto' });
        setTimeout(() => $('#enc-nome').focus({ preventScroll: true }), animar() ? 700 : 0);
      });
    });

    // Compartilhar (Share do app): menu nativo do celular, ou copia o link
    $('[data-compartilhar]', dialogo).addEventListener('click', async () => {
      const m = mandalaAberta;
      if (!m) return;
      const secao = m.origem === 'prontaEntrega' ? 'pronta-entrega' : 'portfolio';
      const url = `${location.origin}${location.pathname}#${secao}`;
      const texto = `Olha que linda a mandala "${m.nome}" da ${D.nome}!`;
      const rotulo = $('[data-compartilhar-texto]', dialogo);
      try {
        if (navigator.share) { await navigator.share({ title: m.nome, text: texto, url }); return; }
        await navigator.clipboard.writeText(`${texto} ${url}`);
        rotulo.textContent = 'Link copiado!';
      } catch (e) {
        if (e && e.name === 'AbortError') return; // a pessoa fechou o menu de compartilhar
        rotulo.textContent = 'Não deu para copiar';
      }
      setTimeout(() => { rotulo.textContent = 'Compartilhar'; }, 2200);
    });
  }

  /* ==========================================================================
     ENCOMENDA — formulário com estimativa ao vivo (EncomendaService)
     ========================================================================== */
  const encomenda = (() => {
    const form = $('[data-form-encomenda]');
    const vazio = { inspirarEm() {} };
    if (!form) return vazio;

    const campoTema = $('[data-temas-form]', form);
    Object.entries(D.temas).forEach(([valor, rotulo]) => {
      campoTema.insertAdjacentHTML('beforeend',
        `<label class="chip"><input type="radio" name="tema" value="${valor}">${rotulo}</label>`);
    });
    const campoTamanho = $('[data-tamanhos-form]', form);
    Object.keys(D.tabelaEncomenda).forEach((tam) => {
      campoTamanho.insertAdjacentHTML('beforeend',
        `<label class="chip"><input type="radio" name="tamanho" value="${tam}"${tam === '30' ? ' checked' : ''}>${tam} cm</label>`);
    });

    const nome = form.elements.nome;
    const ideia = form.elements.ideia;
    const cores = form.elements.cores;
    const presente = form.elements.presente;
    const contador = $('[data-contador-ideia]', form);
    const precoEl = $('[data-estimativa-preco]', form);
    const prazoEl = $('[data-estimativa-prazo]', form);
    const resumo = $('[data-resumo]', form);
    const avisoEnviado = $('[data-enviado]', form);
    const insp = { caixa: $('[data-inspiracao]', form), img: $('[data-inspiracao-img]', form), nome: $('[data-inspiracao-nome]', form) };
    let inspiracao = null;
    let tentouEnviar = false;

    const ler = () => ({
      nome: nome.value.trim(),
      tema: (form.elements.tema.value || null),
      tamanhoCm: Number(form.elements.tamanho.value || 30),
      cores: cores.value.trim(),
      ideia: ideia.value.trim(),
      presente: presente.checked,
      inspiracao,
    });

    // EncomendaService.estimar
    function estimar(p) {
      const t = D.tabelaEncomenda[p.tamanhoCm];
      const extra = p.presente ? D.adicionalPresente : 0;
      return { precoMinimo: t.precoMinimo + extra, precoMaximo: t.precoMaximo + extra, prazoDias: t.prazoDias };
    }

    // EncomendaService.validar (sem o WhatsApp: a pessoa já manda do próprio número)
    function validar(p) {
      const erros = {};
      if (p.nome.length < 2) erros.nome = 'Informe seu nome.';
      if (!p.tema) erros.tema = 'Escolha um tema.';
      if (p.ideia.length < 10) erros.ideia = 'Conte um pouco mais sobre a sua ideia.';
      else if (p.ideia.length > D.limiteIdeia) erros.ideia = `Use no máximo ${D.limiteIdeia} caracteres.`;
      return erros;
    }

    function mostrarErros(erros) {
      [['nome', nome], ['tema', null], ['ideia', ideia]].forEach(([chave, entrada]) => {
        const p = $(`#enc-${chave}-erro`);
        const msg = erros[chave];
        if (entrada) entrada.setAttribute('aria-invalid', String(Boolean(msg)));
        if (msg && (p.hidden || p.textContent !== msg)) { p.textContent = msg; p.hidden = false; }
        if (!msg) { p.hidden = true; p.textContent = ''; }
      });
    }

    const trocarTexto = (el, texto) => {
      if (el.textContent === texto) return;
      el.textContent = texto;
      el.classList.remove('mudou');
      void el.offsetWidth;
      el.classList.add('mudou');
    };

    function atualizar() {
      const p = ler();
      const e = estimar(p);
      trocarTexto(precoEl, faixaPreco(e.precoMinimo, e.precoMaximo));
      trocarTexto(prazoEl, `pronta em cerca de ${e.prazoDias} dias`);
      const linhas = [
        ['Tema', p.tema ? D.temas[p.tema] : '—'],
        ['Tamanho', `${p.tamanhoCm} cm`],
        ['Presente', p.presente ? 'sim, com cartão' : 'não'],
      ];
      if (p.inspiracao) linhas.push(['Inspiração', p.inspiracao.nome]);
      resumo.innerHTML = '';
      linhas.forEach(([a, b]) => {
        const li = document.createElement('li');
        const s1 = document.createElement('span'); s1.textContent = a;
        const s2 = document.createElement('span'); s2.textContent = b;
        li.append(s1, s2);
        resumo.append(li);
      });
      contador.textContent = `${ideia.value.length}/${D.limiteIdeia}`;
      if (tentouEnviar) mostrarErros(validar(p));
    }

    function mensagem(p, e) {
      const linhas = [
        'Olá, Malu! Quero encomendar uma mandala.',
        '',
        `• Nome: ${p.nome}`,
        `• Tema: ${D.temas[p.tema]}`,
        `• Tamanho: ${p.tamanhoCm} cm`,
      ];
      if (p.cores) linhas.push(`• Cores: ${p.cores}`);
      linhas.push(`• Para presente: ${p.presente ? 'sim' : 'não'}`);
      if (p.inspiracao) linhas.push(`• Inspiração: ${p.inspiracao.nome} (portfólio)`);
      linhas.push(`• Ideia: ${p.ideia}`, '', `Estimativa que vi no site: ${faixaPreco(e.precoMinimo, e.precoMaximo)}, cerca de ${e.prazoDias} dias.`);
      return linhas.join('\n');
    }

    form.addEventListener('input', atualizar);
    form.addEventListener('change', atualizar);

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      tentouEnviar = true;
      const p = ler();
      const erros = validar(p);
      mostrarErros(erros);
      if (Object.keys(erros).length) {
        const primeiro = erros.nome ? nome : erros.tema ? $('input[name="tema"]', form) : ideia;
        primeiro.focus();
        avisoEnviado.hidden = true;
        return;
      }
      const link = linkWhats(mensagem(p, estimar(p)));
      window.open(link, '_blank', 'noopener');
      avisoEnviado.innerHTML = '';
      avisoEnviado.append('Abrimos o WhatsApp com o seu pedido. Não abriu? ');
      const a = document.createElement('a');
      a.href = link; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Toque aqui';
      avisoEnviado.append(a, '.');
      avisoEnviado.hidden = false;
    });

    function inspirarEm(m) {
      inspiracao = m;
      const radio = $(`input[name="tema"][value="${m.tema}"]`, form);
      if (radio) radio.checked = true;
      insp.img.src = imagem(m.imagem, 400);
      insp.nome.textContent = m.nome;
      insp.caixa.hidden = false;
      // a inspiração é uma referência; o tamanho é escolhido pela pessoa (só sugere o mais próximo)
      const tamanhos = Object.keys(D.tabelaEncomenda).map(Number);
      const perto = tamanhos.reduce((a, b) => (Math.abs(b - m.tamanhoCm) < Math.abs(a - m.tamanhoCm) ? b : a));
      const radioTam = $(`input[name="tamanho"][value="${perto}"]`, form);
      if (radioTam) radioTam.checked = true;
      atualizar();
    }
    $('[data-inspiracao-tirar]', form).addEventListener('click', () => {
      inspiracao = null;
      insp.caixa.hidden = true;
      atualizar();
      nome.focus();
    });

    atualizar();
    return { inspirarEm };
  })();

  /* ==========================================================================
     DÚVIDAS — busca (FaqService.montarSecoes: filtra e esconde grupos vazios)
     ========================================================================== */
  const buscaFaq = $('[data-busca-faq]');
  if (buscaFaq) {
    const grupos = $$('.faq__grupo');
    const vazio = $('[data-faq-vazio]');
    buscaFaq.addEventListener('input', () => {
      const termo = normalizar(buscaFaq.value);
      let total = 0;
      grupos.forEach((g) => {
        let noGrupo = 0;
        $$('details', g).forEach((d) => {
          const bate = termo === '' || normalizar(d.textContent).includes(termo);
          d.hidden = !bate;
          if (bate) noGrupo++;
        });
        g.hidden = noGrupo === 0;
        if (noGrupo) g.classList.add('revelado');
        total += noGrupo;
      });
      vazio.hidden = total > 0;
    });
  }

  /* ==========================================================================
     PONTILHISMO AO VIVO — uma mandala pintada ponto a ponto
     ========================================================================== */
  const tela = $('[data-pontilhismo]');
  const contadorPontos = $('[data-contador]');
  if (tela) {
    const SVG = 'http://www.w3.org/2000/svg';
    const cor = {
      fundo: token('--cor-musgo'), amarelo: token('--cor-amarelo'), creme: token('--cor-creme-claro'),
      salvia: token('--cor-salvia'), clara: token('--cor-salvia-clara'), marrom: token('--cor-marrom'),
    };
    const fundo = document.createElementNS(SVG, 'circle');
    Object.entries({ cx: 200, cy: 200, r: 196, fill: cor.fundo }).forEach(([k, v]) => fundo.setAttribute(k, v));
    tela.append(fundo);

    const pontos = [];
    const ponto = (x, y, r, c) => {
      const el = document.createElementNS(SVG, 'circle');
      el.setAttribute('cx', Math.round(x * 100) / 100);
      el.setAttribute('cy', Math.round(y * 100) / 100);
      el.setAttribute('r', r);
      el.setAttribute('fill', c);
      el.style.transformBox = 'fill-box';
      el.style.transformOrigin = 'center';
      tela.append(el);
      pontos.push(el);
    };
    const anel = (R, n, r, c, giro = 0) => {
      for (let i = 0; i < n; i++) {
        const a = ((-90 + giro + (360 * i) / n) * Math.PI) / 180;
        ponto(200 + R * Math.cos(a), 200 + R * Math.sin(a), r, c);
      }
    };
    // do centro para fora, na ordem em que seria pintada
    ponto(200, 200, 11, cor.amarelo);
    anel(25, 8, 6, cor.creme);
    anel(39, 16, 3.4, cor.clara, 11.25);
    for (let k = 0; k < 7; k++) { // 16 raios de pontos que diminuem
      anel(52 + k * 9.5, 16, 6 - k * 0.65, k % 2 ? cor.amarelo : cor.creme, 11.25);
    }
    anel(124, 48, 2.8, cor.clara);
    anel(140, 24, 6.2, cor.salvia, 7.5);
    anel(157, 64, 2.4, cor.amarelo);
    anel(175, 40, 5, cor.creme, 4.5);
    const total = pontos.length;

    let pintando = null;
    function pintar() {
      if (pintando) pintando.forEach((a) => a.cancel());
      if (!animar()) {
        pontos.forEach((p) => { p.style.opacity = '1'; });
        contadorPontos.textContent = String(total);
        return;
      }
      const passo = 2600 / total; // ~2,6 s para a mandala inteira
      pintando = pontos.map((p, i) => p.animate(
        [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.35)', opacity: 1, offset: 0.6 }, { transform: 'scale(1)', opacity: 1 }],
        { duration: 380, delay: i * passo, easing: 'ease-out', fill: 'backwards' },
      ));
      const inicio = performance.now();
      const contar = (agora) => {
        const n = Math.min(total, Math.floor((agora - inicio) / passo) + 1);
        contadorPontos.textContent = String(n);
        if (n < total) requestAnimationFrame(contar);
      };
      requestAnimationFrame(contar);
    }

    if ('IntersectionObserver' in window && animar()) {
      pontos.forEach((p) => { p.style.opacity = '0'; });
      const obs = new IntersectionObserver(([r]) => {
        if (!r.isIntersecting) return;
        obs.disconnect();
        pontos.forEach((p) => { p.style.opacity = ''; });
        pintar();
      }, { threshold: 0.45 });
      obs.observe(tela);
    } else pintar();

    const deNovo = $('[data-pintar-de-novo]');
    if (deNovo) deNovo.addEventListener('click', pintar);
  }

  /* ==========================================================================
     REVELAR AO ROLAR — sobe e aparece quando entra na tela
     ========================================================================== */
  if ('IntersectionObserver' in window && animar()) {
    html.classList.add('revela');
    const obs = new IntersectionObserver((registros) => {
      const entrando = registros.filter((r) => r.isIntersecting).map((r) => r.target);
      entrando.forEach((el, i) => {
        el.style.setProperty('--atraso', `${Math.min(i, 6) * 90}ms`);
        el.classList.add('revelado');
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    $$('[data-revela]').forEach((el) => obs.observe(el));
  }
})();
