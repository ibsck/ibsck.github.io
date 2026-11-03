/* Copie de l'adresse : le bouton n'apparaît que si le presse-papiers est disponible,
   et le message reflète le résultat réel. */
export function initCopyEmail() {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    if (!navigator.clipboard || !window.isSecureContext) return;
    btn.hidden = false;
    const status = btn.closest('.exit__body')?.querySelector('.copy-status');
    const label = btn.textContent;
    let timer;
    btn.addEventListener('click', async () => {
      clearTimeout(timer);
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        if (status) status.textContent = 'Adresse copiée dans le presse-papiers.';
        btn.textContent = 'Adresse copiée';
        btn.classList.add('is-done');
      } catch {
        if (status) status.textContent = 'La copie a échoué. Sélectionnez l’adresse ci-dessus pour la copier.';
      }
      timer = setTimeout(() => {
        btn.classList.remove('is-done');
        btn.textContent = label;
        if (status) status.textContent = '';
      }, 2500);
    });
  });
}
