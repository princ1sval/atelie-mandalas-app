import { useCallback, useEffect, useState } from 'react';
import { Perfil } from '../model/Perfil';
import { ErrosPerfil, PerfilService } from '../services/PerfilService';
import { ImagemService, ResultadoImagem } from '../services/ImagemService';
import { LocalizacaoService, ResultadoLocalizacao } from '../services/LocalizacaoService';
import { AuthService } from '../services/AuthService';
import { formatarDistancia, formatarTelefone } from '../utils/formatters';
import { useSessao } from './useSessao';

export interface PerfilViewModel {
  perfil: Perfil; // como está na tela, ainda sem salvar
  erros: ErrosPerfil; // só aparecem depois da primeira tentativa de salvar
  fotoDisponivel: boolean; // false no navegador, que não tem onde guardar o arquivo
  localizacaoDisponivel: boolean; // false no navegador, que não transforma o GPS em cidade
  carregando: boolean;
  erro: string | null; // não deu para ler o perfil salvo
  avisoFoto: string | null; // permissão negada ou câmera que não abriu
  buscandoCidade: boolean;
  avisoCidade: string | null; // permissão negada, GPS desligado ou cidade não encontrada
  distanciaTexto: string | null; // "Você está a 4 km do ateliê." Só nesta visita: não é guardada
  salvando: boolean;
  erroSalvar: string | null;
  salvoAgora: boolean; // mostra "Perfil salvo" até a próxima alteração
  emailDaConta: string | null; // e-mail de quem está logado
  avisoConta: string | null; // se sair da conta falhar
  recarregar: () => void;
  sairDaConta: () => void;
  alterarNome: (texto: string) => void;
  alterarWhatsapp: (texto: string) => void;
  alterarCidade: (texto: string) => void;
  usarMinhaLocalizacao: () => void;
  tirarFoto: () => void;
  escolherDaGaleria: () => void;
  removerFoto: () => void;
  salvar: () => void;
}

// Um aviso para cada jeito de a localização não dar certo. Em todos, a cliente pode digitar a cidade.
const AVISOS_LOCALIZACAO: Record<Exclude<ResultadoLocalizacao['tipo'], 'ok'>, string> = {
  'sem-permissao': 'Sem acesso à localização. Você pode liberar nos Ajustes do celular ou digitar a cidade.',
  'gps-desligado': 'A localização do celular está desligada. Ligue nos Ajustes ou digite a cidade.',
  falhou: 'Não foi possível descobrir a sua cidade agora. Você pode digitá-la.',
};

