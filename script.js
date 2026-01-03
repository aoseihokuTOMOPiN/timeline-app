document.querySelectorAll('.layers input').forEach(cb => {
  cb.addEventListener('change', () => {
    const layer = cb.dataset.layer;
    document.querySelectorAll('.layer-' + layer).forEach(el => {
      el.style.display = cb.checked ? 'block' : 'none';
    });
  });
});
