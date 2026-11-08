import { apenasDigitos } from './texto';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const moedaSemCentavos = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// 220 -> "R$ 220,00"
export function formatarMoeda(valor: number): string {
  return moeda.format(valor);
}

// (250, 320) -> "R$ 250 a R$ 320"
export function formatarFaixaPreco(minimo: number, maximo: number): string {
  return `${moedaSemCentavos.format(minimo)} a ${moedaSemCentavos.format(maximo)}`;
}

// Máscara de telefone enquanto a pessoa digita: "32999990000" -> "(32) 99999-0000"
export function formatarTelefone(texto: string): string {
  const d = apenasDigitos(texto).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}


// "2026-11-08 09:20:48", como o SQLite grava -> "08/11/2026 às 09:20"
// Feito só com texto, sem new Date(): a data já está na hora do aparelho,
// e converter para Date poderia aplicar o fuso de novo.
export function formatarDataHora(dataHora: string): string {
  const [data, hora = ''] = dataHora.split(' ');
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano} às ${hora.slice(0, 5)}`;
}

// (1, 'peça', 'peças') -> "1 peça"   |   (6, 'peça', 'peças') -> "6 peças"
export function formatarQuantidade(quantidade: number, singular: string, plural: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}