// Sport Fryslân Dashboard – client-side
function getVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function setVar(name, val){ document.documentElement.style.setProperty(name, val); }

const AppState = {
  rows: [],
  filtered: [],
  filters: [],
  datasetName: null,
  schema: [],
  mapping: { name: 'naam', city: 'gemeente', group: 'sport', latitude: 'latitude', longitude: 'longitude' },
  theme: { brand: getVar('--brand') || '#212945', accent: getVar('--accent') || '#52E8E8', font: 'Archivo' },
  pendingFile: null,
  usingDummy: true
};

const DummyRows = [
  {naam:'VV Oerterp', gemeente:'Opsterland', sportbond:'KNVB', sport:'Voetbal', doelgroep:'Senioren', latitude:53.0732, longitude:6.0967, leden:250, vrijwilligers:40, contributie:185},
  {naam:'SV Bakkeveen', gemeente:'Opsterland', sportbond:'KNGU', sport:'Turnen', doelgroep:'Jeugd', latitude:53.0658, longitude:6.2667, leden:180, vrijwilligers:30, contributie:160},
  {naam:'VV Wolvega', gemeente:'Weststellingwerf', sportbond:'KNVB', sport:'Voetbal', doelgroep:'Gemengd', latitude:52.8755, longitude:6.0032, leden:320, vrijwilligers:55, contributie:195},
  {naam:'SC Jubbega', gemeente:'Heerenveen', sportbond:'KNVB', sport:'Voetbal', doelgroep:'Jeugd', latitude:52.9890, longitude:6.0683, leden:210, vrijwilligers:35, contributie:170},
  {naam:'VV Oosterstreek', gemeente:'Weststellingwerf', sportbond:'KNVB', sport:'Voetbal', doelgroep:'Senioren', latitude:52.8804, longitude:6.1437, leden:150, vrijwilligers:22, contributie:165},
  {naam:'Shorttrack Drachten', gemeente:'Smallingerland', sportbond:'KNSB', sport:'Schaatsen', doelgroep:'Jeugd', latitude:53.1125, longitude:6.0989, leden:95, vrijwilligers:18, contributie:140},
  {naam:'Basket Leeuwarden', gemeente:'Leeuwarden', sportbond:'NBB', sport:'Basketbal', doelgroep:'Senioren', latitude:53.2012, longitude:5.7999, leden:210, vrijwilligers:28, contributie:175},
  {naam:'Hockey Sneek', gemeente:'Súdwest-Fryslân', sportbond:'KNHB', sport:'Hockey', doelgroep:'Gemengd', latitude:53.0323, longitude:5.6589, leden:260, vrijwilligers:42, contributie:220},
  {naam:'Volley Bolsward', gemeente:'Súdwest-Fryslân', sportbond:'Nevobo', sport:'Volleybal', doelgroep:'Jeugd', latitude:53.0667, longitude:5.5333, leden:140, vrijwilligers:20, contributie:150},
  {naam:'Tennis Gorredijk', gemeente:'Opsterland', sportbond:'KNLTB', sport:'Tennis', doelgroep:'Senioren', latitude:53.0092, longitude:6.0668, leden:130, vrijwilligers:16, contributie:155},
  {naam:'Badminton Heerenveen', gemeente:'Heerenveen', sportbond:'Badminton Nederland', sport:'Badminton', doelgroep:'Gemengd', latitude:52.9599, longitude:5.9242, leden:85, vrijwilligers:12, contributie:120},
  {naam:'Zwem Joure', gemeente:'De Fryske Marren', sportbond:'KNZB', sport:'Zwemmen', doelgroep:'Jeugd', latitude:52.9650, longitude:5.8000, leden:175, vrijwilligers:24, contributie:145}
];

function saveState(){
  localStorage.setItem('sf_dashboard_state', JSON.stringify({
    theme: AppState.theme
  }));
}
function loadState(){
  try{
    const data = JSON.parse(localStorage.getItem('sf_dashboard_state'));
    if(data && data.theme){
      Object.assign(AppState.theme, data.theme);
      setVar('--brand', AppState.theme.brand);
      setVar('--accent', AppState.theme.accent);
    }
  }catch(e){}
}
loadState();

