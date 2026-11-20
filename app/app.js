// Vice City Trophy Guide — tracker, filters, spoiler setting, export/import, detail view.
// All data comes from data/trophies.json in this folder. Nothing is fetched from the network.
const DATA_URL = 'data/trophies.json';
const STORAGE_KEY = 'gta6-trophy-guide-v1';

const SOURCE_URLS = {
  'PowerPyx': 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/',
  'GTABase': 'https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series',
  'KeenGamer': 'https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/',
  'HowToVideoGame': 'https://howtovideogame.com/gta-6-trophies/',
  'GTA Zone': 'https://gta-zone.com/news/gta-6-trophies-achievements/',
  'Press Start': 'https://press-start.com.au/news/2026/11/18/gta-6-trophy-list/',
};

const KIND_LABELS = {
  platinum: 'Platinum',
  story: 'Story',
  completion: '100% completion',
  activity: 'Activity',
  robbery: 'Robbery',
  combat: 'Combat',
  collectible: 'Collectible',
  exploration: 'Exploration',
  money: 'Money',
  side: 'Stranger / side strand',
  misc: 'Misc',
};

const state = loadState();
let trophies = [];

function loadState() {
  const fallback = { earned: [], hideSpoilers: true };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [],
      hideSpoilers: parsed.hideSpoilers !== false,
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or full storage: the tracker still works for this visit.
  }
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function isEarned(trophy) {
  return state.earned.includes(trophy.id);
}

function isSpoilerHidden(trophy) {
  return state.hideSpoilers && trophy.story && !isEarned(trophy);
}

function setEarned(id, earned) {
  const numericId = Number(id);
  const others = trophies.filter((t) => t.grade !== 'platinum');
  if (earned) {
    if (!state.earned.includes(numericId)) state.earned.push(numericId);
    // The platinum pops when the other 54 are earned, so tick it too.
    if (others.every((t) => state.earned.includes(t.id))) {
      const platinum = trophies.find((t) => t.grade === 'platinum');
      if (platinum && !state.earned.includes(platinum.id)) state.earned.push(platinum.id);
    }
  } else {
    state.earned = state.earned.filter((n) => n !== numericId);
    // Un-earning anything un-earns the platinum as well.
    const platinum = trophies.find((t) => t.grade === 'platinum');
    if (platinum && numericId !== platinum.id) {
      state.earned = state.earned.filter((n) => n !== platinum.id);
    }
  }
  saveState();
  renderAll();
}

function readFilters() {
  return {
    search: document.getElementById('searchInput').value.trim().toLowerCase(),
    kind: document.getElementById('kindFilter').value,
    grade: document.getElementById('gradeFilter').value,
    earnedOnly: document.getElementById('earnedOnlyToggle').checked,
    unconfirmedOnly: document.getElementById('unconfirmedToggle').checked,
  };
}

function trophyMatches(trophy, filters) {
  if (filters.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (filters.kind !== 'all' && trophy.kind !== filters.kind) {
    return false;
  }
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.earnedOnly && !isEarned(trophy)) return false;
  if (filters.unconfirmedOnly && !trophy.unconfirmed) return false;
  if (filters.search) {
    const haystack = [trophy.name, trophy.description, trophy.guide, KIND_LABELS[trophy.kind] || trophy.kind, trophy.chapter || '']
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(filters.search)) return false;
  }
  return true;
}

function renderProgress() {
  const earned = trophies.filter(isEarned);
  const total = trophies.length;
  const percent = total ? Math.round((earned.length / total) * 100) : 0;
  document.getElementById('earnedCount').textContent = String(earned.length);
  document.getElementById('percent').textContent = percent + '%';
  document.getElementById('progressFill').style.width = percent + '%';
  document.getElementById('progressBar').setAttribute('aria-valuenow', String(earned.length));
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    const earnedInGrade = inGrade.filter(isEarned).length;
    document.getElementById('count' + gradeLabel(grade)).textContent = earnedInGrade + '/' + inGrade.length;
  }
  const platinum = trophies.find((t) => t.grade === 'platinum');
  const note = document.getElementById('platinumNote');
  if (platinum && isEarned(platinum)) {
    note.textContent = 'Platinum earned — you are a Leonida Legend. Congratulations!';
  } else {
    note.textContent = 'The platinum pops the moment the other 54 are earned. Tick trophies off as you earn them in the game.';
  }
}

