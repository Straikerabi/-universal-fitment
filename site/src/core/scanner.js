export function scannerCapabilities() {
  return {
    camera: Boolean(navigator.mediaDevices?.getUserMedia),
    barcodeDetector: 'BarcodeDetector' in globalThis,
    textDetector: 'TextDetector' in globalThis,
    ocrFallback: true,
    secureContext: globalThis.isSecureContext === true
  };
}

export async function startBarcodeScanner(video, onCode, onStatus = () => {}, {signal}={}) {
  const cancelled=()=>new DOMException('Scan cancelled','AbortError');
  if(signal?.aborted)throw cancelled();
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('camera-unavailable');
  const stream = await navigator.mediaDevices.getUserMedia({
    video:{ facingMode:{ ideal:'environment' }, width:{ ideal:1280 }, height:{ ideal:720 } }, audio:false
  });
  if(signal?.aborted){stream.getTracks().forEach(t=>t.stop());throw cancelled();}
  let stopped=false,frame;
  const stop=()=>{
    if(stopped)return;stopped=true;
    if(frame!==undefined)globalThis.cancelAnimationFrame?.(frame);
    signal?.removeEventListener('abort',stop);
    stream.getTracks().forEach(t=>t.stop());
    if(video.srcObject===stream)video.srcObject=null;
  };
  signal?.addEventListener('abort',stop,{once:true});
  video.srcObject=stream;video.playsInline=true;
  try{await video.play();}catch(error){stop();throw error;}
  if(stopped)throw cancelled();
  if(!('BarcodeDetector' in globalThis)){
    onStatus('Kamera aktiv. Automatische Barcode-Erkennung wird von diesem Browser nicht unterstützt.');
    return {stop,automatic:false};
  }
  let supported=[];
  try{supported=await BarcodeDetector.getSupportedFormats();}catch{}
  if(stopped)throw cancelled();
  let detector;
  try{detector=supported.length?new BarcodeDetector({formats:supported}):new BarcodeDetector();}catch(error){stop();throw error;}
  onStatus('Kamera aktiv – Barcode wird gesucht …');
  const schedule=()=>{frame=requestAnimationFrame(tick);};
  const tick=async()=>{
    if(stopped)return;
    if(document.hidden){schedule();return;}
    if(video.readyState>=2){
      try{
        const codes=await detector.detect(video);
        if(stopped)return;
        const value=codes?.find(c=>c.rawValue)?.rawValue;
        if(value){stop();onCode(value);return;}
      }catch{}
    }
    if(!stopped)schedule();
  };
  schedule();return {stop,automatic:true};
}

export async function detectBarcodeFromImage(file) {
  if (!file || !('BarcodeDetector' in globalThis) || !('createImageBitmap' in globalThis)) return null;
  let bitmap;
  try {
    const supported = await BarcodeDetector.getSupportedFormats().catch(()=>[]);
    const detector = supported.length ? new BarcodeDetector({formats:supported}) : new BarcodeDetector();
    bitmap = await createImageBitmap(file);
    const codes = await detector.detect(bitmap);
    return codes?.find(code=>code.rawValue)?.rawValue || null;
  } catch {
    return null;
  } finally {
    bitmap?.close?.();
  }
}

let tesseractLoader=null;
const abortError=()=>new DOMException('OCR cancelled','AbortError');
function abortable(promise,signal){
  if(!signal)return promise;
  if(signal.aborted){Promise.resolve(promise).catch(()=>{});return Promise.reject(abortError());}
  return new Promise((resolve,reject)=>{
    const cancel=()=>{signal.removeEventListener('abort',cancel);reject(abortError());};
    signal.addEventListener('abort',cancel,{once:true});
    Promise.resolve(promise).then(value=>{signal.removeEventListener('abort',cancel);resolve(value);},error=>{signal.removeEventListener('abort',cancel);reject(error);});
  });
}
async function loadTesseract(){
  if(globalThis.Tesseract?.createWorker)return globalThis.Tesseract;
  if(!tesseractLoader){
    const loading=new Promise((resolve,reject)=>{
      document.querySelector('script[data-uf-tesseract]')?.remove();
      const script=document.createElement('script');let finished=false;
      const finish=error=>{
        if(finished)return;finished=true;clearTimeout(timer);
        script.onload=null;script.onerror=null;
        if(error){script.remove();reject(error);}else resolve(globalThis.Tesseract);
      };
      const timer=setTimeout(()=>finish(new Error('ocr-load-timeout')),20000);
      script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
      script.async=true;script.dataset.ufTesseract='1';
      script.onload=()=>finish(globalThis.Tesseract?.createWorker?null:new Error('ocr-unavailable'));
      script.onerror=()=>finish(new Error('ocr-load-failed'));
      document.head.appendChild(script);
    });
    tesseractLoader=loading.catch(error=>{tesseractLoader=null;throw error;});
  }
  return tesseractLoader;
}

export async function detectTextFromImage(file,onStatus=()=>{},{signal:userSignal}={}){
  if(!file||userSignal?.aborted)return [];
  const deadline=AbortSignal.timeout(45000),signal=userSignal?AbortSignal.any([userSignal,deadline]):deadline;
  const status=message=>{if(!userSignal?.aborted)onStatus(message);};
  if('TextDetector' in globalThis&&'createImageBitmap' in globalThis){
    let bitmap;
    try{
      status('Typtext wird lokal erkannt …');
      const detector=new TextDetector();bitmap=await createImageBitmap(file);
      if(signal.aborted)return [];
      const blocks=await abortable(detector.detect(bitmap),signal);
      const lines=(blocks||[]).map(block=>String(block.rawValue||'').trim()).filter(Boolean);
      if(lines.length)return lines;
    }catch{}finally{bitmap?.close?.();}
    if(signal.aborted)return [];
  }
  let worker,termination;
  const terminate=()=>{
    if(worker&&!termination){termination=Promise.resolve().then(()=>worker.terminate()).catch(()=>{});}
    return termination;
  };
  signal.addEventListener('abort',terminate,{once:true});
  try{
    status('OCR wird geladen …');
    const Tesseract=await abortable(loadTesseract(),signal);
    if(signal.aborted)return [];
    // createWorker returns its handle only after loading; cancelled initialization is cleaned up once the handle exists.
    const creating=Tesseract.createWorker('eng',1,{workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',corePath:'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',logger:message=>{
      if(message?.status==='recognizing text'&&Number.isFinite(message.progress))status(`Typenschild wird gelesen … ${Math.round(message.progress*100)} %`);
    }});
    const pending=Promise.resolve(creating).then(created=>{worker=created;if(signal.aborted)void terminate();return created;});
    worker=await abortable(pending,signal);
    if(signal.aborted)return [];
    status('Typenschild wird per OCR gelesen …');
    const result=await abortable(worker.recognize(file),signal);
    if(signal.aborted)return [];
    return String(result?.data?.text||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  }catch{
    if(!userSignal?.aborted)status(deadline.aborted?'OCR hat zu lange gedauert. Bitte erneut versuchen oder Modellnummer eingeben.':'OCR konnte nicht abgeschlossen werden. Du kannst erneut versuchen oder die Modellnummer eingeben.');
    return [];
  }finally{signal.removeEventListener('abort',terminate);await terminate();}
}
