# Portfolio Pessoal

Portfólio da Volpe — Vitor Volpato. Site em React + Vite com visual escuro/cinematográfico, tons cobre e a raposa Volpe como elemento central.

## Estrutura
Hero → Projetos → Planos → Sobre/Processo → Contato.

## Editar conteúdo
- **Textos, projetos, planos, preços, números do hero e stack:** `src/content.ts`.
  - Projetos aparecem como a logo de cada marca (texto e fonte em `wordmark`/`font`) com link para o site (`url`). A fonte Lovelo da Montê fica em `public/fonts/`.
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
O projeto inclui `render.yaml` e workflow de CI em `.github/workflows/ci.yml`. O Render deve apontar para este repositório e para a branch `main`.