function renderList() {
  const filters = readFilters();
  const list = document.getElementById('trophyList');
  const shown = trophies.filter((t) => trophyMatches(t, filters));
  document.getElementById('showingLine').textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies.';
  document.getElementById('listCount').textContent = '(' + shown.length + ' shown)';
  document.getElementById('emptyLine').hidden = shown.length > 0;

  list.innerHTML = shown.map((trophy) => {
    const earned = isEarned(trophy);
    const hidden = isSpoilerHidden(trophy);
    const name = hidden ? '???' : escapeHtml(trophy.name);
    const desc = hidden
      ? 'Story trophy — hidden until earned. Tick it off once you have earned it in the game.'
      : escapeHtml(trophy.description);
    const badges = [
      trophy.hidden ? '<span class="badge hidden-badge">Hidden</span>' : '',
      trophy.missable ? '<span class="badge missable-badge">Missable</span>' : '',
      trophy.unconfirmed ? '<span class="badge unconfirmed-badge">Unconfirmed</span>' : '',
    ].join('');
    return '<li class="trophy' + (earned ? ' earned' : '') + '" data-id="' + trophy.id + '">' +
      '<div class="trophy-top">' +
        '<input type="checkbox" data-earn="' + trophy.id + '"' + (earned ? ' checked' : '') + ' aria-label="Earned: ' + escapeHtml(hidden ? 'story trophy' : trophy.name) + '">' +
        '<div><p class="trophy-name' + (hidden ? ' spoiler' : '') + '">' + name + '</p>' +
        '<p class="trophy-desc">' + desc + '</p></div>' +
      '</div>' +
      '<div class="trophy-meta"><span class="grade-badge ' + trophy.grade + '">' + gradeLabel(trophy.grade) + '</span>' +
        '<span class="kind-tag">' + escapeHtml(KIND_LABELS[trophy.kind] || trophy.kind) + '</span>' + badges + '</div>' +
      '<div class="trophy-foot">' +
        '<span class="chapter">' + (trophy.chapter ? escapeHtml(trophy.chapter) : '') + '</span>' +
        '<button type="button" class="guide-link" data-open-trophy="' + trophy.id + '">Guide &amp; sources</button>' +
      '</div></li>';
  }).join('');
}

function renderAll() {
  renderProgress();
  renderList();
}

function sourceLinks(names) {
  return names.map((name) => {
    const url = SOURCE_URLS[name];
    const label = escapeHtml(name);
    return url ? '<li><a href="' + url + '">' + label + '</a></li>' : '<li>' + label + '</li>';
  }).join('');
}

function openDetail(id) {
  const trophy = trophies.find((t) => t.id === Number(id));
  if (!trophy) return;
  const overlay = document.getElementById('detailOverlay');
  const hidden = isSpoilerHidden(trophy);
  const badge = document.getElementById('detailGradeBadge');
  badge.className = 'grade-badge ' + trophy.grade;
  badge.textContent = gradeLabel(trophy.grade);
  document.getElementById('detailKind').textContent = KIND_LABELS[trophy.kind] || trophy.kind;
  document.getElementById('detailChapter').textContent = trophy.chapter ? ' · ' + trophy.chapter : '';
  document.getElementById('detailName').textContent = hidden ? '??? — story trophy' : trophy.name;
  document.getElementById('detailDesc').textContent = hidden
    ? 'Hidden until earned. This is a story trophy: its name, description and guide stay hidden while the spoiler setting is on. Tick it as earned below to reveal it.'
    : trophy.description;
  const hiddenBadge = document.getElementById('detailHidden');
  const missableBadge = document.getElementById('detailMissable');
  const unconfirmedBadge = document.getElementById('detailUnconfirmed');
  hiddenBadge.hidden = !trophy.hidden;
  missableBadge.hidden = !trophy.missable;
  unconfirmedBadge.hidden = !trophy.unconfirmed;
  const missableNote = document.getElementById('detailMissableNote');
  missableNote.hidden = !trophy.missable || !trophy.missableNote;
  missableNote.textContent = trophy.missable && trophy.missableNote ? trophy.missableNote : '';
  const unconfirmedNote = document.getElementById('detailUnconfirmedNote');
  unconfirmedNote.hidden = !trophy.unconfirmed;
  unconfirmedNote.textContent = trophy.unconfirmed
    ? 'Trigger unconfirmed: ' + (trophy.unconfirmedNote || 'the exact trigger has not been confirmed by the major guides yet, so this guide does not invent a method.')
    : '';
  document.getElementById('detailGuide').textContent = hidden
    ? 'Hidden until earned — see above.'
    : trophy.guide;
  document.getElementById('detailSources').innerHTML = hidden
    ? '<li>Hidden until earned.</li>'
    : sourceLinks(trophy.sources);
  const earnedBox = document.getElementById('detailEarned');
  earnedBox.checked = isEarned(trophy);
  earnedBox.dataset.trophyId = String(trophy.id);
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  document.getElementById('detailOverlay').hidden = true;
  document.body.style.overflow = '';
}

