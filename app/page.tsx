'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import { AlertTriangle, BarChart3, CalendarDays, Crosshair, Database, Info, Layers3, Leaf, MapPin, RefreshCw, Satellite, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
type Damage = 'Severe' | 'Moderate' | 'Low';
type Farm = {
  Farm_ID: string; Crop: string; Area: number; Flood_Percent: number; NDVI_Change: number;
  AI_Damage_Percent: number; AI_Confidence: number; Claim_Submitted: 'Yes' | 'No';
  Claimed_Damage: number; Potentially_Missed: boolean; Evidence_Mismatch: boolean;
  Priority: Priority; Alert: string; center: [number, number];
};

const rawFarms: Omit<Farm, 'center'>[] = [
  {Farm_ID:'F001',Crop:'Paddy',Area:2.1,Flood_Percent:24,NDVI_Change:18,AI_Damage_Percent:28,AI_Confidence:88,Claim_Submitted:'Yes',Claimed_Damage:25,Potentially_Missed:false,Evidence_Mismatch:false,Priority:'LOW',Alert:'Monitor'},
  {Farm_ID:'F002',Crop:'Groundnut',Area:1.7,Flood_Percent:46,NDVI_Change:35,AI_Damage_Percent:49,AI_Confidence:84,Claim_Submitted:'Yes',Claimed_Damage:52,Potentially_Missed:false,Evidence_Mismatch:false,Priority:'MEDIUM',Alert:'Review'},
  {Farm_ID:'F003',Crop:'Paddy',Area:3.2,Flood_Percent:86,NDVI_Change:69,AI_Damage_Percent:81,AI_Confidence:93,Claim_Submitted:'No',Claimed_Damage:0,Potentially_Missed:true,Evidence_Mismatch:false,Priority:'HIGH',Alert:'Potentially missed'},
  {Farm_ID:'F004',Crop:'Cotton',Area:2.4,Flood_Percent:72,NDVI_Change:56,AI_Damage_Percent:73,AI_Confidence:89,Claim_Submitted:'Yes',Claimed_Damage:70,Potentially_Missed:false,Evidence_Mismatch:false,Priority:'HIGH',Alert:'Verify'},
  {Farm_ID:'F005',Crop:'Maize',Area:1.9,Flood_Percent:31,NDVI_Change:21,AI_Damage_Percent:35,AI_Confidence:82,Claim_Submitted:'Yes',Claimed_Damage:32,Potentially_Missed:false,Evidence_Mismatch:false,Priority:'LOW',Alert:'Monitor'},
  {Farm_ID:'F006',Crop:'Paddy',Area:2.6,Flood_Percent:52,NDVI_Change:38,AI_Damage_Percent:46,AI_Confidence:87,Claim_Submitted:'Yes',Claimed_Damage:78,Potentially_Missed:false,Evidence_Mismatch:true,Priority:'MEDIUM',Alert:'Evidence mismatch'},
  {Farm_ID:'F007',Crop:'Paddy',Area:3.4,Flood_Percent:66,NDVI_Change:51,AI_Damage_Percent:68,AI_Confidence:86,Claim_Submitted:'No',Claimed_Damage:0,Potentially_Missed:false,Evidence_Mismatch:false,Priority:'MEDIUM',Alert:'Review'},
  {Farm_ID:'F008',Crop:'Cotton',Area:2.8,Flood_Percent:81,NDVI_Change:63,AI_Damage_Percent:77,AI_Confidence:92,Claim_Submitted:'Yes',Claimed_Damage:74,Potentially_Missed:false,Evidence_Mismatch:false,Priority:'HIGH',Alert:'Verify'},
  {Farm_ID:'F009',Crop:'Millet',Area:1.4,Flood_Percent:17,NDVI_Change:14,AI_Damage_Percent:22,AI_Confidence:80,Claim_Submitted:'Yes',Claimed_Damage:20,Potentially_Missed:false,Evidence_Mismatch:false,Priority:'LOW',Alert:'Monitor'},
  {Farm_ID:'F010',Crop:'Paddy',Area:2.2,Flood_Percent:58,NDVI_Change:43,AI_Damage_Percent:54,AI_Confidence:85,Claim_Submitted:'Yes',Claimed_Damage:57,Potentially_Missed:false,Evidence_Mismatch:false,Priority:'MEDIUM',Alert:'Review'},
  {Farm_ID:'F011',Crop:'Paddy',Area:3.7,Flood_Percent:89,NDVI_Change:71,AI_Damage_Percent:84,AI_Confidence:95,Claim_Submitted:'Yes',Claimed_Damage:82,Potentially_Missed:false,Evidence_Mismatch:false,Priority:'HIGH',Alert:'Verify'},
  {Farm_ID:'F012',Crop:'Maize',Area:1.6,Flood_Percent:37,NDVI_Change:29,AI_Damage_Percent:39,AI_Confidence:81,Claim_Submitted:'No',Claimed_Damage:0,Potentially_Missed:false,Evidence_Mismatch:false,Priority:'LOW',Alert:'Monitor'},
  {Farm_ID:'F013',Crop:'Cotton',Area:2.9,Flood_Percent:70,NDVI_Change:55,AI_Damage_Percent:71,AI_Confidence:83,Claim_Submitted:'Yes',Claimed_Damage:68,Potentially_Missed:false,Evidence_Mismatch:false,Priority:'MEDIUM',Alert:'Review'},
  {Farm_ID:'F014',Crop:'Paddy',Area:2.5,Flood_Percent:82,NDVI_Change:64,AI_Damage_Percent:75,AI_Confidence:90,Claim_Submitted:'No',Claimed_Damage:0,Potentially_Missed:true,Evidence_Mismatch:false,Priority:'HIGH',Alert:'Potentially missed'},
  {Farm_ID:'F015',Crop:'Groundnut',Area:2.0,Flood_Percent:44,NDVI_Change:34,AI_Damage_Percent:43,AI_Confidence:82,Claim_Submitted:'Yes',Claimed_Damage:72,Potentially_Missed:false,Evidence_Mismatch:true,Priority:'MEDIUM',Alert:'Evidence mismatch'},
  {Farm_ID:'F016',Crop:'Millet',Area:1.8,Flood_Percent:12,NDVI_Change:9,AI_Damage_Percent:18,AI_Confidence:79,Claim_Submitted:'No',Claimed_Damage:0,Potentially_Missed:false,Evidence_Mismatch:false,Priority:'LOW',Alert:'Monitor'},
  {Farm_ID:'F017',Crop:'Paddy',Area:3.1,Flood_Percent:61,NDVI_Change:47,AI_Damage_Percent:58,AI_Confidence:88,Claim_Submitted:'Yes',Claimed_Damage:29,Potentially_Missed:false,Evidence_Mismatch:true,Priority:'MEDIUM',Alert:'Evidence mismatch'},
  {Farm_ID:'F018',Crop:'Paddy',Area:2.8,Flood_Percent:78,NDVI_Change:61,AI_Damage_Percent:72,AI_Confidence:91,Claim_Submitted:'No',Claimed_Damage:0,Potentially_Missed:true,Evidence_Mismatch:false,Priority:'HIGH',Alert:'Potentially missed'},
  {Farm_ID:'F019',Crop:'Cotton',Area:2.3,Flood_Percent:62,NDVI_Change:49,AI_Damage_Percent:64,AI_Confidence:86,Claim_Submitted:'Yes',Claimed_Damage:34,Potentially_Missed:false,Evidence_Mismatch:true,Priority:'MEDIUM',Alert:'Evidence mismatch'},
  {Farm_ID:'F020',Crop:'Maize',Area:1.5,Flood_Percent:27,NDVI_Change:19,AI_Damage_Percent:31,AI_Confidence:80,Claim_Submitted:'No',Claimed_Damage:0,Potentially_Missed:false,Evidence_Mismatch:false,Priority:'LOW',Alert:'Monitor'},
];

