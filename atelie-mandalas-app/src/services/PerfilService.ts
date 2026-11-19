import { Perfil } from '../model/Perfil';
import { perfilRepository } from '../data/repositories/PerfilRepository';
import { fotoRepository } from '../data/repositories/FotoRepository';
import { ehTelefoneValido } from '../utils/validators';

// Mensagem de erro por campo do perfil. Ex.: { nome: 'Informe seu nome.' }
export type ErrosPerfil = Partial<Record<'nome' | 'whatsapp', string>>;

// ---------- Aviso de mudança ----------
// Início, Perfil e Encomenda ficam montados nas abas. Quando o perfil é salvo ou apagado,
// o Service avisa quem está ouvindo e entrega o perfil novo, como o NetInfo.addEventListener
// entrega o estado da conexão (seção 2.5).
type Ouvinte = (perfil: Perfil) => void;
const ouvintes = new Set<Ouvinte>();

// Devolve a função que para de ouvir: é o que o useEffect chama ao desmontar a tela.
function observar(ouvinte: Ouvinte): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function avisarMudanca(perfil: Perfil) {
  ouvintes.forEach((ouvinte) => ouvinte(perfil));
}

// ---------- Perfil ----------

function criarPerfilVazio(): Perfil {
  return { nome: '', whatsapp: '', fotoUri: null };
}

// O que vem do armazenamento é conferido campo a campo, como no rascunho:
// um valor estranho volta ao padrão em vez de quebrar a tela.
function restaurar(salvo: Partial<Perfil>): Perfil {
  const texto = (valor: unknown) => (typeof valor === 'string' ? valor : '');
  const perfil: Perfil = {
    nome: texto(salvo.nome),
    whatsapp: texto(salvo.whatsapp),
    fotoUri: typeof salvo.fotoUri === 'string' ? salvo.fotoUri : null,
  };
  if (typeof salvo.cidade === 'string') perfil.cidade = salvo.cidade;
  return perfil;
}

async function carregar(): Promise<Perfil> {
  const salvo = await perfilRepository.carregar();
  return salvo ? restaurar(salvo) : criarPerfilVazio();
}

// Nome obrigatório. WhatsApp opcional, mas com DDD quando preenchido.
function validar(perfil: Perfil): ErrosPerfil {
  const erros: ErrosPerfil = {};
  if (perfil.nome.trim().length < 2) {
    erros.nome = 'Informe seu nome.';
  }
  if (perfil.whatsapp.trim() !== '' && !ehTelefoneValido(perfil.whatsapp)) {
    erros.whatsapp = 'Informe um WhatsApp com DDD.';
  }
  return erros;
}

function temErros(erros: ErrosPerfil): boolean {
  return Object.keys(erros).length > 0;
}

// Salva o perfil. Se a foto mudou, guarda a nova na pasta do app e só depois apaga a antiga:
// assim o perfil nunca aponta para um arquivo apagado, e nenhuma foto fica esquecida (seção 7.3).
async function salvar(novo: Perfil, anterior: Perfil): Promise<Perfil> {
  if (temErros(validar(novo))) {
    throw new Error('Perfil inválido: confira os campos destacados.');
  }

  const fotoMudou = novo.fotoUri !== anterior.fotoUri;
  const fotoUri = fotoMudou && novo.fotoUri ? await fotoRepository.guardar(novo.fotoUri) : novo.fotoUri;

  const perfil: Perfil = { ...novo, nome: novo.nome.trim(), fotoUri };
  await perfilRepository.salvar(perfil);

  if (fotoMudou && anterior.fotoUri) fotoRepository.apagar(anterior.fotoUri);
  avisarMudanca(perfil);
  return perfil;
}

// Apaga o perfil e a foto. Faz parte do "Apagar meus dados" (seção 7.3).
async function apagar(): Promise<void> {
  const perfil = await carregar();
  if (perfil.fotoUri) fotoRepository.apagar(perfil.fotoUri);
  await perfilRepository.limpar();
  avisarMudanca(criarPerfilVazio());
}

export const PerfilService = {
  criarPerfilVazio,
  carregar,
  validar,
  temErros,
  salvar,
  apagar,
  observar,
};
