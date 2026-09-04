'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import { AlertTriangle, BarChart3, Bell, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, ClipboardList, Clock3, Crosshair, Database, FileText, Flag, Info, Layers3, LayoutDashboard, Leaf, LogOut, Mail, Map, MapPin, RefreshCw, Satellite, Search, Settings, ShieldCheck, SlidersHorizontal, Sprout, UserRound, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
type Damage = 'Severe' | 'Moderate' | 'Low';
type Farm = {
  Farm_ID: string; Crop: string; Area: number; Flood_Percent: number; NDVI_Change: number;
  AI_Damage_Percent: number; AI_Confidence: number; Claim_Submitted: 'Yes' | 'No';
  Claimed_Damage: number; Potentially_Missed: boolean; Evidence_Mismatch: boolean;
  Priority: Priority; Alert: string; boundary: [number, number][];
};
type RegionId = 'ballari'|'sitapur'|'dhemaji';
type Region = {id:RegionId; name:string; lat:number; lon:number; zoom:number; updated:string; farms:Farm[]; floodBoundary:[number,number][]};

const rawFarms: Omit<Farm, 'boundary'>[] = [
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
const farmBoundary=(center:[number,number],index:number,pattern:'blocks'|'riverside'|'clusters'):[number,number][]=>{
  const [lat,lon]=center;
  if(pattern==='riverside'){
    const width=.0035+(index%3)*.00055, length=.0056+(index%4)*.00065, angle=-.14+(index%5)*.055;
    const rotate=(north:number,east:number):[number,number]=>[lat+north*Math.cos(angle)-east*Math.sin(angle),lon+north*Math.sin(angle)+east*Math.cos(angle)];
    return [rotate(-width,-length),rotate(width*.78,-length*.94),rotate(width,length),rotate(-width*.82,length*.9)];
  }
  if(pattern==='clusters'){
    const sx=.0046+(index%4)*.00085, sy=.0058+(index%3)*.00115, angle=-.2+(index%6)*.07;
    const rotate=(north:number,east:number):[number,number]=>[lat+north*Math.cos(angle)-east*Math.sin(angle),lon+north*Math.sin(angle)+east*Math.cos(angle)];
    if(index%2===0) return [rotate(-sx,-sy*.82),rotate(sx*.78,-sy),rotate(sx,sy*.76),rotate(-sx*.7,sy)];
    return [rotate(-sx*.9,-sy*.6),rotate(sx*.08,-sy),rotate(sx*.92,-sy*.48),rotate(sx*.78,sy*.84),rotate(-sx,sy*.72)];
  }
  const sx=.0046+(index%3)*.0005, sy=.0055+(index%2)*.0006;
  return [[lat-sx,lon-sy],[lat+sx*.78,lon-sy*.84],[lat+sx,lon+sy*.82],[lat-sx*.72,lon+sy]];
};

const buildRegionFarms=(prefix:'S'|'D',regionCenters:[number,number][],pattern:'riverside'|'clusters',offset:number):Farm[]=>regionCenters.map((center,index)=>{
  const source=rawFarms[(index*3+offset)%rawFarms.length];
  const missed=(prefix==='S'?[3,12,16]:[2,9,14]).includes(index+1);
  const mismatch=(prefix==='S'?[6,10,15]:[5,8,13]).includes(index+1);
  const baseDamage=Math.max(16,Math.min(88,source.AI_Damage_Percent+(prefix==='S'?4:-2)+((index%3)-1)*3));
  const aiDamage=missed?Math.max(72,baseDamage):baseDamage;
  const claimed=mismatch?Math.max(18,Math.min(86,aiDamage+(index%2?27:-25))):Math.max(12,Math.min(84,aiDamage+(index%3)-1));
  const claimSubmitted:Farm['Claim_Submitted']=missed||index%7===5?'No':'Yes';
  return {...source,Farm_ID:`${prefix}${String(index+1).padStart(3,'0')}`,Crop:['Paddy','Cotton','Maize','Groundnut','Millet'][(index+offset)%5],Area:Number((1.3+(index%7)*.38).toFixed(1)),Flood_Percent:Math.max(12,Math.min(93,aiDamage+7-(index%4)*3)),NDVI_Change:Math.max(9,aiDamage-16+(index%5)),AI_Damage_Percent:aiDamage,AI_Confidence:81+(index%13),Claim_Submitted:claimSubmitted,Claimed_Damage:claimSubmitted==='Yes'?claimed:0,Potentially_Missed:missed,Evidence_Mismatch:mismatch,Priority:missed||aiDamage>=74?'HIGH':aiDamage>=43?'MEDIUM':'LOW',Alert:missed?'Potentially missed':mismatch?'Evidence mismatch':aiDamage>=70?'Verify':aiDamage>=40?'Review':'Monitor',boundary:farmBoundary(center,index,pattern)};
});

const SITAPUR_CENTERS:[number,number][]=[[27.589,80.717],[27.589,80.738],[27.590,80.759],[27.591,80.780],[27.601,80.713],[27.602,80.735],[27.602,80.757],[27.603,80.779],[27.613,80.719],[27.614,80.741],[27.614,80.763],[27.615,80.785],[27.625,80.715],[27.625,80.737],[27.626,80.759],[27.627,80.781]];
const DHEMAJI_CENTERS:[number,number][]=[[27.451,94.520],[27.456,94.552],[27.449,94.590],[27.458,94.625],[27.482,94.506],[27.490,94.544],[27.479,94.584],[27.492,94.635],[27.520,94.510],[27.529,94.550],[27.517,94.592],[27.530,94.627],[27.554,94.536],[27.556,94.580]];
const BALLARI_FARMS:Farm[]=rawFarms.map((farm,index)=>({...farm,boundary:farmBoundary(centers[index],index,'blocks')}));
const REGIONS:Record<RegionId,Region>={
  ballari:{id:'ballari',name:'Ballari, Karnataka',lat:15.1394,lon:76.9214,zoom:14,updated:'09/02/2026 • 10:30 AM IST',farms:BALLARI_FARMS,floodBoundary:[[15.168,76.892],[15.164,76.953],[15.148,76.958],[15.137,76.946],[15.122,76.959],[15.104,76.943],[15.109,76.897],[15.130,76.889]]},
  sitapur:{id:'sitapur',name:'Sitapur, Uttar Pradesh',lat:27.609,lon:80.751,zoom:13,updated:'09/02/2026 • 10:18 AM IST',farms:buildRegionFarms('S',SITAPUR_CENTERS,'riverside',2),floodBoundary:[[27.575,80.747],[27.578,80.701],[27.595,80.697],[27.620,80.698],[27.640,80.704],[27.643,80.751],[27.638,80.800],[27.612,80.806],[27.578,80.798]]},
  dhemaji:{id:'dhemaji',name:'Dhemaji, Assam',lat:27.505,lon:94.575,zoom:12,updated:'09/02/2026 • 09:54 AM IST',farms:buildRegionFarms('D',DHEMAJI_CENTERS,'clusters',5),floodBoundary:[[27.430,94.495],[27.447,94.641],[27.492,94.660],[27.535,94.646],[27.577,94.602],[27.571,94.516],[27.519,94.492],[27.463,94.487]]},
};

const latestDate = () => { const d = new Date(); d.setDate(d.getDate()-2); return d.toISOString().slice(0,10); };
const severity = (farm: Farm): Damage => farm.AI_Damage_Percent >= 70 ? 'Severe' : farm.AI_Damage_Percent >= 40 ? 'Moderate' : 'Low';
const colorFor = (farm: Farm) => farm.Potentially_Missed ? '#9775C9' : severity(farm)==='Severe' ? '#D95C59' : severity(farm)==='Moderate' ? '#D9A441' : '#5EAD78';

function SatelliteMap({ farms, selected, onSelect, date, location, layers, onStatus }: {
  farms: Farm[]; selected: Farm|null; onSelect: (farm: Farm) => void; date: string;
  location: Region; layers: Record<string,boolean>;
  onStatus: (status:'loading'|'available'|'unavailable') => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map|null>(null);
  const leafletRef = useRef<typeof import('leaflet')|null>(null);
  const imageryBaseRef = useRef<Leaflet.TileLayer|null>(null);
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
      const map = L.map(elRef.current, {zoomControl:false, attributionControl:true, preferCanvas:false}).setView([location.lat,location.lon], location.zoom);
      L.control.zoom({position:'bottomright'}).addTo(map);
      mapRef.current = map;
      let errors = 0;
      const imageryBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution:'Esri World Imagery', maxZoom:19,
      });
      imageryBase.addTo(map); imageryBaseRef.current = imageryBase;
      const sat = L.tileLayer.wms('https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi', {
        layers:'MODIS_Terra_CorrectedReflectance_TrueColor', format:'image/jpeg', transparent:false,
        attribution:'NASA GIBS / NASA Earthdata', time:date, tileSize:256, maxZoom:19, maxNativeZoom:9, opacity:.28,
      } as Leaflet.WMSOptions & {time:string});
      sat.on('loading',()=>onStatus('loading'));
      sat.on('load',()=>{ errors=0; onStatus('available'); });
      sat.on('tileerror',()=>{ errors += 1; if(errors>=3) onStatus('unavailable'); });
      sat.addTo(map); satelliteRef.current = sat;
      const labels = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {opacity:.18, attribution:'© OpenStreetMap contributors', maxZoom:19});
      labels.addTo(map); labelsRef.current = labels;
      const flood = L.polygon(location.floodBoundary, {color:'#4E86B8',fillColor:'#4E86B8',fillOpacity:.2,weight:1.5,interactive:false});
      flood.addTo(map); floodRef.current=flood;
      farmGroupRef.current = L.layerGroup().addTo(map);
      setReady(true);
      setTimeout(()=>map.invalidateSize(),120);
    })();
    return () => { cancelled=true; mapRef.current?.remove(); mapRef.current=null; };
  }, []);

  useEffect(() => { if(!mapRef.current) return; mapRef.current.flyTo([location.lat,location.lon],location.zoom,{duration:1}); floodRef.current?.setLatLngs(location.floodBoundary); }, [location]);
  useEffect(() => { const L=leafletRef.current,map=mapRef.current; if(!ready||!L||!map||!selected) return; map.flyToBounds(L.latLngBounds(selected.boundary).pad(.35),{maxZoom:16,duration:.8}); }, [ready,selected?.Farm_ID]);
  useEffect(() => { onStatus('loading'); satelliteRef.current?.setParams({layers:'MODIS_Terra_CorrectedReflectance_TrueColor',format:'image/jpeg',transparent:false,time:date} as Leaflet.WMSParams & {time:string}, false); satelliteRef.current?.redraw(); }, [date]);
  useEffect(() => {
    const map=mapRef.current, base=imageryBaseRef.current, sat=satelliteRef.current, labels=labelsRef.current, flood=floodRef.current;
    if(!map) return;
    if(base) layers.satellite ? base.addTo(map) : base.removeFrom(map);
    if(sat) layers.satellite ? sat.addTo(map) : sat.removeFrom(map);
    if(labels) layers.labels ? labels.addTo(map) : labels.removeFrom(map);
    if(flood) layers.flood ? flood.addTo(map) : flood.removeFrom(map);
  }, [layers]);
  useEffect(() => {
    const L=leafletRef.current, group=farmGroupRef.current;
    if(!ready || !L || !group) return;
    group.clearLayers();
    if(!layers.farms) return;
    farms.forEach((farm) => {
      const active=farm.Farm_ID===selected?.Farm_ID;
      const polygon=L.polygon(farm.boundary,{color:active?'#ffffff':colorFor(farm),fillColor:colorFor(farm),fillOpacity:farm.Potentially_Missed?.38:.34,weight:active?2.5:1.7});
      polygon.bindTooltip(`<b>${farm.Farm_ID}</b><br>${severity(farm)} damage, ${farm.AI_Damage_Percent}% assessed`,{direction:'top',offset:[0,-4]});
      polygon.on('click',()=>onSelect(farm));
      polygon.addTo(group);
    });
  }, [farms, selected?.Farm_ID, layers.farms, ready, onSelect]);
  return <div ref={elRef} className="leaflet-host" aria-label="Interactive NASA GIBS satellite map with synthetic farm boundaries" />;
}

