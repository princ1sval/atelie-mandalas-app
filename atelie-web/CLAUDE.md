# Site do ateliê Malu Mandalas — atelie web

## O que é
Site de página única do ateliê **Malu Mandalas** (mandalas pintadas à mão em pontilhismo, Muriaé-MG), feito a partir do app mobile da pasta `../atelie-mandalas-app` (mesmos textos, peças, cores, fontes e regras de preço/prazo). Serve como **projeto de portfólio** no site princisval.com.br.
Desenvolvido por João Pedro (Princípio Web), no mesmo padrão do site psico-web.

## Stack e restrições
- **HTML, CSS e JS puros.** Sem framework, sem bundler, sem npm, sem biblioteca de animação. Funciona em qualquer servidor estático.
- Uma página só (`index.html`) com seções âncora + `404.html`.
- **Mobile-first.** Conferir em 360 px, 768 px e 1280 px.
- **Sem formulário que envie dados para servidor.** A encomenda monta uma mensagem e abre o WhatsApp; nada fica guardado no site. Sem Analytics, pixel ou script de terceiros sem combinar antes (LGPD).
- Fontes **auto-hospedadas** (`assets/fonts/*.woff2`): Fraunces (títulos) e Poppins (texto), as mesmas do app.

## Estrutura de pastas
```
atelie-web/
├─ index.html · 404.html
├─ favicon.svg · favicon-32.png · apple-touch-icon.png
├─ robots.txt · sitemap.xml
├─ wrangler.jsonc · .assetsignore      ← publicação no Cloudflare
├─ css/  base.css (tokens, reset, tipografia, botões) · menu.css · secoes.css
├─ js/   abertura.js · menu.js · dados.js (catálogo) · site.js
├─ assets/ fonts/ · img/ (mandalas em WebP 400/800 + compartilhar.jpg)
└─ docs/ LEIA-ME.md
```

## Abertura e menu
- **Abertura "a mandala é pintada ponto a ponto"** (1,8 s): os pontos aparecem do centro para fora, o nome surge, a cortina creme abre num círculo de borda pontilhada e a mandala pousa no logo do menu (FLIP). Mesma estrutura do kit do beija-flor do psico-web: trecho 1 e 2 inline no `<head>`, camada `#abertura` no começo do `<body>`, `js/abertura.js`.
- Roda em **toda visita** (como no psico-web); `?intro` força; `?intro=0.25` = câmera lenta; não roda com reduzir movimento, com link de seção (`#duvidas`) ou em aba de segundo plano; clique/toque/rolagem/tecla pula; se o JS quebrar, o CSS remove a camada aos 4 s.
- Atributos: `data-abertura-logo` (SVG do logo, destino do pouso), `data-abertura-sobe` (sobem quando o círculo passa), `data-menu`, `data-menu-flip`, `data-menu-flip="fim"`.
- Ajustes: constantes `T` e `M` em `abertura.js`; variáveis `--ab-*` (cortina) e `--menu-*` (menu). **Não mude tempos e medidas sem perguntar.**
- Menu em pílula ao rolar: o mesmo do psico-web, com um pontinho embaixo do link da seção atual.

## Conteúdo
- Peças, preços e tabela de encomenda ficam em `js/dados.js` (cópia dos mocks do app). **Nunca invente** peças, preços, prazos ou informações do ateliê.
- Imagens e preços ainda são **provisórios** (ilustrações do protótipo). Para trocar uma foto, mantenha o nome do arquivo e gere as versões `-400.webp` e `-800.webp`.
- Fotos de encomendas (pessoas, pets, homenagens) só com autorização dos clientes.

## Definição de pronto
- HTML semântico: um `<h1>`, hierarquia de títulos, `header`/`main`/`section`/`footer`, link "pular para o conteúdo".
- Acessibilidade: contraste AA, foco visível, teclado, `alt` nas imagens, `prefers-reduced-motion` em **todas** as animações.
- Performance: imagens WebP com `width`/`height`, `loading="lazy"` abaixo da dobra, foto do topo com `fetchpriority="high"`, sem CLS.
- SEO: `title`, description, canonical, Open Graph, JSON-LD (Store), `sitemap.xml`, `robots.txt`, `lang="pt-BR"`.
- Zero erros no console.

## Jeito de trabalhar
- Nomes de classes, variáveis e comentários em **português**. Cores e medidas só pelos tokens de `css/base.css`.
- Commits pequenos, mensagem em português no imperativo.
- Testar localmente: `python -m http.server 8000` (ou Live Server do VS Code) dentro desta pasta.
- Publicar: `npx wrangler deploy` dentro desta pasta (veja `docs/LEIA-ME.md`).
