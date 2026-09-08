/* Renaming must be behaviour-preserving. If a reference is missed, the game
   changes silently — a stance keyed to a party that no longer exists falls
   through to axis inference and the division comes out different.

   So: play 40 sittings, rename everything, play again, compare. */
const fs=require("fs"), vm=require("vm"), path=require("path"), root=path.join(__dirname,"..");
const CF=["setup","parties","stations","constituencies","cabinet","instruments","functional","characters","bills","glossary","archetypes","names","events","encyclopedia"];
const src=CF.map(f=>fs.readFileSync(path.join(root,"content",f+".js"),"utf8")).join("\n");

function loadModel(){
  const c={}; vm.runInNewContext(src+";__={SETUP,PARTIES,CURRENTS,STATIONS,FUNCTIONAL,CHARACTERS,BILLS,EVENTS,GLOSSARY,ENCYCLOPEDIA};",c);
  const G=c.__;
  return {setup:G.SETUP,parties:G.PARTIES,currents:G.CURRENTS,stations:G.STATIONS,functional:G.FUNCTIONAL,
    characters:G.CHARACTERS,bills:G.BILLS,glossary:G.GLOSSARY,events:G.EVENTS,encyclopedia:G.ENCYCLOPEDIA};
}
const r={}; vm.runInNewContext(fs.readFileSync(path.join(root,"js/refs.js"),"utf8")+";__R=Refs;",r);
const Refs=r.__R, Engine=require("../js/engine.js");

function content(M){
  const idx=a=>a.reduce((m,o)=>(m[o.id]=o,m),{});
  return {setup:M.setup,parties:M.parties,currents:M.currents,stations:M.stations,characters:M.characters,
    bills:M.bills,events:M.events,glossary:M.glossary,functional:M.functional,
    partyById:idx(M.parties),currentById:idx(M.currents),stationById:idx(M.stations),
    characterById:idx(M.characters),billById:idx(M.bills),eventById:idx(M.events)};
}
function play(M,n){
  const C=content(M); let s=Engine.newGame(C), out=[], k=0;
  for(let i=0;i<n;i++){
    const e=Engine.nextEvent(s,C);
    if(e){ out.push(s.sitting+":"+(M.__map&&M.__map[e.id]||e.id)); Engine.choose(s,C,e,(k++)%e.choices.length); }
    else out.push(s.sitting+":-");
    Engine.advance(s);
  }
  const caps=Object.keys(s.capital).sort().map(k2=>(M.__cap&&M.__cap[k2]||k2)+"="+s.capital[k2]).join(",");
  return { trace: out.join("|"),
           scalars: JSON.stringify(s.scalars),
           capital: caps,
           div: JSON.stringify(Engine.division(s,C,M.__bill||"divergence").popular),
           loy: M.parties.map(p=>(M.__party&&M.__party[p.id]||p.id)+":"+s.parties[p.id].loyalty).sort().join(",") };
}

const A=loadModel(); const before=play(A,40);

/* rename every entity of every kind */
const B=loadModel();
const map={party:{},station:{},bill:{},event:{},character:{},current:{}};
let total=0;
[["parties","party"],["stations","station"],["bills","bill"],
 ["events","event"],["characters","character"],["currents","current"]].forEach(([kind,tag])=>{
  const arr=kind==="currents"?B.currents:B[kind];
  arr.slice().forEach(o=>{
    const from=o.id, to="x_"+tag+"_"+from;
    total+=Refs.rename(B,kind==="currents"?"currents":kind,from,to,o);
    map[tag][to]=from;
  });
});
/* map renamed ids back for comparison */
B.__map=map.event; B.__cap=map.party; B.__party=map.party;
B.__bill=Object.keys(map.bill).find(k=>map.bill[k]==="divergence");

const after=play(B,40);

let fail=0;
const eq=(l,a,b)=>{const ok=a===b; if(!ok)fail++;
  console.log((ok?"  ok   ":"  FAIL ")+l);
  if(!ok){console.log("    before: "+String(a).slice(0,180));console.log("    after:  "+String(b).slice(0,180));}};

console.log("RENAME FIDELITY");
console.log("=".repeat(52));
console.log("  entities renamed: "+Object.values(map).reduce((n,m)=>n+Object.keys(m).length,0));
console.log("  references rewritten: "+total);
console.log("");
eq("40-sitting event trace", before.trace, after.trace);
eq("final scalars", before.scalars, after.scalars);
eq("coalition ledger", before.capital, after.capital);
eq("party loyalties", before.loy, after.loy);
eq("division on the threshold bill", before.div, after.div);

/* no stale ids anywhere */
/* Ask the reference finder rather than scanning for strings: a tag that
   happens to share a word with an id is not a reference to it. */
const stale=[];
[["parties","party"],["stations","station"],["bills","bill"],
 ["events","event"],["characters","character"],["currents","current"]].forEach(([kind,tag])=>{
  Object.values(map[tag]).forEach(old=>{
    const n=Refs.find(B,kind,old).length;
    if(n) stale.push(kind+" "+old+" ×"+n);
  });
});
if(stale.length){fail++;console.log("  FAIL stale ids remain: "+stale.join(", "));}
else console.log("  ok   no stale ids remain anywhere in the model");

console.log("");
console.log(fail?fail+" FAILURES — renaming would corrupt content":"renaming is behaviour-preserving");
process.exit(fail?1:0);
