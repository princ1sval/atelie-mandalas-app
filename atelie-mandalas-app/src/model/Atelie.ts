// Um ponto no mapa, em graus.
export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export interface SimboloMandala {
  id: string;
  nome: string;
  descricao: string;
}

// Conteúdo institucional mostrado na tela Início.
export interface Atelie {
  nome: string;
  instagram: string;
  whatsapp: string; // só números, com 55 + DDD
  coordenadas: Coordenadas; // ponto aproximado do ateliê, para a distância no Perfil
  slogan: string;
  boasVindas: string;
  historia: {
    titulo: string;
    texto: string;
    citacao: string;
    complementoCitacao: string;
  };
  significado: {
    titulo: string;
    texto: string;
    simbolos: SimboloMandala[];
  };
  tecnica: {
    titulo: string;
    texto: string;
  };
}