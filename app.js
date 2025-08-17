
function titleFor(route){
  switch(route){
    case 'compare': return 'Vergelijker';
    case 'map': return 'Kaart';
    case 'help': return 'Uitleg';
    case 'settings': return 'Instellingen';
    default: return 'Dashboard';
  }
}
// Sport Fryslân Dashboard – Pure client-side app
// Routing, state, file upload (xlsx/csv), filters, KPI tiles, compare, map (Leaflet), settings.

/** ---------- Global State ---------- */
const AppState = {
  rows: [],            // raw records (array of objects)
  filtered: [],        // filtered records
  filters: [],         // [{ field, op, value }]; op currently only 'contains' or 'equals'
  datasetName: null,
  schema: [],          // list of field names
  mapping: {          // field mapping (customizable in settings)
    name: null,
    city: null,
    latitude: null,
    longitude: null,
    group: null // generic grouping field
  },
  theme: {
    brand: getVar('--brand') || '#212945',
    accent: getVar('--accent') || '#52E8E8',
    font: 'Archivo'
  }
};

function getVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function setVar(name, val){ document.documentElement.style.setProperty(name, val); }

function saveState(){
  localStorage.setItem('sf_dashboard_state', JSON.stringify({
    mapping: AppState.mapping,
    theme: AppState.theme
  }));
}
function loadState(){
  try{
    const data = JSON.parse(localStorage.getItem('sf_dashboard_state'));
    if(!data) return;
    if(data.mapping) Object.assign(AppState.mapping, data.mapping);
    if(data.theme){
      Object.assign(AppState.theme, data.theme);
      setVar('--brand', AppState.theme.brand);
      setVar('--accent', AppState.theme.accent);
    }
  }catch(e){}
}
loadState();

/** ---------- Router ---------- */
const routes = {
  'dashboard': renderDashboard,
  'compare': renderCompare,
  'map': renderMap,
  'help': renderHelp,
  'settings': renderSettings
};

function navigate(){
  const hash = location.hash.replace('#/', '') || 'dashboard';
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('data-route') === hash);
  });
  const view = document.getElementById('view'); document.getElementById('pageTitle').textContent = titleFor(hash);
  view.innerHTML = '';
  (routes[hash] || renderDashboard)(view);
}
window.addEventListener('hashchange', navigate);

/** ---------- File Upload ---------- */
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  AppState.datasetName = file.name;
  document.getElementById('datasetName').textContent = file.name;

  if(file.name.toLowerCase().endsWith('.csv')){
    const text = await file.text();
    AppState.rows = parseCSV(text);
  } else {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    AppState.rows = XLSX.utils.sheet_to_json(ws, { defval: null });
  }
  AppState.schema = inferSchema(AppState.rows);
  AppState.filters = [];
  applyFilters();
  populateFilterField();
  navigate();
});

function parseCSV(text){
  const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(',').map(h => h.trim());
  return lines.map(line => {
    const parts = splitCsv(line);
    const obj = {};
    headers.forEach((h, i) => obj[h] = parts[i] !== undefined ? coerce(parts[i]) : null);
    return obj;
  });
}
function splitCsv(line){
  const out=[], re=/(?:^|,)("(?:(?:"")*[^"]*)*"|[^,]*)/g; let m;
  while(m = re.exec(line)){
    let v = m[1];
    if(v.startsWith(',')) v = v.slice(1);
    v = v.replace(/^"|"$/g, '').replace(/""/g, '"');
    out.push(v);
  }
  return out;
}
function coerce(v){
  if(v === '') return null;
  const n = Number(v);
  if(!isNaN(n) && v.trim() !== '') return n;
  if(v.toLowerCase?.() === 'true') return true;
  if(v.toLowerCase?.() === 'false') return false;
  return v;
}

/** ---------- Filters ---------- */
function inferSchema(rows){
  const keys = new Set();
  rows.slice(0, 50).forEach(r => Object.keys(r).forEach(k => keys.add(k)));
  return Array.from(keys);
}
function applyFilters(){
  AppState.filtered = AppState.rows.filter(row => {
    return AppState.filters.every(f => {
      const cell = (row[f.field] ?? '').toString().toLowerCase();
      const val = (f.value ?? '').toString().toLowerCase();
      if(f.op === 'equals') return cell === val;
      return cell.includes(val);
    });
  });
}

