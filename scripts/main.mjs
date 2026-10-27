const MODULE_ID = "franchise-wars";
const VERSION = "0.4.0";
const STATE_KEY = "campaignState";
const IMPORT_KEY = "importVersion";
const DEFAULT_STATE = {rabbitRating:1,mandateName:"Rabbit Rating",commonsTally:[],leverage:{},receipts:{},board:{},missions:{},clauses:{},currentAct:1,greyCreep:0,questRabbitCut:30};

Hooks.once("init",()=>{
  game.settings.register(MODULE_ID,STATE_KEY,{name:"Franchise Wars Campaign State",scope:"world",config:false,type:Object,default:foundry.utils.deepClone(DEFAULT_STATE)});
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
  if(imported!==VERSION){
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
  await importItems();
  await importActors();
  await importScenes();
  await game.settings.set(MODULE_ID,IMPORT_KEY,VERSION);
}



async function ensureManagedFolders(type, defs){
  const map=new Map();
  for(const f of defs){
    let folder=game.folders.find(x=>x.type===type&&x.getFlag(MODULE_ID,"sourceId")===f.sourceId);
    if(!folder){const parent=f.parent?map.get(f.parent)?.id:null;folder=await Folder.create({name:f.name,type,folder:parent,flags:{[MODULE_ID]:{sourceId:f.sourceId,managed:true}}});}
    else {const parent=f.parent?map.get(f.parent)?.id:null;if(folder.name!==f.name||folder.folder?.id!==parent)await folder.update({name:f.name,folder:parent});}
    map.set(f.sourceId,folder);
  }
  return map;
}

function managedFlags(sourceId,hash,extra={}){return {[MODULE_ID]:{sourceId,managed:true,importedHash:hash,...extra}};}

async function importItems(){
  const data=await loadJSON("items.json");
  const folders=await ensureManagedFolders("Item",data.folders);
  for(const e of data.entries){
    let item=game.items.find(x=>x.getFlag(MODULE_ID,"sourceId")===e.sourceId);
    const folder=folders.get(e.folder)?.id??null;
    const payload=foundry.utils.deepClone(e.data); payload.folder=folder; payload.flags=foundry.utils.mergeObject(payload.flags??{},managedFlags(e.sourceId,e.contentHash),{inplace:false});
    if(!item){await Item.create(payload);continue;}
    if(item.getFlag(MODULE_ID,"importedHash")===e.contentHash)continue;
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
async function cloneCoreActor(spec,folder,existing=null){
  const src=await coreActorSource(spec);
  if(!src){console.warn(`Franchise Wars | Core actor not found: ${spec.baseName} (needed for ${spec.name})`);return null;}
  const specHash=fnv(JSON.stringify({base:spec.baseName,fallback:spec.fallbackBaseNames??[],name:spec.name,description:spec.description,source:src.uuid,img:spec.img??null,artAssetId:spec.artAssetId??null}));
  if(existing?.getFlag(MODULE_ID,"importedHash")===specHash)return existing;
  const data=src.toObject(); delete data._id; delete data.folder; data.name=spec.name; data.folder=folder;
  if(spec.img){data.img=spec.img;data.prototypeToken??={};data.prototypeToken.texture??={};data.prototypeToken.texture.src=spec.img;}
  data.system??={}; data.system.details??={}; data.system.details.biography??={value:"",public:""}; data.system.details.biography.value=`${spec.description}${data.system.details.biography.value??""}`;
  data.flags=foundry.utils.mergeObject(data.flags??{},managedFlags(spec.sourceId,specHash,{baseName:spec.baseName,clonedFrom:src.uuid,artAssetId:spec.artAssetId??null}),{inplace:false});
  if(!existing)return Actor.create(data);
  const embedded=data.items??[]; delete data.items; await existing.update(data);
  const ids=existing.items.map(i=>i.id); if(ids.length)await existing.deleteEmbeddedDocuments("Item",ids);
  if(embedded.length)await existing.createEmbeddedDocuments("Item",embedded);
  return existing;
}

async function applyActorPayload(actor,payload,hash){
  const update=foundry.utils.deepClone(payload); const embedded=update.items??[]; delete update.items; delete update._id;
  update.flags=foundry.utils.mergeObject(update.flags??{},managedFlags(actor.getFlag(MODULE_ID,"sourceId"),hash),{inplace:false});
  await actor.update(update);
  const managed=actor.items.filter(i=>i.getFlag(MODULE_ID,"managed")); if(managed.length)await actor.deleteEmbeddedDocuments("Item",managed.map(i=>i.id));
  if(embedded.length)await actor.createEmbeddedDocuments("Item",embedded);
}

async function importActors(){
  const data=await loadJSON("actors.json");
  const folders=await ensureManagedFolders("Actor",data.folders);
  for(const e of data.entries){
    let actor=game.actors.find(x=>x.getFlag(MODULE_ID,"sourceId")===e.sourceId); const folder=folders.get(e.folder)?.id??null;
    const payload=foundry.utils.deepClone(e.data); payload.folder=folder; payload.flags=foundry.utils.mergeObject(payload.flags??{},managedFlags(e.sourceId,e.contentHash),{inplace:false});
    if(!actor){await Actor.create(payload);continue;} if(actor.getFlag(MODULE_ID,"importedHash")===e.contentHash)continue; await applyActorPayload(actor,payload,e.contentHash);
  }
  for(const spec of data.clones??[]){
    const actor=game.actors.find(x=>x.getFlag(MODULE_ID,"sourceId")===spec.sourceId);
    await cloneCoreActor(spec,folders.get(spec.folder)?.id??null,actor??null);
  }
}

async function importScenes({force=false}={}){
  const scenes=await loadJSON("scenes.json");
  const folderNames=[...new Set(scenes.map(s=>s.folder).filter(Boolean))];
  const defs=[{sourceId:"fw.sfolder.root",name:"The Franchise Wars",parent:null},...folderNames.map(n=>({sourceId:`fw.sfolder.${fnv(n)}`,name:n,parent:"fw.sfolder.root"}))];
  const folders=await ensureManagedFolders("Scene",defs);
  const folderId=n=>n?folders.get(`fw.sfolder.${fnv(n)}`)?.id??null:folders.get("fw.sfolder.root")?.id??null;
  const tag=o=>({...o,flags:{...(o.flags??{}),[MODULE_ID]:{managed:true}}});
  const toCreate=[];
  for(const s of scenes){
    const scene=game.scenes.find(x=>x.getFlag(MODULE_ID,"sourceId")===s.sourceId);
    const data={name:s.name,img:s.img,background:{src:s.img},thumb:s.thumb??null,width:s.width,height:s.height,padding:s.padding??0,navigation:s.navigation??false,
      grid:s.grid??{type:1,size:100,distance:5,units:"ft"},backgroundColor:s.backgroundColor??"#1b1410",tokenVision:s.tokenVision??true,
      environment:s.environment??undefined,folder:folderId(s.folder),sort:s.sort??0,
      flags:{[MODULE_ID]:{sourceId:s.sourceId,managed:true,mapHash:s.mapHash??"",notes:s.notes??""}}};
    if(!scene){toCreate.push({...data,active:false,walls:(s.walls??[]).map(tag),lights:(s.lights??[]).map(tag)});continue;}
    const sameHash=scene.getFlag(MODULE_ID,"mapHash")===(s.mapHash??"");
    await scene.update(data);
    if(sameHash&&!force)continue;
    const wallIds=scene.walls.filter(w=>w.getFlag(MODULE_ID,"managed")).map(w=>w.id);
    const lightIds=scene.lights.filter(l=>l.getFlag(MODULE_ID,"managed")).map(l=>l.id);
    if(wallIds.length)await scene.deleteEmbeddedDocuments("Wall",wallIds);
    if(lightIds.length)await scene.deleteEmbeddedDocuments("AmbientLight",lightIds);
    if(s.walls?.length)await scene.createEmbeddedDocuments("Wall",s.walls.map(tag));
    if(s.lights?.length)await scene.createEmbeddedDocuments("AmbientLight",s.lights.map(tag));
  }
  for(let i=0;i<toCreate.length;i+=10){
    await Scene.createDocuments(toCreate.slice(i,i+10));
    if(toCreate.length>10)ui.notifications.info(`Franchise Wars | importing battlemaps ${Math.min(i+10,toCreate.length)}/${toCreate.length}`);
  }
}
async function importMaps({force=false}={}){if(!game.user.isGM)throw new Error("GM only");await importScenes({force});ui.notifications.info("Franchise Wars battlemaps imported/updated.");}

async function enrich(content){const editor=foundry?.applications?.ux?.TextEditor?.implementation??globalThis.TextEditor;try{return editor?.enrichHTML?await editor.enrichHTML(content,{async:true}):content;}catch(e){console.warn("Franchise Wars | enrich fallback",e);return content;}}
function shell({title,missionId,checkpointId,body,grade="Contract"}){const source=[missionId,checkpointId].filter(Boolean).join(" / ");return `<section class="fw-chat-card"><header class="fw-card-header"><span class="fw-grade">${grade}</span><strong>${title}</strong>${source?`<small>${source}</small>`:""}</header><div class="fw-card-body">${body}</div></section>`;}
async function requestCheck({missionId,checkpointId,skill,ability,dc,flavor="Corporate requests verification.",audience="all",grade="Contract"}={}){if(!game.user.isGM)throw new Error("GM only");const terms=[];if(skill)terms.push(`skill=${skill}`);else if(ability)terms.push(`ability=${ability}`);else throw new Error("skill or ability required");if(Number.isFinite(Number(dc)))terms.push(`dc=${Number(dc)}`);const body=await enrich(`<p>${flavor}</p><p class="fw-roll-request">[[/check ${terms.join(" ")}]]</p>`);return ChatMessage.create({speaker:ChatMessage.getSpeaker({user:game.user}),content:shell({title:"ACTION REQUIRED",missionId,checkpointId,body,grade}),whisper:audience==="gm"?ChatMessage.getWhisperRecipients("GM").map(u=>u.id):[]});}
async function requestSave({missionId,checkpointId,ability,dc,flavor="Compliance requires a saving throw.",audience="all",grade="Contract"}={}){if(!game.user.isGM)throw new Error("GM only");if(!ability)throw new Error("ability required");const terms=[ability];if(Number.isFinite(Number(dc)))terms.push(`dc=${Number(dc)}`);const body=await enrich(`<p>${flavor}</p><p class="fw-roll-request">[[/save ${terms.join(" ")}]]</p>`);return ChatMessage.create({speaker:ChatMessage.getSpeaker({user:game.user}),content:shell({title:"COMPLIANCE CHECK",missionId,checkpointId,body,grade}),whisper:audience==="gm"?ChatMessage.getWhisperRecipients("GM").map(u=>u.id):[]});}
async function postContractBrief({missionId,title="CONTRACT BRIEF",html="",grade="Contract"}={}){if(!game.user.isGM)throw new Error("GM only");return ChatMessage.create({speaker:ChatMessage.getSpeaker({user:game.user}),content:shell({title,missionId,body:html,grade})});}
async function awardReceipt(id,data={}){const s=await getState(),receipts=foundry.utils.deepClone(s.receipts??{});if(receipts[id]?.status==="acquired")return s;receipts[id]={status:"acquired",acquiredAt:Date.now(),...data};return patchState({receipts});}
async function addLeverage(id,amount=1){const s=await getState(),leverage=foundry.utils.deepClone(s.leverage??{});leverage[id]=Number(leverage[id]??0)+Number(amount??0);return patchState({leverage});}
async function addCommonsAlly(name,data={}){const s=await getState(),a=[...(s.commonsTally??[])];if(!a.some(x=>(typeof x==="string"?x:x.name)===name))a.push({name,...data});return patchState({commonsTally:a});}
async function setBoardSeat(id,state){const s=await getState(),board=foundry.utils.deepClone(s.board??{});board[id]=state;return patchState({board});}
async function setMissionState(id,state){const s=await getState(),missions=foundry.utils.deepClone(s.missions??{});missions[id]=state;return patchState({missions});}
async function voidClause(code,method="receipt"){const s=await getState(),clauses=foundry.utils.deepClone(s.clauses??{});if(clauses[code]?.status==="voided")return s;clauses[code]={status:"voided",method,voidedAt:Date.now()};return patchState({clauses});}
function openCommandCentre(){const j=game.journal.find(x=>x.getFlag(MODULE_ID,"sourceId")==="fw.command");return j?.sheet?.render(true);}

function openSessionZero(){const j=game.journal.find(x=>x.getFlag(MODULE_ID,"sourceId")==="fw.session0.gm");return j?.sheet?.render(true);}
