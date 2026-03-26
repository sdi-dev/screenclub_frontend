# Routage en production (SPA)

En production, selon ton hébergeur, il faudra aussi une règle de redirection :

- Netlify → fichier _redirects à la racine de /dist

`/*  /index.html  200`

- Vercel → vercel.json

`{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`

- Nginx

`location / { try_files $uri $uri/ /index.html; }`