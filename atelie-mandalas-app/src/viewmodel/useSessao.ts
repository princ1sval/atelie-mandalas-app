import { useEffect, useState } from 'react';
import { Usuario } from '../model/Usuario';
import { AuthService } from '../services/AuthService';

export interface Sessao {
  usuario: Usuario | null; // null = ninguém logado
  verificando: boolean; // true até o Firebase ler a sessão salva, logo que o app abre
}

// Quem está logado agora. Atualiza sozinho ao entrar e ao sair, porque ouve o Firebase
// (onAuthStateChanged), no mesmo jeito de ouvir do NetInfo (seção 2.5).
export function useSessao(): Sessao {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [verificando, setVerificando] = useState(true);

  // O return do observar é a função que para de ouvir: o useEffect a chama ao desmontar.
  useEffect(
    () =>
      AuthService.observar((atual) => {
        setUsuario(atual);
        setVerificando(false);
      }),
    [],
  );

  return { usuario, verificando };
}
