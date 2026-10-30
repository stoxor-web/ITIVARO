/* ITIVARO V1.4 — Carte voyage. Données locales ; Leaflet/OSM chargés seulement à l'ouverture de la carte.
   Les traits relient les étapes à vol d'oiseau : aucun calcul routier n'est effectué. */
(()=>{
  'use strict';
  const LEAFLET_CSS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const LEAFLET_JS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  const CACHE_KEY='itivaro-map-locations-v14';
  const known={
    'tokyo':[35.6762,139.6503],'kyoto':[35.0116,135.7681],'osaka':[34.6937,135.5023],
    'hiroshima':[34.3853,132.4553],'nara':[34.6851,135.8048],'kanazawa':[36.5613,136.6562],
    'nagoya':[35.1815,136.9066],'sapporo':[43.0618,141.3545],'fukuoka':[33.5902,130.4017],
    'hakone':[35.2324,139.1069],'nikko':[36.7198,139.6982],'kamakura':[35.3192,139.5467],
    'fuji':[35.3606,138.7274],'mont fuji':[35.3606,138.7274],
    'paris':[48.8566,2.3522],'lyon':[45.764,4.8357],'marseille':[43.2965,5.3698],
    'nice':[43.7102,7.262],'bordeaux':[44.8378,-.5792],'lille':[50.6292,3.0573],
    'strasbourg':[48.5734,7.7521],'toulouse':[43.6047,1.4442],'nantes':[47.2184,-1.5536],
    'londres':[51.5072,-.1276],'london':[51.5072,-.1276],
    'rome':[41.9028,12.4964],'roma':[41.9028,12.4964],'milan':[45.4642,9.19],
    'milano':[45.4642,9.19],'florence':[43.7696,11.2558],'venise':[45.4408,12.3155],
    'venice':[45.4408,12.3155],'naples':[40.8518,14.2681],
    'barcelone':[41.3874,2.1686],'barcelona':[41.3874,2.1686],
    'madrid':[40.4168,-3.7038],'lisbonne':[38.7223,-9.1393],'lisbon':[38.7223,-9.1393],
    'porto':[41.1579,-8.6291],'berlin':[52.52,13.405],'amsterdam':[52.3676,4.9041],
    'prague':[50.0755,14.4378],'vienna':[48.2082,16.3738],'vienne':[48.2082,16.3738],
    'budapest':[47.4979,19.0402],'zurich':[47.3769,8.5417],'geneve':[46.2044,6.1432],
    'geneva':[46.2044,6.1432],'stockholm':[59.3293,18.0686],'oslo':[59.9139,10.7522],
    'helsinki':[60.1699,24.9384],'copenhague':[55.6761,12.5683],
    'copenhagen':[55.6761,12.5683],'dublin':[53.3498,-6.2603],
    'edimbourg':[55.9533,-3.1883],'edinburgh':[55.9533,-3.1883],
    'reykjavik':[64.1466,-21.9426],'new york':[40.7128,-74.006],
    'los angeles':[34.0522,-118.2437],'san francisco':[37.7749,-122.4194],
    'chicago':[41.8781,-87.6298],'montreal':[45.5019,-73.5674],
    'quebec':[46.8139,-71.208],'vancouver':[49.2827,-123.1207],
    'toronto':[43.6532,-79.3832],'mexico':[19.4326,-99.1332],
    'cancun':[21.1619,-86.8515],'rio de janeiro':[-22.9068,-43.1729],
    'sao paulo':[-23.5558,-46.6396],'buenos aires':[-34.6037,-58.3816],
    'lima':[-12.0464,-77.0428],'cusco':[-13.5319,-71.9675],
    'bangkok':[13.7563,100.5018],'chiang mai':[18.7883,98.9853],
    'bali':[-8.4095,115.1889],'ubud':[-8.5069,115.2625],
    'jakarta':[-6.2088,106.8456],'singapour':[1.3521,103.8198],
    'singapore':[1.3521,103.8198],'seoul':[37.5665,126.978],
    'hong kong':[22.3193,114.1694],'shanghai':[31.2304,121.4737],
    'pekin':[39.9042,116.4074],'beijing':[39.9042,116.4074],
    'dubai':[25.2048,55.2708],'marrakech':[31.6295,-7.9811],
    'fes':[34.064,-4.9747],'istanbul':[41.0082,28.9784],
    'antalya':[36.8969,30.7133],'athenes':[37.9838,23.7275],
    'athens':[37.9838,23.7275],'le caire':[30.0444,31.2357],
    'cairo':[30.0444,31.2357],'cape town':[-33.9249,18.4241],
    'le cap':[-33.9249,18.4241],'sydney':[-33.8688,151.2093],
    'melbourne':[-37.8136,144.9631],'auckland':[-36.8509,174.7645],
    'queenstown':[-45.0312,168.6626]
  };
  const simplify=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,' ').trim();
  let cache={};try{const v=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');if(v&&typeof v==='object'&&!Array.isArray(v))cache=v;}catch(_){}
  let loadPromise=null,map=null,markers=new Map(),lastDetail=null,selectedId=null,lastRequest=0,renderToken=0;
  const isPoint=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180;
  const getPoint=(stage,dest)=>{const k=simplify(stage.name);const cacheKey=simplify(dest)+'|'+k;return isPoint(cache[cacheKey])?cache[cacheKey]:(known[k]||null);};
  const status=message=>{const el=document.getElementById('mapStatus');if(el)el.textContent=message;};
  function leaflet(){
    if(window.L)return Promise.resolve(window.L);
    if(loadPromise)return loadPromise;
    loadPromise=new Promise((resolve,reject)=>{
      const css=document.createElement('link');css.rel='stylesheet';css.href=LEAFLET_CSS;css.crossOrigin='anonymous';css.integrity='sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoKhEJR5M/7MNc=';document.head.append(css);
      const script=document.createElement('script');script.src=LEAFLET_JS;script.crossOrigin='anonymous';script.integrity='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';script.onload=()=>window.L?resolve(window.L):reject(Error('Carte non disponible'));script.onerror=()=>reject(Error('Connexion au service cartographique impossible'));document.head.append(script);
    }).catch(err=>{loadPromise=null;throw err});
    return loadPromise;
  }
  function select(id,pan=true){
    if(!lastDetail)return;
    const s=lastDetail.stages.find(x=>x.id===id);if(!s)return;
    selectedId=id;
    document.querySelectorAll('[data-map-step]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.mapStep===id)));
    document.querySelectorAll('[data-map-step-row]').forEach(el=>el.classList.toggle('is-selected',el.dataset.mapStepRow===id));
    const title=document.getElementById('mapSelectedTitle'),date=document.getElementById('mapSelectedDetails'),edit=document.getElementById('mapEditStep');
    if(title)title.textContent=s.name;
    if(date)date.textContent=new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(s.date+'T12:00:00Z'))+(s.notes?' · '+s.notes:'');
    if(edit)edit.dataset.editStep=id;
    for(const [key,marker] of markers){const node=marker.getElement();node?.classList.toggle('is-selected',key===id);}
    document.querySelectorAll('[data-fallback-step]').forEach(el=>el.classList.toggle('is-selected',el.dataset.fallbackStep===id));
    const marker=markers.get(id);
    if(marker&&map&&pan){map.panTo(marker.getLatLng(),{animate:!window.matchMedia('(prefers-reduced-motion: reduce)').matches,duration:.35});marker.openTooltip();}
    if(!marker&&!document.querySelector('[data-fallback-step="'+CSS.escape(id)+'"]'))status('Cette étape n’est pas encore placée sur la carte. Cliquez sur « Localiser » pour chercher la ville (service externe).');
  }
  const safeText=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function fallback(detail){
    const node=document.getElementById('travelMap');if(!node)return;
    const coords=detail.stages.map((s,i)=>({s,i,p:getPoint(s,detail.destination)}));
    const valid=coords.filter(x=>x.p);
    // A true latitude/longitude placement without requiring a network or tile provider.
    let latMin=Math.min(...valid.map(x=>x.p[0])),latMax=Math.max(...valid.map(x=>x.p[0]));
    let lonMin=Math.min(...valid.map(x=>x.p[1])),lonMax=Math.max(...valid.map(x=>x.p[1]));
    if(!valid.length){latMin=-25;latMax=25;lonMin=-35;lonMax=35}
    const latMid=(latMin+latMax)/2,lonMid=(lonMin+lonMax)/2;
    const latSpan=Math.max(3.5,latMax-latMin)*1.36,lonSpan=Math.max(5,lonMax-lonMin)*1.36;
    latMin=latMid-latSpan/2;latMax=latMid+latSpan/2;lonMin=lonMid-lonSpan/2;lonMax=lonMid+lonSpan/2;
    const pos=p=>({x:Math.round(60+(p[1]-lonMin)/(lonMax-lonMin)*580),y:Math.round(50+(latMax-p[0])/(latMax-latMin)*350)});
    let route='';for(let i=1;i<coords.length;i++){if(coords[i-1].p&&coords[i].p){const a=pos(coords[i-1].p),b=pos(coords[i].p);route+=`<path d="M${a.x} ${a.y} L${b.x} ${b.y}" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/><path d="M${a.x} ${a.y} L${b.x} ${b.y}" stroke="#587f71" stroke-width="3.5" stroke-dasharray="8 8" stroke-linecap="round"/>`;}}
    const pins=valid.map(x=>{const pt=pos(x.p),near=valid.some(y=>y.i!==x.i&&Math.hypot(pos(y.p).x-pt.x,pos(y.p).y-pt.y)<65),side=(pt.x>465||(near&&x.i%2===0))?-1:1,labelX=pt.x+side*27;
      return `<g class="premium-map-fallback-marker" data-fallback-step="${safeText(x.s.id)}" tabindex="0" role="button" aria-label="Afficher ${safeText(x.s.name)}"><circle cx="${pt.x}" cy="${pt.y}" r="17" fill="#294b58" stroke="#ffffff" stroke-width="4"/><text x="${pt.x}" y="${pt.y+5}" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">${x.i+1}</text><text x="${labelX}" y="${pt.y+5}" text-anchor="${side<0?'end':'start'}" fill="#294654" font-size="14" font-weight="650" paint-order="stroke" stroke="#f3f7f3" stroke-width="4">${safeText(x.s.name)}</text></g>`;
    }).join('');
    node.innerHTML=`<svg class="premium-map-fallback-svg" viewBox="0 0 700 450" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Schéma géographique des étapes connues, sans fond cartographique"><defs><linearGradient id="premiumSea" x2="1" y2="1"><stop stop-color="#e5f0ed"/><stop offset="1" stop-color="#cddfdb"/></linearGradient><pattern id="premiumGrid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" stroke="#fff" fill="none" opacity=".55"/></pattern></defs><rect width="700" height="450" fill="url(#premiumSea)"/><rect width="700" height="450" fill="url(#premiumGrid)"/><path d="M-12 61 Q125 5 210 90 Q289 126 335 201 Q400 251 407 322 Q382 373 318 458 L-12 458Z" fill="#f9f8f2" opacity=".78" stroke="#dae3da" stroke-width="2"/><path d="M48 121 Q156 137 206 199 T367 290 M82 286 Q209 259 334 341" stroke="#d7e0d6" stroke-width="3" fill="none"/><text x="40" y="38" fill="#698a84" font-size="11" font-weight="600" letter-spacing="2">REPÉRAGE GÉOGRAPHIQUE</text>${route}${pins}<text x="678" y="425" text-anchor="end" fill="#78938b" font-size="11">SCHÉMA HORS LIGNE</text></svg>`;
    node.querySelectorAll('[data-fallback-step]').forEach(el=>{
      const pick=()=>select(el.dataset.fallbackStep,false);
      el.addEventListener('click',pick);
      el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}});
    });
    if(selectedId)select(selectedId,false);
    status(valid.length?'Mode hors ligne : marqueurs géographiques disponibles pour les villes reconnues, sans fond cartographique. Le tracé est indicatif.':'Mode hors ligne : aucune ville reconnue. Vous pouvez toujours gérer vos étapes.');
  }
  async function mount(detail){
    lastDetail=detail;const node=document.getElementById('travelMap');if(!node)return;
    const token=++renderToken;
    if(map){map.remove();map=null;}markers=new Map();
    if(!detail.stages.some(s=>s.id===selectedId))selectedId=detail.stages[0]?.id||null;
    select(selectedId,false);
    try{
      const L=await leaflet();if(renderToken!==token||!document.getElementById('travelMap')||document.getElementById('travelMap')!==node)return;
      const loading=document.getElementById('mapLoading');loading?.remove();
      map=L.map(node,{scrollWheelZoom:false,zoomControl:true,preferCanvas:true,minZoom:2,maxZoom:17});
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'}).addTo(map);
      const valid=[];
      for(const [i,s] of detail.stages.entries()){
        const p=getPoint(s,detail.destination);const row=document.querySelector('[data-map-step-row="'+CSS.escape(s.id)+'"]');
        if(!p){row?.classList.add('is-unlocated');continue}
        row?.classList.remove('is-unlocated');valid.push({point:p,stage:s});
        const marker=L.marker(p,{icon:L.divIcon({className:'premium-location',html:'<span>'+String(i+1)+'</span>',iconSize:[34,34],iconAnchor:[17,17]})}).addTo(map);
        const safeTooltip=document.createElement('span');safeTooltip.textContent=s.name;marker.bindTooltip(safeTooltip,{permanent:true,direction:'right',offset:[15,0],className:'premium-map-tooltip'});
        marker.on('click',()=>select(s.id));markers.set(s.id,marker);
      }
      // Only adjacent located stages are connected; never imply a route through an unknown stop.
      for(let i=1;i<detail.stages.length;i++){
        const a=getPoint(detail.stages[i-1],detail.destination),b=getPoint(detail.stages[i],detail.destination);
        if(a&&b)L.polyline([a,b],{color:'#ffffff',weight:8,opacity:.9,interactive:false}).addTo(map),L.polyline([a,b],{color:'#56796c',weight:3.5,opacity:.95,dashArray:'7 9',interactive:false}).addTo(map);
      }
      if(valid.length>1)map.fitBounds(L.latLngBounds(valid.map(v=>v.point)),{padding:[64,66],maxZoom:10,animate:false});
      else if(valid.length===1)map.setView(valid[0].point,9,{animate:false});
      else map.setView([20,0],2,{animate:false});
      setTimeout(()=>{if(map&&renderToken===token)map.invalidateSize()},80);
      if(selectedId)select(selectedId,false);
      const unlocated=detail.stages.filter(s=>!getPoint(s,detail.destination)).length;
      if(unlocated)status(`${unlocated} étape${unlocated>1?'s':''} non localisée${unlocated>1?'s':''} : utilisez « Localiser » pour rechercher la ville. Les lignes entre étapes sont à vol d’oiseau.`);
      else status('Carte OpenStreetMap. Parcours indicatif à vol d’oiseau : aucun temps de trajet ni itinéraire routier n’est calculé.');
    }catch(err){
      if(renderToken!==token)return;
      const loading=document.getElementById('mapLoading');if(loading){const strong=loading.querySelector('strong');const span=loading.querySelector('span:last-child');if(strong)strong.textContent='Carte momentanément indisponible';if(span)span.textContent='Vérifiez votre connexion. Votre liste d’étapes reste accessible.';}
      fallback(detail);
    }
  }
  async function locate(id){
    const detail=lastDetail,s=detail?.stages.find(x=>x.id===id);if(!s)return;
    if(Date.now()-lastRequest<1100){status('Patientez une seconde entre deux recherches de lieux.');return}
    lastRequest=Date.now();
    const btn=Array.from(document.querySelectorAll('[data-map-locate]')).find(x=>x.dataset.mapLocate===id);
    if(btn){btn.disabled=true;btn.textContent='Recherche…'}
    status('Recherche auprès de Nominatim (OpenStreetMap) ; le nom du lieu et la destination sont transmis au service.');
    try{
      const query=[s.name,detail.destination].filter(Boolean).join(', ');
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),11000);
      let response;try{response=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q='+encodeURIComponent(query),{headers:{'Accept-Language':'fr'},signal:controller.signal})}finally{clearTimeout(timer)}
      if(!response.ok)throw Error('Service de recherche indisponible');
      const result=await response.json();const first=result?.[0];const point=first?[Number(first.lat),Number(first.lon)]:null;
      if(!isPoint(point))throw Error('Aucun résultat : précisez le nom de la ville dans l’étape.');
      const cacheKey=simplify(detail.destination)+'|'+simplify(s.name);cache[cacheKey]=point;
      try{localStorage.setItem(CACHE_KEY,JSON.stringify(cache));}catch(_){}
      await mount(detail);select(id);
    }catch(err){status('Localisation impossible : '+(err.name==='AbortError'?'délai dépassé':err.message)+'. Vous pouvez toujours organiser votre étape.');}
    finally{if(btn){btn.disabled=false;btn.textContent='Localiser'}}
  }
  window.addEventListener('itivaro:carte-rendered',event=>{void mount(event.detail)});
  document.addEventListener('click',event=>{
    const btn=event.target.closest('button');if(!btn)return;
    if(btn.hasAttribute('data-map-step'))select(btn.dataset.mapStep);
    else if(btn.hasAttribute('data-map-locate'))void locate(btn.dataset.mapLocate);
    else if(btn.id==='mapFit'){if(!map){if(lastDetail)fallback(lastDetail);return;}const pts=lastDetail?.stages.map(s=>getPoint(s,lastDetail.destination)).filter(isPoint)||[];if(pts.length>1)map.fitBounds(pts,{padding:[64,66],maxZoom:10});else if(pts.length===1)map.setView(pts[0],9);}
  });
})();
