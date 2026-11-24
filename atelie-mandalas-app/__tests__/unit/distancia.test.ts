import { distanciaKm } from '../../src/utils/distancia';

const MURIAE = { latitude: -21.1306, longitude: -42.3664 };
const JUIZ_DE_FORA = { latitude: -21.7642, longitude: -43.3496 };

describe('distanciaKm (fórmula de Haversine)', () => {
  test('o mesmo ponto está a 0 km', () => {
    expect(distanciaKm(MURIAE, MURIAE)).toBe(0);
  });

  test('Muriaé–Juiz de Fora dá cerca de 123 km em linha reta, nos dois sentidos', () => {
    const ida = distanciaKm(MURIAE, JUIZ_DE_FORA);
    expect(ida).toBeGreaterThan(115);
    expect(ida).toBeLessThan(130);
    expect(distanciaKm(JUIZ_DE_FORA, MURIAE)).toBeCloseTo(ida, 10);
  });
});
