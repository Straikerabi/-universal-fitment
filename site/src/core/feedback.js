const repositoryUrl='https://github.com/Straikerabi/-universal-fitment';

// Enable only after the operator confirms the real support mailbox.
export const supportEmail=null;
export const communityLinks=Object.freeze({
  issues:`${repositoryUrl}/issues`,
  roadmapDe:`${repositoryUrl}/blob/main/ROADMAP.md`,
  roadmapEn:`${repositoryUrl}/blob/main/ROADMAP.en.md`,
  patchnotes:`${repositoryUrl}/blob/main/CHANGELOG.md`
});
export const feedbackTopics=Object.freeze([
  ['idea','Idee / Vorschlag'],['catalog','Gerät oder Teil ergänzen / korrigieren'],
  ['bug','Fehler in der App'],['question','Frage / Kommentar']
]);
const clean=(value,max)=>String(value??'').replace(/\r/g,'').trim().slice(0,max);
export function feedbackDraft({topic='idea',model='',message='',version=''}={}){
  const label=feedbackTopics.find(([key])=>key===topic)?.[1]||feedbackTopics[0][1];
  const device=clean(model,120),note=clean(message,1200);
  if(!note)return null;
  const title=`${label}${device?`: ${device}`:''}`.slice(0,140);
  const body=[`## ${label}`,device?`Gerät / Teil: ${device}`:'',note,`App-Version: ${clean(version,32)}`].filter(Boolean).join('\n\n');
  return {title,body,text:`${title}\n\n${body}`,issueUrl:`${repositoryUrl}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`};
}
export function feedbackMailUrl(draft,email=supportEmail){
  if(!draft||typeof email!=='string'||email.length>254||!/^[-.\w+]+@[-.\w]+\.[A-Za-z]{2,}$/.test(email))return null;
  return `mailto:${email}?subject=${encodeURIComponent(draft.title)}&body=${encodeURIComponent(draft.body)}`;
}
