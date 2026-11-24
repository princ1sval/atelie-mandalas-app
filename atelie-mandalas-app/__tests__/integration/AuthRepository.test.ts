import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { AuthService } from '../../src/services/AuthService';

// Integração com a "API" do app, o Firebase Authentication: AuthService → AuthRepository → Firebase.
// O Firebase vira um test double: nenhum teste depende de internet nem de conta real.
jest.mock('../../src/data/remote/firebase', () => ({ auth: { nome: 'auth-de-teste' }, firebaseConfigurado: true }));
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

const entrarNoFirebase = jest.mocked(signInWithEmailAndPassword);

beforeEach(() => jest.clearAllMocks());

describe('AuthService + AuthRepository com o Firebase', () => {
  test('entrar manda o e-mail sem espaços e devolve só uid e e-mail', async () => {
    entrarNoFirebase.mockResolvedValue({ user: { uid: 'u1', email: 'ana@exemplo.com', displayName: 'X' } } as never);

    const usuario = await AuthService.entrar('  ana@exemplo.com ', 'segredo1');

    expect(entrarNoFirebase).toHaveBeenCalledWith({ nome: 'auth-de-teste' }, 'ana@exemplo.com', 'segredo1');
    expect(usuario).toEqual({ uid: 'u1', email: 'ana@exemplo.com' }); // o tipo do Firebase não vaza
  });

  test('o erro do Firebase chega ao Service e vira mensagem em português', async () => {
    jest.mocked(createUserWithEmailAndPassword).mockRejectedValue({ code: 'auth/email-already-in-use' });

    const erro = await AuthService.cadastrar('ana@exemplo.com', 'segredo1').catch((e: unknown) => e);

    expect(AuthService.mensagemDeErro(erro)).toBe('Esse e-mail já tem conta. Use "Entrar".');
  });

  test('observar repassa entradas e saídas e devolve a função que para de ouvir', () => {
    const pararDeOuvir = jest.fn();
    let avisarFirebase: (user: unknown) => void = () => {};
    jest.mocked(onAuthStateChanged).mockImplementation((_auth, ouvinte) => {
      avisarFirebase = ouvinte as (user: unknown) => void;
      return pararDeOuvir;
    });
    const ouvinte = jest.fn();

    const cancelar = AuthService.observar(ouvinte);
    avisarFirebase({ uid: 'u1', email: 'ana@exemplo.com' });
    avisarFirebase(null);
    cancelar();

    expect(ouvinte).toHaveBeenNthCalledWith(1, { uid: 'u1', email: 'ana@exemplo.com' });
    expect(ouvinte).toHaveBeenNthCalledWith(2, null);
    expect(pararDeOuvir).toHaveBeenCalled();
  });

  test('sair chama o signOut do Firebase', async () => {
    await AuthService.sair();
    expect(signOut).toHaveBeenCalledWith({ nome: 'auth-de-teste' });
  });
});
