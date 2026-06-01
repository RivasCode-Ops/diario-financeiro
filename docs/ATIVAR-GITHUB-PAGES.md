# Ativar GitHub Pages (celular sem 404)

O app no celular usa: **https://rivascode-ops.github.io/diario-financeiro/**

Se aparecer **404**, o deploy ainda não está ativo. Faça uma vez:

1. Abra https://github.com/RivasCode-Ops/diario-financeiro/settings/pages
2. Em **Build and deployment → Source**, escolha **GitHub Actions** (não “Deploy from branch”).
3. Abra https://github.com/RivasCode-Ops/diario-financeiro/actions
4. Rode o workflow **Deploy GitHub Pages** (ou aguarde o push em `main` ficar verde).
5. Quando terminar, teste a URL no celular com aba anônima.

## Enquanto o Pages não estiver no ar

No PC: `Iniciar-Diario-Financeiro-Rede.bat`  
No celular (mesma Wi‑Fi): `http://SEU-IP-DO-PC:8786/` (o bat mostra o IP).
