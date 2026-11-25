// Dados que a cliente guarda no perfil, para não digitar tudo a cada encomenda.
export interface Perfil {
  nome: string;
  whatsapp: string; // com a máscara, como no formulário: "(32) 99999-0000"
  fotoUri: string | null; // caminho do arquivo da foto no aparelho, nunca a imagem em texto
  cidade?: string; // preenchida pela localização na B2
}

// Perfil de quem ainda não salvou nada. Fica no model porque o Service e o contexto usam.
export function criarPerfilVazio(): Perfil {
  return { nome: '', whatsapp: '', fotoUri: null };
}
