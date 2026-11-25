import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Usuario } from '../model/Usuario';
import { AuthService } from '../services/AuthService';

export interface Sessao {
  usuario: Usuario | null; // null = ninguém logado
  verificando: boolean; // true até o Firebase ler a sessão salva, logo que o app abre
}

// null = fora do Provider. O hook useSessao avisa com um erro claro em vez de devolver undefined.
const SessaoContext = createContext<Sessao | null>(null);

// Quem está logado agora, para o app inteiro.
// Lido em telas distantes: a aba Perfil (Entrar ou Perfil), a Encomenda (pede login ao enviar)
// e o Perfil (mostra o e-mail). Antes, cada tela abria a própria escuta do Firebase;
// com o Provider há uma escuta só, e todas as telas veem o mesmo estado.
export function SessaoProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [verificando, setVerificando] = useState(true);

  // O Firebase avisa ao abrir o app e a cada entrada ou saída.
  // O return do observar é a função que para de ouvir: o useEffect a chama ao desmontar.
  useEffect(
    () =>
      AuthService.observar((atual) => {
        setUsuario(atual);
        setVerificando(false);
      }),
    [],
  );

  // useMemo: o objeto só muda quando um dos valores muda,
  // assim quem consome o contexto não redesenha à toa.
  const valor = useMemo(() => ({ usuario, verificando }), [usuario, verificando]);

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>;
}

// Hook customizado: a tela não precisa conhecer o SessaoContext, só chamar useSessao().
export function useSessao(): Sessao {
  const sessao = useContext(SessaoContext);
  if (!sessao) throw new Error('useSessao precisa estar dentro de <SessaoProvider>.');
  return sessao;
}
