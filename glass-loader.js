try {
  await import('./glass.js?v=replay-button');
} catch (error) {
  console.warn('Modo estático ativado: não foi possível carregar o vidro.', error);
} finally {
  clearTimeout(window.glassLoadingTimer);
  document.documentElement.classList.remove('glass-loading');
}
