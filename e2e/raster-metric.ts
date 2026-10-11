/** Tiny edge-AA allowance for a fixed, geometry-identical WebKit rest capture. */
export function compareRgba(a:ArrayLike<number>,b:ArrayLike<number>,width:number,height:number){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<=0||height<=0||a.length!==width*height*4||b.length!==a.length)throw new Error('Raster dimensions changed');
 let maxDelta=0,changedPixels=0,coverageChanged=0,alphaChanged=0;
 for(let i=0;i<a.length;i+=4){let changed=false;for(let j=0;j<3;j++){const d=Math.abs(a[i+j]-b[i+j]);maxDelta=Math.max(maxDelta,d);changed ||=d!==0;}if(changed)changedPixels++;
  // Explicit average-RGB 50% coverage threshold, independent of PNG encoding.
  if(((a[i]+a[i+1]+a[i+2])/3<128)!==((b[i]+b[i+1]+b[i+2])/3<128))coverageChanged++;
  if(a[i+3]!==b[i+3])alphaChanged++;
 }
 return {maxDelta,changedPixels,totalPixels:width*height,coverageChanged,alphaChanged};
}
export function edgeEquivalent(diff:ReturnType<typeof compareRgba>){return diff.maxDelta<=8&&diff.changedPixels/diff.totalPixels<=.005&&diff.coverageChanged===0&&diff.alphaChanged===0;}
