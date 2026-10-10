/** Match CSS ease-in-out without depending on an element animation timeline. */
export function morphEase(time:number):number {
 if(time<=0)return 0;if(time>=1)return 1;
 let lo=0,hi=1;
 for(let i=0;i<24;i++){const s=(lo+hi)/2,x=3*.42*(1-s)*(1-s)*s+3*.58*(1-s)*s*s+s*s*s;if(x<time)lo=s;else hi=s;}
 const s=(lo+hi)/2;return 3*s*s-2*s*s*s;
}
