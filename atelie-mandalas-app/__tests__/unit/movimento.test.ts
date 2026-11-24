import { ehChacoalhada, LIMITE_CHACOALHADA_G } from '../../src/utils/movimento';

describe('ehChacoalhada (acelerômetro)', () => {
  test('celular parado na mesa mede só a gravidade (1 g) e não conta', () => {
    expect(ehChacoalhada({ x: 0, y: 0, z: 1 })).toBe(false);
  });

  test('um movimento forte, acima de 1,8 g, conta como chacoalhada', () => {
    expect(ehChacoalhada({ x: 2, y: 1, z: 1 })).toBe(true); // força ≈ 2,45 g
  });

  test('exatamente no limite ainda não conta: precisa passar dele', () => {
    expect(ehChacoalhada({ x: LIMITE_CHACOALHADA_G, y: 0, z: 0 })).toBe(false);
  });
});
