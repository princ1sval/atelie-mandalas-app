import { apenasDigitos } from './texto';

// Telefone com DDD: 10 dígitos (fixo) ou 11 (celular).
export function ehTelefoneValido(texto: string): boolean {
  const quantidade = apenasDigitos(texto).length;
  return quantidade === 10 || quantidade === 11;
}