
/* Clean app.js with robust router + filters (staged apply) + map */
const AppState = {
  rows: [],
  filtered: [],
  filters: { msGemeente: new Set(), msSport: new Set(), msImpact: new Set(), msType: new Set() },
  staged: null
};

/* Utils */
const $ = sel => document.querySelector(sel);
function el(tag, cls, txt){ const n=document.createElement(tag); if(cls) n.className=cls; if(txt!=null) n.textContent=txt; return n; }
function safe(v, d='—'){ return (v===0 || (v!=null && String(v).trim()!=='')) ? v : d; }
function toNumber(v){ const n=Number(v); return Number.isFinite(n) ? n : null; }
function uniq(arr){ return Array.from(new Set(arr)); }

/* CSV parsing (simple, supports quoted fields) */
function parseCSV(text){
  const rows=[]; let i=0, field='', rec=[], inQ=false;
  const push=()=>{ rec.push(field); field=''; };
  const endRec=()=>{ rows.push(rec); rec=[]; };
  while(i<text.length){
    const c=text[i++];
    if(inQ){
      if(c==='"'){
        if(text[i]==='"'){ field+='"'; i++; }
        else inQ=false;
      }else field+=c;
    }else{
      if(c==='"') inQ=true;
      else if(c===',') push();
      else if(c==='
'){ push(); endRec(); }
      else if(c===''){} else field+=c;
    }
  }
  if(field.length || rec.length){ push(); endRec(); }
  return rows;
}
function rowsFromCSV(text){
  const r=parseCSV(text); if(!r.length) return [];
  const head=r[0].map(h=>h.trim().toLowerCase());
  const idx = name => head.indexOf(name);
  const out=[];
  for(let i=1;i<r.length;i++){
    const row=r[i];
    if(row.length!==head.length) continue;
    const get = k => row[idx(k)] ?? '';
    out.push({
      naam: get('naam') || get('vereniging') || get('club') || 'Onbekend',
      gemeente: get('gemeente'),
      sport: get('sport'),
      sportbond: get('sportbond'),
      type_aanbieder: get('type_aanbieder') || 'Sportaanbieder non-profit',
      adres: get('adres') || '',
      huisnummer: get('huisnummer') || '',
      postcode: get('postcode') || '',
      plaats: get('plaats') || '',
      latitude: toNumber(get('latitude')),
      longitude: toNumber(get('longitude')),
      leden: toNumber(get('leden')) || 0,
      impact_0_4: Number(get('impact_0_4')||0),
      impact_4_12: Number(get('impact_4_12')||0),
      impact_jongeren: Number(get('impact_jongeren')||0),
      impact_volwassenen: Number(get('impact_volwassenen')||0),
      impact_senioren: Number(get('impact_senioren')||0),
      impact_aangepast: Number(get('impact_aangepast')||0),
    });
  }
  return out;
}

/* Multi-select helpers */
function createMultiSelect({label, options, selected}){
  const wrap=el('div','ms-wrap'); const btn=el('button','ms-btn');
  const setTitle=()=>{ const n=selected.size; btn.textContent = n? `${label} (${n})` : `${label} (Alle)`; };
  setTitle(); btn.type='button'; btn.addEventListener('click',e=>{e.stopPropagation();wrap.classList.toggle('open');});
  const panel=el('div','ms-panel'); const list=el('div','ms-list');
  options.forEach(opt=>{ const L=el('label','ms-item'); const cb=el('input'); cb.type='checkbox'; cb.value=opt; cb.checked=selected.has(opt); cb.addEventListener('change',()=>{ if(cb.checked) selected.add(opt); else selected.delete(opt); setTitle(); }); const s=el('span','',opt); L.appendChild(cb); L.appendChild(s); list.appendChild(L); });
  panel.appendChild(list); wrap.appendChild(btn); wrap.appendChild(panel);
  document.addEventListener('click',(e)=>{ if(!wrap.contains(e.target)) wrap.classList.remove('open'); });
  return wrap;
}
function impactLabels(r){
  const labs=[];
  if(r.impact_0_4) labs.push('0-4 jaar');
  if(r.impact_4_12) labs.push('4-12 jaar');
  if(r.impact_jongeren) labs.push('Jongeren');
  if(r.impact_volwassenen) labs.push('Volwassenen');
  if(r.impact_senioren) labs.push('Senioren');
  if(r.impact_aangepast) labs.push('Aangepast Sporten');
  return labs;
}
function providerType(r){
  const s=String(r.type_aanbieder||'').toLowerCase();
  if(s.includes('profit') && !s.includes('non')) return 'Sportaanbieder profit';
  return 'Sportaanbieder non-profit';
}

/* Filters */
function buildFiltersHost(card){
  const host=el('div'); host.id='filters';
  // File row
  const row=el('div','file-row');
  const input=el('input'); input.type='file'; input.accept='.csv';
  const choose=el('label','btn','Kies bestand'); choose.setAttribute('for','fileInput');
  input.id='fileInput'; input.className='hidden-input';
  const load=el('button','btn btn-primary','Laad dataset');
  const name=el('span','dataset-name','Geen dataset geladen');
  load.addEventListener('click',()=>{
    const f=input.files && input.files[0]; if(!f){ alert('Kies eerst een CSV-bestand'); return; }
    const reader=new FileReader();
    reader.onload = e=>{ AppState.rows = rowsFromCSV(e.target.result); AppState.filtered = [...AppState.rows]; name.textContent = f.name; buildDropdownFilters(); updateKpis(); renderList(); };
    reader.readAsText(f, 'utf-8');
  });
  row.appendChild(choose); row.appendChild(load); row.appendChild(name); card.appendChild(input); card.appendChild(row);

  // Filter UI (staged)
  AppState.staged = {
    msGemeente: new Set(AppState.filters.msGemeente),
    msSport: new Set(AppState.filters.msSport),
    msImpact: new Set(AppState.filters.msImpact),
    msType: new Set(AppState.filters.msType),
  };
  buildDropdownFilters();
  return host;
}
function buildDropdownFilters(){
  const bar = $('#filters'); if(!bar) return; bar.innerHTML='';
  const rows = AppState.rows;
  const optsGemeente = uniq(rows.map(r=>r.gemeente).filter(Boolean)).sort((a,b)=>a.localeCompare(b,'nl'));
  const optsSport = uniq(rows.map(r=>r.sport).filter(Boolean)).sort((a,b)=>a.localeCompare(b,'nl'));
  const optsImpact = ['0-4 jaar','4-12 jaar','Jongeren','Volwassenen','Senioren','Aangepast Sporten'];
  const optsType = ['Sportaanbieder non-profit','Sportaanbieder profit'];

  const r = el('div','ms-row');
  r.appendChild(createMultiSelect({label:'Gemeentes', options:optsGemeente, selected:AppState.staged.msGemeente}));
  r.appendChild(createMultiSelect({label:'Sport', options:optsSport, selected:AppState.staged.msSport}));
  r.appendChild(createMultiSelect({label:'Impactgebied', options:optsImpact, selected:AppState.staged.msImpact}));
  r.appendChild(createMultiSelect({label:'Type aanbieder', options:optsType, selected:AppState.staged.msType}));
  bar.appendChild(r);

  const actions = el('div','ms-actions');
  const apply = el('button','btn btn-primary','Filters toepassen');
  apply.addEventListener('click', ()=>{
    AppState.filters = JSON.parse(JSON.stringify({})); // clone keys
    AppState.filters.msGemeente = new Set(AppState.staged.msGemeente);
    AppState.filters.msSport = new Set(AppState.staged.msSport);
    AppState.filters.msImpact = new Set(AppState.staged.msImpact);
    AppState.filters.msType = new Set(AppState.staged.msType);
    applyFilters();
  });
  const clear = el('button','btn btn-ghost','Wis filters');
  clear.addEventListener('click', ()=>{
    AppState.staged.msGemeente.clear(); AppState.staged.msSport.clear(); AppState.staged.msImpact.clear(); AppState.staged.msType.clear();
    AppState.filters.msGemeente.clear(); AppState.filters.msSport.clear(); AppState.filters.msImpact.clear(); AppState.filters.msType.clear();
    applyFilters();
    buildDropdownFilters();
  });
  actions.appendChild(apply); actions.appendChild(clear);
  bar.appendChild(actions);
}
function applyFilters(){
  const rows = AppState.rows || [];
  const F = AppState.filters;
  const selG = Array.from(F.msGemeente||[]);
  const selS = Array.from(F.msSport||[]);
  const selI = Array.from(F.msImpact||[]);
  const selT = Array.from(F.msType||[]);

  const match = r => {
    if(selG.length && !selG.includes(r.gemeente)) return false;
    if(selS.length && !selS.includes(r.sport)) return false;
    if(selI.length){
      const labs=impactLabels(r); if(!selI.some(x=>labs.includes(x))) return false;
    }
    if(selT.length && !selT.includes(providerType(r))) return false;
    return true;
  };
  AppState.filtered = rows.filter(match);
  updateKpis(); renderList(); if(window.location.hash==="#/map") renderMap($('#view'));
}

/* KPI & List */
function updateKpis(){
  const rows = AppState.filtered && AppState.filtered.length ? AppState.filtered : AppState.rows;
  const grid = $('#kpiGrid'); if(!grid) return; grid.innerHTML='';
  const tiles = [
    {l:'Verenigingen', v: rows.length},
    {l:'Gemeenten', v: uniq(rows.map(r=>r.gemeente).filter(Boolean)).length},
    {l:'Sportbonden', v: uniq(rows.map(r=>r.sportbond).filter(Boolean)).length},
    {l:'Sporten', v: uniq(rows.map(r=>r.sport).filter(Boolean)).length},
    {l:'% met coördinaten', v: rows.length? Math.round(100*rows.filter(r=>Number.isFinite(r.latitude)&&Number.isFinite(r.longitude)).length/rows.length)+'%' : '—'},
    {l:'Totaal leden', v: rows.reduce((a,r)=>a+(r.leden||0),0)},
  ];
  // pad to 12
  while(tiles.length<12) tiles.push({l:'—',v:'—'});
  tiles.slice(0,12).forEach(t=>{ const d=el('div','tile'); d.appendChild(el('div','v',String(t.v))); d.appendChild(el('div','l',t.l)); grid.appendChild(d); });
}
function renderList(){
  const mount = $('#selection'); if(!mount) return;
  const rows = AppState.filtered && AppState.filtered.length ? AppState.filtered : AppState.rows;
  mount.innerHTML='';
  rows.slice(0,2000).forEach(r=>{ const li=el('div','list-item', r.naam || 'Onbekend'); mount.appendChild(li); });
}

/* Map */
function renderMap(mount){
  mount.innerHTML='';
  const card=el('div','card');
  const title=el('div','section-title','Kaart'); card.appendChild(title);
  const mapDiv=el('div'); mapDiv.id='map'; card.appendChild(mapDiv);
  mount.appendChild(card);

  const map=L.map(mapDiv).setView([53.1, 5.8], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19, attribution:'© OpenStreetMap'}).addTo(map);

  const rows = AppState.filtered && AppState.filtered.length ? AppState.filtered : AppState.rows;
  const pts = rows.filter(r=>Number.isFinite(r.latitude)&&Number.isFinite(r.longitude)).map(r=>({lat:r.latitude, lon:r.longitude, row:r}));
  const markers=[];
  pts.forEach(p=>{
    const m=L.marker([p.lat,p.lon]).addTo(map);
    m.bindPopup(popupHTML(p.row), {maxWidth:360});
    markers.push(m);
  });
  if(markers.length){
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.25));
  }
}
function popupHTML(r){
  const addr = [r.adres, r.huisnummer, r.postcode, r.plaats].filter(Boolean).join(' ');
  const lines = [
    `<strong>${safe(r.naam,'Onbekend')}</strong>`,
    `${safe(r.sport)} (${safe(r.sportbond)})`,
    addr ? addr : '',
    `Leden: ${safe(r.leden, '—')}`
  ].filter(Boolean);
  return `<div>${lines.map(l=>`<div>${l}</div>`).join('')}</div>`;
}

