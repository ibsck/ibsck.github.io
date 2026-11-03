/* Menu mobile */
export function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');
  if (!toggle || !menu) return;
  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      close();
      toggle.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('is-open') && !menu.contains(e.target) && !toggle.contains(e.target)) close();
  });
  matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
    if (e.matches) close();
  });
}
