import { useCallback, useEffect, useState } from 'react';
import { Atelie } from '../model/Atelie';
import { AtelieService } from '../services/AtelieService';

export interface InicioViewModel {
  atelie: Atelie | null; // textos da história, significado e técnica
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

export function useInicioViewModel(): InicioViewModel {
  const [atelie, setAtelie] = useState<Atelie | null>(null);
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

  return { atelie, carregando, erro, recarregar: carregar };
}