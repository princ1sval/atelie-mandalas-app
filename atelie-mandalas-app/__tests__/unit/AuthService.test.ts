import { AuthService } from '../../src/services/AuthService';

describe('AuthService.validar', () => {
  test('ao entrar, exige e-mail válido e senha preenchida', () => {
    const erros = AuthService.validar({ email: 'ana@', senha: '', confirmacao: '' }, 'entrar');
    expect(erros.email).toBe('Informe um e-mail válido.');
    expect(erros.senha).toBe('Informe a senha.');
  });

  test('no cadastro, exige 6 caracteres e confirmação igual à senha', () => {
    const erros = AuthService.validar({ email: 'ana@exemplo.com', senha: '123', confirmacao: '321' }, 'cadastro');
    expect(erros.email).toBeUndefined();
    expect(erros.senha).toBe('Use pelo menos 6 caracteres.');
    expect(erros.confirmacao).toBe('As senhas não são iguais.');
  });

  test('cadastro correto não tem erros', () => {
    const erros = AuthService.validar({ email: ' ana@exemplo.com ', senha: '123456', confirmacao: '123456' }, 'cadastro');
    expect(AuthService.temErros(erros)).toBe(false);
  });
});

describe('AuthService.mensagemDeErro', () => {
  test('traduz o código do Firebase para português', () => {
    expect(AuthService.mensagemDeErro({ code: 'auth/invalid-credential' })).toBe('E-mail ou senha incorretos.');
    expect(AuthService.mensagemDeErro({ code: 'auth/network-request-failed' })).toMatch(/Sem conexão/);
  });

  test('código desconhecido ou erro sem código ganham a mensagem geral', () => {
    const geral = 'Não foi possível concluir agora. Tente de novo.';
    expect(AuthService.mensagemDeErro({ code: 'auth/qualquer-coisa' })).toBe(geral);
    expect(AuthService.mensagemDeErro(new Error('falhou'))).toBe(geral);
    expect(AuthService.mensagemDeErro(null)).toBe(geral);
  });
});
