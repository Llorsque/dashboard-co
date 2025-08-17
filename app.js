
const AppState = {
  rows: [],
  filtered: [],
  mapping: { latitude:'latitude', longitude:'longitude' }
};

const FixedFilters = { gemeente:null, sportbond:null, sport:null, doelgroep:null };

function titleSuffix(){
  const parts=[];
  if(FixedFilters.gemeente) parts.push(FixedFilters.gemeente);
  if(FixedFilters.sportbond) parts.push(FixedFilters.sportbond);
  if(FixedFilters.sport) parts.push(FixedFilters.sport);
  if(FixedFilters.doelgroep) parts.push(FixedFilters.doelgroep);
  return parts.length ? ' – ' + parts.join(' – ') : '';
}

// Basic layout
function renderShell(){
  const root = document.getElementById('app');
  root.innerHTML = '';
  const app = document.createElement('div'); app.className='app';

  const aside = document.createElement('aside'); aside.className='sidebar';
  const b = document.createElement('div'); b.className='brand';
  b.innerHTML = 'Sport Fryslân<small>CO Data analyse</small>';
  aside.appendChild(b);

  const nav = document.createElement('nav'); nav.className='nav';
  const items = [
    ['#/dashboard','Dashboard'],
    ['#/compare','Vergelijker'],
    ['#/map','Kaart'],
    ['#/help','Uitleg'],
    ['#/settings','Instellingen'],
  ];
  items.forEach(([href,label])=>{
    const a = document.createElement('a'); a.href=href; a.textContent=label;
    a.addEventListener('click', (e)=>{ e.preventDefault(); navigate(href); });
    a.dataset.href = href;
    nav.appendChild(a);
  });
  aside.appendChild(nav);

  const main = document.createElement('main'); main.className='main'; main.id='main';
  app.appendChild(aside); app.appendChild(main);
  root.appendChild(app);

  // initial active link
  setActiveLink(location.hash || '#/dashboard');
}

// Helpers
function detectDelimiter(text){
  const candidates=[',',';','\t','|'];
  let best=',', bestScore=-1;
  for(const d of candidates){
    const lines = text.split(/\r?\n/).slice(0,10);
    const counts = lines.map(l => l.split(d).length);
    const variance = Math.max(...counts) - Math.min(...counts);
    if(variance===0 && counts[0]>1){
      return d;
    }
    if(counts[0]>bestScore){ bestScore=counts[0]; best=d; }
  }
  return best;
}

function parseCSV(text){
  const delim = detectDelimiter(text);
  const [headerLine, ...rows] = text.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(delim).map(h => h.trim());
  return rows.map(line => {
    const vals = line.split(delim);
    const obj = {};
    headers.forEach((h,i)=> obj[h] = vals[i]!==undefined ? vals[i] : '');
    return obj;
  });
}

function coerceNumberNL(v){
  if(v===null||v===undefined) return NaN;
  const s = String(v).trim();
  if(!s) return NaN;
  if(/^-?\d+,\d+$/.test(s) && !s.includes('.')) return Number(s.replace(',', '.'));
  const n = Number(s);
  return isNaN(n) ? NaN : n;
}

function setActiveLink(hash){
  document.querySelectorAll('.nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.href === hash);
  });
}

function applyDropdownFilters(){
  const src = AppState.rows || [];
  AppState.filtered = src.filter(r =>
    (!FixedFilters.gemeente || r.gemeente===FixedFilters.gemeente) &&
    (!FixedFilters.sportbond || r.sportbond===FixedFilters.sportbond) &&
    (!FixedFilters.sport || r.sport===FixedFilters.sport) &&
    (!FixedFilters.doelgroep || r.doelgroep===FixedFilters.doelgroep)
  );
}

function uniqueSorted(arr){ return Array.from(new Set(arr.filter(Boolean))).sort((a,b)=> (''+a).localeCompare(b)); }

function buildDropdownFilters(){
  const mount = document.getElementById('filters');
  mount.innerHTML = '';

  const mkSel = (id,label,values)=>{
    const wrap = document.createElement('div');
    const s = document.createElement('select'); s.className='select'; s.id=id;
    const opt = document.createElement('option'); opt.value=''; opt.textContent=label+' (Alle)'; s.appendChild(opt);
    values.forEach(v => { const o=document.createElement('option'); o.value=v; o.textContent=v; s.appendChild(o); });
    s.addEventListener('change', ()=>{
      const key = id.split('_')[1];
      FixedFilters[key] = s.value || null;
      applyDropdownFilters();
      updateKpiTitle();
      renderGrid();
      renderList();
    });
    wrap.appendChild(s);
    return wrap;
  };

  const rows = AppState.rows || [];
  const gem = uniqueSorted(rows.map(r=>r.gemeente));
  const bonds = uniqueSorted(rows.map(r=>r.sportbond));
  const sport = uniqueSorted(rows.map(r=>r.sport));
  const doel = uniqueSorted(rows.map(r=>r.doelgroep));

  mount.appendChild(mkSel('sel_gemeente','Gemeente',gem));
  mount.appendChild(mkSel('sel_sportbond','Sportbond',bonds));
  mount.appendChild(mkSel('sel_sport','Sport',sport));
  mount.appendChild(mkSel('sel_doelgroep','Doelgroep',doel));
}

