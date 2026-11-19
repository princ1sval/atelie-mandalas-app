// Quem está logado. Só o que o app usa: o identificador do Firebase e o e-mail (seção 7.3).
export interface Usuario {
  uid: string;
  email: string | null;
}
