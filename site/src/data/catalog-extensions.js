// Combine independently observed manufacturer rows without inventing a relationship.
export function extendCatalogPack(base,observed){
 const parts=base.parts.map(p=>({...p,relationships:[...(p.relationships||[])]}));
 const byCode=new Map(parts.map(p=>[p.code,p]));
 for(const row of observed){
  const existing=byCode.get(row.code);
  if(!existing){const part={...row,relationships:[...(row.relationships||[])]};parts.push(part);byCode.set(part.code,part);continue;}
  const relations=new Map([...existing.relationships,...(row.relationships||[])].map(r=>[[r.code,r.reference||r.pnc||'',r.url].join('|'),r]));
  existing.relationships=[...relations.values()];
  if(row.attachmentReferences?.length)existing.attachmentReferences=[...new Set([...(existing.attachmentReferences||[]),...row.attachmentReferences])];
  if(row.restrictions?.length)existing.restrictions=[...new Set([...(existing.restrictions||[]),...row.restrictions])];
  if(row.articleAliases?.length)existing.articleAliases=[...new Set([...(existing.articleAliases||[]),...row.articleAliases])];
 }
 return {...base,parts};
}