// Dashboard
function renderDashboard(){
  const main = document.getElementById('main'); main.innerHTML='';

  // Uploader / toolbar
  const card1 = document.createElement('div'); card1.className='card';
  const t1 = document.createElement('div'); t1.className='section-title'; t1.textContent='Dataset laden'; card1.appendChild(t1);
  const up = document.createElement('div'); up.className='uploader';
  const file = document.createElement('input'); file.type='file'; file.accept='.csv,.txt';
  const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Laad dataset';
  const dm = document.createElement('button'); dm.className='btn btn-ghost'; dm.textContent='Gebruik dummy data';
  up.appendChild(file); up.appendChild(btn); up.appendChild(dm); card1.appendChild(up);
  main.appendChild(card1);

  btn.addEventListener('click', async()=>{
    const f = file.files && file.files[0];
    if(!f) return alert('Kies eerst een CSV-bestand');
    const txt = await f.text();
    const rows = parseCSV(txt).map(normalizeRow);
    AppState.rows = rows; applyDropdownFilters(); updateKpiTitle(); buildDropdownFilters(); renderGrid(); renderList();
  });
  dm.addEventListener('click', ()=>{
    AppState.rows = makeDummyData(); applyDropdownFilters(); updateKpiTitle(); buildDropdownFilters(); renderGrid(); renderList();
  });

  // KPI's
  const card2 = document.createElement('div'); card2.className='card';
  const ktitle = document.createElement('div'); ktitle.className='section-title'; ktitle.id='kpiTitle'; ktitle.textContent='Kerncijfers'; card2.appendChild(ktitle);
  const filters = document.createElement('div'); filters.className='toolbar'; filters.id='filters'; card2.appendChild(filters);
  const grid = document.createElement('div'); grid.className='tile-grid'; grid.id='kpiGrid'; card2.appendChild(grid);
  main.appendChild(card2);

  // Selectie
  const card3 = document.createElement('div'); card3.className='card';
  const t3 = document.createElement('div'); t3.className='section-title'; t3.id='selTitle'; t3.textContent='Selectie'; card3.appendChild(t3);
  const list = document.createElement('div'); list.className='sel-list'; list.id='selList'; card3.appendChild(list);
  main.appendChild(card3);

  // Init
  AppState.rows = AppState.rows && AppState.rows.length ? AppState.rows : makeDummyData();
  applyDropdownFilters();
  buildDropdownFilters();
  updateKpiTitle();
  renderGrid();
  renderList();
}

function updateKpiTitle(){
  const el = document.getElementById('kpiTitle');
  if(!el) return;
  el.textContent = 'Kerncijfers' + titleSuffix();
  const el2 = document.getElementById('selTitle');
  if(el2) el2.textContent = 'Selectie' + (AppState.filtered ? ` (${AppState.filtered.length})` : '');
}

function renderGrid(){
  const grid = document.getElementById('kpiGrid'); grid.innerHTML = '';
  const rows = AppState.filtered || [];
  const total = rows.length;
  const perGem = new Set(rows.map(r=>r.gemeente)).size;
  const perBond = new Set(rows.map(r=>r.sportbond)).size;
  const perSport = new Set(rows.map(r=>r.sport)).size;

  const kpis = [
    {label:'Verenigingen', value: total},
    {label:'Gemeenten', value: perGem},
    {label:'Sportbonden', value: perBond},
    {label:'Sporten', value: perSport},
    {label:'% met coördinaten', value: rows.length ? Math.round(100*rows.filter(r=>r.latitude && r.longitude).length/rows.length)+'%' : '0%'},
  ];
  // Fill up to 12 tiles
  while(kpis.length < 12) kpis.push({label:'—', value:'—'});

  kpis.slice(0,12).forEach(k=>{
    const d = document.createElement('div'); d.className='tile';
    const v = document.createElement('div'); v.className='kpi-value'; v.textContent = k.value;
    const s = document.createElement('div'); s.className='kpi-sub'; s.textContent = k.label;
    d.appendChild(v); d.appendChild(s);
    grid.appendChild(d);
  });
}

function renderList(){
  const listEl = document.getElementById('selList'); if(!listEl) return;
  const rows = AppState.filtered || [];
  listEl.innerHTML = '';
  if(!rows.length){
    const empty = document.createElement('div'); empty.className='sel-item'; empty.textContent='Geen resultaten met deze filters'; listEl.appendChild(empty);
    return;
  }
  rows.forEach(r => {
    const item = document.createElement('div'); item.className='sel-item'; item.textContent = r.naam || '(naam onbekend)';
    listEl.appendChild(item);
  });
}

