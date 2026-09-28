# Portfolio Pessoal

Portfólio da Volpe — Vitor Volpato. Site em React + Vite com visual escuro/cinematográfico, tons cobre e a raposa Volpe como elemento central.

## Estrutura
Hero → Projetos → Planos → Sobre/Processo → Contato.

## Editar conteúdo
- **Textos, projetos, planos, preços, números do hero e stack:** `src/content.ts`.
  - Projetos aparecem como a logo de cada marca (texto e fonte em `wordmark`/`font`) com link para o site (`url`). A fonte Lovelo da Montê fica em `public/fonts/`.
- **Logo:** `public/fox-fur-black.webp` (topo) e `public/fox-fur-white.webp` (contato) são a raposa com pelos. As versões `fox-fur-*-<largura>.webp` são as mesmas imagens já reduzidas para cada tamanho de tela (o site escolhe a certa via `srcset`, o que mantém a logo nítida). `fox-fur-mask.webp` é a silhueta usada na espessura 3D, e `fox-mark-*-48/96.webp` é a logo pequena do cabeçalho e do rodapé. `public/fox-logo.svg` é a silhueta vetorial avulsa.
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
