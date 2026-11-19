import { useCallback, useEffect, useState } from 'react';
import { Atelie } from '../model/Atelie';
import { Perfil } from '../model/Perfil';
import { AtelieService } from '../services/AtelieService';
import { PerfilService } from '../services/PerfilService';
import { primeiroNome } from '../utils/texto';

// Saudação do topo da Início, montada com o perfil salvo.
export interface SaudacaoInicio {
  texto: string; // "Olá, Ana!"
  nome: string; // nome completo, para as iniciais quando não há foto
  fotoUri: string | null;
}

export interface InicioViewModel {
  atelie: Atelie | null; // textos da história, significado e técnica
  saudacao: SaudacaoInicio | null; // null enquanto a cliente não tem perfil
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

export function useInicioViewModel(): InicioViewModel {
  const [atelie, setAtelie] = useState<Atelie | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setAtelie(await AtelieService.obterInformacoes());
    } catch {
      setErro('Não foi possível carregar as informações do ateliê.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // A saudação usa o perfil salvo e muda junto com ele, quando a cliente salva ou apaga.
  useEffect(() => {
    PerfilService.carregar()
      .then((salvo) => setPerfil(salvo))
      .catch(() => {
        // Sem perfil, a Início só não mostra a saudação.
      });
    return PerfilService.observar((novo) => setPerfil(novo));
  }, []);

  const saudacao = perfil?.nome
    ? { texto: `Olá, ${primeiroNome(perfil.nome)}!`, nome: perfil.nome, fotoUri: perfil.fotoUri }
    : null;

  return { atelie, saudacao, carregando, erro, recarregar: carregar };
}
