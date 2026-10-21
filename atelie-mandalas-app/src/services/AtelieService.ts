import { Atelie } from '../model/Atelie';
import { Mandala } from '../model/Mandala';
import { atelieRepository } from '../data/repositories/AtelieRepository';

function obterInformacoes(): Promise<Atelie> {
  return atelieRepository.obter();
}

function montarLinkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

// Link para o botão "Tenho interesse" do Detalhe.
async function linkInteresse(mandala: Mandala): Promise<string> {
  const atelie = await atelieRepository.obter();
  const mensagem = `Olá, Malu! Vi a mandala "${mandala.nome}" no app e tenho interesse. Ela ainda está disponível?`;
  return montarLinkWhatsApp(atelie.whatsapp, mensagem);
}

// Link para o "Chamar no WhatsApp" do FAQ.
async function linkDuvida(): Promise<string> {
  const atelie = await atelieRepository.obter();
  return montarLinkWhatsApp(atelie.whatsapp, 'Olá, Malu! Vim pelo app e tenho uma dúvida.');
}

export const AtelieService = {
  obterInformacoes,
  linkInteresse,
  linkDuvida,
};