function populateFilterField(){
  const sel = document.getElementById('filterField');
  sel.innerHTML = '';
  AppState.schema.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k; opt.textContent = k;
    sel.appendChild(opt);
  });
}

document.getElementById('addFilter').addEventListener('click', ()=>{
  const field = document.getElementById('filterField').value;
  const value = document.getElementById('filterValue').value;
  if(!field || !value) return;
  AppState.filters.push({ field, op:'contains', value });
  applyFilters();
  renderFilterBadges();
  navigate();
});
document.getElementById('clearFilters').addEventListener('click', ()=>{
  AppState.filters = [];
  applyFilters();
  renderFilterBadges();
  navigate();
});
document.getElementById('resetApp').addEventListener('click', ()=>{
  localStorage.removeItem('sf_dashboard_state');
  location.reload();
});

function renderFilterBadges(){
  const view = document.getElementById('view'); document.getElementById('pageTitle').textContent = titleFor(hash);
  const existing = document.getElementById('filterBadges');
  if(existing) existing.remove();
  const wrap = document.createElement('div');
  wrap.id = 'filterBadges';
  wrap.className = 'stack';
  const row = document.createElement('div');
  row.className = 'flex';
  AppState.filters.forEach((f, idx)=>{
    const b = document.createElement('span');
    b.className = 'badge';
    b.textContent = `${f.field} contains "${f.value}"`;
    b.title = 'Klik om te verwijderen';
    b.style.cursor = 'pointer';
    b.addEventListener('click', ()=>{
      AppState.filters.splice(idx,1);
      applyFilters(); renderFilterBadges(); navigate();
    });
    row.appendChild(b);
  });
  if(AppState.filters.length){
    wrap.appendChild(row);
    view.prepend(wrap);
  }
}

/** ---------- KPI Helpers ---------- */
function kpiCount(rows){ return rows.length; }
function kpiPercent(part, whole){ return whole === 0 ? 0 : Math.round((part/whole)*1000)/10; } // 1 decimaal

function kpiUnique(rows, field){
  const set = new Set(rows.map(r => r[field]).filter(v => v !== null && v !== undefined));
  return set.size;
}

function kpiSum(rows, field){
  return rows.reduce((acc,r)=> acc + (typeof r[field] === 'number' ? r[field] : 0), 0);
}

function createTile({label, value, sub}){
  const div = document.createElement('div');
  div.className = 'tile';
  div.innerHTML = `<div class="kpi">${formatKPI(value)}</div>
    <div class="label">${label}</div>
    ${sub ? `<div class="sub">${sub}</div>` : ''}`;
  return div;
}

// --- Extra: inline controls inside the Dashboard first card (upload + filters) ---
function makeInlineControls(){
  const wrap = document.createElement('div');
  wrap.className = 'flex';
  const up = document.createElement('button');
  up.className = 'btn'; up.textContent = 'Upload dataset';
  up.addEventListener('click', () => document.getElementById('fileInput').click());
  const name = document.createElement('div');
  name.style.marginLeft = '8px';
  name.style.color = 'var(--muted)';
  name.textContent = AppState.datasetName ? AppState.datasetName : 'Geen dataset geladen';

  // Local filter UI
  const sel = document.createElement('select'); sel.style.marginLeft = 'auto';
  AppState.schema.forEach(k => { const o=document.createElement('option'); o.value=k; o.textContent=k; sel.appendChild(o); });
  const inp = document.createElement('input'); inp.placeholder = 'Filterwaarde...';
  const add = document.createElement('button'); add.className='btn'; add.textContent='+ Filter';
  const clr = document.createElement('button'); clr.className='btn btn-ghost'; clr.textContent='Reset';

  add.addEventListener('click', ()=>{
    const field = sel.value; const value = inp.value; if(!field || !value) return;
    AppState.filters.push({ field, op:'contains', value }); applyFilters(); renderFilterBadges(); navigate();
  });
  clr.addEventListener('click', ()=>{ AppState.filters=[]; applyFilters(); renderFilterBadges(); navigate(); });

  wrap.appendChild(up); wrap.appendChild(name);
  wrap.appendChild(sel); wrap.appendChild(inp); wrap.appendChild(add); wrap.appendChild(clr);
  return wrap;
}

