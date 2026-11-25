import AsyncStorage from '@react-native-async-storage/async-storage';
import { PerfilService } from '../../src/services/PerfilService';
import { fotoRepository } from '../../src/data/repositories/FotoRepository';
import { perfil } from '../helpers/fabricas';

// Integração: PerfilService → PerfilRepository → AsyncStorage (mock oficial).
// O FotoRepository mexe em arquivos do celular, então vira um test double que só registra as chamadas.
jest.mock('../../src/data/repositories/FotoRepository', () => ({
  fotoRepository: {
    guardar: jest.fn(async () => 'file:///documentos/perfil/foto-nova.jpg'),
    apagar: jest.fn(),
  },
}));

const CHAVE_PERFIL = '@malu-mandalas/perfil';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('PerfilService com AsyncStorage', () => {
  test('salva com o nome sem espaços, não guarda cidade vazia e lê de volta', async () => {
    await PerfilService.salvar(perfil({ nome: '  Ana Souza ', cidade: '   ' }), PerfilService.criarPerfilVazio());

    const guardado = JSON.parse((await AsyncStorage.getItem(CHAVE_PERFIL)) as string);
    expect(guardado.nome).toBe('Ana Souza');
    expect(guardado).not.toHaveProperty('cidade');
    expect(await PerfilService.carregar()).toEqual({ nome: 'Ana Souza', whatsapp: '(32) 99999-0000', fotoUri: null });
  });

  test('foto nova vai para a pasta do app, e a antiga é apagada depois', async () => {
    const anterior = perfil({ fotoUri: 'file:///documentos/perfil/foto-antiga.jpg' });
    const salvo = await PerfilService.salvar(perfil({ fotoUri: 'file:///cache/temporaria.jpg' }), anterior);

    expect(fotoRepository.guardar).toHaveBeenCalledWith('file:///cache/temporaria.jpg');
    expect(fotoRepository.apagar).toHaveBeenCalledWith('file:///documentos/perfil/foto-antiga.jpg');
    expect(salvo.fotoUri).toBe('file:///documentos/perfil/foto-nova.jpg');
  });

  test('perfil inválido não é gravado', async () => {
    await expect(PerfilService.salvar(perfil({ nome: 'A' }), PerfilService.criarPerfilVazio())).rejects.toThrow();
    expect(await AsyncStorage.getItem(CHAVE_PERFIL)).toBeNull();
  });

  test('apagar remove o perfil e o arquivo da foto', async () => {
    await AsyncStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfil({ fotoUri: 'file:///documentos/perfil/f.jpg' })));
    await PerfilService.apagar();
    expect(fotoRepository.apagar).toHaveBeenCalledWith('file:///documentos/perfil/f.jpg');
    expect(await PerfilService.carregar()).toEqual(PerfilService.criarPerfilVazio());
  });
});
