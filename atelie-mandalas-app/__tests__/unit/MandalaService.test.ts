import { MandalaService } from '../../src/services/MandalaService';
import { mandala } from '../helpers/fabricas';

const ceu = mandala({ id: 'ceu', nome: 'Céu', cores: ['azul', 'dourado'] });
const terra = mandala({ id: 'terra', nome: 'Terra', cores: ['marrom', 'laranja'] });
const patinhas = mandala({ id: 'patinhas', nome: 'Patinhas', origem: 'encomenda', tema: 'pet', preco: undefined });
const lacos = mandala({ id: 'lacos', nome: 'Laços de família', origem: 'encomenda', tema: 'familia', preco: undefined });

describe('MandalaService.filtrarPorBusca', () => {
  test('acha pelo nome sem acento e sem diferenciar maiúscula', () => {
    expect(MandalaService.filtrarPorBusca([ceu, terra], 'CEU')).toEqual([ceu]);
  });

  test('acha pela cor, e busca vazia devolve tudo', () => {
    expect(MandalaService.filtrarPorBusca([ceu, terra], 'laranja')).toEqual([terra]);
    expect(MandalaService.filtrarPorBusca([ceu, terra], '  ')).toEqual([ceu, terra]);
  });
});

describe('MandalaService.filtrarPorTema', () => {
  test('"todos" devolve a lista inteira; um tema devolve só as dele', () => {
    expect(MandalaService.filtrarPorTema([patinhas, lacos], 'todos')).toHaveLength(2);
    expect(MandalaService.filtrarPorTema([patinhas, lacos], 'pet')).toEqual([patinhas]);
  });
});

describe('MandalaService.sortear (surpresa do chacoalhar)', () => {
  afterEach(() => jest.restoreAllMocks());

  test('lista vazia não sorteia nada; com uma peça só, ela pode repetir', () => {
    expect(MandalaService.sortear([])).toBeNull();
    expect(MandalaService.sortear([ceu], 'ceu')).toBe(ceu);
  });

  test('com mais de uma peça, nunca repete a última sorteada', () => {
    // Math.random fixo em 0 escolheria sempre a primeira da lista: "ceu", que foi a última.
    jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(MandalaService.sortear([ceu, terra], 'ceu')).toBe(terra);
  });
});

describe('MandalaService: regras do Detalhe', () => {
  test('pronta entrega mostra "Tenho interesse"; portfólio mostra "Quero uma assim" com o tema', () => {
    expect(MandalaService.obterAcaoDetalhe(ceu)).toMatchObject({ tipo: 'tenhoInteresse', rotulo: 'Tenho interesse' });
    const acao = MandalaService.obterAcaoDetalhe(patinhas);
    expect(acao.tipo).toBe('queroUmaAssim');
    expect(acao.ajuda).toContain('Pet');
  });

  test('descreve a origem e monta os filtros com "Todos" primeiro', () => {
    expect(MandalaService.descreverOrigem(ceu)).toBe('Pronta entrega');
    expect(MandalaService.descreverOrigem(patinhas)).toBe('Encomenda · Pet');
    const filtros = MandalaService.opcoesDeFiltro();
    expect(filtros[0]).toEqual({ valor: 'todos', rotulo: 'Todos' });
    expect(filtros).toHaveLength(6);
  });
});