export function usePerfilViewModel(): PerfilViewModel {
  // Duas cópias do perfil: "salvo" é o que está no aparelho e "perfil" é o que está na tela.
  // Comparando as duas, o Service sabe se a foto mudou e qual arquivo antigo apagar.
  const [salvo, setSalvo] = useState<Perfil>(PerfilService.criarPerfilVazio);
  const [perfil, setPerfil] = useState<Perfil>(PerfilService.criarPerfilVazio);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [avisoFoto, setAvisoFoto] = useState<string | null>(null);
  const [buscandoCidade, setBuscandoCidade] = useState(false);
  const [avisoCidade, setAvisoCidade] = useState<string | null>(null);
  const [distanciaTexto, setDistanciaTexto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [salvoAgora, setSalvoAgora] = useState(false);
  const { usuario } = useSessao();
  const [avisoConta, setAvisoConta] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const atual = await PerfilService.carregar();
      setSalvo(atual);
      setPerfil(atual);
    } catch {
      setErro('Não foi possível carregar o seu perfil.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    // Se o perfil mudar em outra tela, como no "Apagar meus dados", esta tela mostra o novo.
    return PerfilService.observar((atual) => {
      setSalvo(atual);
      setPerfil(atual);
      setTentouSalvar(false);
      setSalvoAgora(false);
      setAvisoFoto(null);
      setAvisoCidade(null);
      setDistanciaTexto(null);
    });
  }, [carregar]);

  function alterar(campos: Partial<Perfil>) {
    setPerfil((atual) => ({ ...atual, ...campos }));
    setSalvoAgora(false); // mudou algo: o "Perfil salvo" sai da tela
  }

  // Câmera e galeria seguem o mesmo caminho: pedir a foto, conferir o resultado e mostrar.
  // A foto aparece na hora, mas só vai para a pasta do app quando a cliente toca em "Salvar".
  async function usarImagem(pedir: () => Promise<ResultadoImagem>, origem: 'câmera' | 'galeria') {
    setAvisoFoto(null);
    try {
      const resultado = await pedir();
      if (resultado.tipo === 'foto') alterar({ fotoUri: resultado.uri });
      if (resultado.tipo === 'sem-permissao') {
        setAvisoFoto(`Sem acesso à ${origem}. Você pode liberar nos Ajustes do celular.`);
      }
      // 'cancelado': a pessoa desistiu, não há nada a fazer.
    } catch {
      setAvisoFoto(`Não foi possível abrir a ${origem}.`);
    }
  }

  // Preenche a cidade pelo GPS. Como a foto, ela só fica guardada depois do "Salvar".
  // A distância aparece na hora e não é guardada: o app guarda só a cidade.
  async function usarMinhaLocalizacao() {
    setAvisoCidade(null);
    setBuscandoCidade(true);
    try {
      const resultado = await LocalizacaoService.buscarCidade();
      if (resultado.tipo === 'ok') {
        alterar({ cidade: resultado.cidade });
        setDistanciaTexto(`Você está a ${formatarDistancia(resultado.distanciaKm)} do ateliê.`);
      } else {
        setAvisoCidade(AVISOS_LOCALIZACAO[resultado.tipo]);
      }
    } catch {
      setAvisoCidade(AVISOS_LOCALIZACAO.falhou);
    } finally {
      setBuscandoCidade(false);
    }
  }

  // Sai da conta: o Firebase apaga a sessão do SecureStore, e a aba Perfil volta sozinha
  // para a tela Entrar. Apagar também os dados do aparelho ao sair fica para a B6 (seção 9).
  async function sairDaConta() {
    setAvisoConta(null);
    try {
      await AuthService.sair();
    } catch {
      setAvisoConta('Não foi possível sair agora. Tente de novo.');
    }
  }

  async function salvar() {
    setTentouSalvar(true); // a partir daqui os erros aparecem
    setErroSalvar(null);
    if (PerfilService.temErros(PerfilService.validar(perfil))) return;

    setSalvando(true);
    try {
      // O Service devolve o perfil com o caminho definitivo da foto, já fora do cache.
      const atualizado = await PerfilService.salvar(perfil, salvo);
      setSalvo(atualizado);
      setPerfil(atualizado);
      setSalvoAgora(true);
    } catch {
      setErroSalvar('Não foi possível salvar o perfil. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return {
    perfil,
    erros: tentouSalvar ? PerfilService.validar(perfil) : {},
    fotoDisponivel: ImagemService.disponivel(),
    localizacaoDisponivel: LocalizacaoService.disponivel(),
    carregando,
    erro,
    avisoFoto,
    buscandoCidade,
    avisoCidade,
    distanciaTexto,
    salvando,
    erroSalvar,
    salvoAgora,
    emailDaConta: usuario?.email ?? null,
    avisoConta,
    recarregar: carregar,
    sairDaConta,
    alterarNome: (texto) => alterar({ nome: texto }),
    alterarWhatsapp: (texto) => alterar({ whatsapp: formatarTelefone(texto) }), // máscara enquanto digita
    alterarCidade: (texto) => {
      alterar({ cidade: texto });
      setDistanciaTexto(null); // cidade digitada: a distância do GPS já não vale para ela
    },
    usarMinhaLocalizacao,
    tirarFoto: () => usarImagem(ImagemService.tirarFoto, 'câmera'),
    escolherDaGaleria: () => usarImagem(ImagemService.escolherDaGaleria, 'galeria'),
    removerFoto: () => alterar({ fotoUri: null }),
    salvar,
  };
}
