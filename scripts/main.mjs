const MODULE_ID = "franchise-wars";
const VERSION = "1.2.1";
const STATE_KEY = "campaignState";
const IMPORT_KEY = "importVersion";
const DEFAULT_STATE = {rabbitRating:1,mandateName:"Rabbit Rating",commonsTally:[],leverage:{},receipts:{},board:{},missions:{},clauses:{},currentAct:1,questRabbitCut:30,cutRule:false,log:[],starsAwarded:[]};

Hooks.once("init",()=>{
  game.settings.register(MODULE_ID,STATE_KEY,{name:"Franchise Wars Campaign State",scope:"world",config:false,type:Object,default:foundry.utils.deepClone(DEFAULT_STATE)});
  game.settings.register(MODULE_ID,"autoImport",{name:"Import campaign into this world automatically",hint:"On (default): the first GM load of each new version builds and updates all Franchise Wars documents in the world. Off: nothing is imported automatically; use the compendiums in the Compendium sidebar, or the Content Manager above.",scope:"world",config:true,type:Boolean,default:true});
  game.settings.register(MODULE_ID,IMPORT_KEY,{name:"Franchise Wars Import Version",scope:"world",config:false,type:String,default:""});
  game.franchiseWars={getState,patchState,importContent,importMaps,requestCheck,requestSave,postContractBrief,awardReceipt,addLeverage,addCommonsAlly,setBoardSeat,setMissionState,voidClause,openCommandCentre,openSessionZero};
});

Hooks.once("ready",async()=>{
  document.body.classList.add("franchise-wars-active");
  if(!game.user.isGM)return;
  if(game.system.id!=="dnd5e") return ui.notifications.error("The Franchise Wars requires dnd5e.",{permanent:true});
  const coreMajor=Number(String(game.version??"0").split(".")[0]);
  const sysMajor=Number(String(game.system.version??"0").split(".")[0]);
  if(coreMajor!==14||sysMajor!==6) ui.notifications.warn(`Franchise Wars is tested for Foundry v14 / dnd5e v6. Current: ${game.version} / ${game.system.version}.`,{permanent:true});
  const imported=game.settings.get(MODULE_ID,IMPORT_KEY);
  if(imported!==VERSION&&game.settings.get(MODULE_ID,"autoImport")){
    try{await importContent(); ui.notifications.info("Franchise Wars campaign files imported/updated.");}
    catch(err){console.error("Franchise Wars | import failed",err);ui.notifications.error("Franchise Wars import failed. See console.",{permanent:true});}
  }
});

async function getState(){return foundry.utils.mergeObject(foundry.utils.deepClone(DEFAULT_STATE),game.settings.get(MODULE_ID,STATE_KEY)??{},{inplace:false,overwrite:true,insertKeys:true});}
async function patchState(patch){if(!game.user.isGM)throw new Error("GM only");const next=foundry.utils.mergeObject(await getState(),patch,{inplace:false,overwrite:true,insertKeys:true});await game.settings.set(MODULE_ID,STATE_KEY,next);Hooks.callAll("franchiseWarsStateChanged",next,patch);return next;}

function fnv(text){let h=0x811c9dc5;const bytes=new TextEncoder().encode(text);for(const b of bytes){h^=b;h=Math.imul(h,0x01000193)>>>0;}return h.toString(16).padStart(8,"0");}
function currentJournalHash(j){const payload=j.pages.contents.map(p=>`${p.name}\n${p.text?.content??""}`).join("\n");return fnv(payload);}

async function loadJSON(name){const r=await fetch(`modules/${MODULE_ID}/data/${name}`);if(!r.ok)throw new Error(`${name}: ${r.status}`);return r.json();}
async function importContent({force=false}={}){
  if(!game.user.isGM)throw new Error("GM only");
  const data=await loadJSON("journals.json");
  const folderBySource=new Map();
  for(const f of data.folders){
    let folder=game.folders.find(x=>x.type==="JournalEntry"&&x.getFlag(MODULE_ID,"sourceId")===f.sourceId);
    if(!folder){const parent=f.parent?folderBySource.get(f.parent)?.id:null;folder=await Folder.create({name:f.name,type:"JournalEntry",folder:parent,flags:{[MODULE_ID]:{sourceId:f.sourceId,managed:true}}});}
    folderBySource.set(f.sourceId,folder);
  }
  const recovery=folderBySource.get("fw.folder.recovery");
  for(const e of data.entries){
    let j=game.journal.find(x=>x.getFlag(MODULE_ID,"sourceId")===e.sourceId);
    const folderId=folderBySource.get(e.folder)?.id??null;
    const pageData=e.pages.map((p,i)=>({name:p.name,type:"text",sort:i*100000,text:{format:1,content:p.html}}));
    if(!j){
      j=await JournalEntry.create({name:e.name,folder:folderId,img:e.img??null,ownership:e.ownership??{default:0},pages:pageData,flags:{[MODULE_ID]:{sourceId:e.sourceId,managed:true,importedHash:e.contentHash,meta:e.meta??{}}}});
      continue;
    }
    const oldHash=j.getFlag(MODULE_ID,"importedHash");
    if(!force&&oldHash===e.contentHash)continue;
    if(oldHash&&currentJournalHash(j)!==oldHash&&recovery){
      const clone=j.toObject(); delete clone._id; clone.name=`${j.name} — Recovery ${new Date().toISOString()}`;clone.folder=recovery.id;
      clone.flags={...(clone.flags??{}),[MODULE_ID]:{...(clone.flags?.[MODULE_ID]??{}),managed:false,recoveryOf:e.sourceId}};
      await JournalEntry.create(clone);
    }
    await j.update({name:e.name,folder:folderId,img:e.img??null,ownership:e.ownership??j.ownership,flags:{[MODULE_ID]:{sourceId:e.sourceId,managed:true,importedHash:e.contentHash,meta:e.meta??{}}}});
    const ids=j.pages.map(p=>p.id); if(ids.length)await j.deleteEmbeddedDocuments("JournalEntryPage",ids);
    await j.createEmbeddedDocuments("JournalEntryPage",pageData);
  }
  await importItems({force});
  await importActors({force});
  await importScenes({force});
  await importPlaylists();
  await importRollTables();
  await importMacros();
  await game.settings.set(MODULE_ID,IMPORT_KEY,VERSION);
}



async function ensureManagedFolders(type, defs){
  const map=new Map();
  for(const f of defs){
    let folder=game.folders.find(x=>x.type===type&&x.getFlag(MODULE_ID,"sourceId")===f.sourceId);
    const sorting=f.sorting??(type==="Scene"?"m":undefined),sort=f.sort??undefined;
    if(!folder){const parent=f.parent?map.get(f.parent)?.id:null;folder=await Folder.create({name:f.name,type,folder:parent,...(sorting?{sorting}:{}),...(sort!=null?{sort}:{}),flags:{[MODULE_ID]:{sourceId:f.sourceId,managed:true}}});}
    else {const parent=f.parent?map.get(f.parent)?.id:null;const upd={};if(folder.name!==f.name)upd.name=f.name;if(folder.folder?.id!==parent)upd.folder=parent;if(sorting&&folder.sorting!==sorting)upd.sorting=sorting;if(sort!=null&&folder.sort!==sort)upd.sort=sort;if(Object.keys(upd).length)await folder.update(upd);}
    map.set(f.sourceId,folder);
  }
  return map;
}

function managedFlags(sourceId,hash,extra={}){return {[MODULE_ID]:{sourceId,managed:true,importedHash:hash,...extra}};}

async function importItems({force=false}={}){
  const data=await loadJSON("items.json");
  const folders=await ensureManagedFolders("Item",data.folders);
  for(const e of data.entries){
    let item=game.items.find(x=>x.getFlag(MODULE_ID,"sourceId")===e.sourceId);
    const folder=folders.get(e.folder)?.id??null;
    const payload=foundry.utils.deepClone(e.data); payload.folder=folder; if(payload.prototypeToken?.texture){Object.assign(payload.prototypeToken.texture,{scaleX:1,scaleY:1,fit:"contain"});} payload.flags=foundry.utils.mergeObject(payload.flags??{},managedFlags(e.sourceId,e.contentHash),{inplace:false});
    if(!item){await Item.create(payload);continue;}
    if(!force&&item.getFlag(MODULE_ID,"importedHash")===e.contentHash)continue;
    const update=foundry.utils.deepClone(payload); delete update._id; await item.update(update);
  }
}

let _actorIndex=null;
async function actorCompendiumIndex(){
  if(_actorIndex)return _actorIndex;
  _actorIndex=new Map();
  for(const pack of game.packs.filter(p=>p.documentName==="Actor")){
    try{
      const idx=await pack.getIndex({fields:["name","type"]});
      for(const r of idx){
        const k=String(r.name??"").trim().toLowerCase(); if(!k)continue;
        const hits=_actorIndex.get(k)??[]; hits.push({pack,id:r._id}); _actorIndex.set(k,hits);
      }
    }catch(err){console.warn("Franchise Wars | actor index",pack.collection,err);}
  }
  return _actorIndex;
}
function preferredActorHits(hits){
  const modern=globalThis.dnd5e?.settings?.rulesVersion==="modern";
  return [...hits].sort((a,b)=>{
    const score=h=>{const c=String(h.pack.collection??"").toLowerCase();return modern?(c.includes("actors24")?0:c.includes("monsters")?1:2):(c.includes("monsters")?0:c.includes("actors24")?1:2);};
    return score(a)-score(b);
  });
}
async function coreActorSource(spec){
  const index=await actorCompendiumIndex();
  const candidates=[spec.baseName,...(spec.fallbackBaseNames??[])].filter(Boolean);
  for(const name of candidates){
    const hits=preferredActorHits(index.get(String(name).toLowerCase())??[]);
    for(const hit of hits){const src=await hit.pack.getDocument(hit.id);if(src)return src;}
  }
  return null;
}
async function cloneCoreActor(spec,folder,existing=null,force=false){
  const src=await coreActorSource(spec);
  if(!src){console.warn(`Franchise Wars | No compendium actor found for ${spec.name} (tried ${[spec.baseName,...(spec.fallbackBaseNames??[])].join(", ")})`);return null;}
  if(src.name.toLowerCase()!==String(spec.baseName).toLowerCase())console.info(`Franchise Wars | ${spec.name}: ${spec.baseName} not installed, using ${src.name} from ${src.pack}`);
  const specHash=fnv(JSON.stringify({base:spec.baseName,fallback:spec.fallbackBaseNames??[],name:spec.name,description:spec.description,extraItems:spec.extraItems??[],extraSpells:spec.extraSpells??[],overrides:spec.overrides??{},removeItems:spec.removeItems??[],source:src.uuid,img:spec.img??null,token:spec.token??null,artAssetId:spec.artAssetId??null,v:3}));
  if(!force&&existing?.getFlag(MODULE_ID,"importedHash")===specHash)return existing;
  const data=src.toObject(); delete data._id; delete data.folder; data.name=spec.name; data.folder=folder;
  if(spec.img){data.img=spec.img;data.prototypeToken??={};data.prototypeToken.texture??={};data.prototypeToken.texture.src=spec.token??spec.img;Object.assign(data.prototypeToken.texture,{scaleX:1,scaleY:1,fit:"contain",anchorX:0.5,anchorY:0.5,offsetX:0,offsetY:0});data.prototypeToken.ring={...(data.prototypeToken.ring??{}),enabled:false};}
  if(spec.name){data.prototypeToken??={};data.prototypeToken.name=spec.name;}
  data.system??={}; data.system.details??={}; data.system.details.biography??={value:"",public:""}; data.system.details.biography.value=`${spec.description}${data.system.details.biography.value??""}`;
  if(spec.extraItems?.length){const extra=foundry.utils.deepClone(spec.extraItems); for(const it of extra){it.system??={}; it.system.source=foundry.utils.mergeObject(it.system.source??{},{custom:"Franchise Wars",rules:"2014"},{inplace:false});} const names=new Set(extra.map(i=>i.name)); data.items=[...(data.items??[]).filter(i=>!names.has(i.name)),...extra];}
  if(spec.removeItems?.length){const rm=new Set(spec.removeItems.map(n=>n.toLowerCase()));data.items=(data.items??[]).filter(i=>!rm.has(String(i.name).toLowerCase()));}
  if(spec.extraSpells?.length){for(const sp of spec.extraSpells){const it=await coreItemSource(sp.name,"spell");if(!it){console.warn(`Franchise Wars | spell not found: ${sp.name}`);continue;}const o=it.toObject();delete o._id;if(sp.method)foundry.utils.setProperty(o,"system.method",sp.method);if(sp.uses){o.system.uses={max:String(sp.uses),spent:0,recovery:[{period:"lr",type:"recoverAll"}]};}o.flags=foundry.utils.mergeObject(o.flags??{},{[MODULE_ID]:{managed:true}},{inplace:false});data.items=[...(data.items??[]).filter(i=>i.name!==o.name),o];}}
  for(const[k,v]of Object.entries(spec.overrides??{}))foundry.utils.setProperty(data,k,v);
  data.flags=foundry.utils.mergeObject(data.flags??{},managedFlags(spec.sourceId,specHash,{baseName:spec.baseName,clonedFrom:src.uuid,artAssetId:spec.artAssetId??null}),{inplace:false});
  if(!existing){const made=await Actor.create(data);await stampActorState(made);return made;}
  await actorRecovery(existing);
  const embedded=data.items??[]; delete data.items; await existing.update(data);
  const ids=existing.items.map(i=>i.id); if(ids.length)await existing.deleteEmbeddedDocuments("Item",ids);
  if(embedded.length)await existing.createEmbeddedDocuments("Item",embedded);
  await stampActorState(existing);
  return existing;
}

