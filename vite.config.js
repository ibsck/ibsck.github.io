import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectDir = import.meta.dirname;
const srcDir = resolve(projectDir, 'src');

/**
 * Inclusion de fragments HTML communs à toutes les pages.
 * - <!--@include nom--> est remplacé par le contenu de src/partials/nom.html ;
 * - {{current:cle}} devient aria-current="page" quand cle correspond au data-page du <body>.
 */
function htmlPartials() {
  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const page = (html.match(/<body[^>]*data-page="([^"]+)"/) || [])[1] || '';
        return html
          .replace(/<!--@include ([\w-]+)-->/g, (_, name) =>
            readFileSync(resolve(srcDir, 'partials', `${name}.html`), 'utf8'),
          )
          .replace(/\{\{current:([\w-]+)\}\}/g, (_, key) => (key === page ? 'aria-current="page"' : ''));
      },
    },
  };
}

export default defineConfig({
  root: srcDir,
  publicDir: resolve(projectDir, 'public'),
  plugins: [htmlPartials()],
  build: {
    outDir: resolve(projectDir, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(srcDir, 'index.html'),
        notFound: resolve(srcDir, '404.html'),
        dangereuses: resolve(srcDir, 'realisations/marchandises-dangereuses.html'),
        documentation: resolve(srcDir, 'realisations/documentation-utilisateur.html'),
        dragage: resolve(srcDir, 'realisations/suivi-dragage.html'),
        port3d: resolve(srcDir, 'realisations/port-du-havre-3d.html'),
      },
    },
  },
});
