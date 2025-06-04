/* =========================================================================
   HERO
   -------------------------------------------------------------------------
   DESCR
   ====================================================================== */
// Parallax con RAF — suave y eficiente
(function(){
  const hero = document.querySelector('.hero');
  let prevScroll = window.scrollY;

  function updateParallax(){
    // Distancia desde la parte superior de la página
    const scrolled = window.scrollY;
    // Ajusta el factor 0.4 para más/menos desplazamiento
    const offset = scrolled * 0.4;

    // Mueve el fondo en eje Y (solo si está visible)
    hero.style.backgroundPositionY = `-${offset}px`;

    prevScroll = scrolled;
    requestAnimationFrame(updateParallax);
  }

  // Iniciar cuando se cargue el DOM
  requestAnimationFrame(updateParallax);
})();