/** Utils */
function inferSchema(rows){ const s = new Set(); rows.slice(0,50).forEach(r => Object.keys(r).forEach(k => s.add(k))); return Array.from(s); }
function uniqueValues(rows, field){ return Array.from(new Set(rows.map(r => r[field]).filter(v => v!==null && v!==undefined))).sort((a,b)=>(''+a).localeCompare((''+b),'nl')); }
function average(rows, field){ if(!rows.length) return 0; const sum = rows.reduce((a,r)=> a + (typeof r[field]==='number'? r[field]:0), 0); return sum/rows.length; }
function fmtCurrency(v){ return (v||0).toLocaleString('nl-NL', { style:'currency', currency:'EUR', maximumFractionDigits:0 }); }
function formatKPI(v){ if(typeof v==='number'){ if(Number.isInteger(v)) return v.toLocaleString('nl-NL'); return v.toLocaleString('nl-NL',{minimumFractionDigits:1,maximumFractionDigits:1}); } return v; }
function parseCSV(text){
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length);
  const headers = lines.shift().split(',').map(h=>h.trim());
  const out = [];
  for(const line of lines){
    const parts = []; const re=/(?:^|,)("(?:(?:"")*[^"]*)*"|[^,]*)/g; let m;
    let i=0;
    while(m = re.exec(line)){ let v = m[1]; if(v.startsWith(',')) v=v.slice(1); v=v.replace(/^"|"$/g,'').replace(/""/g,'"'); parts.push(v); i++; }
    const obj = {}; headers.forEach((h,i)=>{
      const raw = parts[i] ?? '';
      const n = Number(raw);
      if(raw === '') obj[h] = null;
      else if(!isNaN(n) && raw.trim()!=='') obj[h] = n;
      else if(['true','false'].includes(String(raw).toLowerCase())) obj[h] = String(raw).toLowerCase()==='true';
      else obj[h]=raw;
    });
    out.push(obj);
  }
  return out;
}

/** Router */
const routes = {
  'dashboard': renderDashboard,
  'compare': renderCompare,
  'map': renderMap,
  'help': renderHelp,
  'settings': renderSettings
};
function titleFor(route){ switch(route){ case 'compare': return 'Vergelijker'; case 'map': return 'Kaart'; case 'help': return 'Uitleg'; case 'settings': return 'Instellingen'; default: return 'Dashboard'; } }
function navigate(){
  const hash = location.hash.replace('#/','') || 'dashboard';
  document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.getAttribute('data-route')===hash));
  const view = document.getElementById('view'); view.innerHTML='';
  document.getElementById('pageTitle').textContent = titleFor(hash);
  (routes[hash]||renderDashboard)(view);
}
window.addEventListener('hashchange', navigate);

/** File input: only select (pending); separate button loads */
document.addEventListener('DOMContentLoaded', ()=>{
  const fileInput = document.getElementById('fileInput');
  if(fileInput){
    fileInput.addEventListener('change', (e)=>{
      const file = e.target.files[0]; if(!file) return;
      AppState.pendingFile = file; AppState.datasetName = file.name;
      const ds = document.querySelector('.dataset-name'); if(ds) ds.textContent = file.name + ' (klaar om te laden)';
    });
  }
  document.getElementById('resetApp').addEventListener('click', ()=>{ localStorage.removeItem('sf_dashboard_state'); location.reload(); });
});

/** Dropdown filters */
const FixedFilters = { gemeente:null, sportbond:null, sport:null, doelgroep:null };
function buildDropdownFilters(){
  const src = AppState.rows.length ? AppState.rows : DummyRows;
  const setSel = (id, field)=>{
    const el = document.getElementById(id); if(!el) return;
    const keep = el.value;
    el.innerHTML=''; const a=document.createElement('option'); a.value=''; a.textContent='(Alle)'; el.appendChild(a);
    uniqueValues(src, field).forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; el.appendChild(o); });
    if(keep && Array.from(el.options).some(o=>o.value===keep)) el.value=keep;
  };
  setSel('ff_gemeente','gemeente'); setSel('ff_sportbond','sportbond'); setSel('ff_sport','sport'); setSel('ff_doelgroep','doelgroep');
}
function applyDropdownFilters(){
  const src = AppState.rows.length ? AppState.rows : DummyRows;
  AppState.filtered = src.filter(r => (!FixedFilters.gemeente || r.gemeente===FixedFilters.gemeente)
    && (!FixedFilters.sportbond || r.sportbond===FixedFilters.sportbond)
    && (!FixedFilters.sport || r.sport===FixedFilters.sport)
    && (!FixedFilters.doelgroep || r.doelgroep===FixedFilters.doelgroep));
}

/** Dashboard */
async function loadSelectedFile(){
  const file = AppState.pendingFile;
  if(!file){ alert('Kies eerst een bestand.'); return; }
  if(file.name.toLowerCase().endsWith('.csv')){
    const text = await file.text(); AppState.rows = parseCSV(text);
  }else{
    const data = await file.arrayBuffer(); const wb = XLSX.read(data,{type:'array'}); const ws = wb.Sheets[wb.SheetNames[0]];
    AppState.rows = XLSX.utils.sheet_to_json(ws,{defval:null});
  }
  AppState.schema = inferSchema(AppState.rows); AppState.usingDummy = false; AppState.filters=[]; applyDropdownFilters(); buildDropdownFilters(); navigate();
}

