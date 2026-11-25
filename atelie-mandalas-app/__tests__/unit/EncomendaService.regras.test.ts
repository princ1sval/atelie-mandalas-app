import { EncomendaService, LIMITE_IDEIA } from '../../src/services/EncomendaService';
import { pedidoValido, perfil } from '../helpers/fabricas';

describe('EncomendaService.estimar', () => {
  test('30 cm sem presente: R$ 235 a R$ 305 em 20 dias', () => {
    expect(EncomendaService.estimar(pedidoValido({ tamanhoCm: 30 }))).toEqual({
      precoMinimo: 235,
      precoMaximo: 305,
      prazoDias: 20,
    });
  });

  test('para presente soma R$ 15 no mínimo e no máximo, sem mudar o prazo', () => {
    const semPresente = EncomendaService.estimar(pedidoValido({ tamanhoCm: 40 }));
    const comPresente = EncomendaService.estimar(pedidoValido({ tamanhoCm: 40, presente: true }));
    expect(comPresente.precoMinimo - semPresente.precoMinimo).toBe(15);
    expect(comPresente.precoMaximo - semPresente.precoMaximo).toBe(15);
    expect(comPresente.prazoDias).toBe(semPresente.prazoDias);
  });
});

describe('EncomendaService.validar', () => {
  test('o formulário vazio tem erro em nome, WhatsApp, tema e ideia', () => {
    const erros = EncomendaService.validar(EncomendaService.criarPedidoInicial());
    expect(Object.keys(erros).sort()).toEqual(['ideia', 'nome', 'tema', 'whatsapp']);
    expect(EncomendaService.temErros(erros)).toBe(true);
  });

  test('ideia acima do limite tem erro; pedido válido não tem nenhum', () => {
    const longa = pedidoValido({ ideia: 'a'.repeat(LIMITE_IDEIA + 1) });
    expect(EncomendaService.validar(longa).ideia).toBe(`Use no máximo ${LIMITE_IDEIA} caracteres.`);
    expect(EncomendaService.validar(pedidoValido())).toEqual({});
  });
});

describe('EncomendaService.criarPedidoInicial', () => {
  test('vem com 30 cm, sem tema, e aceita o tema e a inspiração do "Quero uma assim"', () => {
    expect(EncomendaService.criarPedidoInicial()).toMatchObject({ tema: null, tamanhoCm: 30, presente: false });
    expect(EncomendaService.criarPedidoInicial('pet', 'enc-patinhas')).toMatchObject({
      tema: 'pet',
      inspiracaoId: 'enc-patinhas',
    });
  });
});

describe('EncomendaService.preencherComPerfil', () => {
  test('campo vazio recebe o valor do perfil, e o que a cliente digitou fica', () => {
    const pedido = pedidoValido({ nome: '', whatsapp: '(31) 98888-7777' });
    const preenchido = EncomendaService.preencherComPerfil(pedido, perfil({ nome: 'Ana Souza' }));
    expect(preenchido.nome).toBe('Ana Souza');
    expect(preenchido.whatsapp).toBe('(31) 98888-7777');
  });

  test('quando a cliente troca o nome no Perfil, o formulário que mostrava o nome antigo acompanha', () => {
    const antigo = perfil({ nome: 'Ana' });
    const pedido = pedidoValido({ nome: 'Ana' });
    const novo = perfil({ nome: 'Ana Souza' });
    expect(EncomendaService.preencherComPerfil(pedido, novo, antigo).nome).toBe('Ana Souza');
  });

  test('sem mudança nenhuma, devolve o mesmo objeto (a tela não redesenha à toa)', () => {
    const pedido = pedidoValido();
    expect(EncomendaService.preencherComPerfil(pedido, perfil())).toBe(pedido);
  });
});