export default function Home() {
  const [view,setView]=useState<'overview'|'claims'|'analytics'|'alerts'>('overview');
  const [quick,setQuick]=useState<'all'|'missed'|'mismatch'>('all');
  const [priority,setPriority]=useState<'All'|Priority>('All');
  const [claim,setClaim]=useState<'All'|'Yes'|'No'>('All');
  const [damage,setDamage]=useState<'All'|Damage>('All');
  const [selected,setSelected]=useState<Farm|null>(null);
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [date,setDate]=useState(latestDate());
  const [imageryStatus,setImageryStatus]=useState<'loading'|'available'|'unavailable'>('loading');
  const [regionId,setRegionId]=useState<RegionId>('ballari');
  const [query,setQuery]=useState('Ballari, Karnataka');
  const [searching,setSearching]=useState(false);
  const [locationError,setLocationError]=useState('');
  const [claimSearch,setClaimSearch]=useState('');
  const [layers,setLayers]=useState({satellite:true,farms:true,flood:true,labels:true});
  const [accountPanel,setAccountPanel]=useState<'profile'|'settings'|null>(null);
  const [accountMenuOpen,setAccountMenuOpen]=useState(false);
  const [signedIn,setSignedIn]=useState(true);
  const [emailAlerts,setEmailAlerts]=useState(true);
  const [autoRefresh,setAutoRefresh]=useState(true);
  const currentRegion=REGIONS[regionId];
  const farms=currentRegion.farms;

  const visible=useMemo(()=>farms.filter(f =>
    (quick==='all'||(quick==='missed'&&f.Potentially_Missed)||(quick==='mismatch'&&f.Evidence_Mismatch)) &&
    (priority==='All'||f.Priority===priority) && (claim==='All'||f.Claim_Submitted===claim) &&
    (damage==='All'||severity(f)===damage)
  ),[farms,quick,priority,claim,damage]);
  const counts=useMemo(()=>({all:visible.length,severe:visible.filter(f=>severity(f)==='Severe').length,claims:visible.filter(f=>f.Claim_Submitted==='Yes').length,missed:visible.filter(f=>f.Potentially_Missed).length,high:visible.filter(f=>f.Priority==='HIGH').length,mismatch:visible.filter(f=>f.Evidence_Mismatch).length}),[visible]);

  const scrollToTop=()=>requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}));
  const showView=(next:typeof view)=>{setView(next);scrollToTop();};
  const selectRegion=(next:RegionId)=>{
    const region=REGIONS[next]; setRegionId(next); setQuery(region.name); setSelected(null); setLocationError('');
    setQuick('all'); setPriority('All'); setClaim('All'); setDamage('All'); setClaimSearch(''); if(autoRefresh)setImageryStatus('loading'); scrollToTop();
  };
  const searchLocation=(e:FormEvent) => {
    e.preventDefault(); if(!query.trim()) return; setSearching(true); setLocationError('');
    const normalized=query.toLowerCase(); const match=Object.values(REGIONS).find(region=>region.name.toLowerCase().includes(normalized)||normalized.includes(region.name.split(',')[0].toLowerCase()));
    if(match) selectRegion(match.id); else setLocationError('Demo regions available: Ballari, Sitapur, and Dhemaji.');
    setSearching(false);
  };
  const selectQuick=(next:'all'|'missed'|'mismatch') => setQuick(next);
  const clearFilters=()=>{setQuick('all');setPriority('All');setClaim('All');setDamage('All');};
  const selectFarm=(farm:Farm)=>setSelected(farm);
  const openFarmOnMap=(farm:Farm)=>{setSelected(farm);setFiltersOpen(false);showView('overview');};
  const filteredClaims=farms.filter(f=>f.Farm_ID.toLowerCase().includes(claimSearch.toLowerCase()));
  const nav=[
    {id:'overview' as const,label:'Overview',icon:<LayoutDashboard/>},
    {id:'claims' as const,label:'Claims',icon:<FileText/>},
    {id:'analytics' as const,label:'Analytics',icon:<BarChart3/>},
    {id:'alerts' as const,label:'Alerts',icon:<Bell/>},
  ];
  const metrics=[
    {label:'Farms analysed',value:counts.all,icon:<LayoutDashboard/>},
    {label:'Severely affected',value:counts.severe,icon:<Sprout/>},
    {label:'Claims received',value:counts.claims,icon:<ClipboardList/>},
    {label:'Potentially missed',value:counts.missed,icon:<Search/>},
    {label:'High priority',value:counts.high,icon:<Flag/>},
  ];
  const severeAll=farms.filter(f=>severity(f)==='Severe');
  const severeClaimed=severeAll.filter(f=>f.Claim_Submitted==='Yes').length;
  const severityCounts={severe:farms.filter(f=>severity(f)==='Severe').length,moderate:farms.filter(f=>severity(f)==='Moderate').length,low:farms.filter(f=>severity(f)==='Low').length};

  const currentTitle=view==='overview'?'Flood Impact Overview':view==='claims'?'Claims Review':view==='analytics'?'Damage Analytics':'Verification Alerts';
  const alertCount=farms.filter(f=>f.Potentially_Missed).length;

  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setAccountMenuOpen(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[]);

  if(!signedIn) return <main className="signed-out-page"><section className="signed-out-card"><span className="brand-mark"><Leaf size={22}/></span><span className="eyebrow">TerraAid secure workspace</span><h1>You’re signed out</h1><p>Your prototype session has ended safely. Sign back in to continue reviewing regional flood evidence.</p><button onClick={()=>setSignedIn(true)}>Sign back in as AD</button></section></main>;

  return <main className="shell">
    <header className="app-topbar">
      <div className="topbar-brand-zone">
        <button className="brand" onClick={()=>showView('overview')}><span className="brand-mark"><Leaf size={19}/></span><strong>TerraAid</strong></button>
      </div>
      <div className="topbar-main">
        <span className="live-pill"><i/>Live</span>
        <div className="breadcrumb"><span>{currentRegion.name}</span><ChevronRight/><strong>{currentTitle}</strong></div>
        <div className="topbar-actions">
          <button className="notification" aria-label={`${alertCount} priority notifications`} onClick={()=>showView('alerts')}><Bell/><em>{alertCount}</em></button>
          <div className="account-control" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setAccountMenuOpen(false)}}>
            <button className="user-menu" aria-label="Open account menu" aria-expanded={accountMenuOpen} onClick={()=>setAccountMenuOpen(open=>!open)}><span>AD</span><ChevronDown/></button>
            {accountMenuOpen&&<div className="account-menu" role="menu">
              <div className="account-menu-label"><strong>Admin Officer</strong><small>District relief authority</small></div><hr/>
              <button role="menuitem" onClick={()=>{setAccountPanel('profile');setAccountMenuOpen(false)}}><UserRound/>Profile</button>
              <button role="menuitem" onClick={()=>{setAccountPanel('settings');setAccountMenuOpen(false)}}><Settings/>Settings</button><hr/>
              <button className="danger" role="menuitem" onClick={()=>{setAccountPanel(null);setAccountMenuOpen(false);setSignedIn(false)}}><LogOut/>Log out</button>
            </div>}
          </div>
        </div>
      </div>
    </header>
    <aside className="nav-sidebar">
      <nav aria-label="Primary navigation">{nav.map(item=><button key={item.id} className={view===item.id?'active':''} onClick={()=>showView(item.id)}>{item.icon}<span>{item.label}</span></button>)}</nav>
      <aside className="sidebar-note"><Leaf/><p>TerraAid is built to support evidence-based decisions and faster recovery.</p></aside>
    </aside>
    <div className="page-content">
    <section className="intro">
      <div><h1>{currentTitle}</h1><div className="header-meta"><strong>{currentRegion.name}</strong><span className="verified"><CheckCircle2/></span><span className="assessment-tag">Post-flood agricultural assessment</span></div><p className="intro-description">Monitor flood impact on agricultural farms, track affected areas, and manage claims.</p></div>
      <Dialog><DialogTrigger className="method"><Info size={14}/> Data &amp; method</DialogTrigger><DialogContent className="method-dialog"><DialogHeader><DialogTitle>Data &amp; method</DialogTitle><DialogDescription>TerraAid supports authorised human decisions; it does not approve or reject claims.</DialogDescription></DialogHeader><div className="method-list"><div><Satellite/><span><b>Satellite imagery</b><small>NASA GIBS MODIS Terra True Color. Historical date requests are sent to the live WMS service.</small></span></div><div><BarChart3/><span><b>Damage analysis</b><small>May combine flood evidence, vegetation change and automated change detection.</small></span></div><div><Database/><span><b>Prototype records</b><small>Claims and farm boundaries are synthetic demonstration data—not official cadastral parcels.</small></span></div><div><ShieldCheck/><span><b>Human authority</b><small>Field verification and final relief decisions remain with authorised officials.</small></span></div></div></DialogContent></Dialog>
    </section>
    {view==='overview' && <>
      <section className="metric-grid">{metrics.map(metric=><article className="metric" key={metric.label}><span className="metric-icon">{metric.icon}</span><div><strong>{metric.value}</strong><span>{metric.label}</span></div></article>)}</section>
      <section className="info-strip" aria-label="Assessment summary">
        <article><Clock3/><div><strong>Severe impact detected</strong><span>{counts.severe} farms need immediate attention</span></div></article>
        <article><Map/><div><strong>Coverage</strong><span>{farms.length} farms • {currentRegion.name}</span></div></article>
        <article><Database/><div><strong>Data source</strong><span>Satellite imagery &amp; field data</span></div></article>
        <article><CalendarDays/><div><strong>Last updated</strong><span>{currentRegion.updated}</span></div></article>
      </section>
      <section className="workspace">
        <section className="map-card">
          <div className="map-toolbar">
            <button className="filter-toggle" onClick={()=>setFiltersOpen(v=>!v)} aria-expanded={filtersOpen}><SlidersHorizontal size={14}/>Filters</button>
            <label className="region-switcher"><MapPin/><span>Region</span><select value={regionId} onChange={e=>selectRegion(e.target.value as RegionId)}><option value="ballari">Ballari, Karnataka</option><option value="sitapur">Sitapur, Uttar Pradesh</option><option value="dhemaji">Dhemaji, Assam</option></select></label>
            <form className="location-search" onSubmit={searchLocation}><div className="searchbox"><Search size={14}/><input aria-label="Search district, village or location" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search district, village or location…"/>{query&&<button className="search-clear" type="button" aria-label="Clear search" onClick={()=>setQuery('')}><X/></button>}</div><button className="search-submit" disabled={searching}>{searching?'Searching…':'Search'}</button></form>
            <label className="date-control"><CalendarDays size={13}/><input aria-label="Satellite date" type="date" value={date} max={latestDate()} onInput={e=>setDate(e.currentTarget.value)}/></label>
            <button className="latest" onClick={()=>setDate(latestDate())}><Satellite size={13}/>Latest available</button>
            <span className={`map-status ${imageryStatus}`}><i/>{imageryStatus==='available'?'Satellite available':imageryStatus==='loading'?'Loading imagery':'Imagery unavailable'} <b>{visible.length} farms</b></span>
          </div>
          {locationError&&<div className="location-error"><AlertTriangle size={13}/><span>{locationError}</span><button onClick={()=>setQuery(currentRegion.name)}>Use current region</button></div>}
          <div className="map-stage">
            <SatelliteMap farms={visible} selected={selected} onSelect={selectFarm} date={date} location={currentRegion} layers={layers} onStatus={setImageryStatus}/>
            {imageryStatus==='unavailable'&&<div className="satellite-error"><AlertTriangle/><b>Live satellite imagery temporarily unavailable.</b><small>Farm overlays remain visible. Try a nearby date.</small><button onClick={()=>{setImageryStatus('loading');satelliteRefocusHack(date,setDate)}}><RefreshCw/>Retry</button></div>}
            {filtersOpen&&<aside className="filters">
              <div className="panel-heading"><span>Filters and layers</span><div><button onClick={clearFilters}>Reset</button><button onClick={()=>setFiltersOpen(false)}>Close</button></div></div>
              <button className={quick==='missed'?'filter-active':''} onClick={()=>selectQuick('missed')}><b>Potentially missed</b><small>Severe damage and no claim</small><em>{farms.filter(f=>f.Potentially_Missed).length}</em></button>
              <button className={quick==='all'?'filter-active all-filter':''} onClick={()=>selectQuick('all')}><b>All assessed farms</b><small>Complete assessment</small><em>{farms.length}</em></button>
              <button className={quick==='mismatch'?'filter-active':''} onClick={()=>selectQuick('mismatch')}><b>Evidence mismatch</b><small>Closer review advised</small><em>{farms.filter(f=>f.Evidence_Mismatch).length}</em></button>
              <div className="filter-group"><label>Priority</label><select value={priority} onChange={e=>setPriority(e.target.value as typeof priority)}><option>All</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div>
              <div className="filter-group"><label>Claim status</label><select value={claim} onChange={e=>setClaim(e.target.value as typeof claim)}><option value="All">All</option><option value="Yes">Submitted</option><option value="No">No claim</option></select></div>
              <div className="filter-group"><label>Damage evidence</label><select value={damage} onChange={e=>setDamage(e.target.value as typeof damage)}><option>All</option><option>Severe</option><option>Moderate</option><option>Low</option></select></div>
              <div className="layers"><label><input type="checkbox" checked={layers.satellite} onChange={()=>setLayers({...layers,satellite:!layers.satellite})}/><Satellite/>Satellite imagery</label><label><input type="checkbox" checked={layers.farms} onChange={()=>setLayers({...layers,farms:!layers.farms})}/><Layers3/>Farm damage</label><label><input type="checkbox" checked={layers.flood} onChange={()=>setLayers({...layers,flood:!layers.flood})}/><span className="layer-dot blue"/>Flood extent</label><label><input type="checkbox" checked={layers.labels} onChange={()=>setLayers({...layers,labels:!layers.labels})}/><MapPin/>Place labels</label></div>
            </aside>}
            <div className="legend"><b>Damage evidence</b><span><i className="red"/>Severely affected</span><span><i className="amber"/>Moderately affected</span><span><i className="green"/>No or minor damage</span><span><i className="purple"/>Potentially missed</span><span><i className="blue"/>Flooded area</span></div>
            {selected&&<FarmPanel farm={selected} onClose={()=>setSelected(null)}/>}
          </div>
          <footer><span><Crosshair size={11}/>{currentRegion.lat.toFixed(4)}, {currentRegion.lon.toFixed(4)}</span><span>Esri World Imagery, NASA Earthdata and OpenStreetMap</span></footer>
        </section>
      </section>
    </>}
    {view==='claims'&&<ClaimsView farms={filteredClaims} search={claimSearch} onSearch={setClaimSearch} onOpen={openFarmOnMap}/>}
    {view==='analytics'&&<AnalyticsView severityCounts={severityCounts} severeClaimed={severeClaimed} severeTotal={severeAll.length} missed={farms.filter(f=>f.Potentially_Missed).length}/>}
    {view==='alerts'&&<AlertsView farms={farms.filter(f=>f.Potentially_Missed||f.Evidence_Mismatch||f.Priority==='HIGH')} onOpen={openFarmOnMap}/>}
    </div>
    <Dialog open={accountPanel!==null} onOpenChange={open=>{if(!open)setAccountPanel(null)}}>
      <DialogContent className="account-dialog">
        <DialogHeader><DialogTitle>{accountPanel==='profile'?'Account profile':'Dashboard settings'}</DialogTitle><DialogDescription>{accountPanel==='profile'?'Signed-in relief authority details.':'Choose how TerraAid keeps you informed during reviews.'}</DialogDescription></DialogHeader>
        {accountPanel==='profile'?<div className="profile-card"><span>AD</span><div><strong>Admin Officer</strong><small><Mail/> admin@terraaid.in</small><small><ShieldCheck/> District relief authority</small></div></div>:<div className="settings-list"><label><span><strong>Email priority alerts</strong><small>Receive potentially missed beneficiary notifications.</small></span><input type="checkbox" checked={emailAlerts} onChange={e=>setEmailAlerts(e.target.checked)}/></label><label><span><strong>Automatic map refresh</strong><small>Refresh imagery status when the region changes.</small></span><input type="checkbox" checked={autoRefresh} onChange={e=>setAutoRefresh(e.target.checked)}/></label></div>}
      </DialogContent>
    </Dialog>
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

