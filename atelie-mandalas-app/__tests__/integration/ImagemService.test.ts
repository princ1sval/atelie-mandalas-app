import * as ImagePicker from 'expo-image-picker';
import { ImagemService } from '../../src/services/ImagemService';

// A câmera e a galeria são do celular: o expo-image-picker vira um test double.
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const picker = jest.mocked(ImagePicker);

beforeEach(() => jest.clearAllMocks());

describe('ImagemService', () => {
  test('câmera negada: devolve "sem-permissao" e não abre a câmera', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: false } as never);
    expect(await ImagemService.tirarFoto()).toEqual({ tipo: 'sem-permissao' });
    expect(picker.launchCameraAsync).not.toHaveBeenCalled();
  });

  test('galeria liberada: devolve a foto escolhida, recortada em quadrado', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///foto.jpg' }] } as never);

    expect(await ImagemService.escolherDaGaleria()).toEqual({ tipo: 'foto', uri: 'file:///foto.jpg' });
    expect(picker.launchImageLibraryAsync).toHaveBeenCalledWith(expect.objectContaining({ aspect: [1, 1] }));
  });

  test('a pessoa desistiu: "cancelado", que a tela não trata como erro', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchCameraAsync.mockResolvedValue({ canceled: true, assets: null } as never);
    expect(await ImagemService.tirarFoto()).toEqual({ tipo: 'cancelado' });
  });
});