function actorStateHash(a){return fnv(JSON.stringify({n:a.name,img:a._source.img,s:a._source.system,i:a.items.map(i=>[i.name,i._source.system?.description?.value??"",i._source.system?.activities??{}])}));}
async function stampActorState(a){if(a)await a.setFlag(MODULE_ID,"stateHash",actorStateHash(a));}
async function actorRecovery(a){
  const stamp=a.getFlag(MODULE_ID,"stateHash");if(!stamp||stamp===actorStateHash(a))return;
  const folder=game.folders.find(f=>f.type==="Actor"&&f.getFlag(MODULE_ID,"sourceId")==="fw.actor.recovery");
  const clone=a.toObject();delete clone._id;clone.name=`${a.name} — Recovery ${new Date().toISOString().slice(0,16)}`;clone.folder=folder?.id??null;
  clone.flags={...(clone.flags??{}),[MODULE_ID]:{managed:false,recoveryOf:a.getFlag(MODULE_ID,"sourceId")}};
  await Actor.create(clone);
}
let _itemIndex=null;
async function grantItems(actor,grants){
  const add=[];const missing=[];
  for(const g of grants){
    const names=[g.name,...(g.alt??[])];
    if(actor.items.some(i=>i.type===g.type&&names.some(n=>i.name.toLowerCase()===n.toLowerCase())))continue;
    let src=null;for(const n of names){src=await coreItemSource(n,g.type);if(src)break;}if(!src){missing.push(`${g.type}: ${g.name}`);continue;}
    const o=src.toObject();delete o._id;if(g.levels)o.system.levels=g.levels;
    if(["weapon","equipment"].includes(o.type))foundry.utils.setProperty(o,"system.equipped",true);
    if(o.type==="spell")foundry.utils.setProperty(o,"system.prepared",o.system.level===0?0:1);
    o.flags=foundry.utils.mergeObject(o.flags??{},{[MODULE_ID]:{managed:true,granted:true}},{inplace:false});add.push(o);
  }
  if(add.length)await actor.createEmbeddedDocuments("Item",add,{keepId:false});
  if(missing.length)console.info(`Franchise Wars | ${actor.name}: not found in compendiums (add by hand if wanted)`,missing);
}
async function coreItemSource(name,type){
  if(!_itemIndex){_itemIndex=new Map();for(const pack of game.packs.filter(p=>p.documentName==="Item")){try{const idx=await pack.getIndex({fields:["name","type"]});for(const r of idx){const k=`${r.type}|${String(r.name).toLowerCase()}`;const h=_itemIndex.get(k)??[];h.push({pack,id:r._id});_itemIndex.set(k,h);}}catch(e){}}}
  const modern=globalThis.dnd5e?.settings?.rulesVersion==="modern";
  const hits=[...(_itemIndex.get(`${type}|${String(name).toLowerCase()}`)??[])].sort((a,b)=>{const sc=h=>{const c=h.pack.collection.toLowerCase();return c.startsWith("dnd5e.")?(modern?(c.includes("24")?0:1):(c.includes("24")?1:0)):2;};return sc(a)-sc(b);});
  for(const h of hits){const d=await h.pack.getDocument(h.id);if(d)return d;}
  return null;
}
async function applyActorPayload(actor,payload,hash){
  await actorRecovery(actor);
  const update=foundry.utils.deepClone(payload); const embedded=update.items??[]; delete update.items; delete update._id;
  update.flags=foundry.utils.mergeObject(update.flags??{},managedFlags(actor.getFlag(MODULE_ID,"sourceId"),hash),{inplace:false});
  await actor.update(update);
  const managed=actor.items.filter(i=>i.getFlag(MODULE_ID,"managed")); if(managed.length)await actor.deleteEmbeddedDocuments("Item",managed.map(i=>i.id));
  if(embedded.length)await actor.createEmbeddedDocuments("Item",embedded);
  await stampActorState(actor);
}

async function importActors({force=false}={}){
  const data=await loadJSON("actors.json");const fwFailed=[];
  const folders=await ensureManagedFolders("Actor",data.folders);
  for(const e of data.entries){try{
    let actor=game.actors.find(x=>x.getFlag(MODULE_ID,"sourceId")===e.sourceId); const folder=folders.get(e.folder)?.id??null;
    const payload=foundry.utils.deepClone(e.data); payload.folder=folder; payload.flags=foundry.utils.mergeObject(payload.flags??{},managedFlags(e.sourceId,e.contentHash),{inplace:false});
    if(!actor){const made=await Actor.create(payload);if(!made)throw new Error("Actor.create returned nothing");if(e.grants)await grantItems(made,e.grants);await stampActorState(made);continue;} if(!force&&actor.getFlag(MODULE_ID,"importedHash")===e.contentHash)continue; await applyActorPayload(actor,payload,e.contentHash); if(e.grants)await grantItems(actor,e.grants);
  }catch(err){fwFailed.push(`${e.data?.name??e.sourceId}: ${err.message}`);console.error("Franchise Wars | actor import failed",e.sourceId,err);}}
  for(const spec of data.clones??[]){try{
    const actor=game.actors.find(x=>x.getFlag(MODULE_ID,"sourceId")===spec.sourceId);
    const r=await cloneCoreActor(spec,folders.get(spec.folder)?.id??null,actor??null,force);if(!r&&!actor)fwFailed.push(`${spec.name}: no compendium base found`);
  }catch(err){fwFailed.push(`${spec.name}: ${err.message}`);console.error("Franchise Wars | clone failed",spec.sourceId,err);}}
  if(fwFailed.length)ui.notifications.warn(`Franchise Wars | ${fwFailed.length} actor(s) could not be imported; the rest of the campaign imported normally. See console for the list.`,{permanent:true});
  if(fwFailed.length)console.warn("Franchise Wars | actors not imported:",fwFailed);
  if(data.retired?.length){
    let rf=game.folders.find(f=>f.type==="Actor"&&f.getFlag(MODULE_ID,"sourceId")==="fw.actor.retired");
    if(!rf)rf=await Folder.create({name:"Retired Duplicates (safe to delete)",type:"Actor",folder:folders.get("fw.actor.root")?.id??null,flags:{[MODULE_ID]:{sourceId:"fw.actor.retired",managed:true}}});
    for(const r of data.retired){
      const a=game.actors.find(x=>x.getFlag(MODULE_ID,"sourceId")===r.sourceId&&x.getFlag(MODULE_ID,"managed"));if(!a)continue;
      await a.update({folder:rf.id,name:`${a.name} (retired — use ${r.name})`,flags:{[MODULE_ID]:{managed:false,retiredInFavourOf:r.replacedBy}}});
    }
  }
}

