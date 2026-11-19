import { useCallback, useEffect, useState } from 'react';
import { Perfil } from '../model/Perfil';
import { ErrosPerfil, PerfilService } from '../services/PerfilService';
import { ImagemService, ResultadoImagem } from '../services/ImagemService';
import { formatarTelefone } from '../utils/formatters';

export interface PerfilViewModel {
  perfil: Perfil; // como está na tela, ainda sem salvar
  erros: ErrosPerfil; // só aparecem depois da primeira tentativa de salvar
  fotoDisponivel: boolean; // false no navegador, que não tem onde guardar o arquivo
  carregando: boolean;
  erro: string | null; // não deu para ler o perfil salvo
  avisoFoto: string | null; // permissão negada ou câmera que não abriu
  salvando: boolean;
  erroSalvar: string | null;
  salvoAgora: boolean; // mostra "Perfil salvo" até a próxima alteração
  recarregar: () => void;
  alterarNome: (texto: string) => void;
  alterarWhatsapp: (texto: string) => void;
  tirarFoto: () => void;
  escolherDaGaleria: () => void;
  removerFoto: () => void;
  salvar: () => void;
}

export function usePerfilViewModel(): PerfilViewModel {
  // Duas cópias do perfil: "salvo" é o que está no aparelho e "perfil" é o que está na tela.
  // Comparando as duas, o Service sabe se a foto mudou e qual arquivo antigo apagar.
  const [salvo, setSalvo] = useState<Perfil>(PerfilService.criarPerfilVazio);
  const [perfil, setPerfil] = useState<Perfil>(PerfilService.criarPerfilVazio);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [avisoFoto, setAvisoFoto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [salvoAgora, setSalvoAgora] = useState(false);

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
    carregando,
    erro,
    avisoFoto,
    salvando,
    erroSalvar,
    salvoAgora,
    recarregar: carregar,
    alterarNome: (texto) => alterar({ nome: texto }),
    alterarWhatsapp: (texto) => alterar({ whatsapp: formatarTelefone(texto) }), // máscara enquanto digita
    tirarFoto: () => usarImagem(ImagemService.tirarFoto, 'câmera'),
    escolherDaGaleria: () => usarImagem(ImagemService.escolherDaGaleria, 'galeria'),
    removerFoto: () => alterar({ fotoUri: null }),
    salvar,
  };
}
