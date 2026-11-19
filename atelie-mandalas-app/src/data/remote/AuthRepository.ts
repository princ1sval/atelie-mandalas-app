import {
  Auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from './firebase';
import { Usuario } from '../../model/Usuario';

// Erro com o mesmo código que o Firebase usaria, para o Service traduzir do mesmo jeito.
class FirebaseSemConfiguracao extends Error {
  code = 'auth/invalid-api-key';
}

function exigirAuth(): Auth {
  if (!auth) throw new FirebaseSemConfiguracao('Falta o arquivo .env com a configuração do Firebase.');
  return auth;
}

// O resto do app não conhece o tipo User do Firebase: recebe só um Usuario simples.
function paraUsuario(user: User): Usuario {
  return { uid: user.uid, email: user.email };
}

export interface AuthRepository {
  entrar(email: string, senha: string): Promise<Usuario>;
  cadastrar(email: string, senha: string): Promise<Usuario>;
  sair(): Promise<void>;
  observar(ouvinte: (usuario: Usuario | null) => void): () => void;
}

// A senha vai direto para o Firebase e nunca é guardada no aparelho (seção 7.2).
export const authRepository: AuthRepository = {
  async entrar(email, senha) {
    const { user } = await signInWithEmailAndPassword(exigirAuth(), email, senha);
    return paraUsuario(user);
  },

  async cadastrar(email, senha) {
    const { user } = await createUserWithEmailAndPassword(exigirAuth(), email, senha);
    return paraUsuario(user);
  },

  // Apaga a sessão guardada no SecureStore. A limpeza dos outros dados entra na B6 (seção 9).
  async sair() {
    await signOut(exigirAuth());
  },

  // O Firebase avisa ao abrir o app (depois de ler a sessão salva) e a cada vez que alguém entra ou sai.
  // Devolve a função que para de ouvir, como o PerfilService.observar.
  observar(ouvinte) {
    if (!auth) {
      ouvinte(null); // sem configuração, ninguém consegue entrar
      return () => {};
    }
    return onAuthStateChanged(auth, (user) => ouvinte(user ? paraUsuario(user) : null));
  },
};
