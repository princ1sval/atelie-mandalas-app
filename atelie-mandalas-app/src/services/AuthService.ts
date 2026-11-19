import { Usuario } from '../model/Usuario';
import { authRepository } from '../data/remote/AuthRepository';

export type ModoConta = 'entrar' | 'cadastro';

export interface CamposConta {
  email: string;
  senha: string;
  confirmacao: string; // só no cadastro
}

// Mensagem de erro por campo. Ex.: { email: 'Informe um e-mail válido.' }
export type ErrosConta = Partial<Record<keyof CamposConta, string>>;

const SENHA_MINIMA = 6; // o mínimo que o Firebase aceita

function validar(campos: CamposConta, modo: ModoConta): ErrosConta {
  const erros: ErrosConta = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email.trim())) {
    erros.email = 'Informe um e-mail válido.';
  }
  if (modo === 'entrar') {
    if (campos.senha === '') erros.senha = 'Informe a senha.';
  } else {
    if (campos.senha.length < SENHA_MINIMA) erros.senha = `Use pelo menos ${SENHA_MINIMA} caracteres.`;
    if (campos.confirmacao !== campos.senha) erros.confirmacao = 'As senhas não são iguais.';
  }
  return erros;
}

function temErros(erros: ErrosConta): boolean {
  return Object.keys(erros).length > 0;
}

// O Firebase responde com códigos em inglês, como "auth/email-already-in-use".
// A tela mostra a mensagem em português; o que não estiver na lista ganha uma mensagem geral.
const MENSAGENS: Record<string, string> = {
  'auth/invalid-email': 'Esse e-mail não é válido.',
  'auth/email-already-in-use': 'Esse e-mail já tem conta. Use "Entrar".',
  'auth/weak-password': 'Senha fraca: use pelo menos 6 caracteres.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/too-many-requests': 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet. Confira e tente de novo.',
  'auth/operation-not-allowed': 'O login por e-mail ainda não foi ligado no console do Firebase.',
  'auth/configuration-not-found': 'O login por e-mail ainda não foi ligado no console do Firebase.',
  'auth/invalid-api-key': 'Falta a configuração do Firebase. Confira o arquivo .env.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'A configuração do Firebase está errada. Confira o arquivo .env.',
};

function mensagemDeErro(erro: unknown): string {
  const codigo = typeof erro === 'object' && erro !== null && 'code' in erro ? String(erro.code) : '';
  return MENSAGENS[codigo] ?? 'Não foi possível concluir agora. Tente de novo.';
}

function entrar(email: string, senha: string): Promise<Usuario> {
  return authRepository.entrar(email.trim(), senha);
}

function cadastrar(email: string, senha: string): Promise<Usuario> {
  return authRepository.cadastrar(email.trim(), senha);
}

function sair(): Promise<void> {
  return authRepository.sair();
}

function observar(ouvinte: (usuario: Usuario | null) => void): () => void {
  return authRepository.observar(ouvinte);
}

export const AuthService = {
  validar,
  temErros,
  mensagemDeErro,
  entrar,
  cadastrar,
  sair,
  observar,
};
