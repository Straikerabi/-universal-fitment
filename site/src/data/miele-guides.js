import { partCategory } from './miele-parts.js';

export function installationInfo(part,product){
  const docs=(part.manuals||[]).filter(m=>!/^Produktblatt$/i.test(m.label)).map(m=>({...m,scope:m.kind==='installation-guide'?'Bebilderte Anleitung des Teile-Anbieters':m.kind==='device-care-guide'?'Bebilderte Gerätepflege des Herstellers; Modell und Filterausführung prüfen':m.kind==='safety-information'?'Sicherheitshinweise des Originalteile-Herstellers; keine Einbauanleitung':part.tier==='oem'?'Unterlagen des Originalteile-Herstellers; Geräteausführung prüfen':'Hinweise des Teile-Anbieters; keine Freigabe des Geräteherstellers für den Nachbau'}));
  const category=partCategory(part);
  const wallMount=/wandhalter/i.test(part.name);
  const userReplaceable=!part.professionalOnly&&(wallMount||['Staubsaugerbeutel','Filter','Schläuche','Griffe','Rohre','Bürsten & Düsen','Akkus & Ladegeräte'].includes(category))&&!['miele-part-10715742','miele-part-10715783','miele-part-11567053','miele-part-7698161'].includes(part.id);
  const manual=product?.manuals?.find(m=>m.label==='Gebrauchsanweisung');
  if(manual&&userReplaceable){
    const chapter=wallMount?'Wandmontage':category==='Staubsaugerbeutel'?'Wartung · Staubsaugerbeutel':category==='Filter'?'Wartung · Filter':category==='Akkus & Ladegeräte'?'Akku einsetzen / Laden':category==='Bürsten & Düsen'?'Wartung · Bürste / Bodendüse':'Inbetriebnahme · Saugschlauch, Handgriff und Saugrohr';
    docs.push({label:`${product.brand} Geräteanleitung · ${chapter}`,url:manual.url,scope:'Anleitung für das ausgewählte Gerät. Ausstattung und Abbildungen im PDF prüfen; keine separate Montageanleitung für jedes Ersatzteil.'});
  }
  const missing=!docs.length;
  return {
    links:docs,
    note:missing?'Keine öffentliche Einbauanleitung für dieses Teil hinterlegt. Die Produktbeschreibung ist ein Teile-Nachweis, keine Reparaturanleitung.':userReplaceable?'Vor dem Wechsel Gerät ausschalten. Bei Netzgeräten Stecker ziehen; Akku-Geräte nach der Geräteanleitung sichern. Die verlinkten Abbildungen und Hinweise verwenden.':'Die verlinkten Unterlagen prüfen; eine Anleitung zur Gerätezerlegung ist hier nicht hinterlegt.',
    missing,
    dataSheets:(part.manuals||[]).filter(m=>/^Produktblatt$/i.test(m.label)),
    finder:missing&&product?{label:'Gebrauchsanweisung anhand Gerätedaten suchen',url:product.manualFinderUrl||(product.brand==='Bosch'?'https://www.bosch-home.com/de/service/hilfe-und-unterstuetzung/gebrauchsanleitungen':'https://www.miele.de/e/manual-finder')}:null
  };
}

// Swirl publishes this illustrated sequence. It is intentionally limited to its bag.
export const swirlBagSteps=[
  'Netzstecker ziehen und den Staubraumdeckel öffnen.',
  'Beutel an der Halteplatte lösen, verschließen und entnehmen.',
  'Den neuen Beutel in Pfeilrichtung bis zum Einrasten einschieben.',
  'Beutelsitz und Öffnung kontrollieren, dann den Deckel schließen.'
];