function AnalyticsView({severityCounts,severeClaimed,severeTotal,missed}:{severityCounts:{severe:number;moderate:number;low:number};severeClaimed:number;severeTotal:number;missed:number}) { const total=severityCounts.severe+severityCounts.moderate+severityCounts.low; return <section className="page-panel analytics"><div className="section-head"><div><span className="eyebrow">District evidence summary</span><h2>Damage intelligence</h2><p>Decision-relevant indicators from the current synthetic assessment.</p></div></div><div className="analytics-grid"><article className="chart-card"><div><span>Damage severity</span><strong>{total} farms</strong></div><div className="donut" style={{background:`conic-gradient(#D95C59 0 ${severityCounts.severe/total*100}%,#D9A441 0 ${(severityCounts.severe+severityCounts.moderate)/total*100}%,#5EAD78 0)`}}><span>{severityCounts.severe}<small>severe</small></span></div><ul><li><i className="red"/>Severe <b>{severityCounts.severe}</b></li><li><i className="amber"/>Moderate <b>{severityCounts.moderate}</b></li><li><i className="green"/>Low / minor <b>{severityCounts.low}</b></li></ul></article><article className="chart-card bars-card"><div><span>Claims among severe farms</span><strong>{severeTotal} severe cases</strong></div><div className="bar-item"><label><span>Claim submitted</span><b>{severeClaimed}</b></label><i><em style={{width:`${severeClaimed/severeTotal*100}%`}}/></i></div><div className="bar-item no-claim-bar"><label><span>No claim</span><b>{severeTotal-severeClaimed}</b></label><i><em style={{width:`${(severeTotal-severeClaimed)/severeTotal*100}%`}}/></i></div><small>Every unclaimed severe case is queued for human review.</small></article><article className="chart-card focus-card"><span className="eyebrow purple-text">Coverage gap</span><strong>{missed}</strong><h3>Potentially missed beneficiaries</h3><p>Severe damage evidence with no corresponding claim.</p><div><AlertTriangle/>Field verification recommended</div></article></div></section>; }

