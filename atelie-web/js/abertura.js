/* ==========================================================================
   ABERTURA — "a mandala é pintada ponto a ponto e abre o ateliê"
   --------------------------------------------------------------------------
   Mesma estrutura do kit do beija-flor (psico-web): só roda quando o script
   do <head> pôs a classe .intro no <html>; tudo é calculado pelo relógio, num
   único laço de requestAnimationFrame.
   1. PINTURA: os pontos da mandala aparecem do centro para fora, um a um.
   2. NOME: "Malu Mandalas" surge embaixo dela.
   3. ABERTURA: a cortina creme se abre num círculo de borda pontilhada,
      a partir do centro da mandala, e o site aparece.
   4. POUSO: a mandala encolhe, gira e pousa no logo do menu (FLIP).
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- AJUSTES: tempos (segundos, contados do início) ------------- */
  const T = {
    pinta:      0.04,  // 1. primeiro ponto (o centro)
    pintaFim:   0.72,  //    último ponto começa a aparecer
    ponto:      0.22,  //    cada ponto "brota" em 0,22 s (com overshoot)
    nome:       0.30,  // 2. o nome começa a surgir…
    nomeFim:    0.68,  //    …e termina
    nomeSai:    0.86,  //    o nome some até T.voo
    voo:        0.95,  // 3–4. a cortina começa a abrir e a mandala decola
    abreFim:    1.62,  //    cortina totalmente aberta
    fim:        1.80,  //    fim = duração total (a mandala chega ao logo)
    pular:      0.15,  // saída rápida ao clicar, tocar, rolar ou teclar
    fonte:      0.60,  // espera máxima pela fonte do nome antes de começar
  };

  /* ---------- AJUSTES: medidas -------------------------------------------- */
  const M = {
    mandala:  [150, 0.42, 280], // tamanho: clamp(150px, 42vmin, 280px)
    centroY:  0.42,  // altura do centro da mandala (fração da altura da tela)
    giro:     -45,   // graus: a mandala termina de girar até 0 no pouso
    nome:     44,    // px entre a mandala e o nome
    sobe:     14,    // px que os elementos do topo sobem ao serem revelados
    pontilho: 9,     // px entre os pontos da borda da cortina
    pulso:    1.12,  // o logo "respira" ao receber a mandala
  };

  /* ---------- Curvas de aceleração (as mesmas do CSS) --------------------- */
  const CURVA = {
    entrada: [0.16, 1, 0.3, 1],
    meio:    [0.65, 0, 0.35, 1],
    pouso:   [0.34, 1.56, 0.64, 1],
  };

  /* ======================================================================== */

  const html = document.documentElement;
  const SVG = 'http://www.w3.org/2000/svg';
  const CHAVE_SOBE = 'data-abertura-sobe';
  const limita = (v, a, b) => (v < a ? a : v > b ? b : v);
  const mistura = (a, b, k) => a + (b - a) * k;
  const fase = (t, a, b) => limita((t - a) / (b - a), 0, 1);
  const r1 = (v) => Math.round(v * 10) / 10;
  const r2 = (v) => Math.round(v * 100) / 100;
  const cssCurva = (c) => `cubic-bezier(${c.join(', ')})`;
  const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));

  // cubic-bezier igual ao do CSS
  function curva([x1, y1, x2, y2]) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (s) => ((ax * s + bx) * s + cx) * s;
    const Y = (s) => ((ay * s + by) * s + cy) * s;
    return (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let lo = 0, hi = 1, s = x;
      for (let i = 0; i < 24; i++) {
        const v = X(s);
        if (Math.abs(v - x) < 1e-5) break;
        if (v < x) lo = s; else hi = s;
        s = (lo + hi) / 2;
      }
      return Y(s);
    };
  }
  const E = { entrada: curva(CURVA.entrada), meio: curva(CURVA.meio), pouso: curva(CURVA.pouso) };

  // Bézier quadrática
  const bq = (a, c, b, u) => {
    const v = 1 - u;
    return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]];
  };

  /* ---------- Câmera lenta (para revisar) ----------------------------------
     ?intro=0.25 na URL (25%) ou, no console, abertura.tocar(0.1) (10%). */
  const lerVel = (v) => { const n = parseFloat(v); return n > 0 && n <= 1 ? n : 1; };
  let vel = 1;
  try { vel = lerVel(new URLSearchParams(location.search).get('intro')); } catch (e) {}

  /* ---------- Estado ------------------------------------------------------- */
  let camada = document.getElementById('abertura');
  const molde = camada ? camada.cloneNode(true) : null; // para "rever animação"
  let el = {};          // elementos da camada
  let logo = null;      // logo real do menu
  let estado = 'parado';
  let raf = 0, t0 = 0;
  let W = 0, H = 0, tam = 0, centro = [0, 0], raioMax = 0, alvo = null, controle = null;
  let pontos = [], sobem = [], ultimoD = '';
  let rolagemInicial = 0;

  /* ---------- Montagem da mandala (copia os pontos do logo) --------------- */
  // Os pontos do logo são a mandala que pousa; os "extras" (anéis finos) só existem
  // na abertura e somem durante o voo, porque no tamanho do logo seriam poeira.
  function anel(R, n, r, offset, classe) {
    const lista = [];
    for (let i = 0; i < n; i++) {
      const a = ((-90 + offset + (360 * i) / n) * Math.PI) / 180;
      const c = document.createElementNS(SVG, 'circle');
      c.setAttribute('class', classe);
      c.setAttribute('cx', r2(50 + R * Math.cos(a)));
      c.setAttribute('cy', r2(50 + R * Math.sin(a)));
      c.setAttribute('r', r);
      lista.push(c);
    }
    return lista;
  }
  function montarMandala() {
    const g = el.mandala;
    g.textContent = '';
    const extras = document.createElementNS(SVG, 'g');
    extras.setAttribute('class', 'ab-extras');
    [...anel(22, 16, 1.5, 11.25, 'ml-x1'), ...anel(35.5, 16, 1.7, 11.25, 'ml-x1'), ...anel(49, 32, 1.5, 5.625, 'ml-x2')]
      .forEach((c) => extras.append(c));
    g.append(extras);
    if (logo) logo.querySelectorAll('circle').forEach((c) => g.append(c.cloneNode()));
    el.extras = extras;
    // ordem da pintura: do centro para fora; em cada anel, em volta, a partir do topo
    pontos = [...g.querySelectorAll('circle')].map((c) => {
      const x = +c.getAttribute('cx') - 50, y = +c.getAttribute('cy') - 50;
      const d = Math.hypot(x, y) / 50;
      const giro = ((Math.atan2(y, x) * 180) / Math.PI + 90 + 360) % 360 / 360;
      const r = +c.getAttribute('r');
      c.setAttribute('r', 0);
      return { c, r, t: mistura(T.pinta, T.pintaFim, 0.82 * Math.pow(d, 0.9) + 0.18 * giro * Math.min(1, d * 4)), ultimo: -1 };
    });
  }

  /* ---------- Geometria do instante t --------------------------------------- */
  function mandalaEm(t) {
    const giro = M.giro * (1 - E.entrada(fase(t, 0, T.fim)));
    const s0 = tam / 100;
    if (t <= T.voo || !alvo) {
      // respira de leve enquanto é pintada
      return { c: centro, s: s0 * (0.96 + 0.04 * E.entrada(fase(t, 0, T.pintaFim))), r: giro };
    }
    const k = E.meio(fase(t, T.voo, T.fim));
    return { c: bq(centro, controle, alvo.c, k), s: mistura(s0, alvo.s, k), r: giro };
  }

  function raioEm(t) {
    return raioMax * E.meio(fase(t, T.voo, T.abreFim));
  }

  /* ---------- Desenho do quadro ------------------------------------------- */
  function desenhar(t) {
    // 1. pintura, ponto a ponto
    for (const p of pontos) {
      const k = fase(t, p.t, p.t + T.ponto);
      if (k === p.ultimo) continue;
      p.ultimo = k;
      p.c.setAttribute('r', r2(p.r * E.pouso(k)));
    }
    // 4. a mandala decola e pousa no logo
    const m = mandalaEm(t);
    el.mandala.setAttribute('transform',
      `translate(${r2(m.c[0])} ${r2(m.c[1])}) rotate(${r2(m.r)}) scale(${Math.round(m.s * 1e4) / 1e4}) translate(-50 -50)`);
    const kx = fase(t, T.voo, T.voo + 0.32);
    el.extras.style.opacity = String(1 - kx);

    // 2. nome
    const entra = E.entrada(fase(t, T.nome, T.nomeFim));
    const sai = E.meio(fase(t, T.nomeSai, T.voo));
    el.nome.style.opacity = String(entra * (1 - sai));
    el.nome.setAttribute('transform', `translate(0 ${r1(10 * (1 - entra) - 8 * sai)})`);

    // 3. a cortina abre num círculo de borda pontilhada
    const raio = raioEm(t);
    desenharCortina(raio);
    el.borda.setAttribute('r', r1(raio));
    el.borda.style.opacity = raio > 1 ? String(1 - fase(t, T.abreFim - 0.2, T.abreFim)) : '0';
    revelarTopo(raio);
  }

  function desenharCortina(raio) {
    const [x, y] = centro;
    let d = `M-2 -2H${W + 2}V${H + 2}H-2Z`;
    if (raio > 0.5) {
      const r = r1(raio);
      d += `M${r1(x - r)} ${r1(y)}a${r} ${r} 0 1 0 ${r1(2 * r)} 0a${r} ${r} 0 1 0 ${r1(-2 * r)} 0Z`;
    }
    if (d === ultimoD) return;
    ultimoD = d;
    el.cortinas.forEach((p) => p.setAttribute('d', d));
  }

  // Elementos do topo sobem de leve quando a borda do círculo passa por eles
  function medirTopo() {
    sobem = [...document.querySelectorAll(`[${CHAVE_SOBE}]`)]
      .map((elemento) => ({ elemento, r: elemento.getBoundingClientRect(), foi: false }))
      .filter((o) => o.r.width > 0 && o.r.top < H)
      .map((o) => {
        // distância do centro do círculo até o ponto mais perto do elemento
        const dx = limita(centro[0], o.r.left, o.r.right) - centro[0];
        const dy = limita(centro[1], o.r.top, o.r.bottom) - centro[1];
        return { ...o, d: Math.hypot(dx, dy) };
      })
      .sort((a, b) => a.d - b.d);
  }
  function revelarTopo(raio) {
    let fila = 0;
    for (const o of sobem) {
      if (o.foi || raio < o.d + 20) continue;
      o.foi = true;
      o.elemento.animate([{ translate: `0 ${M.sobe}px`, opacity: 0.4 }, { translate: '0 0', opacity: 1 }], {
        duration: 700 / vel, delay: (40 * fila++) / vel, easing: cssCurva(CURVA.entrada), fill: 'backwards',
      });
    }
  }

  /* ---------- Medidas da tela ---------------------------------------------- */
  function medir() {
    W = camada.clientWidth;
    H = camada.clientHeight;
    tam = limita(Math.min(W, H) * M.mandala[1], M.mandala[0], M.mandala[2]);
    centro = [W / 2, H * M.centroY];
    raioMax = Math.hypot(Math.max(centro[0], W - centro[0]), Math.max(centro[1], H - centro[1])) + 24;
    el.nome.setAttribute('x', r1(W / 2));
    el.nome.setAttribute('y', r1(centro[1] + tam / 2 + M.nome));
    el.borda.setAttribute('cx', r1(centro[0]));
    el.borda.setAttribute('cy', r1(centro[1]));
    el.borda.style.strokeDasharray = `0 ${M.pontilho}`;
    const L = logo && logo.getBoundingClientRect();
    if (L && L.width > 2) {
      const s = L.width / 100;
      alvo = { c: [L.left + 50 * s, L.top + 50 * s], s };
      // arco: sobe primeiro e depois vai para o lado do logo
      controle = [mistura(centro[0], alvo.c[0], 0.25), mistura(centro[1], alvo.c[1], 1.15)];
    } else alvo = null;
    medirTopo();
    ultimoD = '';
  }

  /* ---------- Ciclo de vida ------------------------------------------------- */
  function passo(agora) {
    if (estado !== 'rodando') return;
    if (!t0) {
      t0 = agora;
      el.inicial.remove(); // a partir daqui a cortina é o path
    }
    const t = ((agora - t0) / 1000) * vel;
    try {
      if (camada.clientWidth !== W || camada.clientHeight !== H) medir();
      if (t >= T.fim) return entregar();
      desenhar(t);
      if (!alvo && t > T.voo) el.mandala.style.opacity = String(1 - fase(t, T.voo, T.fim));
      raf = requestAnimationFrame(passo);
    } catch (erro) {
      concluir();
      throw erro;
    }
  }

  // A mandala chega ao logo com o tamanho e o giro exatos; no mesmo quadro o logo real
  // aparece no lugar dela e "respira" uma vez (pulso com overshoot), como um pouso.
  function entregar() {
    if (logo && logo.animate && alvo) {
      logo.animate([{ scale: M.pulso }, { scale: 1 }], { duration: 360 / vel, easing: cssCurva(CURVA.pouso) });
    }
    concluir();
  }

  function esperarFonte() {
    const fontes = document.fonts;
    if (!fontes || !fontes.check) return Promise.resolve();
    const fonte = `300 64px ${getComputedStyle(el.nome).fontFamily}`;
    try { if (fontes.check(fonte, 'Malu Mandalas')) return Promise.resolve(); } catch (e) { return Promise.resolve(); }
    const carregou = fontes.load(fonte, 'Malu Mandalas').then(() => pausa(60), () => {});
    return Promise.race([carregou, pausa(T.fonte * 1000)]);
  }

  // Se o JS começou tarde, empurra a rede de segurança do CSS para depois do fim previsto
  function adiarSeguranca() {
    const resto = (T.fonte + T.fim / vel + 0.8) * 1000;
    [camada, logo].forEach((alvoAnim) => {
      if (!alvoAnim || !alvoAnim.getAnimations) return;
      alvoAnim.getAnimations().forEach((a) => {
        if (!a.animationName || a.animationName.indexOf('ab-') !== 0) return;
        const decorrido = Number(a.currentTime) || 0;
        if (decorrido + resto > 4000) alvoAnim.style.animationDelay = `${Math.ceil(decorrido + resto)}ms`;
      });
    });
  }

  const PULAR_EM = ['pointerdown', 'touchstart', 'wheel', 'keydown'];
  function aoRolar() { if (Math.abs(window.scrollY - rolagemInicial) > 2) pular(); }
  function aoEsconder() { if (document.hidden) concluir(); }
  function ouvir(liga) {
    const f = liga ? 'addEventListener' : 'removeEventListener';
    PULAR_EM.forEach((ev) => window[f](ev, pular, { capture: true, passive: true }));
    window[f]('scroll', aoRolar, { passive: true });
    document[f]('visibilitychange', aoEsconder);
  }

  function iniciar() {
    camada = document.getElementById('abertura');
    if (!camada || !html.classList.contains('intro')) return;
    const q = (s) => camada.querySelector(s);
    logo = document.querySelector('[data-abertura-logo]');
    el = {
      mandala: q('.ab-mandala'),
      nome: q('.ab-nome'),
      borda: q('.ab-borda'),
      cortinas: [...camada.querySelectorAll('[data-cortina]')],
      inicial: q('.ab-inicial'),
    };
    estado = 'esperando';
    t0 = 0; ultimoD = '';
    montarMandala();
    rolagemInicial = window.scrollY;
    ouvir(true);
    adiarSeguranca();
    esperarFonte().then(() => {
      if (estado !== 'esperando') return;
      estado = 'rodando';
      medir();
      raf = requestAnimationFrame(passo);
    });
  }

  // O toque/clique que pulou não pode "atravessar" e acionar o link que estava embaixo
  // da cortina (no celular o clique chega depois que o dedo sai, com a cortina já indo embora)
  function engolirClique() {
    const prazo = performance.now() + 800;
    const engole = (ev) => {
      window.removeEventListener('click', engole, true);
      if (performance.now() > prazo) return;
      ev.preventDefault();
      ev.stopPropagation();
    };
    window.addEventListener('click', engole, true);
    setTimeout(() => window.removeEventListener('click', engole, true), 800);
  }

  // Clique, toque, rolagem ou tecla: vai direto ao estado final com uma saída rápida
  function pular(ev) {
    if (estado !== 'rodando' && estado !== 'esperando') return;
    if (ev && (ev.type === 'pointerdown' || ev.type === 'touchstart')) engolirClique();
    estado = 'saindo';
    cancelAnimationFrame(raf);
    ouvir(false);
    camada.style.pointerEvents = 'none';
    const dur = T.pular * 1000;
    if (logo) {
      logo.style.visibility = 'visible';
      logo.style.animation = 'none';
      logo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, easing: 'ease-out' });
    }
    camada.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-12px)' }], {
      duration: dur, easing: cssCurva(CURVA.entrada), fill: 'forwards',
    }).finished.then(concluir, concluir);
    setTimeout(concluir, dur + 150); // garantia
  }

  function concluir() {
    if (estado === 'fim' || estado === 'parado') return;
    estado = 'fim';
    cancelAnimationFrame(raf);
    ouvir(false);
    html.classList.remove('intro'); // o logo real aparece…
    if (logo) ['visibility', 'opacity', 'animation', 'animation-delay'].forEach((p) => logo.style.removeProperty(p));
    camada.remove();                // …e a camada sai do DOM, no mesmo quadro
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'auto'; } catch (e) {}
    document.dispatchEvent(new CustomEvent('abertura:fim'));
  }

  // Rever (no console: abertura.tocar() · abertura.tocar(0.25) em câmera lenta)
  function tocar(velocidade) {
    if (!molde || estado === 'rodando' || estado === 'esperando' || estado === 'saindo') return;
    vel = lerVel(velocidade);
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.prepend(molde.cloneNode(true));
    html.classList.add('intro');
    iniciar();
  }

  window.abertura = { tocar, pular, rodando: () => estado === 'rodando' || estado === 'esperando' };
  if (camada && html.classList.contains('intro')) iniciar();
  else if (camada) camada.remove(); // sem abertura: a camada nem fica no DOM
})();