function formatKPI(v){
  if(typeof v === 'number'){
    // Format integers vs decimals
    if(Number.isInteger(v)) return v.toLocaleString('nl-NL');
    return v.toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }
  return v;
}

/** ---------- Dashboard ---------- */
function renderDashboard(mount){
  // Card 1: Data & Filters (like "Mijn dagplanning" area)
  const card1 = document.createElement('div'); card1.className='card stack';
  const t1 = document.createElement('div'); t1.className='section-title'; t1.innerHTML = '<span>Data</span>';
  card1.appendChild(t1);
  card1.appendChild(makeInlineControls());
  mount.appendChild(card1);

  // Card 2: Kerncijfers
  const card2 = document.createElement('div'); card2.className='card';
  const t2 = document.createElement('div'); t2.className='section-title'; t2.innerHTML = '<span>Kerncijfers</span>';
  card2.appendChild(t2);

  renderFilterBadges();

  const total = AppState.rows.length;
  const current = AppState.filtered.length;

  const grid = document.createElement('div');
  grid.className = 'tile-grid';

  grid.appendChild(createTile({ label: 'Totaal (alle rijen)', value: total }));
  grid.appendChild(createTile({ label: 'Huidige selectie', value: current, sub: `${kpiPercent(current, total)}% van totaal` }));

  if(AppState.mapping.group && AppState.schema.includes(AppState.mapping.group)){
    grid.appendChild(createTile({ label: `Unieke "${AppState.mapping.group}" in selectie`, value: kpiUnique(AppState.filtered, AppState.mapping.group) }));
  }

  const numericFields = AppState.schema.filter(k => AppState.filtered.some(r => typeof r[k] === 'number'));
  numericFields.slice(0,4).forEach(k => {
    grid.appendChild(createTile({ label: `Som ${k} (selectie)`, value: kpiSum(AppState.filtered, k) }));
  });

  if(AppState.mapping.city && AppState.schema.includes(AppState.mapping.city)){
    const withCity = AppState.filtered.filter(r => !!r[AppState.mapping.city]).length;
    grid.appendChild(createTile({ label: `Records met ${AppState.mapping.city}`, value: kpiPercent(withCity, current) + '%', sub: `${withCity} van ${current}` }));
  }

  card2.appendChild(grid);
  mount.appendChild(card2);

  // Card 3: Overzicht (placeholder for extension; currently duplicates key totals to match layout density)
  const card3 = document.createElement('div'); card3.className='card';
  const t3 = document.createElement('div'); t3.className='section-title'; t3.innerHTML = '<span>Overzicht</span>';
  card3.appendChild(t3);
  const grid2 = document.createElement('div'); grid2.className='tile-grid';
  grid2.appendChild(createTile({ label: 'Records', value: current }));
  grid2.appendChild(createTile({ label: 'Unieke velden (schema)', value: AppState.schema.length }));
  card3.appendChild(grid2);
  mount.appendChild(card3);
}

/** ---------- Compare (Vergelijker) ---------- */
function renderCompare(mount){
  const wrapper = document.createElement('div'); wrapper.className='card';
  const title = document.createElement('div'); title.className='section-title'; title.textContent='Vergelijker'; wrapper.appendChild(title);

  const wrap = document.createElement('div');
  wrap.className = 'split-2';

  const left = document.createElement('div');
  const right = document.createElement('div');
  left.className = 'card'; right.className = 'card';

  left.innerHTML = `<h3>Set A</h3>`;
  right.innerHTML = `<h3>Set B</h3>`;

  const setA = makeCompareBlock('A');
  const setB = makeCompareBlock('B');

  left.appendChild(setA.block);
  right.appendChild(setB.block);

  wrap.appendChild(left); wrap.appendChild(right);
  wrapper.appendChild(wrap);
  mount.appendChild(wrapper);

  function update(){
    renderCompareTiles(setA, left);
    renderCompareTiles(setB, right);
  }
  setA.onChange = update;
  setB.onChange = update;
  update();
}

