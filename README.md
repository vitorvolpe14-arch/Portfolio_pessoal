# Portfolio Pessoal

Portfólio da Volpe — Vitor Volpato. Site em React + Vite com visual escuro/cinematográfico, tons cobre e a raposa Volpe como elemento central.

## Estrutura
Hero → Projetos → Planos → Sobre/Processo → Contato.

## Editar conteúdo
- **Textos, projetos, planos, preços, números do hero e stack:** `src/content.ts`.
  - Para ligar o botão "Acessar projeto" a um site, preencha `url` no projeto. Sem `url`, o botão leva para o contato.
- **Logo (silhueta da raposa):** `src/foxPath.ts` (usado no site) e `public/fox-logo.svg` (arquivo avulso).
- **Ilustrações (raposa do hero, pedras, bolsa, caixa):** `src/art.tsx`.
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
