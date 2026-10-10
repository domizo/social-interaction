import { useCallback, useEffect, useRef, useState } from 'react';
export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';
export interface AsyncActionState<T> { status: AsyncStatus; value: T | undefined; error: Error | null }
/** One in-flight operation. Cancellation invalidates results even when an adapter ignores AbortSignal. */
export function useAsyncAction<T>() {
  const [state,setState]=useState<AsyncActionState<T>>({status:'idle',value:undefined,error:null});
  const alive=useRef(true), generation=useRef(0), current=useRef<AbortController | null>(null);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false; generation.current++; current.current?.abort();current.current=null;};},[]);
  const cancel=useCallback(()=>{generation.current++; current.current?.abort();current.current=null;if(alive.current)setState(s=>({...s,status:'idle',error:null}));},[]);
  const run=useCallback(async(operation:(signal:AbortSignal)=>Promise<T>):Promise<T | undefined>=>{
    if(current.current || !alive.current)return undefined;
    const controller=new AbortController();current.current=controller;const id=++generation.current;
    setState(s=>({...s,status:'pending',error:null}));
    try {const value=await operation(controller.signal);if(!alive.current || id!==generation.current || controller.signal.aborted)return undefined;setState({status:'success',value,error:null});return value;}
    catch(error){if(alive.current && id===generation.current && !controller.signal.aborted)setState(s=>({...s,status:'error',error:error instanceof Error?error:new Error(String(error))}));return undefined;}
    finally {if(id===generation.current)current.current=null;}
  },[]);
  const reset=useCallback(()=>{cancel();if(alive.current)setState({status:'idle',value:undefined,error:null});},[cancel]);
  return {...state,run,cancel,reset};
}
export function simulateRequest<T>(result:T, {signal,delay=900,fail=false}:{signal:AbortSignal;delay?:number;fail?:boolean}):Promise<T> {
  return new Promise((resolve,reject)=>{if(!Number.isFinite(delay)||delay<0||delay>2147483647){reject(new RangeError('delay must be finite and between 0 and 2147483647 ms'));return;}if(signal.aborted){reject(new DOMException('Cancelled','AbortError'));return;}
    const abort=()=>{clearTimeout(timer);signal.removeEventListener('abort',abort);reject(new DOMException('Cancelled','AbortError'));};
    const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);fail?reject(new Error('Simulated request failed. Try again.')):resolve(result);},delay);
    signal.addEventListener('abort',abort,{once:true});
  });
}
