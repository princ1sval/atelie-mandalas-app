import { apenasDigitos, iniciais, normalizarTexto, primeiroNome } from '../../src/utils/texto';

describe('normalizarTexto', () => {
  test('deixa minúsculo, tira acentos e os espaços das pontas', () => {
    expect(normalizarTexto('  Céu AZUL ')).toBe('ceu azul');
    expect(normalizarTexto('Laços de Família')).toBe('lacos de familia');
  });
});

describe('apenasDigitos', () => {
  test('remove a máscara do telefone', () => {
    expect(apenasDigitos('(32) 99999-0000')).toBe('32999990000');
  });
});

describe('iniciais', () => {
  test('usa a primeira letra do primeiro e do último nome', () => {
    expect(iniciais('Ana Clara Souza')).toBe('AS');
  });

  test('com um nome só, usa uma letra; com texto vazio, nenhuma', () => {
    expect(iniciais('ana')).toBe('A');
    expect(iniciais('   ')).toBe('');
  });
});

describe('primeiroNome', () => {
  test('pega o primeiro nome mesmo com espaços sobrando', () => {
    expect(primeiroNome('  Ana   Clara ')).toBe('Ana');
  });
});