const centers: [number, number][] = [
  [15.161,76.898],[15.160,76.911],[15.159,76.925],[15.158,76.940],[15.150,76.902],
  [15.149,76.916],[15.148,76.931],[15.147,76.946],[15.138,76.895],[15.138,76.910],
  [15.137,76.925],[15.136,76.941],[15.127,76.900],[15.126,76.914],[15.125,76.929],
  [15.124,76.944],[15.115,76.905],[15.114,76.920],[15.113,76.935],[15.112,76.950],
];
const FARMS: Farm[] = rawFarms.map((farm, index) => ({...farm, center: centers[index]}));

const latestDate = () => { const d = new Date(); d.setDate(d.getDate()-2); return d.toISOString().slice(0,10); };
const severity = (farm: Farm): Damage => farm.AI_Damage_Percent >= 70 ? 'Severe' : farm.AI_Damage_Percent >= 40 ? 'Moderate' : 'Low';
const colorFor = (farm: Farm) => farm.Potentially_Missed ? '#9775C9' : severity(farm)==='Severe' ? '#D95C59' : severity(farm)==='Moderate' ? '#D9A441' : '#5EAD78';

function SatelliteMap({ farms, selected, onSelect, date, location, layers, onStatus }: {
  farms: Farm[]; selected: Farm|null; onSelect: (farm: Farm) => void; date: string;
  location: {lat:number; lon:number; name:string}; layers: Record<string,boolean>;
  onStatus: (status:'loading'|'available'|'unavailable') => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map|null>(null);
  const leafletRef = useRef<typeof import('leaflet')|null>(null);
  const satelliteRef = useRef<Leaflet.TileLayer.WMS|null>(null);
  const labelsRef = useRef<Leaflet.TileLayer|null>(null);
  const farmGroupRef = useRef<Leaflet.LayerGroup|null>(null);
  const floodRef = useRef<Leaflet.Polygon|null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!elRef.current || mapRef.current) return;
      const L = await import('leaflet');
      if (cancelled || !elRef.current) return;
      leafletRef.current = L;
      const map = L.map(elRef.current, {zoomControl:false, attributionControl:true, preferCanvas:false}).setView([location.lat,location.lon], 14);
      L.control.zoom({position:'bottomright'}).addTo(map);
      mapRef.current = map;
      let errors = 0;
      const sat = L.tileLayer.wms('https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi', {
        layers:'MODIS_Terra_CorrectedReflectance_TrueColor', format:'image/jpeg', transparent:false,
        attribution:'NASA GIBS / NASA Earthdata', time:date, tileSize:256, maxZoom:19, maxNativeZoom:9,
      } as Leaflet.WMSOptions & {time:string});
      sat.on('loading',()=>onStatus('loading'));
      sat.on('load',()=>{ errors=0; onStatus('available'); });
      sat.on('tileerror',()=>{ errors += 1; if(errors>=3) onStatus('unavailable'); });
      sat.addTo(map); satelliteRef.current = sat;
      const labels = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {opacity:.34, attribution:'© OpenStreetMap contributors', maxZoom:19});
      labels.addTo(map); labelsRef.current = labels;
      const flood = L.polygon([[15.168,76.892],[15.164,76.953],[15.148,76.958],[15.137,76.946],[15.122,76.959],[15.104,76.943],[15.109,76.897],[15.130,76.889]], {color:'#4E86B8',fillColor:'#4E86B8',fillOpacity:.2,weight:1.5,interactive:false});
      flood.addTo(map); floodRef.current=flood;
      farmGroupRef.current = L.layerGroup().addTo(map);
      setReady(true);
      setTimeout(()=>map.invalidateSize(),120);
    })();
    return () => { cancelled=true; mapRef.current?.remove(); mapRef.current=null; };
  }, []);

  useEffect(() => { if(!mapRef.current) return; mapRef.current.flyTo([location.lat,location.lon],14,{duration:1}); }, [location]);
  useEffect(() => { onStatus('loading'); satelliteRef.current?.setParams({layers:'MODIS_Terra_CorrectedReflectance_TrueColor',format:'image/jpeg',transparent:false,time:date} as Leaflet.WMSParams & {time:string}, false); satelliteRef.current?.redraw(); }, [date]);
  useEffect(() => {
    const map=mapRef.current, sat=satelliteRef.current, labels=labelsRef.current, flood=floodRef.current;
    if(!map) return;
    if(sat) layers.satellite ? sat.addTo(map) : sat.removeFrom(map);
    if(labels) layers.labels ? labels.addTo(map) : labels.removeFrom(map);
    if(flood) layers.flood ? flood.addTo(map) : flood.removeFrom(map);
  }, [layers]);
  useEffect(() => {
    const L=leafletRef.current, group=farmGroupRef.current;
    if(!ready || !L || !group) return;
    group.clearLayers();
    if(!layers.farms) return;
    farms.forEach((farm,index) => {
      const [lat,lon]=farm.center, sx=.0046+(index%3)*.0005, sy=.0055+(index%2)*.0006;
      const points: Leaflet.LatLngExpression[] = [[lat-sx,lon-sy],[lat+sx*.78,lon-sy*.84],[lat+sx,lon+sy*.82],[lat-sx*.72,lon+sy]];
      const active=farm.Farm_ID===selected?.Farm_ID;
      const polygon=L.polygon(points,{color:active?'#ffffff':colorFor(farm),fillColor:colorFor(farm),fillOpacity:farm.Potentially_Missed?.38:.34,weight:active?2.5:1.7});
      polygon.bindTooltip(`<b>${farm.Farm_ID}</b><br>${severity(farm)} damage, ${farm.AI_Damage_Percent}% assessed`,{direction:'top',offset:[0,-4]});
      polygon.on('click',()=>onSelect(farm));
      polygon.addTo(group);
    });
  }, [farms, selected?.Farm_ID, layers.farms, ready, onSelect]);
  return <div ref={elRef} className="leaflet-host" aria-label="Interactive NASA GIBS satellite map with synthetic farm boundaries" />;
}

