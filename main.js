/* =========================================================================
   mainscript.js
   Este script se encarga de:
   1) Cargar el navbar (navbar.html) en <div id="navbar">
   2) Instalar un listener de scroll para cambiar el fondo del navbar
      en la página "home.html"
   3) Cargar el footer (footer.html) en <div id="footer">
   4) Cargar dinámicamente las páginas (home.html, palestrantes.html, etc.)
      dentro de <main id="content">, gestionando el hash de la URL.
   ========================================================================= */
function formatParagraphs(text) {
  // Separa por dobles saltos de línea, y para cada bloque genera un <p>
  return text
    .split('\n\n')
    .map(block => `<p>${block.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

document.addEventListener("DOMContentLoaded", () => {

  /* Cargar el FOOTER */
  fetch("footer.html")
    .then(response => {
      if (!response.ok) throw new Error("Erro ao carregar footer.html");
      return response.text();
    })
    .then(html => {
      document.getElementById("footer").innerHTML = html;
    })
    .catch(err => { console.error(err); });

  // ✅ Agregar aquí directamente el scroll listener
  const header = document.querySelector(".custom-navbar");
  if (!header) {
    console.error("❌ Navbar no encontrada");
    return;
  }

  window.addEventListener("scroll", () => {
    if (window.scrollY > 3) {
      header.classList.add("navbar-scrolled");
    } else {
      header.classList.remove("navbar-scrolled");
    }
  });

  handleRouting();
});

function loadPage(page) {
  fetch(page)
    .then(res => {
      if (!res.ok) throw new Error(`Error al cargar ${page}`);
      return res.text();
    })
    .then(html => {
      const content = document.getElementById("content");
      content.innerHTML = html;

      // Si es “palestrantes.html”, “schedule.html”, cargamos funciones
      /* if (page === "palestrantes.html") {loadPalestras(); loadEstudantes();} */
      if (page === "palestrantes.html") {loadPalestras();}
      if (page === "schedule.html") {loadSchedule();}

      // Llevamos el scroll al top
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Forzamos el estado del navbar según la página que acabamos de cargar
      const navbarEl = document.querySelector(".custom-navbar");
      if (page !== "home.html") {
        content.classList.add("with-offset");
        navbarEl.classList.remove("navbar-scrolled");
        navbarEl.classList.add("navbar-otros");
      } else {
        content.classList.remove("with-offset");
        navbarEl.classList.remove("navbar-scrolled");
        navbarEl.classList.remove("navbar-otros");
      }

    })
    .catch(err => {
      document.getElementById("content").innerHTML = `
        <div class="container py-5 text-center">
          <h2>Error al cargar la página</h2>
          <p>${err.message}</p>
        </div>`;
    });

  (function() {
    const collapseEl = document.getElementById('navbarNav');
    if (!collapseEl) return;
    // Instancia de Collapse sin toggle automático
    const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false });
    const mq = window.matchMedia('(max-width: 991.98px)');

    // Al cargar: si estamos en móvil/tableta, ocultamos el menú
    if (mq.matches) {
      collapseEl.classList.remove('show');  // por si viniere con 'show' de más
      bsCollapse.hide();                    // oculta el colapsado
    }

    // Al clicar cualquier enlace del menú en móvil/tablet, lo volvemos a ocultar
    document
      .querySelectorAll('#navbarNav .nav-link, #navbarNav .btn-inscricao')
      .forEach(link => {
        link.addEventListener('click', () => {
          if (mq.matches) {
            bsCollapse.hide();
          }
        });
      });
  })();
}



/* ------------------------------------------------------------
   7) Navegación SPA: interceptar clicks en links [data-page]
------------------------------------------------------------ */
document.addEventListener("click", function(e) {
  const link = e.target.closest("[data-page]");
  if (!link) return;            // si no es un enlace SPA, salimos
  e.preventDefault();           // evitamos recarga completa
  const page = link.getAttribute("data-page"); // p.ej. "palestrantes.html"
  history.pushState({}, "", `#${page}`);      // actualizamos la URL
  loadPage(page);               // cargamos la página con tu función
});

/* ------------------------------------------------------------
   8) Manejar el botón “atrás” / “adelante” del navegador
------------------------------------------------------------ */
window.addEventListener("popstate", () => {
  const page = location.hash ? location.hash.substring(1) : "home.html";
  loadPage(page);
});













/* =========================================================================
   PALESTRANTES EN GRAL
   ====================================================================== */
/* Cambia estos valores si tus archivos o carpetas tienen otros nombres. */
const PALESTRAS_JSON   = 'palestras.json';   // Minicursos, palestras plenarias, mesa redonda
const ESTUDANTES_JSON  = 'estudantes.json';  // Palestras estudantis y pósteres
const IMG_PATH         = 'images/palestrantes/'; // Carpeta de fotos (termina en “/”)
const PDF_PATH         = 'pdfs/';         // Carpeta de PDFs (termina en “/”)

