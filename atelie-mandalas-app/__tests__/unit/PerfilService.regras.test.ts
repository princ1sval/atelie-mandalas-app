import { PerfilService } from '../../src/services/PerfilService';
import { perfil } from '../helpers/fabricas';

describe('PerfilService.validar', () => {
  test('nome com menos de 2 letras tem erro', () => {
    expect(PerfilService.validar(perfil({ nome: ' A ' })).nome).toBe('Informe seu nome.');
  });

  test('WhatsApp é opcional: vazio é aceito, mas incompleto tem erro', () => {
    expect(PerfilService.validar(perfil({ whatsapp: '' }))).toEqual({});
    expect(PerfilService.validar(perfil({ whatsapp: '(32) 9999' })).whatsapp).toBe('Informe um WhatsApp com DDD.');
  });
});
