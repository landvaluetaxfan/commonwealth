/* Round-trip: serialise every content file, re-evaluate it, and confirm the
   game is byte-for-byte unchanged in behaviour. If this fails, the editor
   would silently corrupt content, which is the one thing it must never do. */
const fs=require("fs"), vm=require("vm"), path=require("path"), root=path.join(__dirname,"..");
const CF=["setup","parties","stations","constituencies","cabinet","instruments","characters","bills","events","glossary","encyclopedia"];
const src=CF.map(f=>fs.readFileSync(path.join(root,"content",f+".js"),"utf8")).join("\n");
vm.runInThisContext(src+"\n;globalThis.__A={SETUP,PARTIES,CURRENTS,STATIONS,CHARACTERS,BILLS,EVENTS,GLOSSARY,ENCYCLOPEDIA,CONSTITUENCIES};");
const A=globalThis.__A;
const Serialise=require("../js/serialise.js");
const Engine=require("../js/engine.js");

function mkContent(o){
  const C={setup:o.SETUP,parties:o.PARTIES,currents:o.CURRENTS,stations:o.STATIONS,
           characters:o.CHARACTERS,bills:o.BILLS,events:o.EVENTS,glossary:o.GLOSSARY};
  const idx=a=>a.reduce((m,x)=>(m[x.id]=x,m),{});
  C.partyById=idx(o.PARTIES);C.currentById=idx(o.CURRENTS);C.stationById=idx(o.STATIONS);
  C.characterById=idx(o.CHARACTERS);C.billById=idx(o.BILLS);C.eventById=idx(o.EVENTS);
  return C;
}
function play(C,n){
  let s=Engine.newGame(C), out=[], k=0;
  for(let i=0;i<n;i++){
    const e=Engine.nextEvent(s,C);
    if(e){ out.push(s.sitting+":"+e.id); Engine.choose(s,C,e,(k++)%e.choices.length); }
    else out.push(s.sitting+":-");
    Engine.advance(s);
  }
  return {trace:out.join("|"), scalars:JSON.stringify(s.scalars),
          div:JSON.stringify(Engine.division(s,C,"divergence"))};
}

const before=play(mkContent(A),40);

/* serialise → re-evaluate */
const regen =
  Serialise.file("glossary",A.GLOSSARY)+"\n"+
  Serialise.partiesFile(A.PARTIES,A.CURRENTS)+"\n"+
  Serialise.file("stations",A.STATIONS)+"\n"+
  Serialise.file("characters",A.CHARACTERS)+"\n"+
  Serialise.file("bills",A.BILLS)+"\n"+
  Serialise.file("constituencies",A.CONSTITUENCIES)+"\n"+
  Serialise.file("events",A.EVENTS)+"\n"+
  fs.readFileSync(path.join(root,"content","setup.js"),"utf8");
const ctx={};
vm.runInNewContext(regen+"\n;__B={SETUP,PARTIES,CURRENTS,STATIONS,CHARACTERS,BILLS,EVENTS,GLOSSARY,CONSTITUENCIES};",ctx);
const B=ctx.__B;

const after=play(mkContent(B),40);

let fail=0;
const eq=(l,a,b)=>{ const ok=a===b; if(!ok)fail++;
  console.log((ok?"  ok  ":"  FAIL")+" "+l); if(!ok){console.log("    before: "+String(a).slice(0,160));console.log("    after:  "+String(b).slice(0,160));} };

console.log("ROUND-TRIP: content → serialiser → content");
console.log("=".repeat(52));
console.log("  regenerated size:", regen.length, "chars");
eq("event counts", A.EVENTS.length, B.EVENTS.length);
eq("party counts", A.PARTIES.length, B.PARTIES.length);
eq("station counts", A.STATIONS.length, B.STATIONS.length);
eq("glossary counts", A.GLOSSARY.length, B.GLOSSARY.length);
eq("40-sitting trace identical", before.trace, after.trace);
eq("final scalars identical", before.scalars, after.scalars);
eq("division identical", before.div, after.div);
console.log("");
console.log(fail?fail+" FAILURES — the editor would corrupt content":"round-trip is lossless");
