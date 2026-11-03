# Portfolio · Ibrahima Sory BALDE

Site statique multipage en HTML, CSS et JavaScript, sans framework, construit avec [Vite](https://vite.dev). Aucune dépendance côté serveur, aucun traceur.

## Démarrage

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
npm run dev       # serveur de développement, rechargement à chaud
npm run build     # génère le site final dans dist/
npm run preview   # sert dist/ tel qu'il sera en ligne
```

Pour juger la fluidité réelle (chargement, transitions entre pages), utiliser `npm run build` puis `npm run preview`.

## Arborescence

```text
portfolio/
├── src/                        Code source du site (racine Vite)
│   ├── index.html              Accueil
│   ├── 404.html                Page introuvable
│   ├── realisations/           Les quatre études de cas
│   ├── partials/               Fragments HTML communs, insérés à la construction
│   │   ├── head.html           <meta>, polices préchargées, CSS et JS
│   │   ├── header.html         Lien d'évitement, barre du haut, navigation
│   │   ├── footer.html
│   │   ├── contact.html        Bloc « Me contacter »
│   │   └── tracks-strip.html   Navigation entre études de cas (R1 à R4)
│   ├── styles/
│   │   ├── main.css            Point d'entrée : importe les fichiers ci-dessous, dans l'ordre
│   │   ├── base/               Polices, jetons (couleurs, grille), réinitialisation
│   │   ├── components/         Plaques, puces de preuve, traits de légende, boutons
│   │   ├── layout/             En-tête, bandes de section, pied de page
│   │   ├── home/               Sections de l'accueil (intro, réalisations, méthode, compétences, parcours)
│   │   ├── shared/             Bloc contact
│   │   ├── case/               Études de cas (bande de position, page, schéma)
│   │   └── pages/              Page 404
│   └── scripts/
│       ├── main.js             Point d'entrée : lance chaque module
│       ├── constants.js        Constantes partagées (taille d'un carreau, espace de noms SVG)
│       ├── menu.js             Menu mobile
│       ├── siding.js           Faisceau de l'accueil : tracé et allumage des voies
│       ├── schemas.js          Schémas animés des études de cas
│       └── copy-email.js       Bouton « Copier l'adresse »
├── public/                     Copié tel quel dans dist/
│   ├── cv/                     CV en PDF
│   ├── fonts/                  Polices Barlow (woff2)
│   ├── favicon.svg
│   └── robots.txt
└── vite.config.js              Racine src/, sortie dist/, inclusion des fragments HTML
```

### Conventions

- **HTML** : une page par fichier. Les blocs communs sont écrits une seule fois dans `src/partials/` et insérés avec `<!--@include nom-->`. Sur une page, `{{current:cle}}` devient `aria-current="page"` quand `cle` correspond à l'attribut `data-page` du `<body>`.
- **CSS** : classes nommées en BEM (`bloc__element--variante`). Toutes les couleurs et tailles de base sont des variables définies dans `styles/base/tokens.css`. Chaque fichier contient ses propres règles responsives, en fin de fichier.
- **JavaScript** : modules ES. Chaque module exporte une fonction `init…` qui ne fait rien si ses éléments sont absents de la page. Le site reste lisible et navigable sans JavaScript.
- **Formatage** : `.editorconfig` (UTF-8, 2 espaces, fin de ligne LF).

## Déployer

`dist/` se publie tel quel sur n'importe quel hébergement statique, à la racine d'un domaine : les liens internes sont absolus, en `/…`.

- **Cloudflare Pages, Netlify, Vercel** : commande de build `npm run build`, dossier publié `dist`.
- **GitHub Pages** : dépôt nommé `pseudo.github.io`. Le fichier `.github/workflows/deploy.yml` construit et publie le site à chaque push sur `main` (Settings → Pages → Source : GitHub Actions).
- **Hébergement classique ou serveur Nginx** : copier le contenu de `dist/` à la racine du site. Pour Nginx, ajouter `error_page 404 /404.html;`.

Pour un déploiement dans un sous-dossier (par exemple `exemple.fr/portfolio/`), il faut ajouter `base: '/portfolio/'` dans `vite.config.js` et adapter les liens absolus.

### À faire une fois l'adresse du site connue

Aucune URL de production n'est inventée dans le code. Quand le domaine est choisi :

1. Ajouter dans `src/partials/head.html`, ou dans chaque page, la balise `<link rel="canonical" href="https://votre-domaine/…">` et `<meta property="og:url" …>`.
2. Ajouter `Sitemap: https://votre-domaine/sitemap.xml` dans `public/robots.txt`, et créer `public/sitemap.xml` listant les six pages.
3. Facultatif : ajouter une image de partage `public/og.png` (1200 × 630) et `<meta property="og:image" …>`, puis passer `twitter:card` à `summary_large_image`.

## Contenu

### Remplacer le CV

Remplacer `public/cv/CV_Ibrahima_Sory_BALDE.pdf` en gardant le même nom. Si son poids change nettement, mettre à jour la mention « PDF, 53 Ko » dans `src/index.html` et `src/partials/contact.html`.

Le CV actuel contient le numéro de téléphone et indique la recherche d'un CDI : il sera public une fois le site en ligne.

### Contact

Lien email, bouton de copie de l'adresse (affiché seulement si le navigateur le permet, avec un message fidèle au résultat), LinkedIn et CV. Il n'y a pas de formulaire : il faudrait un service d'envoi (Formspree, Netlify Forms…) pour en ajouter un.

### Illustrations

Les schémas des études de cas sont des illustrations dessinées pour le site et signalées comme telles. Aucune capture, aucun code ni aucune donnée des applications HAROPA PORT n'est utilisé.

## Polices

Barlow et Barlow Semi Condensed (licence SIL Open Font License), sous-ensemble latin, dans `public/fonts/`. Les deux graisses les plus visibles sont préchargées dans `src/partials/head.html`.
