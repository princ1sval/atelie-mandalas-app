import * as Location from 'expo-location';
import { LocalizacaoService } from '../../src/services/LocalizacaoService';
import { ATELIE_MOCK } from '../../src/data/mocks/atelie.mock';

// Integração: LocalizacaoService + AtelieService/Repository (coordenadas do ateliê) + Haversine.
// O expo-location precisa do GPS do celular, então vira um test double.
jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  hasServicesEnabledAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

const gps = jest.mocked(Location);

beforeEach(() => {
  jest.clearAllMocks();
  gps.hasServicesEnabledAsync.mockResolvedValue(true);
  gps.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
});

describe('LocalizacaoService.buscarCidade', () => {
  test('GPS desligado: avisa sem nem pedir a permissão', async () => {
    gps.hasServicesEnabledAsync.mockResolvedValue(false);
    expect(await LocalizacaoService.buscarCidade()).toEqual({ tipo: 'gps-desligado' });
    expect(gps.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  test('permissão negada: não lê a posição', async () => {
    gps.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);
    expect(await LocalizacaoService.buscarCidade()).toEqual({ tipo: 'sem-permissao' });
    expect(gps.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  test('com permissão, devolve "cidade – UF" e a distância até o ateliê', async () => {
    gps.getCurrentPositionAsync.mockResolvedValue({ coords: ATELIE_MOCK.coordenadas } as never);
    gps.reverseGeocodeAsync.mockResolvedValue([{ city: 'Muriaé', region: 'MG' }] as never);

    expect(await LocalizacaoService.buscarCidade()).toEqual({ tipo: 'ok', cidade: 'Muriaé – MG', distanciaKm: 0 });
  });

  test('no Android a cidade pode vir em subregion; sem cidade nenhuma, "falhou"', async () => {
    gps.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: -21.76, longitude: -43.35 } } as never);
    gps.reverseGeocodeAsync.mockResolvedValueOnce([{ city: null, subregion: 'Juiz de Fora', region: 'MG' }] as never);
    const resultado = await LocalizacaoService.buscarCidade();
    expect(resultado).toMatchObject({ tipo: 'ok', cidade: 'Juiz de Fora – MG' });

    gps.reverseGeocodeAsync.mockResolvedValueOnce([] as never);
    expect(await LocalizacaoService.buscarCidade()).toEqual({ tipo: 'falhou' });
  });
});
