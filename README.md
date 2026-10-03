# Portfolio Pessoal

Portfólio da Volpe — Vitor Volpato. Site em React + Vite com visual escuro/cinematográfico, tons cobre e a raposa Volpe como elemento central.

## Estrutura
Hero → Projetos → Planos → Sobre/Processo → Contato.

## Idiomas
Português em `/`, inglês em `/en/` e italiano em `/it/`. O seletor PT · EN · IT no topo troca o idioma sem recarregar a página e atualiza o endereço.

No build, `vite.config.ts` gera `dist/en/index.html` e `dist/it/index.html`. Cada versão sai com idioma, título, descrição, endereço canônico e links `hreflang` próprios, para o Google indexar as três. `public/sitemap.xml` lista as três versões.

## Editar conteúdo
- **Textos, projetos, planos, preços e stack:** `src/content.ts`.
  - Os textos ficam em `copy.pt`, `copy.en` e `copy.it`, com a mesma estrutura. Ao mudar um texto, mude nos três. Nos títulos, `\n` quebra a linha e `*palavra*` fica em itálico.
  - Planos: número, nome e preço ficam em `planBase`. Cada versão tem a sua moeda: reais em português (`brl`: R$ 799, R$ 1.300 e R$ 2.000), dólares em inglês (`usd`: $400, $850 e $1,400) e euros em italiano (`eur`: € 380, € 700 e € 1.000). Os textos de cada plano ficam em `plans`, dentro de cada idioma e na mesma ordem. Cada plano inclui tudo do anterior (quanto mais caro, mais serviços). `items` aparece no cartão; `extras` e `details` só em "Ver detalhes". A forma de pagamento (`payment`, 50% ao contratar e 50% na entrega) vale para todos. `note` aparece no cartão e nos detalhes: Start + R$ 49/mês e Studio + R$ 89/mês de hospedagem na Cloudflare e domínio (em inglês, + $19 e + $29; em italiano, + € 19 e + € 29); no Signature, inclusos.
  - Projetos aparecem como a logo de cada marca com link para o site (`url`). A logo é uma imagem em `public/projects/` (`logo.image`) ou texto na fonte da marca (`logo.text`/`logo.font`). `hidden: true` tira um projeto do site sem apagar os dados (a Montê está assim por enquanto; a fonte Lovelo dela fica em `public/fonts/`).
- **Logo (vetorizada):** a raposa foi traçada da arte original com Potrace, incluindo o sombreamento da escultura em faixas de tom (volume e vincos), e está em SVG, nítida em qualquer tamanho.
  - `public/fox-vector-black.svg` (topo) e `public/fox-vector-white.svg` (contato), usadas na logo 3D.
  - `public/fox-vector-mask.svg`: silhueta usada na espessura 3D e na sombra.
  - `public/fox-vector-black-mark.svg` e `public/fox-vector-white-mark.svg`: versões sem margem para a logo pequena do cabeçalho e do rodapé.
  - `public/fox-logo.svg` é a silhueta vetorial avulsa antiga.
- **Ícones:** `src/art.tsx`.
- **Estilos:** `src/styles.css`.

## Desenvolvimento
```bash
npm install
npm run dev
npm run check
npm run build
```

## Deploy
Cloudflare Workers, só com arquivos estáticos: o build do Vite (`dist/`) é publicado como assets do Worker `portfolio-pessoal` (configuração em `wrangler.jsonc`).

Endereço: https://volpedev.com.br (domínio no Registro.br, DNS no Cloudflare, ligado ao Worker em Settings → Domains & Routes). `www.volpedev.com.br` e o endereço antigo `portfolio-pessoal.vitorvolpe14.workers.dev` redirecionam para ele (script no topo do `index.html`). `public/robots.txt` e `public/sitemap.xml` apontam para o domínio.

Cloudflare → Workers & Pages → `portfolio-pessoal`, ligado a este repositório pelo Workers Builds (branch `main`, build `npm run build`, deploy `npx wrangler deploy`). Cada push na `main` publica sozinho. O CI do GitHub (`.github/workflows/ci.yml`) roda typecheck e build em cada PR.

Para testar localmente como no Cloudflare: `npm run build && npx wrangler dev`.
