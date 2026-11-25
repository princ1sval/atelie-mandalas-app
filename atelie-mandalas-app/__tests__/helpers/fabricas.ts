import { PedidoEncomenda } from '../../src/model/Encomenda';
import { Mandala } from '../../src/model/Mandala';
import { Perfil } from '../../src/model/Perfil';
import { PedidoParaSalvar } from '../../src/db/PedidoDao';

// Fábricas de dados de teste: cada teste muda só o campo que importa para ele.

export function pedidoValido(campos: Partial<PedidoEncomenda> = {}): PedidoEncomenda {
  return {
    nome: 'Ana Souza',
    whatsapp: '(32) 99999-0000',
    tema: 'familia',
    tamanhoCm: 30,
    cores: 'verde e creme',
    ideia: 'Mandala para a família toda, com quatro corações.',
    presente: false,
    ...campos,
  };
}

export function pedidoParaSalvar(campos: Partial<PedidoParaSalvar> = {}): PedidoParaSalvar {
  return {
    protocolo: 'MM-000001',
    tema: 'pet',
    tamanhoCm: 30,
    cores: 'azul',
    ideia: 'Mandala com as patinhas do Thor.',
    presente: false,
    estimativa: { precoMinimo: 235, precoMaximo: 305, prazoDias: 20 },
    ...campos,
  };
}

export function perfil(campos: Partial<Perfil> = {}): Perfil {
  return { nome: 'Ana Souza', whatsapp: '(32) 99999-0000', fotoUri: null, ...campos };
}

export function mandala(campos: Partial<Mandala> = {}): Mandala {
  return {
    id: 'm1',
    nome: 'Céu',
    origem: 'prontaEntrega',
    subtitulo: 'Mandala de teste',
    descricao: 'Descrição de teste.',
    tecnica: 'Pontilhismo',
    base: 'MDF',
    tamanhoCm: 30,
    cores: ['azul', 'dourado'],
    preco: 220,
    imagem: 1,
    descricaoImagem: 'Mandala azul de teste',
    ...campos,
  };
}