async function importScenes({force=false}={}){
  const scenes=await loadJSON("scenes.json");
  const folderNames=[...new Set(scenes.map(s=>s.folder).filter(Boolean))];
  const firstSort=n=>Math.min(...scenes.filter(s=>s.folder===n).map(s=>Number(s.sort??0)));
  const defs=[{sourceId:"fw.sfolder.root",name:"The Franchise Wars",parent:null},...folderNames.map(n=>({sourceId:`fw.sfolder.${fnv(n)}`,name:n,parent:"fw.sfolder.root",sort:folderNames.indexOf(n)*100000}))];
  const folders=await ensureManagedFolders("Scene",defs);
  const folderId=n=>n?folders.get(`fw.sfolder.${fnv(n)}`)?.id??null:folders.get("fw.sfolder.root")?.id??null;
  const tag=o=>({...o,flags:{...(o.flags??{}),[MODULE_ID]:{managed:true}}});
  const toCreate=[];
  for(const s of scenes){
    const scene=game.scenes.find(x=>x.getFlag(MODULE_ID,"sourceId")===s.sourceId);
    const data={name:s.name,thumb:s.thumb??null,width:s.width,height:s.height,padding:s.padding??0,navigation:s.navigation??false,
      grid:s.grid??{type:1,size:100,distance:5,units:"ft"},backgroundColor:s.backgroundColor??"#1b1410",tokenVision:s.tokenVision??true,
      environment:s.environment??undefined,folder:folderId(s.folder),sort:s.sort??0,
      flags:{[MODULE_ID]:{sourceId:s.sourceId,managed:true,mapHash:s.mapHash??"",notes:s.notes??""}}};
    if(!scene){toCreate.push({...data,active:false,walls:(s.walls??[]).map(tag),lights:(s.lights??[]).map(tag)});continue;}
    const sameHash=scene.getFlag(MODULE_ID,"mapHash")===(s.mapHash??"");
    await scene.update(data);
    await ensureLevelBackground(scene,s.img,s.backgroundColor);
    if(sameHash&&!force)continue;
    const wallIds=scene.walls.filter(w=>w.getFlag(MODULE_ID,"managed")).map(w=>w.id);
    const lightIds=scene.lights.filter(l=>l.getFlag(MODULE_ID,"managed")).map(l=>l.id);
    if(wallIds.length)await scene.deleteEmbeddedDocuments("Wall",wallIds);
    if(lightIds.length)await scene.deleteEmbeddedDocuments("AmbientLight",lightIds);
    if(s.walls?.length)await scene.createEmbeddedDocuments("Wall",s.walls.map(tag));
    if(s.lights?.length)await scene.createEmbeddedDocuments("AmbientLight",s.lights.map(tag));
  }
  const imgBySource=new Map(scenes.map(s=>[s.sourceId,s]));
  for(let i=0;i<toCreate.length;i+=10){
    const made=await Scene.createDocuments(toCreate.slice(i,i+10));
    for(const sc of made){const src=imgBySource.get(sc.getFlag(MODULE_ID,"sourceId"));await ensureLevelBackground(sc,src?.img,src?.backgroundColor);}
    if(toCreate.length>10)ui.notifications.info(`Franchise Wars | importing battlemaps ${Math.min(i+10,toCreate.length)}/${toCreate.length}`);
  }
  for(const s of scenes){const sc=game.scenes.find(x=>x.getFlag(MODULE_ID,"sourceId")===s.sourceId);if(sc){try{await applySceneExtras(sc,s,force);}catch(err){console.warn("Franchise Wars | scene extras",s.sourceId,err);}}}
}
async function applySceneExtras(sc,s,force=false){
  const mflag=d=>d.getFlag(MODULE_ID,"managed");
  const hash=fnv(JSON.stringify([s.fwTokens??[],s.fwNotes??[],s.fwJournal??null,s.fwSound??null]));
  if(!force&&sc.getFlag(MODULE_ID,"extrasHash")===hash)return;
  const tagged=o=>({...o,flags:{...(o.flags??{}),[MODULE_ID]:{managed:true}}});
  // Scene -> guide page
  if(s.fwJournal){const j=fwFind("JournalEntry",s.fwJournal.entry);const pg=fwPage(j,s.fwJournal.page);if(j)await sc.update({journal:j.id,journalEntryPage:pg?.id??null});}
  // pins
  const oldNotes=sc.notes.filter(mflag).map(n=>n.id);if(oldNotes.length)await sc.deleteEmbeddedDocuments("Note",oldNotes);
  const notes=[];for(const n of s.fwNotes??[]){const j=fwFind("JournalEntry",n.entry);if(!j)continue;const pg=fwPage(j,n.page);notes.push(tagged({entryId:j.id,pageId:pg?.id??null,x:n.x,y:n.y,text:n.label,texture:{src:"icons/svg/book.svg"},iconSize:48,fontSize:22,textAnchor:1}));}
  if(notes.length)await sc.createEmbeddedDocuments("Note",notes);
  // ambience
  const oldS=sc.sounds.filter(mflag).map(n=>n.id);if(oldS.length)await sc.deleteEmbeddedDocuments("AmbientSound",oldS);
  if(s.fwSound)await sc.createEmbeddedDocuments("AmbientSound",[tagged({path:s.fwSound.path,x:s.fwSound.x,y:s.fwSound.y,radius:s.fwSound.radius,volume:s.fwSound.volume,repeat:true,easing:true,walls:false})]);
  // hidden encounter tokens: only placed while the GM has not placed/kept their own managed set
  const managedTokens=sc.tokens.filter(mflag);
  const posHash=ts=>fnv(JSON.stringify(ts.map(t=>[t.getFlag(MODULE_ID,"group")??"",t.x,t.y,t.actorId]).sort()));
  const untouched=managedTokens.length&&sc.getFlag(MODULE_ID,"tokenPosHash")===posHash(managedTokens);
  const legacy=managedTokens.length&&!sc.getFlag(MODULE_ID,"tokenPosHash")&&sc.getFlag(MODULE_ID,"extrasHash")&&sc.getFlag(MODULE_ID,"extrasHash")!==hash&&!managedTokens.some(t=>t.getFlag(MODULE_ID,"group")==="Patrons");
  if(!managedTokens.length||force||untouched||legacy){
    if(managedTokens.length)await sc.deleteEmbeddedDocuments("Token",managedTokens.map(t=>t.id));
    const toks=[];for(const t of s.fwTokens??[]){const a=fwFind("Actor",t.actor);if(!a)continue;const td=await a.getTokenDocument({x:t.x,y:t.y,hidden:!!t.hidden,...(t.img?{texture:{...a.prototypeToken.texture.toObject?.()??{},src:t.img}}:{})});const o=td.toObject();o.flags=foundry.utils.mergeObject(o.flags??{},{[MODULE_ID]:{managed:true,group:t.group}},{inplace:false});toks.push(o);}
    for(let i=0;i<toks.length;i+=25)await sc.createEmbeddedDocuments("Token",toks.slice(i,i+25));
    await sc.setFlag(MODULE_ID,"tokenPosHash",posHash(sc.tokens.filter(mflag)));
  }
  await sc.setFlag(MODULE_ID,"extrasHash",hash);
}
async function importPlaylists(){
  let data;try{data=await loadJSON("playlists.json");}catch(e){return;}
  for(const p of data){
    let pl=game.playlists.find(x=>x.getFlag(MODULE_ID,"sourceId")===p.sourceId);
    const sounds=p.sounds.map(s=>({name:s.name,path:s.path,repeat:s.repeat,volume:s.volume,flags:{[MODULE_ID]:{managed:true}}}));
    if(!pl){await Playlist.create({name:p.name,mode:p.mode??0,sounds,flags:{[MODULE_ID]:{sourceId:p.sourceId,managed:true}}});continue;}
    const ids=pl.sounds.filter(x=>x.getFlag(MODULE_ID,"managed")).map(x=>x.id);if(ids.length)await pl.deleteEmbeddedDocuments("PlaylistSound",ids);
    await pl.createEmbeddedDocuments("PlaylistSound",sounds);
  }
}
async function ensureLevelBackground(scene,src,color){
  if(!scene||!src)return;
  const levels=scene.levels;
  if(!levels){if(scene.background?.src!==src)await scene.update({"background.src":src});return;}
  const initId=scene._source?.initialLevel??null;
  let lvl=(initId&&levels.get(initId))||levels.contents?.[0]||null;
  if(!lvl){
    const [made]=await scene.createEmbeddedDocuments("Level",[{name:"Ground",background:{src}}]);
    if(made)await scene.update({initialLevel:made.id});
    return;
  }
  if(lvl.background?.src!==src)await lvl.update({"background.src":src});
}
async function importMaps({force=false}={}){if(!game.user.isGM)throw new Error("GM only");await importScenes({force});ui.notifications.info("Franchise Wars battlemaps imported/updated.");}

async function enrich(content){const editor=foundry?.applications?.ux?.TextEditor?.implementation??globalThis.TextEditor;try{return editor?.enrichHTML?await editor.enrichHTML(content,{async:true}):content;}catch(e){console.warn("Franchise Wars | enrich fallback",e);return content;}}
function shell({title,missionId,checkpointId,body,grade="Contract"}){const source=[missionId,checkpointId].filter(Boolean).join(" / ");return `<section class="fw-chat-card"><header class="fw-card-header"><span class="fw-grade">${grade}</span><strong>${title}</strong>${source?`<small>${source}</small>`:""}</header><div class="fw-card-body">${body}</div></section>`;}
async function requestCheck({missionId,checkpointId,skill,ability,dc,flavor="Corporate requests verification.",audience="all",grade="Contract"}={}){if(!game.user.isGM)throw new Error("GM only");const terms=[];if(skill)terms.push(`skill=${skill}`);else if(ability)terms.push(`ability=${ability}`);else throw new Error("skill or ability required");if(Number.isFinite(Number(dc)))terms.push(`dc=${Number(dc)}`);const body=await enrich(`<p>${flavor}</p><p class="fw-roll-request">[[/check ${terms.join(" ")}]]</p>`);return ChatMessage.create({speaker:ChatMessage.getSpeaker({user:game.user}),content:shell({title:"ACTION REQUIRED",missionId,checkpointId,body,grade}),whisper:audience==="gm"?ChatMessage.getWhisperRecipients("GM").map(u=>u.id):[]});}
async function requestSave({missionId,checkpointId,ability,dc,flavor="Compliance requires a saving throw.",audience="all",grade="Contract"}={}){if(!game.user.isGM)throw new Error("GM only");if(!ability)throw new Error("ability required");const terms=[ability];if(Number.isFinite(Number(dc)))terms.push(`dc=${Number(dc)}`);const body=await enrich(`<p>${flavor}</p><p class="fw-roll-request">[[/save ${terms.join(" ")}]]</p>`);return ChatMessage.create({speaker:ChatMessage.getSpeaker({user:game.user}),content:shell({title:"COMPLIANCE CHECK",missionId,checkpointId,body,grade}),whisper:audience==="gm"?ChatMessage.getWhisperRecipients("GM").map(u=>u.id):[]});}
async function postContractBrief({missionId,title="CONTRACT BRIEF",html="",grade="Contract"}={}){if(!game.user.isGM)throw new Error("GM only");return ChatMessage.create({speaker:ChatMessage.getSpeaker({user:game.user}),content:shell({title,missionId,body:html,grade})});}
async function awardReceipt(id,data={}){const s=await getState(),receipts=foundry.utils.deepClone(s.receipts??{});if(receipts[id]?.status==="acquired")return s;receipts[id]={status:"acquired",acquiredAt:Date.now(),...data};const r=await patchState({receipts});await fwLog(`Receipt acquired: ${data.name??id} (${id})${data.holder?`, given to ${data.holder}`:""}`,"receipt");if(/^S\d\d$/.test(id)&&(await getState()).missions?.[id]?.status!=="done")await fwSetMission(id,"done");return r;}
async function addLeverage(id,amount=1){const s=await getState(),leverage=foundry.utils.deepClone(s.leverage??{});leverage[id]=Number(leverage[id]??0)+Number(amount??0);const r=await patchState({leverage});const n=(await fwCorps())[id]??id;await fwLog(`Leverage ${Number(amount)>0?"+":""}${amount} vs ${n} (now ${leverage[id]})`,"leverage");return r;}
async function addCommonsAlly(name,data={}){const s=await getState(),a=[...(s.commonsTally??[])];if(a.some(x=>(typeof x==="string"?x:x.name)===name))return s;a.push({name,at:Date.now(),...data});const r=await patchState({commonsTally:a});await fwLog(`Commons Tally ally added: ${name}${data.note?` (${data.note})`:""}`,"commons");return r;}
async function setBoardSeat(id,state){const s=await getState(),board=foundry.utils.deepClone(s.board??{});board[id]=state;const r=await patchState({board});const n=(await fwCorps())[id]??id;await fwLog(`Board seat ${n}: ${SEAT_LABEL[state?.state??state]??state?.state??state}${state?.proxyDemanded?" (proxy demanded)":""}`,"board");return r;}
async function setMissionState(id,state){const s=await getState(),missions=foundry.utils.deepClone(s.missions??{});missions[id]=state;return patchState({missions});}
async function voidClause(code,method="receipt"){const s=await getState(),clauses=foundry.utils.deepClone(s.clauses??{});if(clauses[code]?.status==="voided")return s;clauses[code]={status:"voided",method,voidedAt:Date.now()};const r=await patchState({clauses});await fwLog(`Clause ${code} voided (${method})`,"contract");return r;}
function openCommandCentre(){const j=game.journal.find(x=>x.getFlag(MODULE_ID,"sourceId")==="fw.command");return j?.sheet?.render(true);}