function makeCompareBlock(label){
  const block = document.createElement('div');
  const selField = document.createElement('select');
  const inpValue = document.createElement('input');
  const btn = document.createElement('button');
  selField.style.marginRight = '8px';
  inpValue.placeholder = 'Filterwaarde...';
  btn.textContent = 'Toepassen';
  btn.className = 'btn'; btn.style.marginLeft = '8px';

  AppState.schema.forEach(k => {
    const opt = document.createElement('option'); opt.value=k; opt.textContent=k; selField.appendChild(opt);
  });

  block.appendChild(selField); block.appendChild(inpValue); block.appendChild(btn);
  const tiles = document.createElement('div'); tiles.className = 'tile-grid'; tiles.style.marginTop = '12px';
  block.appendChild(tiles);

  const state = { field: null, value: '', rows: [] };
  btn.addEventListener('click', ()=>{
    state.field = selField.value; state.value = inpValue.value;
    state.rows = AppState.rows.filter(r => ((r[state.field] ?? '') + '').toLowerCase().includes(state.value.toLowerCase()));
    if(block.onChange) block.onChange();
  });

  return { block, state, tiles, onChange: null };
}

function renderCompareTiles(set, container){
  const tiles = set.block.querySelector('.tile-grid');
  tiles.innerHTML = '';
  const total = AppState.rows.length;
  const current = set.state.rows.length;

  tiles.appendChild(createTile({ label: 'Rijen in set', value: current, sub: `${kpiPercent(current,total)}% van totaal` }));

  if(AppState.mapping.group && AppState.schema.includes(AppState.mapping.group)){
    tiles.appendChild(createTile({ label: `Unieke ${AppState.mapping.group}`, value: kpiUnique(set.state.rows, AppState.mapping.group) }));
  }
  const numericFields = AppState.schema.filter(k => set.state.rows.some(r => typeof r[k] === 'number'));
  numericFields.slice(0,3).forEach(k => {
    tiles.appendChild(createTile({ label: `Som ${k}`, value: kpiSum(set.state.rows, k) }));
  });
}