/* Convierte un texto en un identificador “seguro” si algún día lo necesitas */
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
/* Inserta HTML en un contenedor (helper para abreviar) */
function appendHTML(containerId, html) {
  document.getElementById(containerId).insertAdjacentHTML('beforeend', html);
}

/* PLANTILLAS DE TARJETAS Y MODALES */
function cardTemplate(item) {
  const { id, foto, nome, afiliacao, titulo, categoria } = item;
  const modalId = `modal-${id}`;
  const label = categoria === 'MINICURSO'
    ? 'Minicurso:'
    : categoria === 'PALESTRANTE'
      ? 'Título:'
      : categoria === 'MESA REDONDA'
        ? ''
        : '';
  return `
  <div class="col-12 col-md-6 col-xxl-4 mb-4">
    <div class="card card-palestrante h-100 shadow-sm">
      <div class="d-flex flex-column flex-lg-row h-100">
        <!-- Imagen desktop con clase speaker-img -->
        <img src="${foto || IMG_PATH + 'placeholder.png'}"
             class="speaker-img rounded-start d-none d-lg-block"
             alt="Foto de ${nome}">
        <!-- Imagen mobile con misma clase speaker-img -->
        <img src="${foto || IMG_PATH + 'placeholder.png'}"
             class="speaker-img rounded-circle mt-3 mb-0 shadow-sm mx-auto d-block d-lg-none"
             alt="Foto de ${nome}">
        <!-- Cuerpo -->
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${nome}</h5>
          <p class="text-muted mb-2">${afiliacao || ''}</p>
          ${label ? `<p class="card-text flex-grow-1"><strong>${label}</strong> ${titulo}</p>` : ''}
          <div class="mt-3 mt-lg-auto text-lg-end">
            <button class="btn btn-outline-primary btn-cplf-palestras" data-bs-toggle="modal" data-bs-target="#${modalId}">
              Mais info
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- MODALES ESPECÍFICO ---------- */


function modalMinicurso(item) {
  const { id, nome, resumo, bio, detalhes } = item;
  return `
  <div class="modal fade" id="modal-${id}" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${nome} – Minicurso</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
        </div>
        <div class="modal-body">
          ${bio ? `<p><strong>Bio:</strong> ${formatParagraphs(bio)}</p>` : ''}
          ${resumo ? `<p><em>Resumo:</em> ${formatParagraphs(resumo)}</p>` : ''}
          ${detalhes?.programa ? `<p><strong>Programa:</strong></p>
            <ul>${detalhes.programa.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
          ${detalhes?.nivel ? `<p><strong>Nível:</strong> ${detalhes.nivel}</p>` : ''}
          ${detalhes?.material ? `<a href="${detalhes.material}" target="_blank" class="btn btn-sm btn-cplf1">Material preliminar</a>` : ''}
        </div>
      </div>
    </div>
  </div>`;
}

function modalPalestrante(item) {
  const { id, nome, resumo, bio, palavras_chave = [] } = item;
  return `
  <div class="modal fade" id="modal-${id}" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">${nome}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
      </div>
      <div class="modal-body">
        ${resumo ? `<p><em>Resumo:</em> ${resumo}</p>` : ''}
        ${bio ? `<p><strong>Bio:</strong> ${bio}</p>` : ''}
        ${palavras_chave.length ? `<p><strong>Palavras-chave:</strong> ${palavras_chave.join(', ')}</p>` : ''}
      </div>
    </div></div>
  </div>`;
}

function modalMesa(item) {
  const { id, nome, bio, temas = [] } = item;
  return `
  <div class="modal fade" id="modal-${id}" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">${nome} – Mesa Redonda</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
      </div>
      <div class="modal-body">
        ${bio ? `<p><strong>Bio:</strong> ${bio}</p>` : ''}
        ${temas.length ? `<p><strong>Temas de discussão:</strong></p><ul>${temas.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
      </div>
    </div></div>
  </div>`;
}

/* CARGA PRINCIPAL (Palestrantes, minicursos y mesa redonda) */
function loadPalestras() {
  const min   = document.getElementById('container-minicursos');
  const plen  = document.getElementById('container-palestrantes');
  const mesa  = document.getElementById('container-mesa');

  /* 1. Abortamos si ya se pintó una vez */
  if (min?.dataset.loaded === '1') return;
  /* 2. Limpiamos por si el usuario volvió a la página */
  min.innerHTML  = '';
  plen.innerHTML = '';
  mesa.innerHTML = '';

  fetch(PALESTRAS_JSON)
    .then(r => r.json())
    .then(data => {
      data.forEach(item => {
        const card  = cardTemplate(item);
        const modal =
          item.categoria === 'MINICURSO'   ? modalMinicurso(item)  :
          item.categoria === 'PALESTRANTE' ? modalPalestrante(item):
                                             modalMesa(item);
        if (item.categoria === 'MINICURSO')        min.insertAdjacentHTML('beforeend', card);
        else if (item.categoria === 'PALESTRANTE') plen.insertAdjacentHTML('beforeend', card);
        else if (item.categoria === 'MESA REDONDA') mesa.insertAdjacentHTML('beforeend', card);
        document.body.insertAdjacentHTML('beforeend', modal);
      });
      /* 3 Marcamos como cargado */
      min.dataset.loaded = '1';
    })
    .catch(err => console.error('Erro ao carregar palestras:', err));
}


/* CARGA DE ESTUDANTES E PÔSTERES*/
/* Devuelve [preview, resto] a partir de un texto largo ------------- */
function splitResumo(texto, max = 180) {
  if (!texto || texto.length <= max) return [texto, ''];      // nada que truncar
  const corte = texto.lastIndexOf(' ', max);                  // no cortar palabras
  return [texto.slice(0, corte) + '…', texto.slice(corte)];
}

function cardEstudante(item) {
  const [preview, resto] = splitResumo(item.resumo, 180);
  const collapseId = `collapse-${item.id}`;
  return `
  <div class="col-md-6 col-lg-4 mb-4">
    <div class="card h-100 shadow-sm">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${item.nome}</h5>
        <p><strong>${item.titulo}</strong></p>
        <!-- Resumo corto -->
        <p class="text-muted mb-2">${preview}</p>
        <!-- Bloque colapsable con el resto -->
        ${resto ? `
          <div class="collapse" id="${collapseId}">
            <p class="text-muted mb-2">${resto}</p>
          </div>
          <a class="btn btn-link p-0 mb-2 mt-auto" data-bs-toggle="collapse"
             href="#${collapseId}" role="button" aria-expanded="false"
             aria-controls="${collapseId}">
            <span class="ver-mais">Ver mais</span>
          </a>
        ` : ''}
        ${item.arquivo
          ? `<a href="${PDF_PATH + item.arquivo}" target="_blank"
               class="btn btn-sm btn-outline-primary btn-cplf-palestras mt-1">PDF</a>`
          : ''}
      </div>
    </div>
  </div>`;
}

function loadEstudantes() {
  const est = document.getElementById('container-palestras-estudantis');
  const pos = document.getElementById('container-posters');
  if (est?.dataset.loaded === '1') return;
  est.innerHTML = '';
  pos.innerHTML = '';
  fetch(ESTUDANTES_JSON)
    .then(r => r.json())
    .then(data => {
      data.forEach(item => {
        const card = cardEstudante(item);
        if (item.categoria === 'PALESTRA ESTUDIANTIL') est.insertAdjacentHTML('beforeend', card);
        else if (item.categoria === 'POSTER')          pos.insertAdjacentHTML('beforeend', card);
      });
      est.dataset.loaded = '1';
    })
    .catch(err => console.error('Erro ao carregar estudantes:', err));
}

/* Buenas prácticas */

function runWhenReady(selector, fn) {
  if (document.querySelector(selector)) {
    fn();
  } else {
    // Observa el DOM hasta que el nodo exista
    const obs = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        obs.disconnect();
        fn();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
}

document.addEventListener('click', e => {
  const link = e.target.closest('.btn-link[data-bs-toggle="collapse"]');
  if (!link) return;

  const span = link.querySelector('.ver-mais');
  /* Bootstrap actualiza aria-expanded automáticamente */
  setTimeout(() => {
    const expanded = link.getAttribute('aria-expanded') === 'true';
    if (span) span.textContent = expanded ? 'Ver menos' : 'Ver mais';
  }, 150); // espera a que termine la animación
});










/* =========================================================================
   FOOTER
   ====================================================================== */

// Scroll al hacer clic en el logo del footer
document.addEventListener("click", function (e) {
  if (e.target.closest("#logo-footer")) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});











// página completas de tu SPA (terminan en .html)
const SPA_PAGES = ["home.html", "palestrantes.html", "inscricoes.html", "schedule.html"];

function handleRouting() {
  const fragment = location.hash.substring(1);
  if (SPA_PAGES.includes(fragment)) {
    // si es una página .html conocida, la cargamos
    loadPage(fragment);
  } else if (fragment) {
    // si es un ancla interna, hacemos scroll
    const target = document.getElementById(fragment);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  } else {
    // sin hash, cargamos home
    loadPage("home.html");
  }
}

// Al inicio y en cada cambio de hash:
document.addEventListener("DOMContentLoaded", handleRouting);
window.addEventListener("hashchange", handleRouting);

// Para tus enlaces de nivel superior (navbar), que usan data-page:
document.addEventListener("click", e => {
  const link = e.target.closest("[data-page]");
  if (!link) return;
  e.preventDefault();
  location.hash = link.dataset.page;
});