function openSessionZero(){const j=game.journal.find(x=>x.getFlag(MODULE_ID,"sourceId")==="fw.session0.gm");return j?.sheet?.render(true);}

/* ---------------------------------------------------------------- v0.5 mission-guide enrichers
   @FWLink[Type|sourceId(|pageName)]{label}  -> live link to the managed document (found by flag)
   @FWCheck[S01|skill=inv dc=20|flavor]{label} / @FWSave[S01|ability=wis dc=13|flavor]{label}
   @FWChat[narrate|cover]{label}  -> sends the surrounding read-aloud box / contract slip to chat
   @FWShow[handoutSourceId|pageName]{label} -> posts one handout page to chat (no journal permissions change)
   @FWReceipt[S01|itemSourceId]{label} -> records the Receipt and announces it */
const FW_COLLECTIONS={Actor:()=>game.actors,Item:()=>game.items,Scene:()=>game.scenes,JournalEntry:()=>game.journal};
const fwUnesc=t=>{const d=document.createElement("textarea");d.innerHTML=String(t??"");return d.value.trim();};
function fwPage(entry,name){const n=fwUnesc(name);return entry?.pages.find(p=>fwUnesc(p.name)===n)??null;}
function fwFind(type,sourceId){return FW_COLLECTIONS[type]?.()?.find(d=>d.getFlag(MODULE_ID,"sourceId")===sourceId)??null;}
function fwMissing(label,why){const s=document.createElement("span");s.classList.add("fw-missing-link");s.dataset.tooltip=why;s.textContent=label;return s;}
function fwButton(action,label,data){const a=document.createElement("a");a.classList.add("fw-action",`fw-action-${action}`);a.dataset.fwAction=action;for(const[k,v]of Object.entries(data))a.dataset[k]=v;const icon={check:"fa-dice-d20",save:"fa-shield-halved",chat:"fa-comment",show:"fa-eye",receipt:"fa-file-signature"}[action]??"fa-bolt";a.innerHTML=`<i class="fa-solid ${icon}"></i> ${label}`;return a;}
Hooks.once("init",()=>{
  const enrichers=CONFIG.TextEditor.enrichers;
  enrichers.push({pattern:/@FWLink\[(Actor|Item|Scene|JournalEntry)\|([^\]|]+)(?:\|([^\]]+))?\]\{([^}]+)\}/g,enricher:async(m)=>{
    const [,type,src,page,label]=m;
    if(type==="Scene"){const a=fwButton("scene",label,{src});a.classList.add("fw-map-link");a.querySelector("i").className="fa-solid fa-map";a.title="Click: view this battlemap · Shift-click: activate it for everyone";return a;}
    const doc=await fwFindAny(type,src);
    if(!doc)return fwMissing(label,`Not imported yet: ${src}`);
    let target=doc;
    if(page&&type==="JournalEntry"){target=fwPage(doc,page)??doc;}
    try{return await target.toAnchor({name:label});}catch(e){const a=document.createElement("a");a.classList.add("content-link");a.dataset.uuid=target.uuid;a.textContent=label;return a;}
  }});
  enrichers.push({pattern:/@FW(Check|Save)\[([^\]|]+)\|([^\]|]+)\|?([^\]]*)\]\{([^}]+)\}/g,enricher:async(m)=>{
    const [,kind,code,spec,flavor,label]=m;return fwButton(kind.toLowerCase(),label,{code,spec,flavor:flavor??""});
  }});
  enrichers.push({pattern:/@FWChat\[([^\]]*)\]\{([^}]+)\}/g,enricher:async(m)=>fwButton("chat",m[2],{mode:m[1]})});
  enrichers.push({pattern:/@FWShow\[([^\]|]+)\|([^\]]+)\]\{([^}]+)\}/g,enricher:async(m)=>fwButton("show",m[3],{src:m[1],page:m[2]})});
  enrichers.push({pattern:/@FWReceipt\[([^\]|]+)\|([^\]]+)\]\{([^}]+)\}/g,enricher:async(m)=>fwButton("receipt",m[3],{code:m[1],item:m[2]})});
});
function fwParseSpec(spec){const o={};for(const t of String(spec).trim().split(/\s+/)){const[k,v]=t.split("=");o[k]=v;}return o;}
async function fwShowPage(src,pageName){
  // Handouts go to chat as a card: players see only this page, and no journal permissions change.
  const entry=fwFind("JournalEntry",src);if(!entry)return ui.notifications.warn(`Handout journal not found: ${src}`);
  const page=fwPage(entry,pageName);if(!page)return ui.notifications.warn(`Handout page not found: ${pageName}`);
  return fwPostHandout(page);
}
async function fwPostHandout(page){
  const TE=foundry.applications?.ux?.TextEditor?.implementation??TextEditor;
  const html=await TE.enrichHTML(page.text?.content??"",{secrets:false,relativeTo:page});
  const div=document.createElement("div");div.innerHTML=html;
  div.querySelectorAll("a.fw-action,.fw-handout-tools,section.secret,.fw-gm-only").forEach(n=>n.remove());
  await ChatMessage.create({speaker:{alias:"Handout"},content:`<div class="fw-chat-handout">${div.innerHTML}</div>`,flags:{[MODULE_ID]:{handout:page.uuid}}});
  ui.notifications.info(`Sent to chat: ${page.name}`);
  await fwLog(`Handout sent to chat: ${page.parent?.name??""} · ${page.name}`,"handout");
}
document.addEventListener("click",async ev=>{
  const a=ev.target.closest?.("a.fw-action[data-fw-action]");if(!a)return;
  ev.preventDefault();ev.stopPropagation();
  if(!game.user.isGM)return ui.notifications.warn("Only the GM can use mission-guide actions.");
  const d=a.dataset;
  try{
    if(d.fwAction==="check"){const s=fwParseSpec(d.spec);await requestCheck({missionId:d.code,skill:s.skill,ability:s.ability,dc:s.dc,flavor:d.flavor||"Corporate requests verification."});}
    else if(d.fwAction==="save"){const s=fwParseSpec(d.spec);await requestSave({missionId:d.code,ability:s.ability,dc:s.dc,flavor:d.flavor||"Compliance requires a saving throw."});}
    else if(d.fwAction==="chat"){
      const root=a.closest(".fw-readaloud")??a.closest(".journal-entry-page,.journal-page-content,article")?.querySelector(".fw-contract-slip")??null;
      if(!root)return ui.notifications.warn("Nothing to send.");
      const clone=root.cloneNode(true);clone.querySelectorAll("a.fw-action,header").forEach(n=>n.remove());
      const isSlip=!root.classList.contains("fw-readaloud");
      await ChatMessage.create({speaker:{alias:isSlip?"QuestRabbit Job Board":"Narrator"},content:isSlip?`<div class="fw-chat-handout"><div class="fw-contract-slip">${clone.innerHTML}</div></div>`:`<div class="fw-chat-narration">${clone.innerHTML}</div>`});
    }
    else if(d.fwAction==="show")await fwShowPage(d.src,d.page);
    else if(d.fwAction==="scene")await fwOpenScene(d.src,{activate:ev.shiftKey});
    else if(d.fwAction==="receipt"){
      const item=fwFind("Item",d.item);await awardReceipt(d.code,{item:d.item,name:item?.name});
      await postContractBrief({missionId:d.code,title:"RECEIPT ACQUIRED",html:`<p>The party has secured <strong>${item?item.link:d.item}</strong>.</p><p><em>Every Receipt can void a clause of the Final Contract.</em></p>`});
    }
  }catch(err){console.error("Franchise Wars | action",err);ui.notifications.error(err.message);}
},true);

/* ---------------------------------------------------------------- v1.0 additions
   @FWLev[CO-01|1|source]{label} -> adds Leverage against a corporation and announces it
   Roll tables, and three GM windows: Campaign Tracker, Clause Debate, Board Vote. */
Hooks.once("init",()=>{
  CONFIG.TextEditor.enrichers.push({pattern:/@FWLev\[([^\]|]+)\|(-?\d+)\|?([^\]]*)\]\{([^}]+)\}/g,enricher:async(m)=>fwButton("lev",m[4],{corp:m[1],amount:m[2],source:m[3]??""})});
  game.franchiseWars=Object.assign(game.franchiseWars??{}, {openDashboard:t=>fwOpenDashboard(t),openTracker:()=>fwOpenDashboard("overview"),openClauseDebate:()=>fwOpenDashboard("contract"),openBoardVote:()=>fwOpenDashboard("board")});
});
let FW_CORPS=null,FW_CLAUSES=null;
async function fwCorps(){return FW_CORPS??=await loadJSON("corporations.json").catch(()=>({}));}
async function fwClauses(){return FW_CLAUSES??=await loadJSON("final-contract.json").catch(()=>[]);}
document.addEventListener("click",async ev=>{
  const a=ev.target.closest?.("a.fw-action[data-fw-action='lev']");if(!a)return;
  ev.preventDefault();ev.stopPropagation();
  if(!game.user.isGM)return ui.notifications.warn("Only the GM can record Leverage.");
  const d=a.dataset,corps=await fwCorps(),n=Number(d.amount||1);
  const s=await addLeverage(d.corp,n);
  await postContractBrief({missionId:d.source||d.corp,title:"LEVERAGE RECORDED",html:`<p><strong>${n>0?"+":""}${n} Leverage</strong> against <strong>${corps[d.corp]??d.corp}</strong>.</p><p>Total now: <strong>${s.leverage[d.corp]}</strong>.</p>`});
},true);

async function importRollTables(){
  let data;try{data=await loadJSON("rolltables.json");}catch(e){return;}
  let folder=game.folders.find(f=>f.type==="RollTable"&&f.getFlag(MODULE_ID,"sourceId")==="fw.folder.tables");
  if(!folder)folder=await Folder.create({name:"The Franchise Wars — Tables",type:"RollTable",color:"#7a1f2b",flags:{[MODULE_ID]:{sourceId:"fw.folder.tables"}}});
  for(const t of data){
    const results=t.results.map((r,i)=>({type:CONST.TABLE_RESULT_TYPES?.TEXT??"text",description:r,name:r.slice(0,60),range:[i+1,i+1],weight:1,img:"icons/svg/d20-black.svg"}));
    const doc={name:t.name,formula:`1d${results.length}`,replacement:true,displayRoll:true,folder:folder.id,img:"icons/svg/d20-grey.svg",results,flags:{[MODULE_ID]:{sourceId:t.sourceId,managed:true,hash:fnv(JSON.stringify(t))}}};
    const old=game.tables.find(x=>x.getFlag(MODULE_ID,"sourceId")===t.sourceId);
    if(old){if(old.getFlag(MODULE_ID,"hash")===doc.flags[MODULE_ID].hash)continue;await old.delete();}
    try{await RollTable.create(doc);}catch(err){delete doc.img;await RollTable.create(doc);}
  }
}

