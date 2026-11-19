import { Directory, File, Paths } from 'expo-file-system';

// A foto é um arquivo, não texto: fica numa pasta do app, e o perfil guarda só o caminho.
// É a seção 6 do material (armazenamento de arquivos), que na Parte A ficou de fora.
export interface FotoRepository {
  guardar(uriTemporaria: string): Promise<string>;
  apagar(uri: string): void;
}

export const fotoRepository: FotoRepository = {
  // O picker devolve a foto no cache, que o sistema pode limpar a qualquer hora (seção 8.2).
  // Por isso ela é copiada para a pasta de documentos do app, que só some ao desinstalar (6.1).
  async guardar(uriTemporaria) {
    const pasta = new Directory(Paths.document, 'perfil');
    if (!pasta.exists) pasta.create({ intermediates: true });
    const destino = new File(pasta, `foto-${Date.now()}.jpg`);
    await new File(uriTemporaria).copy(destino);
    return destino.uri;
  },

  // Apaga o arquivo da foto. Se ele já não existir, não faz nada.
  apagar(uri) {
    try {
      const arquivo = new File(uri);
      if (arquivo.exists) arquivo.delete();
    } catch {
      // Se não der para apagar, o arquivo fica, mas o perfil já não aponta para ele.
    }
  },
};
