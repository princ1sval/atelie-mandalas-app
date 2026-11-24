import { AuthService } from '../../src/services/AuthService';

// Sem o .env, o jest.setup.ts deixa auth = null, como no app sem configuração.
// O app abre do mesmo jeito: o catálogo funciona e só a conta fica indisponível.
describe('AuthService sem o Firebase configurado', () => {
  test('entrar falha com um aviso claro, em vez de quebrar o app', async () => {
    const erro = await AuthService.entrar('ana@exemplo.com', 'segredo1').catch((e: unknown) => e);
    expect(AuthService.mensagemDeErro(erro)).toBe('Falta a configuração do Firebase. Confira o arquivo .env.');
  });

  test('observar avisa na hora que ninguém está logado', () => {
    const ouvinte = jest.fn();
    const cancelar = AuthService.observar(ouvinte);
    expect(ouvinte).toHaveBeenCalledWith(null);
    expect(() => cancelar()).not.toThrow();
  });
});