/* ----- small ApplicationV2 base that renders a plain HTML string */
const FWAppBase=foundry.applications.api.ApplicationV2;
class FWWindow extends FWAppBase{
  static DEFAULT_OPTIONS={classes:["franchise-wars","fw-window"],window:{resizable:true},position:{width:560,height:"auto"}};
  async _renderHTML(){return await this.html();}
  _replaceHTML(result,content){content.innerHTML=result;content.querySelectorAll("[data-act]").forEach(el=>el.addEventListener(el.tagName==="SELECT"||el.tagName==="INPUT"?"change":"click",ev=>{ev.preventDefault();this.act(el.dataset.act,el,ev);}));}
  async act(){}
}
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ----------------------------------------------------------------- v1.2 GM Dashboard
   One tabbed, scrollable panel for every campaign tracker. Auto-tracks Receipts given to characters,
   Leverage and Receipt buttons, handouts sent to chat, milestone stars, and keeps an activity log. */
let FW_DASH=null;
async function fwDash(){return FW_DASH??=await loadJSON("dashboard.json").catch(()=>({missions:[],corps:[],rules:{},rabbit:[],clauses:[]}));}
async function fwLog(text,kind="note"){
  if(!game.user.isGM)return;const s=await getState();const log=[{t:Date.now(),kind,text},...(s.log??[])].slice(0,300);
  await game.settings.set(MODULE_ID,STATE_KEY,{...s,log});Hooks.callAll("franchiseWarsStateChanged",await getState(),{log:true});
}
const fwShort=t=>String(t??"").split(/ ,|, | \(| :|\. | who | again/)[0].trim();
const SEAT_LABEL={active:"with Vend",leaning:"wavering",allied:"flipped",removed:"removed"};
const SEAT_HELP={active:"Votes with Vend (his proxy holds).",leaning:"Wavering: proxy demanded or persuadable.",allied:"Flipped: votes against Vend.",removed:"Removed: proxy voided."};
const DEBATE_SKILLS=[["per","Persuasion"],["ins","Insight"],["his","History"],["rel","Religion"],["inv","Investigation"]];
const MISSION_STATUS={"":"not started",active:"in progress",done:"complete"};
const CUT_BY_STARS={1:30,2:25,3:20,4:15,5:10};  // optional "falling commission" schedule (house rule, not in the book)
const TABS=[["overview","Overview","fa-gauge"],["missions","Missions","fa-list-check"],["leverage","Leverage","fa-hand-holding-dollar"],["board","Board Vote","fa-check-to-slot"],["contract","Final Contract","fa-scale-balanced"],["receipts","Receipts","fa-file-signature"],["commons","Commons Tally","fa-people-group"],["log","Activity Log","fa-clock-rotate-left"]];

async function fwSetMission(code,status){
  const s=await getState(),missions=foundry.utils.deepClone(s.missions??{}),was=missions[code]?.status??"";
  if(was===status)return;missions[code]={status,at:Date.now()};
  const patch={missions};const D=await fwDash();const m=D.missions.find(x=>x.code===code);
  if(status==="done"&&was!=="done"&&m?.star&&!(s.starsAwarded??[]).includes(code)){patch.rabbitRating=Math.min(5,Number(s.rabbitRating??1)+1);patch.starsAwarded=[...(s.starsAwarded??[]),code];}
  if(status==="done"&&m)patch.currentAct=Math.max(Number(s.currentAct??1),m.act);
  if(patch.rabbitRating&&s.cutRule){const c=CUT_BY_STARS[patch.rabbitRating];if(c<Number(s.questRabbitCut??30))patch.questRabbitCut=c;}
  await patchState(patch);
  await fwLog(`${code} ${m?.title??""}: ${MISSION_STATUS[status]}${patch.rabbitRating?` · Rabbit Rating now ${"★".repeat(patch.rabbitRating)} (milestone)`:""}${patch.questRabbitCut!=null?` · QuestRabbit cut now ${patch.questRabbitCut}%`:""}`,"mission");
}

class FWDashboard extends FWWindow{
  static DEFAULT_OPTIONS={id:"fw-dashboard",classes:["fw-dash-window"],window:{title:"The Franchise Wars — GM Dashboard",icon:"fa-solid fa-briefcase",resizable:true},position:{width:960,height:780}};
  tab="overview";clause=null;actFilter=0;
  constructor(opts={}){super(opts);if(opts.tab)this.tab=opts.tab;this._hook=Hooks.on("franchiseWarsStateChanged",()=>{if(this.rendered)this.render();});}
  async close(o){Hooks.off("franchiseWarsStateChanged",this._hook);FW_DASH_APP=null;return super.close(o);}
  _replaceHTML(result,content){const y=content.querySelector(".fw-dash-body")?.scrollTop??0;super._replaceHTML(result,content);const b=content.querySelector(".fw-dash-body");if(b&&this._keepScroll!==false)b.scrollTop=y;this._keepScroll=true;}
  async html(){
    const s=await getState(),D=await fwDash();this._s=s;this._D=D;
    const done=D.missions.filter(m=>s.missions?.[m.code]?.status==="done").length;
    const held=D.clauses.filter(c=>s.receipts?.[c.mission]?.status==="acquired").length;
    const voided=D.clauses.filter(c=>s.clauses?.[c.code]?.status==="voided").length;
    const turned=D.corps.filter(c=>c.board&&["allied","removed"].includes(this.seat(c.id))).length;
    const tally=(s.commonsTally??[]).length;
    const stat=(label,val,sub)=>`<div class="fw-kpi"><span>${label}</span><b>${val}</b>${sub?`<small>${sub}</small>`:""}</div>`;
    const head=`<header class="fw-dash-head">
      ${stat("Act",["","I","II","III","IV","V"][s.currentAct]??s.currentAct,"current act")}
      ${stat(esc(s.mandateName||"Rabbit Rating"),`<span class="fw-stars">${"★".repeat(s.rabbitRating)}<i>${"★".repeat(5-s.rabbitRating)}</i></span>`,D.rabbit[s.rabbitRating-1]?.unlocks?.split(";")[0]??"")}
      ${stat("QuestRabbit cut",`${s.questRabbitCut??30}%`,s.cutRule?"falling commission on":"standard rate")}
      ${stat("Missions",`${done}/24`,"complete")}
      ${stat("Receipts",`${held}/${D.clauses.length}`,"clause Receipts held")}
      ${stat("Clauses void",`${voided}/${D.clauses.length}`,voided>=6?"Vend stands":"Vend stands at 6")}
      ${stat("Board",`${turned}/6`,"seats turned")}
      ${stat("Commons",tally,`${Math.floor(tally/5)} director(s) disadvantaged`)}
      <div class="fw-dash-actions"><button data-act="post" title="Post a campaign status card to chat"><i class="fa-solid fa-comment"></i></button><button data-act="manager" title="Content Manager"><i class="fa-solid fa-gear"></i></button></div>
    </header>
    <nav class="fw-dash-tabs">${TABS.map(([k,l,i])=>`<a data-act="tab" data-tab="${k}" class="${this.tab===k?"active":""}"><i class="fa-solid ${i}"></i> ${l}</a>`).join("")}</nav>`;
    const body=await this[`tab_${this.tab}`]?.(s,D)??"";
    return `<div class="fw-dash">${head}<section class="fw-dash-body">${body}</section></div>`;
  }
  seat(id){const b=this._s.board?.[id];return (b?.state??b)||"active";}
  rules(title,...texts){return `<details class="fw-rules" ${this.tab==="overview"?"":"open"}><summary><i class="fa-solid fa-book-open"></i> ${title}</summary>${texts.filter(Boolean).map(t=>`<p>${esc(t)}</p>`).join("")}</details>`;}

  async tab_overview(s,D){
    const next=D.missions.find(m=>s.missions?.[m.code]?.status!=="done");
    const rows=D.rabbit.map(r=>`<tr class="${r.stars===s.rabbitRating?"fw-current":""}"><td class="fw-stars">${"★".repeat(r.stars)}</td><td>${esc(r.unlocks)}</td><td class="fw-dm">${esc(r.hidden)}</td></tr>`).join("");
    return `<div class="fw-grid2">
      <div class="fw-panel"><h3>${esc(s.mandateName||"Rabbit Rating")}</h3>
        <div class="fw-row"><button data-act="star" data-n="-1">−</button><span class="fw-stars fw-big">${"★".repeat(s.rabbitRating)}<i>${"★".repeat(5-s.rabbitRating)}</i></span><button data-act="star" data-n="1">+</button>
        <label class="fw-inline"><input type="checkbox" data-act="mandate" ${s.mandateName==="Mandate"?"checked":""}> Party has left QuestRabbit (call it the Mandate)</label></div>
        <table class="fw-table"><thead><tr><th>Stars</th><th>Unlocks</th><th>Hidden meaning (GM)</th></tr></thead><tbody>${rows}</tbody></table>
        ${this.rules("How the rating works",D.rules.rabbit,D.rules.rabbitEarn,D.rules.mandate)}
        <p class="fw-note">Stars are added automatically when S02, S05, S10, S15 or S20 is marked complete. The rating never goes above five stars.</p>
        <h3>QuestRabbit’s cut</h3>
        <div class="fw-row"><button data-act="cut" data-n="-5">−5%</button><b class="fw-big-num">${s.questRabbitCut??30}%</b><button data-act="cut" data-n="5">+5%</button>
          <span class="fw-note">taken from every contract fee (party keeps ${100-(s.questRabbitCut??30)}%)</span></div>
        <label class="fw-inline fw-block"><input type="checkbox" data-act="cutrule" ${s.cutRule?"checked":""}> <b>Optional rule: falling commission.</b> As the party’s rating rises, QuestRabbit takes less.</label>
        <table class="fw-table fw-cut"><thead><tr><th>Rating</th>${[1,2,3,4,5].map(n=>`<th class="${n===s.rabbitRating?"fw-current":""}">${"★".repeat(n)}</th>`).join("")}</tr></thead><tbody><tr><td>Suggested cut</td>${[1,2,3,4,5].map(n=>`<td class="c ${n===s.rabbitRating?"fw-current":""}">${CUT_BY_STARS[n]}%</td>`).join("")}</tr></tbody></table>
        <div class="fw-row"><button data-act="cutsugg" ${s.cutRule?"":"disabled"}>Apply suggested cut for ${"★".repeat(s.rabbitRating)} (${CUT_BY_STARS[s.rabbitRating]}%)</button></div>
        <p class="fw-note">House rule, not in the book: the standard rate is 30% throughout. With falling commission on, the cut drops to the suggested rate automatically when a milestone star is earned; you can still set any rate by hand.</p>
      </div>
      <div class="fw-panel"><h3>Where the party is</h3>
        <div class="fw-row">Current act ${[1,2,3,4,5].map(a=>`<button data-act="setact" data-a="${a}" class="${s.currentAct===a?"fw-on":""}">${["","I","II","III","IV","V"][a]}</button>`).join("")}</div>
        ${next?`<div class="fw-next"><small>Next mission</small><b>${next.code} — ${esc(next.title)}</b><span>${esc(next.grade)} · Level ${esc(next.level)} · ${esc(next.client)}</span><p>${esc(next.synopsis)}</p><div class="fw-row"><button data-act="openj" data-j="${next.journal}"><i class="fa-solid fa-book"></i> Open guide</button><button data-act="mstat" data-code="${next.code}" data-v="active">Mark in progress</button><button data-act="mstat" data-code="${next.code}" data-v="done">Mark complete</button></div></div>`:`<p>All 24 missions complete.</p>`}
        <h3>Recent activity</h3><ul class="fw-log fw-log-short">${(s.log??[]).slice(0,8).map(l=>`<li><time>${new Date(l.t).toLocaleString()}</time> ${esc(l.text)}</li>`).join("")||"<li class='fw-note'>Nothing recorded yet. Receipts, Leverage, handouts and mission progress are logged automatically.</li>"}</ul>
      </div></div>`;
  }
  async tab_missions(s,D){
    const acts=[1,2,3,4,5].filter(a=>!this.actFilter||a===this.actFilter);
    const filt=`<div class="fw-row">Show: <button data-act="actf" data-a="0" class="${!this.actFilter?"fw-on":""}">All</button>${[1,2,3,4,5].map(a=>`<button data-act="actf" data-a="${a}" class="${this.actFilter===a?"fw-on":""}">Act ${["","I","II","III","IV","V"][a]}</button>`).join("")}</div>`;
    return filt+acts.map(a=>`<h3>Act ${["","I","II","III","IV","V"][a]}</h3>`+D.missions.filter(m=>m.act===a).map(m=>{
      const st=s.missions?.[m.code]?.status??"",r=m.receipt?s.receipts?.[m.code]?.status==="acquired":null;
      return `<div class="fw-mission fw-ms-${st||"none"}"><div class="fw-mhead"><b>${m.code}</b><span class="fw-mtitle">${esc(m.title)}</span>${m.star?`<span class="fw-badge" title="Completing this mission adds a star">★ milestone</span>`:""}
        <span class="fw-meta">${esc(m.grade)} · Level ${esc(m.level)} · ${esc(m.client)}</span>
        <select data-act="mstat" data-code="${m.code}">${Object.entries(MISSION_STATUS).map(([k,l])=>`<option value="${k}" ${st===k?"selected":""}>${l}</option>`).join("")}</select>
        <button data-act="openj" data-j="${m.journal}" title="Open the mission guide"><i class="fa-solid fa-book"></i></button></div>
        <details><summary>Synopsis${m.receiptName?` · Receipt: <i>${esc(m.receiptName)}</i> ${r?"<span class='fw-ok'>✔ held</span>":"<span class='fw-muted'>not yet</span>"}`:""}</summary><p>${esc(m.synopsis)}</p></details></div>`;}).join("")).join("");
  }
  async tab_leverage(s,D){
    return this.rules("How Leverage works",D.rules.leverage,D.rules.leverageSpend,D.rules.leverageLose)+`<div class="fw-cards">`+D.corps.map(c=>{const lev=s.leverage?.[c.id]??0;return `<div class="fw-corp">
      <div class="fw-corp-head"><b>${esc(c.name)}</b><small>${c.id}${c.board?" · Board umbrella":""}</small><button data-act="openj" data-j="${c.journal}" title="Open dossier"><i class="fa-solid fa-book"></i></button></div>
      ${c.slogan?`<i class="fw-slogan">“${esc(c.slogan)}”</i>`:""}<p>${esc(c.goal)}</p>
      <dl><dt>Public face</dt><dd>${esc(c.face)}</dd><dt>Controlled by</dt><dd>${esc(c.controlledBy)}</dd></dl>
      <div class="fw-row fw-lev"><span>Leverage</span><button data-act="lev" data-id="${c.id}" data-n="-1">−</button><b>${lev}</b><button data-act="lev" data-id="${c.id}" data-n="1">+</button>
      ${lev>0?`<span class="fw-spend">Spend:</span>${["Advantage","Access","Cover"].map(k=>`<button data-act="spend" data-id="${c.id}" data-k="${k}" title="Spend 1 Leverage for ${k}">${k}</button>`).join("")}`:""}</div></div>`;}).join("")+`</div>`;
  }
  async tab_board(s,D){
    const seats=D.corps.filter(c=>c.board);const turned=seats.filter(c=>["allied","removed"].includes(this.seat(c.id))).length,tally=(s.commonsTally??[]).length;
    return this.rules("How the Board Vote works (S23)",D.rules.board)+`<table class="fw-table"><thead><tr><th>Umbrella</th><th>Director</th><th>Leverage</th><th>Seat</th><th></th></tr></thead><tbody>${seats.map(c=>{const lev=s.leverage?.[c.id]??0,st=this.seat(c.id);return `<tr class="fw-seat-${st}"><td><b>${esc(c.name)}</b></td><td>${esc(fwShort(c.controlledBy))}</td><td class="c">${lev}</td>
      <td><select data-act="seat" data-id="${c.id}" title="${esc(SEAT_HELP[st])}">${Object.entries(SEAT_LABEL).map(([k,l])=>`<option value="${k}" ${st===k?"selected":""}>${l}</option>`).join("")}</select></td>
      <td>${lev>=2&&!["allied","removed"].includes(st)?`<button data-act="proxy" data-id="${c.id}">Demand proxy (−2)</button>`:""}</td></tr>`;}).join("")}</tbody></table>
      <p class="fw-result">Seats turned against Vend: <b>${turned}</b> of 6 needed → <b class="${turned>=6?"fw-ok":"fw-bad"}">${turned>=6?"MOTION CARRIES":"VEND HOLDS THE BOARD"}</b></p>
      <p class="fw-note">Commons Tally: ${tally} allies observing, so ${Math.floor(tally/5)} wavering director(s) have disadvantage to refuse the party.</p>
      <div class="fw-row"><button data-act="vote"><i class="fa-solid fa-gavel"></i> Announce the vote in chat</button></div>`;
  }
  async tab_contract(s,D){
    const open=D.clauses.filter(c=>s.clauses?.[c.code]?.status!=="voided"),voided=D.clauses.length-open.length,tally=(s.commonsTally??[]).length;
    const sel=open.find(c=>c.code===this.clause)??open[0];if(sel)this.clause=sel.code;
    const list=`<table class="fw-table"><thead><tr><th>Clause</th><th>Issue</th><th>Receipt that voids it</th><th>From</th><th>Status</th></tr></thead><tbody>${D.clauses.map(c=>{const v=s.clauses?.[c.code]?.status==="voided",h=s.receipts?.[c.mission]?.status==="acquired";
      return `<tr class="${v?"fw-voided":""} ${sel?.code===c.code?"fw-current":""}"><td><b>${esc(c.code)}</b></td><td>${esc(c.title)}</td><td>${esc(c.receipt)} ${h?"<span class='fw-ok'>✔</span>":""}</td><td>${c.mission}</td>
      <td>${v?`VOID <a data-act="unvoid" data-code="${esc(c.code)}" title="Restore this clause">↺</a>`:`<a data-act="pickc" data-code="${esc(c.code)}">debate</a>`}</td></tr>`;}).join("")}</tbody></table>`;
    let debate=`<p class="fw-note">Every clause is void. The Final Contract is blank paper.</p>`;
    if(sel){const has=s.receipts?.[sel.mission]?.status==="acquired",dc=has?18:25;
      debate=`<div class="fw-panel fw-debate"><h3>Clause ${esc(sel.code)}: ${esc(sel.title)}</h3>
      <p>Receipt: <b>${esc(sel.receipt)}</b> (${sel.mission}) — ${has?"<span class='fw-ok'>held</span>":"<span class='fw-bad'>not held</span>"} · Argument DC <b>${dc}</b></p>
      <div class="fw-row">Request a check: ${DEBATE_SKILLS.map(([k,n])=>`<button data-act="ask" data-skill="${k}" data-dc="${dc}">${n}</button>`).join("")}</div>
      <div class="fw-row"><button data-act="win"><i class="fa-solid fa-fire"></i> Argument succeeds: burn the clause</button><button data-act="witness" ${tally<3?"disabled":""}><i class="fa-solid fa-people-group"></i> Three Tally witnesses (${tally})</button><button data-act="lose"><i class="fa-solid fa-feather"></i> Fails: Ledger Entry</button></div></div>`;}
    return this.rules("How the Clause Debate works (S24)",D.rules.debate)+`<p class="fw-result">Clauses void: <b>${voided}</b> of ${D.clauses.length}${voided>=6?" · <span class='fw-bad'>Vend stands</span>":""}</p>`+debate+list;
  }
  async tab_receipts(s,D){
    const items=game.items.filter(i=>(i.getFlag(MODULE_ID,"sourceId")??"").startsWith("fw.item.receipt.")).sort((a,b)=>a.getFlag(MODULE_ID,"sourceId").localeCompare(b.getFlag(MODULE_ID,"sourceId")));
    const holders={};for(const a of game.actors)for(const i of a.items){const sid=i.getFlag(MODULE_ID,"sourceId")??i._stats?.compendiumSource??"";const m=/fw\.item\.receipt\.(S\d\d)/.exec(sid)||/receipt\.(S\d\d)/.exec(i.getFlag(MODULE_ID,"receipt")??"");if(m)(holders[m[1]]??=[]).push(a.name);}
    const clauseFor=Object.fromEntries(D.clauses.map(c=>[c.mission,c.code]));
    return this.rules("How Receipts work",D.rules.receipts,D.rules.receiptsPhys)+`<p class="fw-note">Receipts are marked held automatically when a Receipt item is given to any character, or when a guide's Award Receipt button is used.</p>
    <table class="fw-table"><thead><tr><th>Mission</th><th>Receipt</th><th>Voids</th><th>Held by</th><th>Status</th><th></th></tr></thead><tbody>${items.map(i=>{const code=i.getFlag(MODULE_ID,"sourceId").split(".").pop(),h=s.receipts?.[code]?.status==="acquired";
      return `<tr class="${h?"fw-held":""}"><td>${code}</td><td>${i.link?`<a data-act="openitem" data-id="${i.id}">${esc(i.name)}</a>`:esc(i.name)}</td><td>${clauseFor[code]?`Clause ${clauseFor[code]}`:"—"}</td><td>${esc((holders[code]??[]).join(", "))||"—"}</td>
      <td>${h?"<span class='fw-ok'>held</span>":"<span class='fw-muted'>not yet</span>"}</td><td>${h?`<a data-act="unreceipt" data-code="${code}">↺</a>`:`<button data-act="receipt" data-code="${code}" data-item="${i.getFlag(MODULE_ID,"sourceId")}">Award</button>`}</td></tr>`;}).join("")}</tbody></table>`;
  }
  async tab_commons(s,D){
    const a=s.commonsTally??[];
    return this.rules("How the Commons Tally works",D.rules.tally,D.rules.tallyPlay)+`<div class="fw-row"><input type="text" class="fw-ally-name" placeholder="Ally: a person, union, neighbourhood or guild"><input type="text" class="fw-ally-note" placeholder="How they were won (optional)"><button data-act="ally"><i class="fa-solid fa-plus"></i> Add ally</button></div>
    <p class="fw-result">${a.length} allies · S23: ${Math.floor(a.length/5)} wavering director(s) disadvantaged · S24: up to ${Math.floor(a.length/3)} clause(s) voidable by witnesses${a.length>=20?" · <span class='fw-ok'>Held in Common ending available</span>":` · Held in Common ending needs 20`}</p>
    <table class="fw-table"><thead><tr><th>Ally</th><th>How they were won</th><th>Added</th><th></th></tr></thead><tbody>${a.map(x=>{const o=typeof x==="string"?{name:x}:x;return `<tr><td><b>${esc(o.name)}</b></td><td>${esc(o.note??"")}</td><td>${o.at?new Date(o.at).toLocaleDateString():""}</td><td><a data-act="unally" data-name="${esc(o.name)}" title="Remove">×</a></td></tr>`;}).join("")}</tbody></table>`;
  }
  async tab_log(s){
    return `<div class="fw-row"><button data-act="clearlog"><i class="fa-solid fa-eraser"></i> Clear log</button></div><ul class="fw-log">${(s.log??[]).map(l=>`<li class="fw-log-${l.kind}"><time>${new Date(l.t).toLocaleString()}</time> ${esc(l.text)}</li>`).join("")||"<li class='fw-note'>Nothing recorded yet.</li>"}</ul>`;
  }

  async act(a,el,ev){
    const d=el.dataset,s=await getState(),D=await fwDash();this._keepScroll=true;
    try{
    if(a==="tab"){this.tab=d.tab;this._keepScroll=false;return this.render();}
    if(a==="actf"){this.actFilter=Number(d.a);return this.render();}
    if(a==="pickc"){this.clause=d.code;return this.render();}
    if(a==="openj"){const j=fwFind("JournalEntry",d.j)??await fwFindAny("JournalEntry",d.j);return j?j.sheet.render(true):ui.notifications.warn("Journal not found.");}
    if(a==="openitem"){return game.items.get(d.id)?.sheet.render(true);}
    if(a==="manager")return new FWSettingsMenu().render(true);
    if(a==="star"){const v=Math.max(1,Math.min(5,Number(s.rabbitRating)+Number(d.n)));await patchState({rabbitRating:v});return fwLog(`${s.mandateName||"Rabbit Rating"} set to ${"★".repeat(v)}`,"rating");}
    if(a==="mandate"){await patchState({mandateName:el.checked?"Mandate":"Rabbit Rating"});return fwLog(el.checked?"The rating continues as the Mandate":"Rating renamed back to Rabbit Rating","rating");}
    if(a==="cut"){const v=Math.max(0,Math.min(30,Number(s.questRabbitCut??30)+Number(d.n)));await patchState({questRabbitCut:v});return fwLog(`QuestRabbit cut set to ${v}% (party keeps ${100-v}%)`,"rating");}
    if(a==="cutrule"){await patchState({cutRule:el.checked});return fwLog(el.checked?"Optional rule on: falling commission":"Optional rule off: falling commission","rating");}
    if(a==="cutsugg"){const v=CUT_BY_STARS[s.rabbitRating];await patchState({questRabbitCut:v});return fwLog(`QuestRabbit cut set to the suggested ${v}% for ${"★".repeat(s.rabbitRating)}`,"rating");}
    if(a==="setact"){await patchState({currentAct:Number(d.a)});return fwLog(`Current act set to ${["","I","II","III","IV","V"][d.a]}`,"mission");}
    if(a==="mstat")return fwSetMission(d.code,el.tagName==="SELECT"?el.value:d.v);
    if(a==="lev"){await addLeverage(d.id,Number(d.n));return;}
    if(a==="spend"){await addLeverage(d.id,-1);const c=D.corps.find(x=>x.id===d.id);await fwLog(`Spent 1 Leverage vs ${c?.name} for ${d.k}`,"leverage");
      return ChatMessage.create({content:shell({title:"LEVERAGE SPENT",grade:d.k,body:`<p>The party leans on <b>${esc(c?.name)}</b>: <b>${d.k}</b>.</p>`}),whisper:ChatMessage.getWhisperRecipients("GM").map(u=>u.id)});}
    if(a==="seat"){await setBoardSeat(d.id,{state:el.value,changedAt:Date.now()});return;}
    if(a==="proxy"){const c=D.corps.find(x=>x.id===d.id);const ok=await foundry.applications.api.DialogV2.confirm({window:{title:"Demand proxy"},content:`<p>Spend 2 Leverage against ${esc(c?.name)} to demand ${esc(fwShort(c?.controlledBy))}’s proxy? If the director refuses, they must be dealt with in person.</p>`});if(!ok)return;
      await addLeverage(d.id,-2);await setBoardSeat(d.id,{state:"leaning",proxyDemanded:true,changedAt:Date.now()});return;}
    if(a==="vote"){const g={};for(const c of D.corps.filter(x=>x.board))(g[this.seat(c.id)]??=[]).push(c.name);const n=(g.allied?.length??0)+(g.removed?.length??0);
      await postContractBrief({title:n>=6?"MOTION CARRIES":"MOTION FAILS",grade:"Board Vote",html:`<p><em>That Tallis Vend be removed as Chairman of Creation &amp; Company.</em></p>${Object.entries(SEAT_LABEL).map(([k,l])=>`<p><b>${l[0].toUpperCase()+l.slice(1)} (${g[k]?.length??0}):</b> ${g[k]?.join(", ")||"—"}</p>`).join("")}`});return fwLog(`Board vote announced: ${n>=6?"motion carries":"motion fails"} (${n}/6)`,"board");}
    const sel=D.clauses.find(c=>c.code===this.clause);
    if(a==="ask"){await requestCheck({missionId:`S24 · Clause ${sel.code}`,skill:d.skill,dc:Number(d.dc),flavor:`Vend reads Clause ${esc(sel.code)}, ${esc(sel.title)}. Make your case, then roll.`,grade:"Clause Debate"});return;}
    if(a==="win"||a==="witness"){await voidClause(sel.code,a==="witness"?"witnesses":"debate");await postContractBrief({title:"CLAUSE VOIDED",grade:"Final Contract",html:`<p>Clause <b>${esc(sel.code)} — ${esc(sel.title)}</b> burns off the page${a==="witness"?", witnessed by three members of the Commons":""}.</p>`});this.clause=null;return;}
    if(a==="lose"){await ChatMessage.create({speaker:{alias:"Tallis Vend"},content:shell({title:"LEDGER ENTRY",grade:"Final Contract",body:`<p>Clause ${esc(sel.code)} holds. Vend dips the Quill and writes one sentence that becomes true (see his stat block: Ledger Entry).</p>`}),whisper:ChatMessage.getWhisperRecipients("GM").map(u=>u.id)});return fwLog(`Clause ${sel.code} holds: Vend makes a Ledger Entry`,"contract");}
    if(a==="unvoid"){const c=foundry.utils.deepClone(s.clauses??{});delete c[d.code];await game.settings.set(MODULE_ID,STATE_KEY,{...s,clauses:c});Hooks.callAll("franchiseWarsStateChanged",await getState(),{});return fwLog(`Clause ${d.code} restored`,"contract");}
    if(a==="receipt"){const it=fwFind("Item",d.item);await awardReceipt(d.code,{item:d.item,name:it?.name});return;}
    if(a==="unreceipt"){const r=foundry.utils.deepClone(s.receipts??{});delete r[d.code];await game.settings.set(MODULE_ID,STATE_KEY,{...s,receipts:r});Hooks.callAll("franchiseWarsStateChanged",await getState(),{});return fwLog(`Receipt for ${d.code} marked as not held`,"receipt");}
    if(a==="ally"){const root=el.closest(".fw-dash");const n=root.querySelector(".fw-ally-name").value.trim(),note=root.querySelector(".fw-ally-note").value.trim();if(!n)return ui.notifications.warn("Enter the ally's name.");await addCommonsAlly(n,{note,at:Date.now()});return;}
    if(a==="unally"){await game.settings.set(MODULE_ID,STATE_KEY,{...s,commonsTally:(s.commonsTally??[]).filter(x=>(typeof x==="string"?x:x.name)!==d.name)});Hooks.callAll("franchiseWarsStateChanged",await getState(),{});return fwLog(`Removed from the Commons Tally: ${d.name}`,"commons");}
    if(a==="clearlog"){const ok=await foundry.applications.api.DialogV2.confirm({window:{title:"Clear activity log"},content:"<p>Clear the whole activity log? Campaign progress is not affected.</p>"});if(ok){await game.settings.set(MODULE_ID,STATE_KEY,{...s,log:[]});this.render();}return;}
    if(a==="post"){const done=D.missions.filter(m=>s.missions?.[m.code]?.status==="done").length,v=D.clauses.filter(c=>s.clauses?.[c.code]?.status==="voided").length;
      return postContractBrief({title:"CAMPAIGN STATUS",html:`<p>Act <b>${["","I","II","III","IV","V"][s.currentAct]}</b> · ${esc(s.mandateName)} <b>${"★".repeat(s.rabbitRating)}</b> · QuestRabbit cut <b>${s.questRabbitCut??30}%</b></p><p>Missions complete: <b>${done}/24</b></p><p>Final Contract: <b>${v}/${D.clauses.length}</b> clauses void · Commons allies: <b>${(s.commonsTally??[]).length}</b></p>`});}
    }catch(err){console.error("Franchise Wars | dashboard",err);ui.notifications.error(err.message);}
  }
}
let FW_DASH_APP=null;
function fwOpenDashboard(tab){if(FW_DASH_APP?.rendered){if(tab)FW_DASH_APP.tab=tab;FW_DASH_APP.render({force:true});FW_DASH_APP.bringToFront?.();return FW_DASH_APP;}FW_DASH_APP=new FWDashboard({tab});FW_DASH_APP.render(true);return FW_DASH_APP;}

/* One GM Dashboard button in the Journals sidebar (and the scene controls notes layer) */
Hooks.on("renderJournalDirectory",(app,html)=>{
  if(!game.user.isGM)return;const root=html instanceof HTMLElement?html:html[0];if(!root||root.querySelector(".fw-gm-tools"))return;
  const bar=document.createElement("div");bar.className="fw-gm-tools";
  bar.innerHTML=`<button type="button"><i class="fa-solid fa-briefcase"></i> Franchise Wars GM Dashboard</button>`;
  bar.querySelector("button").addEventListener("click",()=>fwOpenDashboard());
  (root.querySelector(".directory-header")??root).prepend(bar);
});

/* Auto-tracking */
Hooks.on("createItem",async(item,opts,userId)=>{
  if(!game.user.isGM||(game.users.activeGM&&game.users.activeGM.id!==game.user.id)||!(item.parent instanceof Actor))return;
  const sid=item.getFlag(MODULE_ID,"sourceId")??"";const m=/^fw\.item\.receipt\.(S\d\d)$/.exec(sid);if(!m)return;
  await awardReceipt(m[1],{item:sid,name:item.name,holder:item.parent.name});
});

async function importMacros(){
  for(const old of ["fw.macro.tracker","fw.macro.debate","fw.macro.vote"]){const m=game.macros.find(x=>x.getFlag(MODULE_ID,"sourceId")===old);if(m)await m.delete();}
  const list=[["fw.macro.dashboard","FW: GM Dashboard","game.franchiseWars.openDashboard();","icons/svg/book.svg"],
    ["fw.macro.command","FW: Command Centre","game.franchiseWars.openCommandCentre();","icons/svg/castle.svg"],
    ["fw.macro.maps","FW: Re-import Battlemaps (force)","game.franchiseWars.importMaps({force:true});","icons/svg/village.svg"],
    ["fw.macro.export","FW: Export to Compendiums","game.franchiseWars.exportToCompendiums();","icons/svg/chest.svg"],
    ["fw.macro.reimport","FW: Re-import Everything (force)","game.franchiseWars.reimportAll();","icons/svg/upgrade.svg"]];
  let folder=game.folders.find(f=>f.type==="Macro"&&f.getFlag(MODULE_ID,"sourceId")==="fw.folder.macros");
  if(!folder)folder=await Folder.create({name:"The Franchise Wars",type:"Macro",color:"#7a1f2b",flags:{[MODULE_ID]:{sourceId:"fw.folder.macros"}}});
  for(const[sid,name,command,img]of list){
    const old=game.macros.find(m=>m.getFlag(MODULE_ID,"sourceId")===sid);
    if(old){if(old.command!==command)await old.update({command,name});continue;}
    await Macro.create({name,type:"script",command,img,folder:folder.id,flags:{[MODULE_ID]:{sourceId:sid,managed:true}}});
  }
}

/* Compendium export: copies every managed Franchise Wars document into world compendiums
   ("Franchise Wars — Actors/Journals/Items/Scenes/Tables") so they can be moved between worlds or into a shared module. */
async function exportToCompendiums(){
  if(!game.user.isGM)throw new Error("GM only");
  const defs=[["Actor","actors",game.actors],["JournalEntry","journals",game.journal],["Item","items",game.items],["Scene","scenes",game.scenes],["RollTable","tables",game.tables],["Playlist","playlists",game.playlists]];
  for(const[type,key,coll]of defs){
    const docs=coll.filter(d=>d.getFlag(MODULE_ID,"sourceId"));if(!docs.length)continue;
    const name=`franchise-wars-${key}`;let pack=game.packs.get(`world.${name}`);
    if(!pack)pack=await foundry.documents.collections.CompendiumCollection.createCompendium({type,label:`Franchise Wars — ${key[0].toUpperCase()+key.slice(1)}`,name,package:"world"});
    const existing=await pack.getIndex({fields:[`flags.${MODULE_ID}.sourceId`]});
    const del=existing.filter(e=>foundry.utils.getProperty(e,`flags.${MODULE_ID}.sourceId`)).map(e=>e._id);
    if(del.length)await pack.documentClass.deleteDocuments(del,{pack:pack.collection});
    for(let i=0;i<docs.length;i+=50){await pack.documentClass.createDocuments(docs.slice(i,i+50).map(d=>d.toCompendium(pack)),{pack:pack.collection});}
    ui.notifications.info(`Franchise Wars | exported ${docs.length} ${type} documents to ${pack.title}`);
  }
}
Hooks.once("init",()=>{game.franchiseWars.exportToCompendiums=exportToCompendiums;});

/* ---------------------------------------------------------------- v1.0.1 Game Settings menu + compendium support */
async function reimportAll({confirm=true}={}){
  if(!game.user.isGM)throw new Error("GM only");
  if(confirm){const ok=await foundry.applications.api.DialogV2.confirm({window:{title:"Re-import The Franchise Wars"},content:"<p>Rebuild every Franchise Wars journal, actor, item, battlemap, table, playlist and macro in this world from the module, including documents that look unchanged.</p><p>Anything you edited is copied to the <b>Recovery</b> folders first. Campaign progress (Leverage, Receipts, Board, clauses) is not touched.</p>"});if(!ok)return;}
  ui.notifications.info("Franchise Wars | full re-import started. This can take a few minutes.");
  _actorIndex=null;_itemIndex=null;
  await importContent({force:true});
  ui.notifications.info("Franchise Wars | full re-import complete.");
}
async function resetCampaignState(){
  const ok=await foundry.applications.api.DialogV2.confirm({window:{title:"Reset campaign tracker"},content:"<p>Reset Rabbit Rating, Leverage, Receipts, Board seats, clauses and the Commons Tally to a new campaign? Documents are not changed. This cannot be undone.</p>"});
  if(!ok)return;await game.settings.set(MODULE_ID,STATE_KEY,foundry.utils.deepClone(DEFAULT_STATE));Hooks.callAll("franchiseWarsStateChanged",await getState(),{});ui.notifications.info("Franchise Wars | campaign tracker reset.");
}
class FWSettingsMenu extends FWWindow{
  static DEFAULT_OPTIONS={id:"fw-settings-menu",window:{title:"The Franchise Wars — Content Manager",icon:"fa-solid fa-briefcase"},position:{width:520}};
  async html(){
    const imported=game.settings.get(MODULE_ID,IMPORT_KEY)||"never";
    const packs=game.packs.filter(p=>p.metadata.packageName===MODULE_ID);
    return `<div class="fw-settings">
      <p>Module version <b>${VERSION}</b> · last world import <b>${esc(imported)}</b></p>
      <h3>World content</h3>
      <div class="fw-row"><button data-act="all"><i class="fa-solid fa-rotate"></i> Re-import everything</button></div>
      <p class="fw-note">Rebuilds every journal, actor, item, battlemap, table, playlist and macro from the module. Your edits are copied to the Recovery folders first.</p>
      <div class="fw-row"><button data-act="maps"><i class="fa-solid fa-map"></i> Re-import battlemaps only</button><button data-act="update"><i class="fa-solid fa-download"></i> Import changes only</button></div>
      <h3>Compendiums</h3>
      <p class="fw-note">The module ships ${packs.length} compendiums in the <b>The Franchise Wars</b> folder of the Compendium sidebar. Drag single documents out, or use a pack's <i>Import All Content</i> (tick <b>Keep Document IDs</b> so map pins and tokens stay linked).</p>
      <div class="fw-row"><button data-act="export"><i class="fa-solid fa-box-archive"></i> Copy this world's versions into world compendiums</button></div>
      <h3>Campaign tracker</h3>
      <div class="fw-row"><button data-act="tracker"><i class="fa-solid fa-briefcase"></i> Open GM Dashboard</button><button data-act="reset"><i class="fa-solid fa-eraser"></i> Reset campaign progress</button></div>
    </div>`;
  }
  async act(a){
    try{
      if(a==="all")await reimportAll();
      else if(a==="maps")await importMaps({force:true});
      else if(a==="update"){await importContent();ui.notifications.info("Franchise Wars | changes imported.");}
      else if(a==="export")await exportToCompendiums();
      else if(a==="tracker")fwOpenDashboard();
      else if(a==="reset")await resetCampaignState();
    }catch(err){console.error("Franchise Wars |",err);ui.notifications.error(err.message);}
    this.render();
  }
}
Hooks.once("init",()=>{
  game.settings.registerMenu(MODULE_ID,"contentManager",{name:"Campaign content",label:"Open Content Manager",hint:"Re-import every Franchise Wars journal, actor, battlemap, table and playlist into this world, re-import only the maps, or reset campaign progress.",icon:"fa-solid fa-briefcase",type:FWSettingsMenu,restricted:true});
  Object.assign(game.franchiseWars,{reimportAll,resetCampaignState,openContentManager:()=>new FWSettingsMenu().render(true)});
});

/* Links inside compendium journals: if a document is not in the world, link to the module compendium copy instead. */
let FW_PACK_INDEX=null;
async function fwPackIndex(){
  if(FW_PACK_INDEX)return FW_PACK_INDEX;FW_PACK_INDEX=new Map();
  for(const pack of game.packs.filter(p=>p.metadata.packageName===MODULE_ID)){
    try{const idx=await pack.getIndex({fields:[`flags.${MODULE_ID}.sourceId`]});for(const r of idx){const sid=foundry.utils.getProperty(r,`flags.${MODULE_ID}.sourceId`);if(sid)FW_PACK_INDEX.set(`${pack.documentName}|${sid}`,{pack,id:r._id});}}catch(e){}
  }
  return FW_PACK_INDEX;
}
async function fwFindAny(type,sourceId){
  const w=fwFind(type,sourceId);if(w)return w;
  const hit=(await fwPackIndex()).get(`${type}|${sourceId}`);if(!hit)return null;
  try{return await hit.pack.getDocument(hit.id);}catch(e){return null;}
}
/* Scenes brought in from the compendium keep their map image on a flag; put it on the v14 Level. */
Hooks.on("createScene",async(scene,options,userId)=>{
  if(userId!==game.user.id)return;const bg=scene.getFlag(MODULE_ID,"background");if(!bg)return;
  try{await ensureLevelBackground(scene,bg,scene.backgroundColor);}catch(err){console.warn("Franchise Wars | scene background",err);}
});
Hooks.once("ready",async()=>{
  if(!game.user.isGM)return;
  for(const scene of game.scenes.filter(s=>s.getFlag(MODULE_ID,"fromPack")&&s.getFlag(MODULE_ID,"background"))){
    const lvl=scene.levels?.contents?.[0];if(!lvl||!lvl.background?.src){try{await ensureLevelBackground(scene,scene.getFlag(MODULE_ID,"background"),scene.backgroundColor);}catch(e){}}
  }
});

/* v1.1.4: handouts now go to chat. Undo the journal permissions older versions opened when showing a handout. */
Hooks.once("init",()=>{game.settings.register(MODULE_ID,"handoutPrivacyV1",{scope:"world",config:false,type:Boolean,default:false});});
Hooks.once("ready",async()=>{
  if(!game.user.isGM||game.settings.get(MODULE_ID,"handoutPrivacyV1"))return;
  const NONE=CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,INHERIT=CONST.DOCUMENT_OWNERSHIP_LEVELS.INHERIT;let n=0;
  for(const j of game.journal){
    const sid=j.getFlag(MODULE_ID,"sourceId")??"";if(!/^fw\.handouts?\./.test(sid))continue;
    try{
      if((j.ownership.default??0)>NONE){await j.update({"ownership.default":NONE});n++;}
      const pages=j.pages.filter(p=>(p.ownership?.default??INHERIT)!==INHERIT).map(p=>({_id:p.id,"ownership.default":INHERIT}));
      if(pages.length){await j.updateEmbeddedDocuments("JournalEntryPage",pages);n++;}
    }catch(err){console.warn("Franchise Wars | handout privacy",sid,err);}
  }
  await game.settings.set(MODULE_ID,"handoutPrivacyV1",true);
  if(n)ui.notifications.info(`Franchise Wars | ${n} handout journal(s) made GM-only again; handouts now go to chat.`);
});

/* Map links: view (or Shift = activate) a Franchise Wars battlemap; import it from the compendium if it is not in the world yet. */
async function fwOpenScene(src,{activate=false}={}){
  let scene=fwFind("Scene",src);
  if(!scene){
    const hit=(await fwPackIndex()).get(`Scene|${src}`);
    if(hit){
      ui.notifications.info("Franchise Wars | importing battlemap from the compendium…");
      scene=await game.scenes.importFromCompendium(hit.pack,hit.id,{},{keepId:true});
    }
  }
  if(!scene)return ui.notifications.warn(`Battlemap not found: ${src}. Run Content Manager → Re-import battlemaps only.`);
  try{
    if(activate)await scene.activate();else await scene.view();
    ui.notifications.info(`${activate?"Activated":"Viewing"}: ${scene.name}`);
  }catch(err){console.error("Franchise Wars | open scene",err);ui.notifications.error(`Could not open ${scene.name}: ${err.message}`);}
}
