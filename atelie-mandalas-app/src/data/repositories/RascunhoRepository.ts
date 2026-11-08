import AsyncStorage from '@react-native-async-storage/async-storage';
import { PedidoEncomenda } from '../../model/Encomenda';

// O rascunho é um único objeto, sobrescrito a cada alteração e sem busca:
// por isso fica no AsyncStorage, e não no SQLite (seções 3.1 e 4.1).
// O prefixo com o nome do app evita colisão com chaves de bibliotecas.
const CHAVE_RASCUNHO = '@malu-mandalas/rascunho-encomenda';

export interface RascunhoRepository {
  salvar(pedido: PedidoEncomenda): Promise<void>;
  carregar(): Promise<Partial<PedidoEncomenda> | null>;
  limpar(): Promise<void>;
}

export const rascunhoRepository: RascunhoRepository = {
  async salvar(pedido) {
    // O AsyncStorage só guarda texto: o objeto vira JSON (seção 3.1).
    await AsyncStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(pedido));
  },

  // Devolve o que estiver salvo, sem garantir que está completo: quem confere é o Service.
  async carregar() {
    const json = await AsyncStorage.getItem(CHAVE_RASCUNHO);
    if (json === null) return null; // ainda não há rascunho
    try {
      const valor = JSON.parse(json);
      return valor && typeof valor === 'object' ? valor : null;
    } catch {
      // JSON estragado: o material não trata esse caso (seção 3.1). Aqui ele é ignorado,
      // e o formulário começa vazio em vez de quebrar a tela.
      return null;
    }
  },

  async limpar() {
    await AsyncStorage.removeItem(CHAVE_RASCUNHO);
  },
};
