document.querySelectorAll('.materia').forEach(materia => {
  materia.addEventListener('click', () => {
    if (materia.classList.contains('bloqueada')) return;

    materia.classList.toggle('aprobada');

    const unlocks = materia.dataset.unlocks;
    if (unlocks) {
      const siguiente = document.querySelector(`[data-id="${unlocks}"]`);
      if (materia.classList.contains('aprobada')) {
        siguiente.classList.remove('bloqueada');
      } else {
        siguiente.classList.add('bloqueada');
        siguiente.classList.remove('aprobada');
        // y se bloquean todos los descendientes
        resetDescendientes(siguiente.dataset.unlocks);
      }
    }
  });
});

function resetDescendientes(id) {
  if (!id) return;
  const mat = document.querySelector(`[data-id="${id}"]`);
  if (mat) {
    mat.classList.add('bloqueada');
    mat.classList.remove('aprobada');
    resetDescendientes(mat.dataset.unlocks);
  }
}

