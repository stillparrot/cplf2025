document.addEventListener("DOMContentLoaded", function () {
  // Cargar navbar
  fetch("navbar.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("navbar").innerHTML = data;
    });

  // Cargar footer
  fetch("footer.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("footer").innerHTML = data;
    });

  // Verifica se há uma página no hash da URL (como #inscricoes.html)
  const pageFromHash = location.hash ? location.hash.substring(1) : "home.html";
  loadPage(pageFromHash);
});

// Delegador global para links com data-page
document.addEventListener("click", function (e) {
  const link = e.target.closest("[data-page]");
  if (link) {
    e.preventDefault();
    const page = link.getAttribute("data-page");
    loadPage(page);
    history.pushState({}, "", `#${page}`); // atualiza a URL sem recarregar
  }
});

// Lidar com o botão "voltar" do navegador
window.addEventListener("popstate", function () {
  const pageFromHash = location.hash ? location.hash.substring(1) : "home.html";
  loadPage(pageFromHash);
});

function loadPage(page) {
  fetch(page)
    .then(res => {
      if (!res.ok) throw new Error(`Erro ao carregar ${page}`);
      return res.text();
    })
    .then(html => {
      const content = document.getElementById("content");
      content.innerHTML = html;          // ahora los contenedores existen

      /* 🟢 dispara los loaders SOLO para las páginas que lo necesitan */
      if (page === 'palestrantes.html') {
        loadPalestras();
      }
      if (page === 'palestrantes.html') {
        loadEstudantes();
      }
      if (page === 'schedule.html') {
        loadSchedule();
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    })
    .catch(err => {
      document.getElementById("content").innerHTML = `
        <div class="container py-5 text-center">
          <h2>Erro ao carregar a página</h2>
          <p>${err.message}</p>
        </div>`;
    });
}




/* =========================================================================
   CONFIGURACIÓN BÁSICA
   -------------------------------------------------------------------------
   Cambia estos valores si tus archivos o carpetas tienen otros nombres.
   ====================================================================== */
const PALESTRAS_JSON   = 'palestras.json';   // Minicursos, palestras plenarias, mesa redonda
const ESTUDANTES_JSON  = 'estudantes.json';  // Palestras estudantis y pósteres
const IMG_PATH         = 'images/palestrantes/'; // Carpeta de fotos (termina en “/”)
const PDF_PATH         = 'pdfs/';         // Carpeta de PDFs (termina en “/”)

/* =========================================================================
   UTILIDADES
   ====================================================================== */
/* Convierte un texto en un identificador “seguro” si algún día lo necesitas */
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/* Inserta HTML en un contenedor (helper para abreviar) */
function appendHTML(containerId, html) {
  document.getElementById(containerId).insertAdjacentHTML('beforeend', html);
}

/* =========================================================================
   PLANTILLAS DE TARJETAS Y MODALES
   ====================================================================== */
function cardTemplate(item) {
  const { id, foto, nome, afiliacao, titulo, categoria } = item;
  const modalId = `modal-${id}`;
  /* Título visible (“Minicurso: …” o “Título: …”) */
  const label = categoria === 'MINICURSO'
    ? 'Minicurso:'
    : categoria === 'PALESTRANTE'
      ? 'Título:'
      : categoria === 'MESA REDONDA'
        ? ''
        : '';

  return `
  <div class="col-12 col-md-6 col-lg-4 mb-4">
    <div class="card h-100 shadow-sm" style="min-height:230px;">

      <div class="d-flex flex-column flex-lg-row h-100">

        <!-- Imagen desktop -->
        <img src="${foto || IMG_PATH + 'placeholder.png'}"
             class="img-fluid rounded-start d-none d-lg-block"
             style="width:160px;height:100%;object-fit:cover;border-top-left-radius:.375rem;border-bottom-left-radius:.375rem;"
             alt="Foto de ${nome}">

        <!-- Imagen mobile -->
        <img src="${foto || IMG_PATH + 'placeholder.png'}"
             class="rounded-circle mt-3 mb-0 shadow-sm mx-auto d-block d-lg-none"
             style="width:160px;height:160px;object-fit:cover; flex-shrink:0;"
             alt="Foto de ${nome}">

        <!-- Cuerpo -->
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${nome}</h5>
          <p class="text-muted mb-2">${afiliacao || ''}</p>
          ${label ? `<p class="card-text flex-grow-1"><strong>${label}</strong> ${titulo}</p>` : ''}
          <div class="mt-3 mt-lg-auto text-lg-end">
            <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#${modalId}">
              Mais info
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>`;
}

/* ---------- Modales específicos ---------- */
function modalMinicurso(item) {
  const { id, nome, resumo, detalhes } = item;
  return `
  <div class="modal fade" id="modal-${id}" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title">${nome} – Minicurso</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
        </div>

        <div class="modal-body">
          ${resumo ? `<p><em>Resumo:</em> ${resumo}</p>` : ''}
          ${detalhes?.programa ? `<p><strong>Programa:</strong></p>
            <ul>${detalhes.programa.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
          ${detalhes?.nivel ? `<p><strong>Nível:</strong> ${detalhes.nivel}</p>` : ''}
          ${detalhes?.material ? `<a href="${detalhes.material}" target="_blank" class="btn btn-sm btn-secondary">Material preliminar</a>` : ''}
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

/* =========================================================================
   CARGA PRINCIPAL (Palestrantes, minicursos y mesa redonda)
   ====================================================================== */
function loadPalestras() {
  const min   = document.getElementById('container-minicursos');
  const plen  = document.getElementById('container-palestrantes');
  const mesa  = document.getElementById('container-mesa');

  /* 1️⃣  Abortamos si ya se pintó una vez */
  if (min?.dataset.loaded === '1') return;

  /* 2️⃣  Limpiamos por si el usuario volvió a la página */
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

      /* 3️⃣  Marcamos como cargado */
      min.dataset.loaded = '1';
    })
    .catch(err => console.error('Erro ao carregar palestras:', err));
}


/* =========================================================================
   (Opcional) CARGA DE ESTUDANTES E PÔSTERES
   ====================================================================== */
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
               class="btn btn-sm btn-outline-primary mt-1">PDF</a>`
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


/* =========================================================================
   INICIALIZACIÓN CUANDO EL DOM ESTÉ LISTO
   ====================================================================== 
document.addEventListener('DOMContentLoaded', () => {
  loadPalestras();
  loadEstudantes();   // quita esta línea si aún no usas estudantes.json
}); */

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

/* Lanza el cargado solo cuando #container-minicursos aparezca 
runWhenReady('#container-minicursos', loadPalestras); */

/* Si también cargas estudantes.json así: 
runWhenReady('#container-palestras-estudantis', loadEstudantes);*/

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


// Scroll al hacer clic en el logo del footer
document.addEventListener("click", function (e) {
  if (e.target.closest("#logo-footer")) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});


