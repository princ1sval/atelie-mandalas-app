import AsyncStorage from '@react-native-async-storage/async-storage';
import { Perfil } from '../../model/Perfil';

// O perfil é um objeto só, sobrescrito a cada "Salvar": por isso fica no AsyncStorage,
// como o rascunho (seção 3.1). A foto não entra aqui: o perfil guarda só o caminho do arquivo.
const CHAVE_PERFIL = '@malu-mandalas/perfil';

export interface PerfilRepository {
  salvar(perfil: Perfil): Promise<void>;
  carregar(): Promise<Partial<Perfil> | null>;
  limpar(): Promise<void>;
}

export const perfilRepository: PerfilRepository = {
  async salvar(perfil) {
    // O AsyncStorage só guarda texto: o objeto vira JSON (seção 3.1).
    await AsyncStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfil));
  },

  // Devolve o que estiver salvo, sem garantir que está completo: quem confere é o Service.
  async carregar() {
    const json = await AsyncStorage.getItem(CHAVE_PERFIL);
    if (json === null) return null; // ainda não há perfil
    try {
      const valor = JSON.parse(json);
      return valor && typeof valor === 'object' ? valor : null;
    } catch {
      // JSON estragado: o perfil começa vazio em vez de quebrar a tela.
      return null;
    }
  },

  async limpar() {
    await AsyncStorage.removeItem(CHAVE_PERFIL);
  },
};
