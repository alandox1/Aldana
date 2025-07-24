document.querySelectorAll('.materia').forEach(materia => {
  materia.addEventListener('click', () => {
    if (materia.classList.contains('bloqueada')) return;

    materia.classList.toggle('aprobada');

    const unlockId = materia.dataset.unlocks;
    if (unlockId) {
      const siguiente = document.querySelector(`[data-id="${unlockId}"]`);
      if (materia.classList.contains('aprobada')) {
        siguiente?.classList.remove('bloqueada');
      } else {
        bloquearConDescendientes(siguiente);
      }
    }
  });
});

function bloquearConDescendientes(materia) {
  if (!materia) return;
  materia.classList.add('bloqueada');
  materia.classList.remove('aprobada');
  const nextId = materia.dataset.unlocks;
  if (nextId) {
    const siguiente = document.querySelector(`[data-id="${nextId}"]`);
    bloquearConDescendientes(siguiente);
  }
}

