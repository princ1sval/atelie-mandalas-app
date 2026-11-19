import { useState } from 'react';
import { AuthService, ErrosConta, ModoConta } from '../services/AuthService';

export interface AuthViewModel {
  email: string;
  senha: string;
  confirmacao: string;
  erros: ErrosConta; // só aparecem depois da primeira tentativa
  enviando: boolean;
  erro: string | null; // resposta do Firebase, já em português
  alterarEmail: (texto: string) => void;
  alterarSenha: (texto: string) => void;
  alterarConfirmacao: (texto: string) => void;
  enviar: () => void;
}

// Formulário das telas Entrar e Criar conta.
// A senha só existe na memória da tela e vai direto para o Firebase: o app nunca a guarda (seção 7.2).
export function useAuthViewModel(modo: ModoConta): AuthViewModel {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const campos = { email, senha, confirmacao };

  async function enviar() {
    setTentou(true); // a partir daqui os erros aparecem
    setErro(null);
    if (AuthService.temErros(AuthService.validar(campos, modo))) return;

    setEnviando(true);
    try {
      if (modo === 'entrar') await AuthService.entrar(email, senha);
      else await AuthService.cadastrar(email, senha);
      // Deu certo: a aba Perfil troca para o perfil sozinha, porque ouve o Firebase (useSessao).
    } catch (falha) {
      setErro(AuthService.mensagemDeErro(falha));
    } finally {
      setEnviando(false);
    }
  }

  return {
    email,
    senha,
    confirmacao,
    erros: tentou ? AuthService.validar(campos, modo) : {},
    enviando,
    erro,
    alterarEmail: setEmail,
    alterarSenha: setSenha,
    alterarConfirmacao: setConfirmacao,
    enviar,
  };
}
