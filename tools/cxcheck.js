/* Concordance integrity: does every [[link]] and see-also resolve? */
const fs=require("fs"), vm=require("vm"), path=require("path"), root=path.join(__dirname,"..");
const files=["setup","parties","stations","constituencies","cabinet","instruments","characters","bills","events","glossary","encyclopedia"]
  .map(f=>path.join(root,"content",f+".js"));
vm.runInThisContext(files.map(f=>fs.readFileSync(f,"utf8")).join("\n")+
  "\n;globalThis.__G={ENCYCLOPEDIA,PARTIES,STATIONS,BILLS,CHARACTERS,GLOSSARY};");
const {ENCYCLOPEDIA,PARTIES,STATIONS,BILLS,CHARACTERS,GLOSSARY}=globalThis.__G;

const ids=new Set();
ENCYCLOPEDIA.articles.forEach(a=>ids.add(a.id));
PARTIES.forEach(p=>ids.add(p.id));
STATIONS.forEach(s=>ids.add(s.id));
BILLS.forEach(b=>ids.add("bill_"+b.id));
CHARACTERS.forEach(c=>ids.add("person_"+c.id));
GLOSSARY.forEach(g=>{const t=g.term.toLowerCase().replace(/\s+/g,"_");ids.add("term_"+t);ids.add(t);});

const bad=[], counts={hand:ENCYCLOPEDIA.articles.length,gen:0};
counts.gen = PARTIES.length+STATIONS.length+BILLS.length+CHARACTERS.length+GLOSSARY.length;

ENCYCLOPEDIA.articles.forEach(a=>{
  const text=[a.summary,...(a.sections||[]).map(s=>s.body)].join(" ");
  [...text.matchAll(/\[\[([a-z0-9_]+)/gi)].forEach(m=>{ if(!ids.has(m[1])) bad.push(a.id+" → [["+m[1]+"]]"); });
  (a.see||[]).forEach(s=>{ if(!ids.has(s)) bad.push(a.id+" → see:"+s); });
  (a.banners||[]).forEach(b=>{ if(!ENCYCLOPEDIA.banners[b]) bad.push(a.id+" → banner:"+b); });
});

console.log("CONCORDANCE CHECK");
console.log("=".repeat(50));
console.log("  hand-written articles:", counts.hand);
console.log("  generated articles:   ", counts.gen);
console.log("  total:                ", counts.hand+counts.gen);
console.log("");
const cats={};
ENCYCLOPEDIA.articles.forEach(a=>cats[a.category]=(cats[a.category]||0)+1);
console.log("  hand-written by category:");
Object.keys(cats).sort().forEach(k=>console.log("    "+k.padEnd(24)+cats[k]));
console.log("");
const banners={};
ENCYCLOPEDIA.articles.forEach(a=>(a.banners||[]).forEach(b=>banners[b]=(banners[b]||0)+1));
console.log("  maintenance banners in use:");
Object.keys(banners).sort().forEach(k=>console.log("    "+k.padEnd(24)+banners[k]));
console.log("");
if(bad.length){ console.log("BROKEN REFERENCES"); bad.forEach(b=>console.log("  "+b)); }
else console.log("all links and banners resolve");
