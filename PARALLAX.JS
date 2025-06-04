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

// parallax-sticky.js
(() => {
  const hero    = document.querySelector('.hero');
  const inner   = hero.querySelector('.hero-inner');
  const maxY    = hero.offsetHeight - window.innerHeight;  // 50 vh en el ejemplo
  const imgPush = 25;  // píxeles extra para el "empujón"

  function onScroll(){
    const y = window.scrollY - hero.offsetTop;
    if (y >= 0 && y <= maxY){
      // progreso 0→1 dentro del héroe
      const t = y / maxY;
      // mueve background un pelín (solo el 20 % final)
      const extra = t > .8 ? (t-.8)/.2*imgPush : 0;
      inner.style.backgroundPositionY = `-${extra}px`;
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
})();
