/**
 * Logo 3D da raposa: quadros renderizados no Blender, um a cada 3° de giro em torno do eixo vertical
 * (public/fox3d/<tom>/NN.webp). O quadro mostrado segue o mouse e a rolagem da seção, lidos das variáveis
 * --mouse-x e --s que o motor de parallax grava na seção (data-scene). Entre dois quadros há uma transição suave.
 */
export type FoxTone="black"|"white";

const STEP=3;
/** Primeiro ângulo renderizado e quantidade de quadros de cada tom (preta: topo; branca: contato). */
export const foxFrames:Record<FoxTone,{from:number;count:number}>={black:{from:-72,count:52},white:{from:-39,count:31}};
export const foxFrameUrl=(tone:FoxTone,i:number)=>`/fox3d/${tone}/${String(i).padStart(2,"0")}.webp`;
export const foxFrontFrame=(tone:FoxTone)=>Math.round(-foxFrames[tone].from/STEP);

/** Mesma curva do --ease do CSS (cubic-bezier(.2,.8,.2,1)), aproximada. */
const ease=(t:number)=>1-Math.pow(1-t,3.2);

type Options={
 /** Graus de giro por unidade de rolagem da seção (--s vai de -0,6 a 1). */
 turn:number;
 /** Entrada: começa virada neste ângulo e gira até a frente (só no topo). */
 intro?:number;
 /** Chamado quando o primeiro quadro está pronto (a logo pode aparecer). */
 onReady?:()=>void;
};

export function foxTurn(canvas:HTMLCanvasElement,tone:FoxTone,{turn,intro=0,onReady}:Options){
 const ctx=canvas.getContext("2d");
 const scene=canvas.closest<HTMLElement>("[data-scene]");
 if(!ctx)return()=>{};
 const{from,count}=foxFrames[tone];
 const front=foxFrontFrame(tone);
 const still=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 const frames:(HTMLImageElement|undefined)[]=new Array(count);
 let alive=true,raf=0,last="",visible=true,introStart=0,introOn=false,ready=false;

 const load=(i:number)=>new Promise<void>(done=>{
  if(frames[i]||!alive){done();return}
  const im=new Image();
  im.decoding="async";
  im.src=foxFrameUrl(tone,i);
  im.decode().then(()=>{frames[i]=im;last="";queue()},()=>{}).finally(done);
 });
 const loadAll=async(list:number[],batch=4)=>{for(let k=0;k<list.length&&alive;k+=batch)await Promise.all(list.slice(k,k+batch).map(load))};

 const yaw=()=>{
  const v=(name:string)=>Number(scene?.style.getPropertyValue(name)||0)||0;
  let y=v("--mouse-x")*30+v("--s")*turn;
  if(introOn){
   const p=Math.min(1,(performance.now()-introStart)/1600);
   y+=intro*(1-ease(p));
   if(p>=1)introOn=false;
  }
  return y;
 };

 const draw=()=>{
  raf=0;
  if(!alive)return;
  const pos=still?front:Math.min(count-1,Math.max(0,(yaw()-from)/STEP));
  let lo=Math.floor(pos),hi=Math.ceil(pos);
  while(lo>=0&&!frames[lo])lo--;
  while(hi<count&&!frames[hi])hi++;
  if(lo<0&&hi>=count){if(introOn||visible)queue();return}
  if(lo<0)lo=hi;if(hi>=count)hi=lo;
  const f=hi===lo?0:(pos-lo)/(hi-lo);
  const key=lo+":"+hi+":"+f.toFixed(2)+":"+canvas.width;
  if(key!==last){
   last=key;
   const w=canvas.width,h=canvas.height;
   ctx.clearRect(0,0,w,h);
   ctx.imageSmoothingQuality="high";
   ctx.globalAlpha=1;ctx.drawImage(f>.5?frames[hi]!:frames[lo]!,0,0,w,h);
   const other=f>.5?frames[lo]!:frames[hi]!,amount=f>.5?1-f:f;
   if(amount>.01){ctx.globalAlpha=amount;ctx.drawImage(other,0,0,w,h);ctx.globalAlpha=1}
  }
  if(introOn||(visible&&!still))queue();
 };
 const queue=()=>{if(!raf&&alive)raf=requestAnimationFrame(draw)};

 const resize=()=>{
  const r=canvas.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);
  const w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;last="";queue()}
 };
 const ro=new ResizeObserver(resize);
 ro.observe(canvas);
 resize();

 const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)queue()},{rootMargin:"20% 0px"});
 io.observe(canvas);

 const begin=(playIntro:boolean)=>{
  if(ready||!alive)return;
  ready=true;
  if(playIntro&&intro&&!still){introOn=true;introStart=performance.now()}
  onReady?.();
  queue();
 };

 const cleanup:(()=>void)[]=[];
 // Sem entrada (contato): só baixa os quadros quando a seção se aproxima da tela.
 const near=new Promise<void>(res=>{
  if(intro){res();return}
  const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){o.disconnect();res()}},{rootMargin:"100% 0px"});
  o.observe(canvas);
  cleanup.push(()=>o.disconnect());
 });

 (async()=>{
  await near;
  await load(front);
  if(still){begin(false);return}
  // Entrada: quadros do caminho da virada (de 6 em 6°) antes de aparecer; se demorar, aparece já de frente.
  if(intro){
   const path:number[]=[];for(let i=front-2;i>=0;i-=2)path.push(i);
   const timer=window.setTimeout(()=>begin(false),1400);
   await loadAll(path,6);
   window.clearTimeout(timer);
   begin(true);
  }else begin(false);
  const rest=[...Array(count).keys()].sort((a,b)=>Math.abs(a-front)-Math.abs(b-front));
  await loadAll(rest);
 })();

 return()=>{alive=false;cancelAnimationFrame(raf);ro.disconnect();io.disconnect();cleanup.forEach(c=>c())};
}