export default function Home() {
  const [view,setView]=useState<'overview'|'map'|'claims'|'analytics'|'alerts'>('overview');
  const [quick,setQuick]=useState<'all'|'missed'|'mismatch'>('all');
  const [priority,setPriority]=useState<'All'|Priority>('All');
  const [claim,setClaim]=useState<'All'|'Yes'|'No'>('All');
  const [damage,setDamage]=useState<'All'|Damage>('All');
  const [selected,setSelected]=useState<Farm|null>(null);
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [date,setDate]=useState(latestDate());
  const [imageryStatus,setImageryStatus]=useState<'loading'|'available'|'unavailable'>('loading');
  const [location,setLocation]=useState({lat:15.1394,lon:76.9214,name:'Ballari, Karnataka'});
  const [query,setQuery]=useState('Ballari, Karnataka');
  const [searching,setSearching]=useState(false);
  const [locationError,setLocationError]=useState('');
  const [claimSearch,setClaimSearch]=useState('');
  const [layers,setLayers]=useState({satellite:true,farms:true,flood:true,labels:true});

  const visible=useMemo(()=>FARMS.filter(f =>
    (quick==='all'||(quick==='missed'&&f.Potentially_Missed)||(quick==='mismatch'&&f.Evidence_Mismatch)) &&
    (priority==='All'||f.Priority===priority) && (claim==='All'||f.Claim_Submitted===claim) &&
    (damage==='All'||severity(f)===damage)
  ),[quick,priority,claim,damage]);
  const counts=useMemo(()=>({all:visible.length,severe:visible.filter(f=>severity(f)==='Severe').length,claims:visible.filter(f=>f.Claim_Submitted==='Yes').length,missed:visible.filter(f=>f.Potentially_Missed).length,high:visible.filter(f=>f.Priority==='HIGH').length,mismatch:visible.filter(f=>f.Evidence_Mismatch).length}),[visible]);

  const searchLocation=async(e:FormEvent) => {
    e.preventDefault(); if(!query.trim()) return; setSearching(true); setLocationError('');
    try { const response=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,{headers:{'Accept-Language':'en'}}); if(!response.ok) throw new Error(); const data=await response.json() as {lat:string;lon:string;display_name:string}[]; if(!data[0]) throw new Error(); setLocation({lat:Number(data[0].lat),lon:Number(data[0].lon),name:data[0].display_name.split(',').slice(0,2).join(',')}); }
    catch { setLocationError('Location not found. Try a district, village, or coordinates.'); }
    finally { setSearching(false); }
  };
  const useCoords=() => { const match=query.split(',').map(Number); if(match.length===2&&match.every(Number.isFinite)){setLocation({lat:match[0],lon:match[1],name:`${match[0].toFixed(4)}, ${match[1].toFixed(4)}`});setLocationError('');} else setLocationError('Enter coordinates as latitude, longitude.'); };
  const selectQuick=(next:'all'|'missed'|'mismatch') => setQuick(next);
  const clearFilters=()=>{setQuick('all');setPriority('All');setClaim('All');setDamage('All');};
  const selectFarm=(farm:Farm)=>setSelected(farm);
  const filteredClaims=FARMS.filter(f=>f.Farm_ID.toLowerCase().includes(claimSearch.toLowerCase()));
  const nav=[['overview','Overview'],['map','Map'],['claims','Claims'],['analytics','Analytics'],['alerts','Alerts']] as const;
  const metrics=[['Farms analysed',counts.all],['Severely affected',counts.severe],['Claims received',counts.claims],['Potentially missed',counts.missed],['High priority',counts.high]];
  const severeAll=FARMS.filter(f=>severity(f)==='Severe');
  const severeClaimed=severeAll.filter(f=>f.Claim_Submitted==='Yes').length;
  const severityCounts={severe:FARMS.filter(f=>severity(f)==='Severe').length,moderate:FARMS.filter(f=>severity(f)==='Moderate').length,low:FARMS.filter(f=>severity(f)==='Low').length};

  return <main className="shell">
    <header className="topbar">
      <button className="brand" onClick={()=>setView('overview')}><span className="brand-mark"><Leaf size={19}/></span><strong>TerraAid</strong></button>
      <nav aria-label="Primary navigation">{nav.map(([id,label])=><button key={id} className={view===id?'active':''} onClick={()=>setView(id)}>{label}</button>)}</nav>
    </header>
    <section className="intro">
      <div><h1>{view==='overview'||view==='map'?'Flood Impact Overview':view==='claims'?'Claims Review':view==='analytics'?'Damage Analytics':'Verification Alerts'}</h1><p><strong>{location.name}</strong><span>Post-flood agricultural assessment</span></p></div>
      <Dialog><DialogTrigger className="method"><Info size={14}/> Data &amp; method</DialogTrigger><DialogContent className="method-dialog"><DialogHeader><DialogTitle>Data &amp; method</DialogTitle><DialogDescription>TerraAid supports authorised human decisions; it does not approve or reject claims.</DialogDescription></DialogHeader><div className="method-list"><div><Satellite/><span><b>Satellite imagery</b><small>NASA GIBS MODIS Terra True Color. Historical date requests are sent to the live WMS service.</small></span></div><div><BarChart3/><span><b>Damage analysis</b><small>May combine flood evidence, vegetation change and automated change detection.</small></span></div><div><Database/><span><b>Prototype records</b><small>Claims and farm boundaries are synthetic demonstration data—not official cadastral parcels.</small></span></div><div><ShieldCheck/><span><b>Human authority</b><small>Field verification and final relief decisions remain with authorised officials.</small></span></div></div></DialogContent></Dialog>
    </section>
    {(view==='overview'||view==='map') && <>
      <section className="metric-grid">{metrics.map(([label,value],index)=><article className={`metric ${index===3?'critical':''}`} key={label}><strong>{value}</strong><span>{label}</span></article>)}</section>
      <section className="workspace">
        <section className="map-card">
          <div className="map-toolbar">
            <button className="filter-toggle" onClick={()=>setFiltersOpen(v=>!v)} aria-expanded={filtersOpen}><SlidersHorizontal size={14}/>Filters</button>
            <form className="searchbox" onSubmit={searchLocation}><Search size={14}/><input aria-label="Search district, village or location" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search district, village or location…"/><button disabled={searching}>{searching?'Searching…':'Search'}</button></form>
            <label className="date-control"><CalendarDays size={13}/><input aria-label="Satellite date" type="date" value={date} max={latestDate()} onInput={e=>setDate(e.currentTarget.value)}/></label>
            <button className="latest" onClick={()=>setDate(latestDate())}><Satellite size={13}/>Latest available</button>
            <span className={`map-status ${imageryStatus}`}><i/>{imageryStatus==='available'?'Satellite available':imageryStatus==='loading'?'Loading imagery':'Imagery unavailable'} <b>{visible.length} farms</b></span>
          </div>
          {locationError && <div className="location-error"><AlertTriangle size={13}/>{locationError}<button onClick={useCoords}>Use as coordinates</button></div>}
          <div className="map-stage">
            <SatelliteMap farms={visible} selected={selected} onSelect={selectFarm} date={date} location={location} layers={layers} onStatus={setImageryStatus}/>
            {imageryStatus==='unavailable'&&<div className="satellite-error"><AlertTriangle/><b>Live satellite imagery temporarily unavailable.</b><small>Farm overlays remain visible. Try a nearby date.</small><button onClick={()=>{setImageryStatus('loading');satelliteRefocusHack(date,setDate)}}><RefreshCw/>Retry</button></div>}
            {filtersOpen&&<aside className="filters">
              <div className="panel-heading"><span>Filters and layers</span><div><button onClick={clearFilters}>Reset</button><button onClick={()=>setFiltersOpen(false)}>Close</button></div></div>
              <button className={quick==='missed'?'filter-active':''} onClick={()=>selectQuick('missed')}><b>Potentially missed</b><small>Severe damage and no claim</small><em>{FARMS.filter(f=>f.Potentially_Missed).length}</em></button>
              <button className={quick==='all'?'filter-active all-filter':''} onClick={()=>selectQuick('all')}><b>All assessed farms</b><small>Complete assessment</small><em>{FARMS.length}</em></button>
              <button className={quick==='mismatch'?'filter-active':''} onClick={()=>selectQuick('mismatch')}><b>Evidence mismatch</b><small>Closer review advised</small><em>{FARMS.filter(f=>f.Evidence_Mismatch).length}</em></button>
              <div className="filter-group"><label>Priority</label><select value={priority} onChange={e=>setPriority(e.target.value as typeof priority)}><option>All</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div>
              <div className="filter-group"><label>Claim status</label><select value={claim} onChange={e=>setClaim(e.target.value as typeof claim)}><option value="All">All</option><option value="Yes">Submitted</option><option value="No">No claim</option></select></div>
              <div className="filter-group"><label>Damage evidence</label><select value={damage} onChange={e=>setDamage(e.target.value as typeof damage)}><option>All</option><option>Severe</option><option>Moderate</option><option>Low</option></select></div>
              <div className="layers"><label><input type="checkbox" checked={layers.satellite} onChange={()=>setLayers({...layers,satellite:!layers.satellite})}/><Satellite/>Satellite</label><label><input type="checkbox" checked={layers.farms} onChange={()=>setLayers({...layers,farms:!layers.farms})}/><Layers3/>Farm damage</label><label><input type="checkbox" checked={layers.flood} onChange={()=>setLayers({...layers,flood:!layers.flood})}/><span className="layer-dot blue"/>Flood extent</label><label><input type="checkbox" checked={layers.labels} onChange={()=>setLayers({...layers,labels:!layers.labels})}/><MapPin/>Labels</label></div>
            </aside>}
            <div className="legend"><b>Damage evidence</b><span><i className="red"/>Severely affected</span><span><i className="amber"/>Moderately affected</span><span><i className="green"/>No or minor damage</span><span><i className="purple"/>Potentially missed</span><span><i className="blue"/>Flooded area</span></div>
            {selected&&<FarmPanel farm={selected} onClose={()=>setSelected(null)}/>} 
          </div>
          <footer><span><Crosshair size={11}/>{location.lat.toFixed(4)}, {location.lon.toFixed(4)}</span><span>NASA Earthdata and OpenStreetMap</span></footer>
        </section>
      </section>
    </>}
    {view==='claims'&&<ClaimsView farms={filteredClaims} search={claimSearch} onSearch={setClaimSearch} onOpen={farm=>{setSelected(farm);setView('map');}}/>}
    {view==='analytics'&&<AnalyticsView severityCounts={severityCounts} severeClaimed={severeClaimed} severeTotal={severeAll.length}/>} 
    {view==='alerts'&&<AlertsView farms={FARMS.filter(f=>f.Potentially_Missed||f.Evidence_Mismatch||f.Priority==='HIGH')} onOpen={farm=>{setSelected(farm);setView('map');}}/>}
  </main>;
}

