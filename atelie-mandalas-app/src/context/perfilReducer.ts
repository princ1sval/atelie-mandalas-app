import { criarPerfilVazio, Perfil } from '../model/Perfil';

// Estado do perfil compartilhado entre as telas.
export interface EstadoPerfil {
  perfil: Perfil; // o que está salvo no aparelho
  carregando: boolean; // lendo o AsyncStorage
  erro: string | null; // não deu para ler o perfil salvo
}

// Tudo o que pode acontecer com o perfil. Cada ação vira um caso do reducer.
export type AcaoPerfil =
  | { tipo: 'carregando' }
  | { tipo: 'carregou'; perfil: Perfil }
  | { tipo: 'falhou'; mensagem: string }
  | { tipo: 'salvou'; perfil: Perfil };

export function criarEstadoInicialPerfil(): EstadoPerfil {
  return { perfil: criarPerfilVazio(), carregando: true, erro: null };
}

// Função pura: recebe o estado e a ação e devolve o estado novo, sem tocar no armazenamento.
// Por isso é fácil de testar e de explicar. Quem lê e grava é o PerfilProvider, pelo PerfilService.
export function perfilReducer(estado: EstadoPerfil, acao: AcaoPerfil): EstadoPerfil {
  switch (acao.tipo) {
    case 'carregando':
      // Mantém o perfil anterior na tela enquanto lê de novo.
      return { ...estado, carregando: true, erro: null };
    case 'carregou':
      return { perfil: acao.perfil, carregando: false, erro: null };
    case 'falhou':
      return { ...estado, carregando: false, erro: acao.mensagem };
    case 'salvou':
      return { ...estado, perfil: acao.perfil, erro: null };
    default:
      return estado;
  }
}