// Map
function renderMap(mount){
  const main = document.getElementById('main'); main.innerHTML='';

  const card = document.createElement('div'); card.className='card';
  const t = document.createElement('div'); t.className='section-title'; t.id='mapTitle'; t.textContent='Kaart' + titleSuffix(); card.appendChild(t);
  const sub = document.createElement('div'); sub.className='sub'; sub.id='mapCount'; sub.textContent=''; card.appendChild(sub);
  const mapDiv = document.createElement('div'); mapDiv.style.height='70vh'; card.appendChild(mapDiv);
  main.appendChild(card);

  const map = L.map(mapDiv).setView([53.1, 5.8], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'© OpenStreetMap'}).addTo(map);

  const rows = (AppState.filtered && AppState.filtered.length) ? AppState.filtered : AppState.rows;
  const pts = rows.map(r => ({ lat: coerceNumberNL(r.latitude), lon: coerceNumberNL(r.longitude), row: r })).filter(p => isFinite(p.lat) && isFinite(p.lon));

  const subEl = document.getElementById('mapCount');
  if(subEl) subEl.textContent = pts.length + ' locaties gevonden';

  if(!pts.length){
    L.popup({ closeButton:false, autoClose:false }).setLatLng([53.2,5.8]).setContent('Geen resultaten').openOn(map);
    return;
  }

  const markers = pts.map(p => {
    const m = L.marker([p.lat, p.lon]).addTo(map);
    const name = p.row.naam || 'Vereniging';
    m.bindPopup('<strong>'+name+'</strong>');
    return m;
  });
  const group = L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.25));
}

// Data normalization
function normalizeRow(r){
  const obj = {};
  const lower = {};
  Object.keys(r).forEach(k => lower[k.toLowerCase()] = r[k]);

  obj.naam = lower['naam'] || lower['vereniging'] || lower['organisatienaam'] || r.naam || '';
  obj.gemeente = lower['gemeente'] || lower['vestigingsgemeente'] || lower['plaats'] || '';
  obj.sportbond = lower['sportbond'] || lower['bond'] || '';
  obj.sport = lower['sport'] || lower['subsoort_organisatie'] || '';
  obj.doelgroep = lower['doelgroep'] || 'Gemengd';
  obj.latitude = r.latitude || r.Latitude || r.lat || r.breedtegraad || '';
  obj.longitude = r.longitude || r.Longitude || r.lon || r.lengtegraad || '';
  obj.leden = r.leden || lower['aantal_leden'] || '';
  obj.vrijwilligers = r.vrijwilligers || '';
  obj.contributie = r.contributie || '';

  return obj;
}

// Dummy data (200 clubs in Friese gemeenten)
function makeDummyData(){
  const gemeenten = ['Leeuwarden','Smallingerland','Súdwest-Fryslân','Heerenveen','De Fryske Marren','Waadhoeke','Noardeast-Fryslân','Ooststellingwerf','Weststellingwerf','Opsterland','Achtkarspelen','Harlingen','Dantumadiel','Tytsjerksteradiel','Schiermonnikoog','Ameland','Terschelling','Vlieland'];
  const sporten = ['Voetbal','Korfbal','Hockey','Gymnastiek','Tennis','Zwemmen','Atletiek','Basketbal','Volleybal','Judo','Badminton','Rugby'];
  const bonden = {'Voetbal':'KNVB','Korfbal':'KNKV','Hockey':'KNHB','Gymnastiek':'KNGU','Tennis':'KNLTB','Zwemmen':'KNZB','Atletiek':'Atletiekunie','Basketbal':'NBB','Volleybal':'Nevobo','Judo':'JBN','Badminton':'Badminton Nederland','Rugby':'NRB'};
  const out=[];
  for(let i=1;i<=200;i++){
    const g = gemeenten[Math.floor(Math.random()*gemeenten.length)];
    const s = sporten[Math.floor(Math.random()*sporten.length)];
    out.push({
      naam: 'Vereniging '+i,
      gemeente: g,
      sport: s,
      sportbond: bonden[s],
      doelgroep: 'Gemengd',
      latitude: '',
      longitude: '',
      leden: '',
      vrijwilligers: '',
      contributie: ''
    });
  }
  return out;
}

// Router
function navigate(hash){
  const h = hash || location.hash || '#/dashboard';
  history.replaceState(null, '', h);
  setActiveLink(h);
  if(h==='#/dashboard') renderDashboard();
  else if(h==='#/map') renderMap();
  else {
    const main = document.getElementById('main'); main.innerHTML='';
    const card = document.createElement('div'); card.className='card';
    const t = document.createElement('div'); t.className='section-title'; t.textContent='Onder constructie'; card.appendChild(t);
    main.appendChild(card);
  }
}

// Boot
window.addEventListener('hashchange', ()=> navigate());
renderShell();
navigate();