function satelliteRefocusHack(date:string,setDate:(v:string)=>void){ setDate(date==='2000-01-01'?latestDate():'2000-01-01'); setTimeout(()=>setDate(date),0); }

function FarmPanel({farm,onClose}:{farm:Farm;onClose:()=>void}) { return <aside className={`priority-card ${farm.Potentially_Missed?'missed-card':''}`}>
  <div className="detail-head"><span className="panel-kicker">{farm.Potentially_Missed?'Priority case':'Selected farm'}</span><button onClick={onClose}>Close</button></div><div className="farm-title"><span>{farm.Farm_ID}</span><em className={`priority-${farm.Priority.toLowerCase()}`}>{farm.Priority.toLowerCase()} priority</em></div>
  <h2>{farm.Potentially_Missed?'Potentially missed beneficiary':farm.Evidence_Mismatch?'Evidence mismatch':'Evidence summary'}</h2><p>{farm.Potentially_Missed?'Strong satellite evidence of flood damage with no corresponding claim record.':farm.Evidence_Mismatch?'Claim and satellite evidence differ materially. Closer verification recommended.':`${farm.Crop} farm with ${severity(farm).toLowerCase()} assessed damage.`}</p>
  <div className="farm-meta"><span><Leaf/> {farm.Crop}</span><span>{farm.Area} acres</span></div>
  <div className="evidence-grid"><div><span>Flood exposure</span><strong>{farm.Flood_Percent}%</strong><i style={{width:`${farm.Flood_Percent}%`}}/></div><div><span>AI damage</span><strong>{farm.AI_Damage_Percent}%</strong><i style={{width:`${farm.AI_Damage_Percent}%`}}/></div><div><span>Vegetation decline</span><strong>{farm.NDVI_Change}%</strong><i style={{width:`${farm.NDVI_Change}%`}}/></div><div><span>AI confidence</span><strong>{farm.AI_Confidence}%</strong><i style={{width:`${farm.AI_Confidence}%`}}/></div></div>
  <div className="no-claim"><span>Claim submitted</span><strong>{farm.Claim_Submitted.toUpperCase()}</strong></div>{farm.Claim_Submitted==='Yes'&&<div className="claim-compare"><span>Claimed damage</span><strong>{farm.Claimed_Damage}%</strong></div>}
  <button className="verify">{farm.Potentially_Missed?'Recommend field verification':'Open field brief'}</button><small className="human-note">TerraAid provides decision support. Final relief decisions remain with authorised officials.</small>
 </aside>; }

