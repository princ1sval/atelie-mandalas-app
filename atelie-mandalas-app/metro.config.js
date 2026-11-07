// Configuração do Metro, o empacotador que o Expo usa para montar o app.
// Ela existe só para o app abrir no navegador. No iPhone e no Android nada muda.
// Parte vem do guia de web que acompanha o pacote:
// node_modules/expo-sqlite/skills/expo-sqlite/references/web-and-config.md
const http = require('http');
const { getDefaultConfig } = require('expo/metro-config');

// Parte da configuração padrão do Expo e só acrescenta o que o SQLite precisa.
const config = getDefaultConfig(__dirname);

// 1) No navegador, o SQLite roda em WebAssembly, um arquivo .wasm.
//    Sem esta linha, o Metro não aceita esse tipo de arquivo e a versão web nem monta.
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

// 2) A API síncrona do SQLite usa SharedArrayBuffer, que o navegador só libera
//    quando a página chega com estes dois cabeçalhos de segurança.
//    O guia usa config.server.enhanceMiddleware, mas no SDK 58 o Expo responde a página
//    antes de passar pelo Metro, e os cabeçalhos ficavam só nos arquivos JavaScript.
//    Por isso eles entram em toda resposta do servidor de desenvolvimento (npx expo start).
//    Um site publicado precisaria mandar os mesmos cabeçalhos.
const writeHeadOriginal = http.ServerResponse.prototype.writeHead;
http.ServerResponse.prototype.writeHead = function (...args) {
  this.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  this.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  return writeHeadOriginal.apply(this, args);
};

module.exports = config;
