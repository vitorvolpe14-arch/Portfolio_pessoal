# Portfolio Pessoal

Portfólio pessoal de Vitor Volpato, construído como um projeto novo e independente.

## Estrutura
Hero → Projetos → Planos/Preços → Processo → Sobre/Stack → Contato.

## Editar conteúdo
Os projetos e planos ficam centralizados em `src/main.tsx`. A logo vetorial fica em `public/logo.svg`.

## Desenvolvimento
```bash
npm install
npm run dev
npm run check
npm run build
```

## Deploy
O projeto inclui `render.yaml` e workflow de CI em `.github/workflows/ci.yml`. O Render deve apontar para este repositório e para a branch `main`.