function ClaimsView({farms,search,onSearch,onOpen}:{farms:Farm[];search:string;onSearch:(v:string)=>void;onOpen:(f:Farm)=>void}) { return <section className="page-panel"><div className="section-head"><div><span className="eyebrow">Claim and evidence review</span><h2>Claims register</h2><p>Synthetic claim records compared with prototype satellite analysis.</p></div><div className="table-search"><Search/><input value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search Farm ID…"/></div></div><div className="table-wrap"><table><thead><tr><th>Farm ID</th><th>Crop</th><th>Claim</th><th>Claimed damage</th><th>AI damage</th><th>Mismatch</th><th>Priority</th><th/></tr></thead><tbody>{farms.map(f=><tr key={f.Farm_ID}><td><b>{f.Farm_ID}</b></td><td>{f.Crop}</td><td><span className={`table-status ${f.Claim_Submitted==='No'?'no':''}`}>{f.Claim_Submitted==='Yes'?'Submitted':'No claim'}</span></td><td>{f.Claim_Submitted==='Yes'?`${f.Claimed_Damage}%`:'—'}</td><td>{f.AI_Damage_Percent}%</td><td>{f.Evidence_Mismatch?<span className="mismatch-chip">Review</span>:'Aligned'}</td><td><span className={`priority-chip priority-${f.Priority.toLowerCase()}`}>{f.Priority.toLowerCase()}</span></td><td><button onClick={()=>onOpen(f)}>View on map</button></td></tr>)}</tbody></table></div><div className="legal-note"><ShieldCheck/>Satellite evidence is decision support, not legal or automatic claim determination.</div></section>; }

function AnalyticsView({severityCounts,severeClaimed,severeTotal}:{severityCounts:{severe:number;moderate:number;low:number};severeClaimed:number;severeTotal:number}) { const total=severityCounts.severe+severityCounts.moderate+severityCounts.low; const missed=FARMS.filter(f=>f.Potentially_Missed).length; return <section className="page-panel analytics"><div className="section-head"><div><span className="eyebrow">District evidence summary</span><h2>Damage intelligence</h2><p>Decision-relevant indicators from the current synthetic assessment.</p></div></div><div className="analytics-grid"><article className="chart-card"><div><span>Damage severity</span><strong>{total} farms</strong></div><div className="donut" style={{background:`conic-gradient(#D95C59 0 ${severityCounts.severe/total*100}%,#D9A441 0 ${(severityCounts.severe+severityCounts.moderate)/total*100}%,#5EAD78 0)`}}><span>{severityCounts.severe}<small>severe</small></span></div><ul><li><i className="red"/>Severe <b>{severityCounts.severe}</b></li><li><i className="amber"/>Moderate <b>{severityCounts.moderate}</b></li><li><i className="green"/>Low / minor <b>{severityCounts.low}</b></li></ul></article><article className="chart-card bars-card"><div><span>Claims among severe farms</span><strong>{severeTotal} severe cases</strong></div><div className="bar-item"><label><span>Claim submitted</span><b>{severeClaimed}</b></label><i><em style={{width:`${severeClaimed/severeTotal*100}%`}}/></i></div><div className="bar-item no-claim-bar"><label><span>No claim</span><b>{severeTotal-severeClaimed}</b></label><i><em style={{width:`${(severeTotal-severeClaimed)/severeTotal*100}%`}}/></i></div><small>Every unclaimed severe case is queued for human review.</small></article><article className="chart-card focus-card"><span className="eyebrow purple-text">Coverage gap</span><strong>{missed}</strong><h3>Potentially missed beneficiaries</h3><p>Severe damage evidence with no corresponding claim.</p><div><AlertTriangle/>Field verification recommended</div></article></div></section>; }

function AlertsView({farms,onOpen}:{farms:Farm[];onOpen:(f:Farm)=>void}) { return <section className="page-panel alerts-page"><div className="section-head"><div><span className="eyebrow">Action queue</span><h2>{farms.length} farms need attention</h2><p>Ranked for human field verification—not automatic claim decisions.</p></div></div><div className="alert-list">{farms.sort((a,b)=>(a.Potentially_Missed?-2:a.Evidence_Mismatch?-1:0)-(b.Potentially_Missed?-2:b.Evidence_Mismatch?-1:0)).map(f=><article key={f.Farm_ID} className={f.Potentially_Missed?'missed-alert':''}><span className="alert-symbol">{f.Potentially_Missed?<AlertTriangle/>:f.Evidence_Mismatch?<SlidersHorizontal/>:<ShieldCheck/>}</span><div><span className="eyebrow">{f.Potentially_Missed?'High priority':f.Evidence_Mismatch?'Review':'Verify'} <b>{f.Farm_ID}</b></span><h3>{f.Potentially_Missed?'Potentially missed beneficiary':f.Evidence_Mismatch?'Claim and evidence mismatch':'Severe damage evidence'}</h3><p>{f.AI_Damage_Percent}% AI damage, {f.Claim_Submitted==='No'?'no corresponding claim':`${f.Claimed_Damage}% claimed damage`}, {f.AI_Confidence}% confidence</p></div><button onClick={()=>onOpen(f)}>Open evidence</button></article>)}</div></section>; }
