import { ehTelefoneValido } from '../../src/utils/validators';

describe('ehTelefoneValido', () => {
  test('aceita telefone fixo (10 dígitos) e celular (11 dígitos), com ou sem máscara', () => {
    expect(ehTelefoneValido('(32) 8710-3005')).toBe(true);
    expect(ehTelefoneValido('32999990000')).toBe(true);
  });

  test('recusa telefone sem DDD ou com dígitos a mais', () => {
    expect(ehTelefoneValido('99999-0000')).toBe(false);
    expect(ehTelefoneValido('329999900001')).toBe(false);
    expect(ehTelefoneValido('')).toBe(false);
  });
});
