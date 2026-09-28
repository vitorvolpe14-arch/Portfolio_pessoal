# Portfolio Pessoal

Portfólio da Volpe — Vitor Volpato. Site em React + Vite com visual escuro/cinematográfico, tons cobre e a raposa Volpe como elemento central.

## Estrutura
Hero → Projetos → Planos → Sobre/Processo → Contato.

## Editar conteúdo
- **Textos, projetos, planos, preços, números do hero e stack:** `src/content.ts`.
  - Por enquanto os cards de projeto mostram só o nome; descrição, tags e `url` já ficam guardados no arquivo.
- **Logo:** `public/fox-fur-black.webp` e `public/fox-fur-white.webp` (raposa com textura, usadas no topo, no contato, no cabeçalho e no rodapé). `public/fox-logo.svg` é a silhueta vetorial avulsa.
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
