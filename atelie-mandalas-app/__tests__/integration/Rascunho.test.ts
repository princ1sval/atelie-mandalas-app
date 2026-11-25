import AsyncStorage from '@react-native-async-storage/async-storage';
import { EncomendaService } from '../../src/services/EncomendaService';
import { pedidoValido, perfil } from '../helpers/fabricas';

// Integração do rascunho: EncomendaService → RascunhoRepository → AsyncStorage.
const CHAVE_RASCUNHO = '@malu-mandalas/rascunho-encomenda';
const semPerfil = perfil({ nome: '', whatsapp: '' });

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('Rascunho da encomenda no AsyncStorage', () => {
  test('o que é salvo volta igual ao abrir o app de novo', async () => {
    const pedido = pedidoValido({ tema: 'pet', tamanhoCm: 20, inspiracaoId: 'enc-patinhas' });
    await EncomendaService.salvarRascunho(pedido, semPerfil);
    expect(await EncomendaService.carregarRascunho()).toEqual(pedido);
  });

  test('JSON estragado é ignorado e um tamanho que não existe volta ao padrão', async () => {
    await AsyncStorage.setItem(CHAVE_RASCUNHO, '{isto não é json');
    expect(await EncomendaService.carregarRascunho()).toBeNull();

    await AsyncStorage.setItem(CHAVE_RASCUNHO, JSON.stringify({ nome: 'Ana', tamanhoCm: 99, tema: 'dragao' }));
    expect(await EncomendaService.carregarRascunho()).toMatchObject({ nome: 'Ana', tamanhoCm: 30, tema: null });
  });

  test('formulário vazio apaga a chave, e nome igual ao do perfil não é repetido', async () => {
    await EncomendaService.salvarRascunho(pedidoValido(), semPerfil);
    await EncomendaService.salvarRascunho(EncomendaService.criarPedidoInicial(), semPerfil);
    expect(await AsyncStorage.getItem(CHAVE_RASCUNHO)).toBeNull();

    await EncomendaService.salvarRascunho(pedidoValido({ nome: 'Ana Souza' }), perfil({ nome: 'Ana Souza' }));
    const guardado = JSON.parse((await AsyncStorage.getItem(CHAVE_RASCUNHO)) as string);
    expect(guardado.nome).toBe(''); // já está no perfil (guardar só o necessário)
  });
});