function renderDashboard(mount){
  if(!AppState.rows.length && AppState.usingDummy){
    AppState.rows = DummyRows.slice(); AppState.schema = inferSchema(AppState.rows); buildDropdownFilters(); applyDropdownFilters();
  }

  // Controls card
  const card1 = document.createElement('div'); card1.className='card stack';
  const head = document.createElement('div'); head.className='section-title'; head.textContent='Data & Filters'; card1.appendChild(head);
  const ctl = document.createElement('div'); ctl.className='flex';
  const pick = document.createElement('button'); pick.className='btn'; pick.textContent='Kies bestand'; pick.addEventListener('click', ()=> document.getElementById('fileInput').click());
  const load = document.createElement('button'); load.className='btn'; load.textContent='Laad dataset'; load.addEventListener('click', loadSelectedFile);
  const useDummy = document.createElement('button'); useDummy.className='btn btn-ghost'; useDummy.textContent='Gebruik dummy data';
  useDummy.addEventListener('click', ()=>{ AppState.rows = DummyRows.slice(); AppState.schema=inferSchema(AppState.rows); AppState.usingDummy=true; buildDropdownFilters(); applyDropdownFilters(); navigate(); });
  const name = document.createElement('div'); name.style.marginLeft='8px'; name.style.color='var(--muted)'; name.textContent = AppState.datasetName || 'Geen dataset geladen';
  ctl.appendChild(pick); ctl.appendChild(load); ctl.appendChild(useDummy); ctl.appendChild(name);
  card1.appendChild(ctl);

  const filterRow = document.createElement('div'); filterRow.className='filter-row';
  const mk = (label,id)=>{ const g=document.createElement('div'); g.className='group'; const l=document.createElement('div'); l.className='label-sm'; l.textContent=label; const s=document.createElement('select'); s.id=id; s.addEventListener('change',()=>{ FixedFilters[id.split('_')[1]]= s.value||null; applyDropdownFilters(); renderGrid(); }); g.appendChild(l); g.appendChild(s); return g; };
  filterRow.appendChild(mk('Gemeente','ff_gemeente'));
  filterRow.appendChild(mk('Sportbond','ff_sportbond'));
  filterRow.appendChild(mk('Sport','ff_sport'));
  filterRow.appendChild(mk('Doelgroep','ff_doelgroep'));
  card1.appendChild(filterRow);

  const reset = document.createElement('button'); reset.className='btn btn-ghost'; reset.textContent='Wis filters';
  reset.addEventListener('click', ()=>{ Object.keys(FixedFilters).forEach(k=>FixedFilters[k]=null); ['ff_gemeente','ff_sportbond','ff_sport','ff_doelgroep'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';}); applyDropdownFilters(); renderGrid(); });
  card1.appendChild(reset);

  mount.appendChild(card1);

  // KPI grid card
  const card2 = document.createElement('div'); card2.className='card';
  const t2 = document.createElement('div'); t2.className='section-title'; t2.textContent='Kerncijfers'; card2.appendChild(t2);
  const grid = document.createElement('div'); grid.className='tile-grid fixed-4'; grid.id='kpiGrid'; card2.appendChild(grid);
  mount.appendChild(card2);

  buildDropdownFilters();
  renderGrid();

  function renderGrid(){
    applyDropdownFilters();
    const total = (AppState.rows.length||0);
    const rows = AppState.filtered;
    const current = rows.length||0;
    const sum = (rows, f)=> rows.reduce((a,r)=> a + (typeof r[f]==='number'? r[f]:0), 0);
    const uniq = (rows, f)=> new Set(rows.map(r=> r[f]).filter(Boolean)).size;
    const pct = (a,b)=> b? Math.round((a/b)*1000)/10 : 0;
    const ledenTot = sum(rows,'leden'); const vrijTot = sum(rows,'vrijwilligers');
    const gemLeden = current ? Math.round(ledenTot/current) : 0;
    const vrijPer100 = ledenTot ? Math.round((vrijTot/ledenTot)*1000)/10 : 0;
    const hasLoc = rows.filter(r=> isFinite(Number(r.latitude)) && isFinite(Number(r.longitude))).length;
    const avgContrib = Math.round(average(rows,'contributie'));
    const maxV = rows.slice().sort((a,b)=> (b.leden||0)-(a.leden||0))[0];

    const tiles = [
      { label:'Verenigingen (selectie)', value: current },
      { label:'Totaal leden', value: ledenTot },
      { label:'Gem. leden per vereniging', value: gemLeden },
      { label:'Vrijwilligers totaal', value: vrijTot },

      { label:'Vrijwilligers per 100 leden', value: vrijPer100 },
      { label:'Unieke sporten', value: uniq(rows,'sport') },
      { label:'Unieke sportbonden', value: uniq(rows,'sportbond') },
      { label:'Unieke gemeenten', value: uniq(rows,'gemeente') },

      { label:'Met locatie', value: pct(hasLoc,current)+'%', sub: `${hasLoc}/${current}` },
      { label:'Gem. contributie', value: fmtCurrency(avgContrib) },
      { label:'Selectie / Totaal', xofy: `${current}/${total}`, sub: `${pct(current,total)}%` },
      { label:'Meeste leden (vereniging)', value: maxV? maxV.leden:0, sub: maxV? maxV.naam:'—' }
    ];

    const grid = document.getElementById('kpiGrid'); grid.innerHTML='';
    tiles.forEach(t => {
      const d = document.createElement('div'); d.className='tile equal';
      if(t.xofy){
        d.innerHTML = `<div class="kpi-xofy">${t.xofy}</div><div class="label">${t.label}</div>${t.sub? `<div class="sub">${t.sub}</div>`:''}`;
      }else{
        d.innerHTML = `<div class="kpi kpi-metric">${formatKPI(t.value)}</div><div class="label">${t.label}</div>${t.sub? `<div class="sub">${t.sub}</div>`:''}`;
      }
      grid.appendChild(d);
    });
  }
}

/** Compare */
function renderCompare(mount){
  const card = document.createElement('div'); card.className='card';
  const title = document.createElement('div'); title.className='section-title'; title.textContent='Vergelijker'; card.appendChild(title);
  const p = document.createElement('div'); p.textContent = 'Coming soon: Gebruik filters links in Dashboard voor nu. (Functionaliteit blijft behouden.)';
  card.appendChild(p); mount.appendChild(card);
}

/** Map */
function renderMap(mount){
  const wrapper = document.createElement('div'); wrapper.className='card';
  const title = document.createElement('div'); title.className='section-title'; title.textContent='Kaart'; wrapper.appendChild(title);
  const mapWrap = document.createElement('div'); mapWrap.className='tile equal'; mapWrap.style.height='64vh'; mapWrap.id='map'; wrapper.appendChild(mapWrap);
  mount.appendChild(wrapper);

  const rows = AppState.rows.length ? AppState.rows : DummyRows;
  const map = L.map('map').setView([52.99,5.9], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
  const pts = rows.map(r => ({lat:Number(r.latitude), lon:Number(r.longitude), name:r.naam})).filter(p => isFinite(p.lat)&&isFinite(p.lon));
  pts.forEach(p =>{ const m=L.marker([p.lat,p.lon]).addTo(map); m.bindPopup(`<strong>${p.name}</strong>`); });
  if(pts.length){ const g = L.featureGroup(pts.map(p=>L.marker([p.lat,p.lon]))); map.fitBounds(g.getBounds().pad(0.25)); }
}

/** Help */
function renderHelp(mount){
  const card = document.createElement('div'); card.className='card stack';
  const title = document.createElement('div'); title.className='section-title'; title.textContent='Uitleg'; card.appendChild(title);
  const p = document.createElement('div'); p.innerHTML = '<p>Gebruik <strong>Kies bestand</strong> en daarna <strong>Laad dataset</strong> om data zichtbaar te maken. Pas vervolgens de 4 filters toe om de tegels te sturen. Alles draait lokaal in je browser.</p>'; card.appendChild(p);
  mount.appendChild(card);
}

/** Settings */
function renderSettings(mount){
  const wrapper = document.createElement('div'); wrapper.className='card stack';
  const title = document.createElement('div'); title.className='section-title'; title.textContent='Instellingen'; wrapper.appendChild(title);
  const theme = document.createElement('div'); theme.className='flex';
  const inBrand = document.createElement('input'); inBrand.type='color'; inBrand.value=getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()||'#212945';
  const inAccent = document.createElement('input'); inAccent.type='color'; inAccent.value=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#52E8E8';
  const save = document.createElement('button'); save.className='btn'; save.textContent='Opslaan';
  save.addEventListener('click', ()=>{ document.documentElement.style.setProperty('--brand', inBrand.value); document.documentElement.style.setProperty('--accent', inAccent.value); AppState.theme.brand=inBrand.value; AppState.theme.accent=inAccent.value; saveState(); alert('Instellingen opgeslagen ✅'); });
  theme.append('Merk-kleur', inBrand, 'Accent-kleur', inAccent, save); wrapper.appendChild(theme);
  mount.appendChild(wrapper);
}

/** Boot */
navigate();