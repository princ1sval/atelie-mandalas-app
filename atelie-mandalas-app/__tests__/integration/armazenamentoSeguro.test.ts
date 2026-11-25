import * as SecureStore from 'expo-secure-store';
import { armazenamentoSeguro } from '../../src/data/remote/armazenamentoSeguro';

// O Firebase guarda a sessão pelo armazenamentoSeguro, que escreve no SecureStore
// (o jest.setup.ts troca o Keychain/Keystore por um Map na memória).
describe('armazenamentoSeguro (sessão do Firebase no SecureStore)', () => {
  const chaveFirebase = 'firebase:authUser:abc123:[DEFAULT]';

  test('troca os caracteres que o SecureStore não aceita e guarda o token', async () => {
    await armazenamentoSeguro.setItem(chaveFirebase, '{"token":"xyz"}');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('firebase_authUser_abc123__DEFAULT_', '{"token":"xyz"}');
    expect(await armazenamentoSeguro.getItem(chaveFirebase)).toBe('{"token":"xyz"}');
  });

  test('ao sair, a sessão é apagada', async () => {
    await armazenamentoSeguro.setItem(chaveFirebase, 'token');
    await armazenamentoSeguro.removeItem(chaveFirebase);
    expect(await armazenamentoSeguro.getItem(chaveFirebase)).toBeNull();
  });
});
