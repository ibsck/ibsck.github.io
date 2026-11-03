/*
 * Point d'entrée du JavaScript, chargé sur toutes les pages.
 * Chaque module ne s'active que si ses éléments sont présents sur la page.
 * Le site reste lisible et navigable sans script.
 */
import { initMenu } from './menu.js';
import { initCopyEmail } from './copy-email.js';
import { initSiding } from './siding.js';
import { initSchemas } from './schemas.js';

// Les modules indépendants d'abord : un incident dans l'un ne bloque pas les autres.
for (const init of [initMenu, initCopyEmail, initSiding, initSchemas]) {
  try {
    init();
  } catch (err) {
    console.warn(err);
  }
}
