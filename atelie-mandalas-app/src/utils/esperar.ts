// Espera alguns milissegundos. Usado pelos repositories para imitar o tempo de uma API.
export function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}