const MODULE_ID = "franchise-wars";
const VERSION = "0.2.0";
const STATE_KEY = "campaignState";
const IMPORT_KEY = "importVersion";
const DEFAULT_STATE = {rabbitRating:1,mandateName:"Rabbit Rating",commonsTally:[],leverage:{},receipts:{},board:{},missions:{},clauses:{},currentAct:1,greyCreep:0,questRabbitCut:30};

Hooks.once("init",()=>{
  game.settings.register(MODULE_ID,STATE_KEY,{name:"Franchise Wars Campaign State",scope:"world",config:false,type:Object,default:foundry.utils.deepClone(DEFAULT_STATE)});
  game.settings.register(MODULE_ID,IMPORT_KEY,{name:"Franchise Wars Import Version",scope:"world",config:false,type:String,default:""});
  game.franchiseWars={getState,patchState,importContent,requestCheck,requestSave,postContractBrief,awardReceipt,addLeverage,addCommonsAlly,setBoardSeat,setMissionState,voidClause,openCommandCentre,openSessionZero};
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
  await importScenes();
  await game.settings.set(MODULE_ID,IMPORT_KEY,VERSION);
}

async function importScenes(){const scenes=await loadJSON("scenes.json");for(const s of scenes){let scene=game.scenes.find(x=>x.getFlag(MODULE_ID,"sourceId")===s.sourceId);const data={name:s.name,img:s.img,width:s.width,height:s.height,padding:s.padding??0.05,navigation:s.navigation??true,active:false,grid:s.grid??{type:0},flags:{[MODULE_ID]:{sourceId:s.sourceId,managed:true}}};if(!scene)await Scene.create(data);else await scene.update(data);}}

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
