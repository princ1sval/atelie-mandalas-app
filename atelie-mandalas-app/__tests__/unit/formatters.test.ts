import {
  formatarDataHora,
  formatarDistancia,
  formatarFaixaPreco,
  formatarMoeda,
  formatarQuantidade,
  formatarTelefone,
} from '../../src/utils/formatters';

// O Intl separa "R$" do número com um espaço especial (U+00A0). Para comparar, troca por espaço comum.
const semEspacoEspecial = (texto: string) => texto.replace(/\s/g, ' ');

describe('formatarTelefone (máscara enquanto digita)', () => {
  test('vai montando a máscara aos poucos', () => {
    expect(formatarTelefone('')).toBe('');
    expect(formatarTelefone('3')).toBe('(3');
    expect(formatarTelefone('3299')).toBe('(32) 99');
  });

  test('formata fixo de 10 dígitos e celular de 11', () => {
    expect(formatarTelefone('3287103005')).toBe('(32) 8710-3005');
    expect(formatarTelefone('32999990000')).toBe('(32) 99999-0000');
  });

  test('ignora letras e corta o que passa de 11 dígitos', () => {
    expect(formatarTelefone('32a99999-00001234')).toBe('(32) 99999-0000');
  });
});

describe('formatarMoeda e formatarFaixaPreco', () => {
  test('formata em reais, com e sem centavos', () => {
    expect(semEspacoEspecial(formatarMoeda(220))).toBe('R$ 220,00');
    expect(semEspacoEspecial(formatarFaixaPreco(250, 320))).toBe('R$ 250 a R$ 320');
  });
});

describe('formatarDataHora', () => {
  test('converte o texto do SQLite para o formato brasileiro', () => {
    expect(formatarDataHora('2026-11-08 09:20:48')).toBe('08/11/2026 às 09:20');
  });
});

describe('formatarDistancia', () => {
  test('abaixo de 1 km mostra "menos de 1 km"', () => {
    expect(formatarDistancia(0.4)).toBe('menos de 1 km');
  });

  test('arredonda para km inteiro e separa o milhar com ponto', () => {
    expect(formatarDistancia(3.6)).toBe('4 km');
    expect(formatarDistancia(1234.5)).toBe('1.235 km');
  });
});

describe('formatarQuantidade', () => {
  test('usa o singular só para 1', () => {
    expect(formatarQuantidade(1, 'peça', 'peças')).toBe('1 peça');
    expect(formatarQuantidade(6, 'peça', 'peças')).toBe('6 peças');
    expect(formatarQuantidade(0, 'peça', 'peças')).toBe('0 peças');
  });
});