/** ---------- Map (Kaart) ---------- */
function renderMap(mount){
  const wrapper = document.createElement('div'); wrapper.className='card';
  const title = document.createElement('div'); title.className='section-title'; title.textContent='Kaart'; wrapper.appendChild(title);

  const card = document.createElement('div');
  card.className = 'card';
  const info = document.createElement('div');
  info.className = 'stack';
  info.innerHTML = `
    <div><strong>Kaartweergave</strong></div>
    <div class="sub">Zet in Instellingen de kolommen voor latitude/longitude. Zonder deze velden kan de kaart niet tekenen.</div>
  `;
  const mapWrap = document.createElement('div');
  mapWrap.className = 'map-wrap';
  mapWrap.id = 'map';
  card.appendChild(info); card.appendChild(mapWrap);
  wrapper.appendChild(card);
  mount.appendChild(wrapper);

  // Initialize Leaflet
  const map = L.map('map').setView([52.1, 5.3], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  const latK = AppState.mapping.latitude;
  const lonK = AppState.mapping.longitude;
  if(!latK || !lonK){
    return;
  }
  const pts = AppState.filtered
    .map(r => ({ lat: Number(r[latK]), lon: Number(r[lonK]), name: AppState.mapping.name ? r[AppState.mapping.name] : null }))
    .filter(p => isFinite(p.lat) && isFinite(p.lon));

  pts.forEach(p => {
    const m = L.marker([p.lat, p.lon]).addTo(map);
    if(p.name) m.bindPopup(`<strong>${p.name}</strong>`);
  });
  if(pts.length){
    const group = new L.featureGroup(pts.map(p => L.marker([p.lat, p.lon])));
    map.fitBounds(group.getBounds().pad(0.25));
  }
}

/** ---------- Help (Uitleg) ---------- */
function renderHelp(mount){
  const wrapper = document.createElement('div'); wrapper.className='card';
  const title = document.createElement('div'); title.className='section-title'; title.textContent='Uitleg'; wrapper.appendChild(title);

  const card = document.createElement('div'); card.className = 'card stack';
  card.innerHTML = `
    <h3>Uitleg</h3>
    <p>Upload een <strong>.xlsx</strong> of <strong>.csv</strong> via de knop linksboven. De eerste sheet/het CSV-bestand wordt ingelezen.</p>
    <ul>
      <li>Pas filters toe via het veld- en waarde-invoer. Klik op een filterbadge om deze te verwijderen.</li>
      <li>De tegels tonen aantallen en percentages op basis van de huidige selectie.</li>
      <li>In <em>Vergelijker</em> kun je twee filtersets naast elkaar bekijken.</li>
      <li>In <em>Kaart</em> toon je locaties als je <code>latitude</code> en <code>longitude</code> kolommen hebt ingesteld in <em>Instellingen</em>.</li>
      <li>In <em>Instellingen</em> stel je branding en veldmapping in. Alles wordt lokaal opgeslagen.</li>
    </ul>
    <p>Er worden <strong>geen gegevens geüpload naar een server</strong>; alles draait in je browser.</p>
  `;
  wrapper.appendChild(card);
  mount.appendChild(wrapper);
}

/** ---------- Settings (Instellingen) ---------- */
function renderSettings(mount){
  const wrapper = document.createElement('div'); wrapper.className='card';
  const title = document.createElement('div'); title.className='section-title'; title.textContent='Instellingen'; wrapper.appendChild(title);

  const card = document.createElement('div'); card.className='card stack';
  card.innerHTML = `<h3>Instellingen</h3>`;

  // Branding
  const themeBlock = document.createElement('div'); themeBlock.className='stack';
  themeBlock.innerHTML = `
    <h4>Branding</h4>
    <div class="flex">
      <label class="stack" style="flex:1">
        <span>Merk-kleur (brand)</span>
        <input type="color" id="brandColor" value="${AppState.theme.brand}"/>
      </label>
      <label class="stack" style="flex:1">
        <span>Accent-kleur</span>
        <input type="color" id="accentColor" value="${AppState.theme.accent}"/>
      </label>
    </div>
  `;

  // Mapping
  const mappingBlock = document.createElement('div'); mappingBlock.className='stack';
  mappingBlock.innerHTML = `<h4>Veldmapping</h4>`;
  const fields = ['name','city','group','latitude','longitude'];
  fields.forEach(f => {
    const sel = document.createElement('select'); sel.id = `map_${f}`;
    const wrap = document.createElement('div'); wrap.className='stack';
    const label = document.createElement('span'); label.textContent = `${f}`;
    const noneOpt = document.createElement('option'); noneOpt.value=''; noneOpt.textContent='(geen)';
    sel.appendChild(noneOpt);
    AppState.schema.forEach(k => {
      const opt = document.createElement('option'); opt.value=k; opt.textContent=k; sel.appendChild(opt);
    });
    if(AppState.mapping[f]) sel.value = AppState.mapping[f];
    wrap.appendChild(label); wrap.appendChild(sel);
    mappingBlock.appendChild(wrap);
  });

  const saveBtn = document.createElement('button'); saveBtn.textContent='Opslaan'; saveBtn.className='btn';
  saveBtn.addEventListener('click', ()=>{
    const brand = document.getElementById('brandColor').value;
    const accent = document.getElementById('accentColor').value;
    setVar('--brand', brand); setVar('--accent', accent);
    AppState.theme.brand = brand; AppState.theme.accent = accent;
    ['name','city','group','latitude','longitude'].forEach(f => {
      const v = document.getElementById(`map_${f}`).value || null;
      AppState.mapping[f] = v;
    });
    saveState();
    alert('Instellingen opgeslagen ✅');
  });

  card.appendChild(themeBlock);
  card.appendChild(mappingBlock);
  card.appendChild(saveBtn);

  wrapper.appendChild(card);
  mount.appendChild(wrapper);
}

/** ---------- Boot ---------- */
navigate();

/** Enhance filter field after load */
function afterLoad(){
  populateFilterField();
}
document.addEventListener('DOMContentLoaded', afterLoad);
