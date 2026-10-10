// 250 synthetische Lasttest-Fälle, niemals OEM-Fakten.
export function generateSyntheticFixtures(count=250){
 if(!Number.isInteger(count)||count<100||count>20000)throw Error('Synthetic count must be integer 100..20000');
 return Array.from({length:count},(_,i)=>{
  const key=String(i).padStart(6,'0');
  return {recordType:'synthetic_load_fixture',fixtureOnly:true,id:'SYNTHETIC-ONLY-'+key,
   domain:i%2?'vacuum-cleaner':'washing-machine',brand:'SYNTHETIC-TEST-MANUFACTURER',model:'FAKE-DEVICE-'+key,
   market:i%3?'DE':'GB',primary:{namespace:i%2?'device-sku':'pnc',value:'FAKE-'+key},
   variant:{eNumber:null,pnc:i%2?null:'000'+key,manufacturerProductCode:null,serialRange:null,revisionRange:null},
   source:{authority:'none',url:null,locator:'SYNTHETIC-FIXTURE-NOT-AN-OEM-SOURCE',observedAt:null},
   consumerPublished:false,fitmentConfirmed:false,licenseApproved:false};
 });
}
