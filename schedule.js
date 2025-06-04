/* =========================================================================
   HORARIO - 
   ====================================================================== */

const DAYS = ['2025-10-14','2025-10-15','2025-10-16','2025-10-17'];
const LABELS = ['Terça 14','Quarta 15','Quinta 16','Sexta 17'];

const COLOR_BY_TYPE = {
  'MINICURSO': 'bg-info text-white',
  'PALESTRANTE': 'bg-primary text-white',
  'POSTER': 'bg-warning',
  'COFFEE': 'bg-light',
  'ALMUERZO': 'bg-light',
  'REGISTRO': 'bg-light',
  'PALESTU': 'bg-light'
};

let SPEAKER_LOOKUP = {}; // Global para uso general

function loadSchedule() {
  Promise.all([
    fetch(PALESTRAS_JSON).then(res => res.json()),
    fetch('schedule.json').then(res => res.json())
  ])
  .then(([palestrantes, schedule]) => {
    SPEAKER_LOOKUP = palestrantes.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
    drawSchedule(schedule);
  })
  .catch(err => console.error('❌ Erro ao carregar dados do cronograma', err));
}

function drawSchedule(data) {
  const thead = `<thead><tr><th>Hora</th>${LABELS.map(d => `<th>${d}</th>`).join('')}</tr></thead>`;
  const rows = [];

  for (let h = 8; h <= 17; h++) {
    ['00', '30'].forEach(min => {
      const hora = `${String(h).padStart(2, '0')}:${min}`;
      rows.push({ hora, cols: Array(4).fill('') });
    });
  }



  data.forEach(s => {
    const col = DAYS.indexOf(s.dia);
    if (col < 0) return;

    const start = rows.findIndex(r => r.hora === s.hora_inicio);
    const end = rows.findIndex(r => r.hora === s.hora_fin);
    const rowspan = end - start;

    const speaker = s.speaker_id ? SPEAKER_LOOKUP[s.speaker_id] : null;
    const label = speaker ? speaker.nome : (s.titulo || s.tipo);
    const link = speaker ? `palestrantes.html#${speaker.id}` : null;
    const color = COLOR_BY_TYPE[s.tipo] || 'bg-light';

    const content = link
      ? `<a href="${link}" class="stretched-link text-decoration-none">${label}</a>`
      : `<span>${label}</span>`;

    rows[start].cols[col] = `
      <td class="${color}" rowspan="${rowspan}" style="vertical-align: middle; text-align: center;">
        ${content}
      </td>`;

    for (let i = start + 1; i < end; i++) {
      rows[i].cols[col] = 'SKIP';
    }
  });

  const tbody = rows.map(r => {
    const cols = r.cols.map(c => (c === 'SKIP' ? '' : (c || '<td></td>'))).join('');
    return `<tr><th scope="row">${r.hora}</th>${cols}</tr>`;
  }).join('');

  document.getElementById('tabla-horario').innerHTML = thead + `<tbody>${tbody}</tbody>`;
}
