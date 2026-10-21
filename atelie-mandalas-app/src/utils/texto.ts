const SEM_ACENTO: Record<string, string> = {
  á: 'a', à: 'a', â: 'a', ã: 'a', ä: 'a',
  é: 'e', è: 'e', ê: 'e',
  í: 'i', ì: 'i', î: 'i',
  ó: 'o', ò: 'o', ô: 'o', õ: 'o', ö: 'o',
  ú: 'u', ù: 'u', û: 'u', ü: 'u',
  ç: 'c',
};

// Deixa o texto em minúsculas, sem acentos e sem espaços nas pontas.
// Assim a busca por "ceu" encontra "Céu".
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .replace(/[áàâãäéèêíìîóòôõöúùûüç]/g, (letra) => SEM_ACENTO[letra] ?? letra);
}

// "(32) 99999-0000" -> "32999990000"
export function apenasDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}