function AlertsView({farms,onOpen}:{farms:Farm[];onOpen:(f:Farm)=>void}) { return <section className="page-panel alerts-page"><div className="section-head"><div><span className="eyebrow">Action queue</span><h2>{farms.length} farms need attention</h2><p>Ranked for human field verification—not automatic claim decisions.</p></div></div><div className="alert-list">{farms.sort((a,b)=>(a.Potentially_Missed?-2:a.Evidence_Mismatch?-1:0)-(b.Potentially_Missed?-2:b.Evidence_Mismatch?-1:0)).map(f=><article key={f.Farm_ID} className={f.Potentially_Missed?'missed-alert':''}><span className="alert-symbol">{f.Potentially_Missed?<AlertTriangle/>:f.Evidence_Mismatch?<SlidersHorizontal/>:<ShieldCheck/>}</span><div><span className="eyebrow">{f.Potentially_Missed?'High priority':f.Evidence_Mismatch?'Review':'Verify'} <b>{f.Farm_ID}</b></span><h3>{f.Potentially_Missed?'Potentially missed beneficiary':f.Evidence_Mismatch?'Claim and evidence mismatch':'Severe damage evidence'}</h3><p>{f.AI_Damage_Percent}% AI damage, {f.Claim_Submitted==='No'?'no corresponding claim':`${f.Claimed_Damage}% claimed damage`}, {f.AI_Confidence}% confidence</p></div><button onClick={()=>onOpen(f)}>Open evidence</button></article>)}</div></section>; }
