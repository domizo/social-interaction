import {useEffect} from 'react';
/** React inserts section targets after the browser's initial fragment-scroll attempt.
 * Wait for layout fonts, then perform the requested initial jump without animation. */
export function useInitialFragment(){
 useEffect(()=>{
  const hash=window.location.hash;
  if(!['#studio','#studio-config','#timeline','#async-comparison','#design-lens','#compare','#motion','#icon-catalog','#states','#documentation'].includes(hash))return;
  let active=true,frame:number|undefined;
  const stop=()=>{active=false;if(frame!==undefined)cancelAnimationFrame(frame);};
  const events=['wheel','touchstart','pointerdown','keydown'] as const;
  for(const event of events)window.addEventListener(event,stop,{once:true,passive:true});
  Promise.resolve(document.fonts?.ready).then(()=>{
   if(!active||window.location.hash!==hash)return;
   frame=requestAnimationFrame(()=>{if(active&&window.location.hash===hash)document.getElementById(hash.slice(1))?.scrollIntoView({block:'start',behavior:'instant'});});
  });
  return()=>{stop();for(const event of events)window.removeEventListener(event,stop);};
 },[]);
}
