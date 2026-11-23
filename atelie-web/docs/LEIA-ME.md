# atelie web — como testar, publicar e usar no portfólio

## Testar no computador
Dentro da pasta `atelie-web`:

```
python -m http.server 8000
```
Abra `http://localhost:8000`. Para rever a abertura em câmera lenta: `http://localhost:8000/?intro=0.25`.

## Publicar no Cloudflare (igual ao psico-web)
1. Dentro da pasta `atelie-web`, rode `npx wrangler login` (só na primeira vez) e depois `npx wrangler deploy`.
2. O wrangler lê o `wrangler.jsonc` e publica a pasta como arquivos estáticos, sem os itens do `.assetsignore` (docs, CLAUDE.md, configurações).
3. O endereço fica `https://atelie-web.jp-princisval.workers.dev`. Se usar outro nome ou domínio, troque o endereço no `index.html` (canonical, `og:url`, `og:image`, JSON-LD), no `robots.txt` e no `sitemap.xml`.
4. Página que não existe cai na `404.html` (`not_found_handling` no `wrangler.jsonc`).

## Usar no princisval.com.br
- Link do card do portfólio: o endereço publicado acima.
- Print para o card: abra o endereço com `/#inicio` no fim (link de seção não roda a abertura), em 1280 × 800, e tire o print do topo.
- A prévia do link (WhatsApp, Instagram) usa `assets/img/compartilhar.jpg` (1200 × 630).

## Pendências (antes de virar site oficial do ateliê)
- [ ] Trocar as ilustrações pelas fotos reais das peças (mesmos nomes de arquivo, WebP 400 e 800 px).
- [ ] Confirmar preços da pronta entrega e a tabela de encomenda (`js/dados.js`) com a Malu.
- [ ] Confirmar as respostas das dúvidas.
- [ ] Tirar o `noindex` do `index.html` quando o ateliê aprovar o site.
- [ ] Se tiver domínio próprio, trocar os endereços (item 3 acima).

## O que veio do app
| App (React Native) | Site |
|---|---|
| Início (cartão verde, "M alu andalas") | Seção Início + Nossa história + Significado + A técnica |
| Pronta entrega (busca por nome ou cor) | Seção Pronta entrega, com busca sem acento e "Me surpreenda" (o chacoalhar do app) |
| Detalhe da mandala ("Tenho interesse" / "Quero uma assim" / compartilhar) | Janela de detalhe, com a imagem voando do cartão |
| Portfólio (filtro por tema) | Seção Portfólio, com chips e animação dos cartões |
| Encomenda (estimativa ao vivo) | Formulário que monta a mensagem e abre o WhatsApp; nada fica salvo |
| Dúvidas (SectionList com busca) | Acordeão `<details>` com busca |
| Meus pedidos, Perfil, login | Não entram no site: dependem do aparelho ou de conta |