function exportProgress() {
  const payload = {
    app: 'vice-city-trophy-guide',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
    hideSpoilers: state.hideSpoilers,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const earned = Array.isArray(parsed.earned) ? parsed.earned : parsed;
      if (!Array.isArray(earned)) throw new Error('bad file');
      const valid = new Set(trophies.map((t) => t.id));
      state.earned = earned.filter((n) => Number.isInteger(n) && valid.has(n));
      if (typeof parsed.hideSpoilers === 'boolean') {
        state.hideSpoilers = parsed.hideSpoilers;
        document.getElementById('spoilerToggle').checked = state.hideSpoilers;
      }
      saveState();
      renderAll();
    } catch {
      alert('That file is not a progress export from this guide.');
    }
  };
  reader.readAsText(file);
}

function applyQueryParams() {
  const params = new URLSearchParams(location.search);
  const grade = params.get('grade');
  if (grade && ['platinum', 'gold', 'silver', 'bronze'].includes(grade)) {
    document.getElementById('gradeFilter').value = grade;
  }
  const kind = params.get('kind');
  const kindSelect = document.getElementById('kindFilter');
  if (kind && [...kindSelect.options].some((o) => o.value === kind)) {
    kindSelect.value = kind;
  }
  if (params.get('view') === 'roadmap') {
    document.body.classList.add('roadmap-view');
  }
  const trophy = params.get('trophy');
  if (trophy) openDetail(trophy);
}

async function init() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  trophies = Array.isArray(data) ? data : data.trophies;

  document.getElementById('spoilerToggle').checked = state.hideSpoilers;
  document.getElementById('searchInput').addEventListener('input', renderList);
  document.getElementById('kindFilter').addEventListener('change', renderList);
  document.getElementById('gradeFilter').addEventListener('change', renderList);
  document.getElementById('earnedOnlyToggle').addEventListener('change', renderList);
  document.getElementById('unconfirmedToggle').addEventListener('change', renderList);
  document.getElementById('spoilerToggle').addEventListener('change', (event) => {
    state.hideSpoilers = event.target.checked;
    saveState();
    renderList();
  });

  document.getElementById('trophyList').addEventListener('change', (event) => {
    const box = event.target.closest('[data-earn]');
    if (box) setEarned(box.dataset.earn, box.checked);
  });
  document.getElementById('trophyList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-open-trophy]');
    if (button) openDetail(button.dataset.openTrophy);
  });
  document.querySelectorAll('[data-open-trophy]').forEach((button) => {
    if (button.closest('#trophyList')) return;
    button.addEventListener('click', () => openDetail(button.dataset.openTrophy));
  });
  document.getElementById('detailClose').addEventListener('click', closeDetail);
  document.getElementById('detailOverlay').addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeDetail();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDetail();
  });
  document.getElementById('detailEarned').addEventListener('change', (event) => {
    setEarned(event.target.dataset.trophyId, event.target.checked);
    const trophy = trophies.find((t) => t.id === Number(event.target.dataset.trophyId));
    if (trophy && !document.getElementById('detailOverlay').hidden) openDetail(trophy.id);
  });

  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importFile').addEventListener('change', (event) => {
    if (event.target.files && event.target.files[0]) importProgress(event.target.files[0]);
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies?')) {
      state.earned = [];
      saveState();
      renderAll();
    }
  });

  applyQueryParams();
  renderAll();
}

init();
