'use strict';

// Tarea #15 - Navegación y avisos compartidos del frontend.
// La autenticación, reservas, comentarios y directorio de profesores aún no existen.
document.addEventListener('DOMContentLoaded', () => {
  const botonMenu = document.getElementById('boton-menu');
  const menu = document.getElementById('menu-principal');
  const aviso = document.getElementById('aviso-navegacion');
  const textoAviso = aviso?.querySelector('.aviso-navegacion__texto');
  const cerrarAviso = aviso?.querySelector('.aviso-navegacion__cerrar');
  const movil = window.matchMedia('(max-width: 700px)');
  let temporizadorAviso;

  function cambiarMenu(abierto) {
    if (!botonMenu || !menu) return;
    const visible = abierto && movil.matches;
    menu.classList.toggle('is-open', visible);
    botonMenu.setAttribute('aria-expanded', String(visible));
    botonMenu.setAttribute('aria-label', visible ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
  }

  botonMenu?.addEventListener('click', () => {
    cambiarMenu(botonMenu.getAttribute('aria-expanded') !== 'true');
  });

  menu?.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) cambiarMenu(false);
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') {
      if (botonMenu?.getAttribute('aria-expanded') === 'true') {
        cambiarMenu(false);
        botonMenu.focus();
      }
      ocultarAviso();
    }
  });

  document.addEventListener('click', (evento) => {
    if (movil.matches && menu?.classList.contains('is-open') &&
        !evento.target.closest('#menu-principal, #boton-menu')) cambiarMenu(false);
  });

  if (typeof movil.addEventListener === 'function') {
    movil.addEventListener('change', () => cambiarMenu(false));
  } else if (typeof movil.addListener === 'function') {
    movil.addListener(() => cambiarMenu(false));
  }

  function ocultarAviso() {
    if (aviso) aviso.hidden = true;
    clearTimeout(temporizadorAviso);
  }

  function mostrarAviso(mensaje) {
    if (!aviso || !textoAviso) return;
    clearTimeout(temporizadorAviso);
    textoAviso.textContent = mensaje;
    aviso.hidden = false;
    temporizadorAviso = setTimeout(ocultarAviso, 5000);
  }

  cerrarAviso?.addEventListener('click', ocultarAviso);

  const mensajesPendientes = {
    profesores: 'El directorio de profesores se incorporará en una fase posterior.',
    reservar: 'La reserva de tutorías estará disponible cuando se implemente esta función.',
    reservas: 'La gestión de reservas estará disponible cuando se implemente esta función.',
    comentarios: 'Los comentarios estarán disponibles cuando se implemente esta función.'
  };

  document.querySelectorAll('[data-proximo]').forEach((enlace) => {
    enlace.addEventListener('click', (evento) => {
      const mensaje = mensajesPendientes[enlace.dataset.proximo];
      if (!mensaje) return;
      evento.preventDefault();
      mostrarAviso(mensaje);
    });
  });
});
