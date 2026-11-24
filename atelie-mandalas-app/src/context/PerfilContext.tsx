import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { Perfil } from '../model/Perfil';
import { PerfilService } from '../services/PerfilService';
import { criarEstadoInicialPerfil, perfilReducer } from './perfilReducer';

export interface PerfilContextValor {
  perfil: Perfil; // o perfil salvo no aparelho
  carregando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>; // lê de novo do AsyncStorage (ex.: depois do "Apagar meus dados")
  salvar: (novo: Perfil) => Promise<Perfil>; // grava e avisa todas as telas
}

const PerfilContext = createContext<PerfilContextValor | null>(null);

// O perfil é lido e alterado em abas diferentes: a Início mostra "Olá, Ana!", a Encomenda
// preenche nome e WhatsApp, o Perfil edita e o Meus pedidos apaga. As abas ficam montadas,
// então todas precisam do mesmo perfil. Antes isso era feito com um observer manual no
// PerfilService; o contexto é o jeito do React de compartilhar esse estado.
//
// Padrão da persistência: lê do armazenamento ao abrir, muda o estado durante o uso e grava ao salvar.
export function PerfilProvider({ children }: { children: ReactNode }) {
  // useReducer: o perfil tem vários estados (carregando, carregou, falhou, salvou),
  // e o reducer junta essas regras num lugar só (perfilReducer.ts).
  const [estado, dispatch] = useReducer(perfilReducer, undefined, criarEstadoInicialPerfil);

  const recarregar = useCallback(async () => {
    dispatch({ tipo: 'carregando' });
    try {
      dispatch({ tipo: 'carregou', perfil: await PerfilService.carregar() });
    } catch {
      dispatch({ tipo: 'falhou', mensagem: 'Não foi possível carregar o seu perfil.' });
    }
  }, []);

  // Lê o perfil salvo uma vez, quando o app abre.
  useEffect(() => {
    recarregar();
  }, [recarregar]);

  // O Service precisa do perfil anterior para saber se a foto mudou e qual arquivo apagar.
  const perfilSalvo = estado.perfil;
  const salvar = useCallback(
    async (novo: Perfil) => {
      const salvo = await PerfilService.salvar(novo, perfilSalvo);
      dispatch({ tipo: 'salvou', perfil: salvo });
      return salvo;
    },
    [perfilSalvo],
  );

  const valor = useMemo(
    () => ({ perfil: estado.perfil, carregando: estado.carregando, erro: estado.erro, recarregar, salvar }),
    [estado, recarregar, salvar],
  );

  return <PerfilContext.Provider value={valor}>{children}</PerfilContext.Provider>;
}

export function usePerfil(): PerfilContextValor {
  const valor = useContext(PerfilContext);
  if (!valor) throw new Error('usePerfil precisa estar dentro de <PerfilProvider>.');
  return valor;
}