/* Views */
function renderDashboard(mount){
  mount.innerHTML='';
  // Card 1: Data & Filters
  const card1=el('div','card');
  card1.appendChild(el('div','section-title','Data & Filters'));
  // host builds file row + filters
  const host = buildFiltersHost(card1);
  card1.appendChild(host);
  mount.appendChild(card1);

  // Card 2: KPI grid
  const card2=el('div','card');
  card2.appendChild(el('div','section-title','Kerncijfers'));
  const grid=el('div','tile-grid fixed-4'); grid.id='kpiGrid'; card2.appendChild(grid);
  mount.appendChild(card2);

  // Card 3: selectie lijst
  const card3=el('div','card');
  card3.appendChild(el('div','section-title','Selectie'));
  const list=el('div','list'); list.id='selection'; card3.appendChild(list);
  mount.appendChild(card3);

  updateKpis(); renderList();
}
function renderCompare(mount){
  mount.innerHTML=''; const card=el('div','card'); card.appendChild(el('div','section-title','Vergelijker')); card.appendChild(el('div','','(in ontwikkeling)')); mount.appendChild(card);
}
function renderHelp(mount){
  mount.innerHTML=''; const card=el('div','card'); card.appendChild(el('div','section-title','Uitleg')); card.appendChild(el('div','','Upload een CSV, pas filters toe en bekijk kaart en kerncijfers.')); mount.appendChild(card);
}
function renderSettings(mount){
  mount.innerHTML=''; const card=el('div','card'); card.appendChild(el('div','section-title','Instellingen')); card.appendChild(el('div','','Hier komen layout- en titelinstellingen.')); mount.appendChild(card);
}

/* Router */
function navigate(){
  const hash = window.location.hash || '#/dashboard';
  const page = hash.replace('#/','');
  document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('active', a.getAttribute('href')===hash));
  const t = {dashboard:'Dashboard', compare:'Vergelijker', map:'Kaart', help:'Uitleg', settings:'Instellingen'}[page] || 'Dashboard';
  const titleEl = $('#pageTitle'); if(titleEl) titleEl.textContent=t;
  const view = $('#view'); if(!view) return;
  const routes = {dashboard:renderDashboard, compare:renderCompare, map:renderMap, help:renderHelp, settings:renderSettings};
  (routes[page]||renderDashboard)(view);
}
window.addEventListener('hashchange', navigate);
document.addEventListener('DOMContentLoaded', navigate);
