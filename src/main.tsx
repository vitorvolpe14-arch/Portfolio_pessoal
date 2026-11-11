import{Fragment,StrictMode,createContext,useContext,useEffect,useRef,useState,type CSSProperties,type ReactNode}from"react";
import{createRoot}from"react-dom/client";
import"./styles.css";
import{contact,copy,langFromPath,languages,plansFor,projects,site,stack,type Copy,type Lang,type Project}from"./content";
import{ArrowRight,ArrowUpRight,Check}from"./art";

document.documentElement.classList.add("js");

const reducedMotion=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const vars=(v:Record<string,string|number>)=>v as CSSProperties;

/** Idioma atual (pelo endereço: /, /en/ ou /it/) e os textos dele. */
const LangContext=createContext<{lang:Lang;t:Copy;setLang:(l:Lang)=>void}>({lang:"pt",t:copy.pt,setLang:()=>{}});
const useLang=()=>useContext(LangContext);

/** *palavra* em itálico. */
const emphasis=(line:string)=>line.split(/\*(.+?)\*/).map((part,i)=>i%2?<em key={i}>{part}</em>:part);
/** Título com quebras de linha ("\n") e itálico (*palavra*). */
function Rich({text}:{text:string}):ReactNode{
 return text.split("\n").map((line,i)=><Fragment key={i}>{i>0&&<br/>}{emphasis(line)}</Fragment>);
}
const whatsappUrl=(t:Copy)=>`https://wa.me/${contact.whatsapp.number}?text=${encodeURIComponent(t.contact.message)}`;

function useReveal(){
 useEffect(()=>{
  const els=[...document.querySelectorAll<HTMLElement>("[data-reveal]")];
  if(!("IntersectionObserver" in window)||reducedMotion()){els.forEach(el=>el.classList.add("is-visible"));return}
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("is-visible");io.unobserve(e.target)}}),{threshold:.14,rootMargin:"0px 0px -6% 0px"});
  els.forEach(el=>io.observe(el));
  return()=>io.disconnect();
 },[]);
}

type Layer={el:HTMLElement;center:number;top:number;bottom:number;speed:number;speedX:number;depth:number;rotate:number};

/**
 * Motor de parallax.
 * - data-speed: deslocamento vertical relativo ao scroll (positivo = mais "ao fundo", negativo = mais "à frente").
 * - data-speed-x: deslocamento horizontal conforme o scroll.
 * - data-rotate: giro conforme o scroll (graus a cada 100px).
 * - data-depth: deslocamento conforme o ponteiro (desktop).
 * Os valores viram as variáveis --sx/--sy/--sr/--mx/--my, aplicadas via `translate` e `rotate` no CSS.
 */
function useParallax(){
 useEffect(()=>{
  if(reducedMotion())return;
  let scenes:{el:HTMLElement;top:number;h:number}[]=[];
  const pointer=window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const mouse={x:0,y:0,tx:0,ty:0};
  let layers:Layer[]=[],raf=0;

  const frame=()=>{
   raf=0;
   const vh=window.innerHeight,y=window.scrollY,k=window.innerWidth<760?.55:1;
   mouse.x+=(mouse.tx-mouse.x)*.07;mouse.y+=(mouse.ty-mouse.y)*.07;
   for(const l of layers){
    if(l.bottom-y<-vh||l.top-y>vh*2)continue;
    const d=l.center-y-vh/2;
    if(l.speed)l.el.style.setProperty("--sy",(-d*l.speed*k).toFixed(1)+"px");
    if(l.speedX)l.el.style.setProperty("--sx",(d*l.speedX*k).toFixed(1)+"px");
    if(l.rotate)l.el.style.setProperty("--sr",(d*l.rotate*k/100).toFixed(2)+"deg");
    if(l.depth&&pointer){l.el.style.setProperty("--mx",(mouse.x*l.depth*70).toFixed(1)+"px");l.el.style.setProperty("--my",(mouse.y*l.depth*50).toFixed(1)+"px")}
   }
   for(const sc of scenes){
    if(sc.top+sc.h-y<-vh||sc.top-y>vh*2)continue;
    const p=(y+vh/2-(sc.top+sc.h/2))/vh;
    sc.el.style.setProperty("--s",Math.min(1,Math.max(-.6,p)).toFixed(3));
    sc.el.style.setProperty("--mouse-x",mouse.x.toFixed(3));
    sc.el.style.setProperty("--mouse-y",mouse.y.toFixed(3));
   }
   if(Math.abs(mouse.tx-mouse.x)>.0005||Math.abs(mouse.ty-mouse.y)>.0005)raf=requestAnimationFrame(frame);
  };
  const queue=()=>{if(!raf)raf=requestAnimationFrame(frame)};

  const measure=()=>{
   const els=[...document.querySelectorAll<HTMLElement>("[data-speed],[data-speed-x],[data-rotate],[data-depth]")];
   els.forEach(el=>{el.style.removeProperty("--sy");el.style.removeProperty("--sx")});
   const y=window.scrollY;
   layers=els.map(el=>{
    const r=el.getBoundingClientRect();
    return{el,center:r.top+y+r.height/2,top:r.top+y,bottom:r.bottom+y,speed:Number(el.dataset.speed||0),speedX:Number(el.dataset.speedX||0),depth:Number(el.dataset.depth||0),rotate:Number(el.dataset.rotate||0)};
   });
   scenes=[...document.querySelectorAll<HTMLElement>("[data-scene]")].map(el=>({el,top:el.getBoundingClientRect().top+y,h:el.offsetHeight}));
   cancelAnimationFrame(raf);raf=0;frame();
  };

  const onPointer=(e:PointerEvent)=>{mouse.tx=e.clientX/window.innerWidth-.5;mouse.ty=e.clientY/window.innerHeight-.5;queue()};
  const ro=new ResizeObserver(()=>measure());
  ro.observe(document.body);
  measure();
  window.addEventListener("scroll",queue,{passive:true});
  if(pointer)window.addEventListener("pointermove",onPointer,{passive:true});
  document.fonts?.ready.then(measure);
  return()=>{cancelAnimationFrame(raf);ro.disconnect();window.removeEventListener("scroll",queue);window.removeEventListener("pointermove",onPointer)};
 },[]);
}

/**
 * Vidro que inclina e reflete a luz conforme o ponteiro (desktop), nos elementos com data-tilt (valor = graus).
 * --rx/--ry inclinam o cartão, --gx/--gy dizem onde fica o reflexo e --px/--py (-.5 a .5) deslocam o conteúdo de dentro.
 */
function useTilt(){
 useEffect(()=>{
  if(reducedMotion()||!window.matchMedia("(hover: hover) and (pointer: fine)").matches)return;
  let current:HTMLElement|null=null;
  const release=()=>{if(!current)return;current.classList.remove("is-tilting");for(const v of["--rx","--ry","--px","--py"])current.style.removeProperty(v);current=null};
  const onMove=(e:PointerEvent)=>{
   const el=(e.target as Element|null)?.closest?.<HTMLElement>("[data-tilt]")??null;
   if(el!==current)release();
   if(!el)return;
   current=el;
   const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height,max=Number(el.dataset.tilt)||5;
   el.classList.add("is-tilting");
   el.style.setProperty("--rx",((.5-y)*max).toFixed(2)+"deg");
   el.style.setProperty("--ry",((x-.5)*max).toFixed(2)+"deg");
   el.style.setProperty("--gx",(x*100).toFixed(1)+"%");
   el.style.setProperty("--gy",(y*100).toFixed(1)+"%");
   el.style.setProperty("--px",(x-.5).toFixed(3));
   el.style.setProperty("--py",(y-.5).toFixed(3));
  };
  document.addEventListener("pointermove",onMove,{passive:true});
  document.documentElement.addEventListener("pointerleave",release);
  return()=>{document.removeEventListener("pointermove",onMove);document.documentElement.removeEventListener("pointerleave",release);release()};
 },[]);
}

/**
 * Arrastar a logo 3D gira a raposa, com limite elástico; ao soltar, ela volta com um balanço de mola.
 * No celular só o arrasto na horizontal gira (o vertical continua rolando a página).
 * O giro vira as variáveis --spin-x/--spin-y (graus), somadas à rotação da logo no CSS, e --spin (-1 a 1), que desloca o brilho.
 */
function useLogoSpin(){
 useEffect(()=>{
  const maxY=62,maxX=26,reach=230;
  const cleanups=[...document.querySelectorAll<HTMLElement>(".logo3d")].map(el=>{
   let x=0,y=0,vx=0,vy=0,raf=0,last=0;
   let drag:{id:number;startX:number;startY:number;baseX:number;baseY:number;touch:boolean;time:number}|null=null;
   const apply=()=>{el.style.setProperty("--spin-y",x.toFixed(2)+"deg");el.style.setProperty("--spin-x",y.toFixed(2)+"deg");el.style.setProperty("--spin",(x/maxY).toFixed(3))};
   const settle=(now:number)=>{
    const dt=Math.min(.032,(now-last)/1000);last=now;
    vx+=(-150*x-9*vx)*dt;vy+=(-150*y-9*vy)*dt;x+=vx*dt;y+=vy*dt;
    if(Math.abs(x)+Math.abs(y)<.04&&Math.abs(vx)+Math.abs(vy)<.4){x=y=vx=vy=0;raf=0;apply();return}
    apply();raf=requestAnimationFrame(settle);
   };
   const onDown=(e:PointerEvent)=>{
    if(e.button!==0)return;
    cancelAnimationFrame(raf);raf=0;
    // continua do ângulo em que a logo está (inverso da curva elástica)
    drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,baseX:reach*Math.atanh(Math.max(-.98,Math.min(.98,x/maxY))),baseY:reach*Math.atanh(Math.max(-.98,Math.min(.98,y/maxX))),touch:e.pointerType==="touch",time:performance.now()};
    vx=vy=0;
    try{el.setPointerCapture(e.pointerId)}catch{/* ponteiro já solto */}
    el.classList.add("is-grabbing");
   };
   const onMove=(e:PointerEvent)=>{
    if(!drag||e.pointerId!==drag.id)return;
    const now=performance.now(),dt=Math.max(.008,(now-drag.time)/1000);drag.time=now;
    const nx=maxY*Math.tanh((drag.baseX+e.clientX-drag.startX)/reach),ny=drag.touch?0:maxX*Math.tanh((drag.baseY-(e.clientY-drag.startY))/reach);
    vx=(nx-x)/dt;vy=(ny-y)/dt;x=nx;y=ny;apply();
   };
   const onUp=(e:PointerEvent)=>{
    if(!drag||e.pointerId!==drag.id)return;
    drag=null;el.classList.remove("is-grabbing");
    if(reducedMotion()){x=y=vx=vy=0;apply();return}
    vx=Math.max(-900,Math.min(900,vx));vy=Math.max(-900,Math.min(900,vy));
    last=performance.now();raf=requestAnimationFrame(settle);
   };
   el.addEventListener("pointerdown",onDown);el.addEventListener("pointermove",onMove);el.addEventListener("pointerup",onUp);el.addEventListener("pointercancel",onUp);
   return()=>{cancelAnimationFrame(raf);el.removeEventListener("pointerdown",onDown);el.removeEventListener("pointermove",onMove);el.removeEventListener("pointerup",onUp);el.removeEventListener("pointercancel",onUp)};
  });
  return()=>cleanups.forEach(f=>f());
 },[]);
}

/**
 * Links internos (#secao): rolagem suave até a seção, fechando o menu do celular.
 * Feito em JS para funcionar também quando o site é exibido dentro de um iframe.
 */
function useInPageLinks(){
 useEffect(()=>{
  const onClick=(e:MouseEvent)=>{
   if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
   const link=(e.target as Element|null)?.closest?.("a[href^='#']");
   if(!link)return;
   const id=decodeURIComponent((link.getAttribute("href")||"").slice(1));
   const target=id?document.getElementById(id):null;
   if(!target)return;
   e.preventDefault();
   document.body.classList.remove("menu-open");
   requestAnimationFrame(()=>{
    target.scrollIntoView({behavior:reducedMotion()?"auto":"smooth",block:"start"});
    if(!target.hasAttribute("tabindex"))target.setAttribute("tabindex","-1");
    target.focus({preventScroll:true});
    try{history.replaceState(null,"","#"+id)}catch{/* iframe sem URL própria */}
   });
  };
  document.addEventListener("click",onClick);
  return()=>document.removeEventListener("click",onClick);
 },[]);
}

/** Seção ativa no menu e tema (claro/escuro) do cabeçalho conforme a seção sob ele. */
function useSectionState(){
 const[active,setActive]=useState("top");
 const[theme,setTheme]=useState<"light"|"dark">("light");
 useEffect(()=>{
  const sections=copy.pt.nav.map(n=>document.getElementById(n.id)).filter((el):el is HTMLElement=>!!el);
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)setActive(e.target.id)}),{rootMargin:"-45% 0px -50% 0px"});
  sections.forEach(s=>io.observe(s));
  const themed=[...document.querySelectorAll<HTMLElement>("[data-theme]")];
  const tio=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)setTheme((e.target as HTMLElement).dataset.theme==="dark"?"dark":"light")}),{rootMargin:"-3% 0px -93% 0px"});
  themed.forEach(s=>tio.observe(s));
  return()=>{io.disconnect();tio.disconnect()};
 },[]);
 return{active,theme};
}

function useScrolled(offset=24){
 const[scrolled,setScrolled]=useState(false);
 useEffect(()=>{
  const onScroll=()=>setScrolled(window.scrollY>offset);
  onScroll();window.addEventListener("scroll",onScroll,{passive:true});
  return()=>window.removeEventListener("scroll",onScroll);
 },[offset]);
 return scrolled;
}

/** Destaca uma disciplina por vez na lateral do hero. */
function useCycle(length:number,ms=2400){
 const[index,setIndex]=useState(0);
 useEffect(()=>{
  if(reducedMotion())return;
  const id=window.setInterval(()=>setIndex(i=>(i+1)%length),ms);
  return()=>window.clearInterval(id);
 },[length,ms]);
 return index;
}

/** PT · EN · IT: troca o idioma sem recarregar; os links também servem para o Google achar cada versão. */
function LangSwitch(){
 const{lang,t,setLang}=useLang();
 return <nav className="lang-switch" aria-label={t.header.language}>
  {languages.map(l=><a key={l.id} href={l.path} hrefLang={l.htmlLang} lang={l.htmlLang} title={l.name} aria-current={l.id===lang?"true":undefined}
   onClick={e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();setLang(l.id)}}>{l.label}</a>)}
 </nav>
}

function Header(){
 const{t}=useLang();
 const{active,theme}=useSectionState();
 const scrolled=useScrolled();
 const[open,setOpen]=useState(false);
 useEffect(()=>{document.body.classList.toggle("menu-open",open)},[open]);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[]);
 return <header className={"site-header theme-"+(open?"dark":theme)+(scrolled?" is-scrolled":"")+(open?" is-open":"")}>
  <a className="brand" href="#top" aria-label={t.header.home}><BrandMark/></a>
  <nav id="menu" className="site-nav" aria-label={t.header.mainNav}>
   {t.nav.map(n=><a key={n.id} href={"#"+n.id} className={active===n.id?"is-active":undefined} aria-current={active===n.id?"true":undefined} onClick={()=>setOpen(false)}>{n.label}</a>)}
   <a className="btn btn-outline nav-cta-mobile" href="#contato" onClick={()=>setOpen(false)}>{t.header.cta} <ArrowRight className="btn-arrow"/></a>
  </nav>
  <div className="header-side">
   <span className="location"><i className="dot"/>{contact.city}</span>
   <LangSwitch/>
   <a className="btn header-cta" href="#contato">{t.header.cta} <ArrowRight className="btn-arrow"/></a>
  </div>
  <button className="menu-toggle" aria-expanded={open} aria-controls="menu" aria-label={open?t.header.closeMenu:t.header.openMenu} onClick={()=>setOpen(o=>!o)}><span/><span/></button>
 </header>
}

/**
 * Camadas da espessura da logo 3D: afinam em perfil circular para trás, deixando a borda arredondada.
 * A da frente (is-edge) é o chanfro claro e duas do meio (is-inlay) formam o filete de cobre na lateral.
 * A quantidade (22) também está no CSS, em .logo3d-layer.
 */
const DEPTH=22;
const layers=Array.from({length:DEPTH},(_,z)=>{const u=(DEPTH-1-z)/(DEPTH-1);return{z,r:(1-.075*(1-Math.sqrt(1-u*u))).toFixed(4),kind:z===DEPTH-1?" is-edge":z===DEPTH-7||z===DEPTH-8?" is-inlay":""}});

/** Logo pequena do cabeçalho e rodapé: versão preta sobre fundos claros, branca sobre escuros. */
function BrandMark(){
 return <span className="brand-mark" aria-hidden="true">
  <img className="is-black" src="/fox-vector-black-mark.svg" alt="" draggable={false}/>
  <img className="is-white" src="/fox-vector-white-mark.svg" alt="" draggable={false}/>
 </span>
}

/**
 * Logo em 3D (preta no topo, branca no contato): SVG vetorizado, nítido em qualquer tamanho.
 * De trás para a frente: anéis, disco de vidro, sombra, espessura em camadas, a arte, o chanfro de luz e o brilho.
 * Gira com o scroll, com o ponteiro e ao ser arrastada (useLogoSpin).
 */
function FoxLogo({tone,speed,depth}:{tone:"black"|"white";speed:string;depth:string}){
 const kind=" tone-"+tone,s=Number(speed),d=Number(depth);
 return <>
  <div className="logo-rings" data-speed={(s*1.25).toFixed(2)} data-depth={(d*.45).toFixed(2)} aria-hidden="true"><i/><i/><i/><b/></div>
  <div className={"logo3d-halo"+kind} data-speed={(s*.7).toFixed(2)} data-depth={(d*.5).toFixed(2)} aria-hidden="true"/>
  <div className={"logo3d-shadow"+kind} data-speed={speed} data-depth={(-d*.8).toFixed(2)} aria-hidden="true"><i/></div>
  <div className={"logo3d"+kind} data-speed={speed} data-depth={depth} aria-hidden="true">
   <div className="logo3d-float">
    <div className="logo3d-rig">
     {layers.map(l=><span key={l.z} className={"logo3d-layer"+l.kind} style={vars({"--z":l.z,"--r":l.r})}/>)}
     <img className="logo3d-face" src={`/fox-vector-${tone}.svg`} alt="" draggable={false} decoding="async"/>
     <span className="logo3d-bevel"/>
     <span className="logo3d-sheen"/>
    </div>
   </div>
  </div>
 </>
}

type Glow={tone:"copper"|"light"|"deep";x:number;y:number;size:number;speed:number;depth:number};
type Bead={x:number;y:number;size:number;speed:number;depth:number;blur?:number;rotate?:number};

/** Esfera de vidro solta no fundo: quanto maior a velocidade (negativa), mais "à frente" ela parece. */
function Orb({bead,index}:{bead:Bead;index:number}){
 return <span className={"orb orb-"+index} data-speed={bead.speed} data-depth={bead.depth} data-rotate={bead.rotate}
  style={{...vars({"--x":bead.x+"%","--y":bead.y+"%","--size":bead.size+"px"}),filter:bead.blur?`blur(${bead.blur}px)`:undefined}}/>
}

/** Luzes e esferas de vidro ao fundo de uma seção, cada uma numa profundidade: é o que o vidro dos cards desfoca. */
function Ambient({glows,beads=[]}:{glows:Glow[];beads?:Bead[]}){
 return <div className="ambient" aria-hidden="true">
  {glows.map((g,i)=><span key={i} className={"glow glow-"+g.tone} data-speed={g.speed} data-depth={g.depth} style={vars({"--x":g.x+"%","--y":g.y+"%","--size":g.size+"vmax"})}/>)}
  {beads.map((b,i)=><Orb key={i} bead={b} index={i}/>)}
 </div>
}

const heroGlows:Glow[]=[
 {tone:"copper",x:66,y:62,size:46,speed:.26,depth:.3},
 {tone:"light",x:40,y:14,size:40,speed:.14,depth:-.2},
 {tone:"deep",x:92,y:10,size:30,speed:.1,depth:-.3},
];
const heroBeads:Bead[]=[
 {x:45,y:22,size:30,speed:-.22,depth:.9},
 {x:79,y:68,size:72,speed:-.34,depth:1.3,rotate:3},
 {x:86,y:15,size:16,speed:.12,depth:.35,blur:1},
 {x:52,y:84,size:46,speed:-.5,depth:1.6,blur:2},
 {x:73,y:9,size:11,speed:.22,depth:.25},
 {x:93,y:86,size:130,speed:-.7,depth:2.2,blur:6},
];

function Hero(){
 const{t}=useLang();
 const current=useCycle(t.disciplines.length);
 return <section id="top" className="hero" data-theme="light" data-scene>
  <div className="hero-scene" aria-hidden="true">
   {heroGlows.map((g,i)=><span key={i} className={"glow glow-"+g.tone} data-speed={g.speed} data-depth={g.depth} style={vars({"--x":g.x+"%","--y":g.y+"%","--size":g.size+"vmax"})}/>)}
   <div className="hero-word" data-speed=".3" data-speed-x="-.35">Volpe</div>
   <span className="hero-line hero-line-a" data-speed=".08"/><span className="hero-line hero-line-b" data-speed="-.1"/>
   <FoxLogo tone="black" speed=".16" depth=".45"/>
   {heroBeads.map((b,i)=><Orb key={i} bead={b} index={i}/>)}
  </div>

  <div className="hero-inner">
   <div className="hero-copy" data-speed=".1" data-depth="-.06">
    <p className="hero-kicker glass" data-reveal><i className="dot"/>{t.hero.kicker}</p>
    <h1 data-reveal>{t.hero.title.split("\n").map((line,i)=><span key={i}>{emphasis(line)}</span>)}</h1>
    <p className="hero-lede" data-reveal>{t.hero.lede}</p>
    <div className="hero-actions" data-reveal>
     <a className="btn btn-dark" href={whatsappUrl(t)} target="_blank" rel="noopener noreferrer">{t.hero.quote} <ArrowRight className="btn-arrow"/></a>
     <a className="play-link glass" href="#servicos"><span className="play-ring"><ArrowRight className="play-arrow"/></span>{t.hero.plans}</a>
    </div>
   </div>
  </div>

  <div className="hero-areas glass" data-speed="-.12" data-depth=".55">
   <p className="hero-areas-title" aria-hidden="true">{t.hero.areas}</p>
   <ul className="hero-disciplines" aria-label={t.hero.areas}>
    {t.disciplines.map((d,i)=><li key={i} className={i===current?"is-current":undefined}>{d}</li>)}
   </ul>
  </div>
  <a className="hero-scroll" href="#projetos" aria-label={t.hero.scroll}>Scroll<i/></a>
  <p className="hero-signature glass" data-speed="-.2" data-depth=".75"><i/>{t.hero.signature}</p>
 </section>
}

function ProjectMark({logo}:{logo:Project["logo"]}){
 if("image" in logo)return <img className="project-logo-img" src={logo.image} alt="" draggable={false}/>;
 if(!logo.script)return <>{logo.text}</>;
 const [before,after]=logo.text.split(" "+logo.script+" ");
 return <>{before} <i>{logo.script}</i> {after}</>;
}

const projectGlows:Glow[]=[
 {tone:"copper",x:72,y:34,size:48,speed:.24,depth:.4},
 {tone:"deep",x:50,y:74,size:34,speed:-.2,depth:-.3},
 {tone:"light",x:94,y:84,size:36,speed:.12,depth:.2},
 {tone:"light",x:12,y:20,size:34,speed:-.14,depth:.3},
];
const projectBeads:Bead[]=[
 {x:38,y:10,size:58,speed:-.32,depth:1.1,rotate:2},
 {x:96,y:46,size:26,speed:-.5,depth:1.5,blur:1},
 {x:31,y:86,size:16,speed:.16,depth:.4},
];
/** Velocidade dos cards de projeto no parallax: os vizinhos de linha andam em ritmos diferentes; os de cima e de baixo, juntos (não se encostam). */
const projectSpeeds=[".04","-.05"];

function Projects(){
 const{t}=useLang();
 return <section id="projetos" className="projects" data-theme="light">
  <Ambient glows={projectGlows} beads={projectBeads}/>
  <div className="bg-word projects-word" data-speed-x=".28" aria-hidden="true">{t.projects.label}</div>
  <div className="projects-copy" data-speed=".08">
   <div data-reveal>
    <p className="label"><i className="dot"/>{t.projects.label}</p>
    <h2><Rich text={t.projects.title}/></h2>
    <p className="section-lede">{t.projects.lede}</p>
    <a className="text-cta" href="#contato"><i className="dot"/>{t.projects.cta} <ArrowRight className="btn-arrow"/></a>
   </div>
  </div>
  <ul className="project-grid">
   {projects.filter(p=>!p.hidden).map((p,i)=><li key={p.title} className={"text" in p.logo&&p.logo.text.length>10?"is-wide":undefined} data-speed={projectSpeeds[i%projectSpeeds.length]}>
    <a className={"project-card glass"+("font" in p.logo?" font-"+p.logo.font:" has-image")} href={p.url} target="_blank" rel="noopener noreferrer" data-tilt="6" data-reveal style={vars({"--i":i})} aria-label={p.title+" — "+t.projects.open}>
     <span className="project-card-top" aria-hidden="true"><span className="project-index">{String(i+1).padStart(2,"0")}</span><span className="project-logo-go"><ArrowUpRight/></span></span>
     <span className="project-logo-mark"><ProjectMark logo={p.logo}/></span>
    </a>
   </li>)}
  </ul>
 </section>
}

function Marquee(){
 const{t}=useLang();
 const words=[...t.disciplines,...t.disciplines,...t.disciplines];
 return <div className="marquee" data-theme="dark" aria-hidden="true">
  <div className="marquee-row" data-speed-x=".55">{words.map((w,i)=><span key={i}>{w}<i/></span>)}</div>
  <div className="marquee-row is-outline" data-speed-x="-.55">{words.map((w,i)=><span key={i}>{w}<i/></span>)}</div>
 </div>
}

/**
 * Giro 3D dos detalhes: o card vira até ficar de lado (0° → 90°) e os detalhes completam o giro
 * (-90° → 0°) saindo da posição dele até o centro. Ao fechar, o caminho inverso.
 */
const flipEaseIn="cubic-bezier(.55,0,.75,.2)",flipEaseOut="cubic-bezier(.2,.8,.2,1)";
const flipRest="translate(0px,0px) perspective(1400px) rotateY(0deg) scale(1,1)";
function turnCard(card:HTMLElement){
 // parte da posição de repouso do card (--lift), sem a inclinação do ponteiro
 const b=`translateY(${getComputedStyle(card).getPropertyValue("--lift").trim()||"0px"})`;
 return card.animate([{transform:`perspective(1400px) ${b} rotateY(0deg)`,opacity:1},{opacity:1,offset:.85},{transform:`perspective(1400px) ${b} rotateY(90deg)`,opacity:0}],{duration:300,easing:flipEaseIn,fill:"forwards"});
}
/** Transform que põe os detalhes no lugar e no tamanho do card (o tamanho vem do layout, já que o card girado fica estreito). */
function atCard(d:HTMLElement,card:HTMLElement,angle:number){
 const c=card.getBoundingClientRect(),r=d.getBoundingClientRect();
 return `translate(${c.left+c.width/2-(r.left+r.width/2)}px,${c.top+c.height/2-(r.top+r.height/2)}px) perspective(1400px) rotateY(${angle}deg) scale(${card.offsetWidth/r.width},${card.offsetHeight/r.height})`;
}

function PlanDialog({selected,onClose}:{selected:{index:number;card:HTMLElement}|null;onClose:()=>void}){
 const{lang,t}=useLang();
 const plan=selected?plansFor(lang)[selected.index]:null;
 const ref=useRef<HTMLDialogElement>(null);
 const turn=useRef<Animation|null>(null);
 const closing=useRef(false);
 useEffect(()=>{
  const d=ref.current;if(!d)return;
  if(selected&&!d.open){
   d.showModal();
   if(reducedMotion())return;
   turn.current=turnCard(selected.card);
   d.animate([{transform:atCard(d,selected.card,-90),opacity:0},{opacity:1,offset:.15},{transform:flipRest,opacity:1}],{duration:560,delay:280,easing:flipEaseOut,fill:"backwards"});
  }
  if(!selected&&d.open)d.close();
 },[selected]);
 const requestClose=()=>{
  const d=ref.current;
  if(!d||closing.current)return;
  if(!selected||!turn.current){d.close();return}
  closing.current=true;
  d.getAnimations().forEach(a=>a.cancel());
  d.classList.add("is-closing");
  d.animate([{transform:flipRest,opacity:1},{opacity:1,offset:.85},{transform:atCard(d,selected.card,-90),opacity:0}],{duration:340,easing:flipEaseIn,fill:"forwards"})
   .finished.then(a=>{d.close();a.cancel()},()=>{});
 };
 const onClosed=()=>{
  closing.current=false;
  ref.current?.classList.remove("is-closing");
  const a=turn.current;turn.current=null;
  if(a){a.reverse();a.finished.then(()=>a.cancel(),()=>{})}
  onClose();
 };
 return <dialog ref={ref} className="plan-dialog" onClose={onClosed} onCancel={e=>{e.preventDefault();requestClose()}} onClick={e=>{if(e.target===ref.current)requestClose()}} aria-labelledby="plan-dialog-title">
  {plan&&<div className="plan-dialog-body">
   <button className="dialog-close" onClick={requestClose} aria-label={t.plansSection.closeDetails}>×</button>
   <p className="label"><i className="dot"/>{t.plansSection.plan} {plan.number}</p>
   <h3 id="plan-dialog-title">{plan.name}</h3>
   <p className="plan-intro">{plan.intro}</p>
   <p className="plan-price">{plan.price}<small> {t.plansSection.perProject}</small></p>
   {plan.note&&<p className="plan-note">{plan.note}</p>}
   <dl className="plan-facts">{[
    [t.labels.deadline,plan.details.deadline],[t.labels.revisions,plan.details.revisions],[t.labels.support,plan.details.support],[t.labels.payment,t.payment.full],
   ].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
   <div className="plan-lists">
    <ul>{plan.items.map(x=><li key={x}><Check/>{x}</li>)}</ul>
    <ul>{plan.extras.map(x=><li key={x}><Check/>{x}</li>)}</ul>
   </div>
   <a className="btn btn-light" href={`mailto:${contact.email}?subject=${encodeURIComponent(t.plansSection.subject.replace("{plan}",plan.name))}`}>{t.plansSection.choose} <ArrowRight className="btn-arrow"/></a>
  </div>}
 </dialog>
}

const planGlows:Glow[]=[
 {tone:"copper",x:40,y:22,size:38,speed:.22,depth:.5},
 {tone:"light",x:66,y:8,size:26,speed:-.16,depth:-.4},
 {tone:"copper",x:90,y:70,size:40,speed:-.24,depth:.6},
 {tone:"light",x:52,y:96,size:24,speed:.3,depth:.3},
];
const planBeads:Bead[]=[
 {x:30,y:16,size:44,speed:-.36,depth:1.2,rotate:2},
 {x:95,y:30,size:18,speed:.14,depth:.4},
 {x:26,y:90,size:22,speed:-.5,depth:1.4,blur:1},
];

function Plans(){
 const{lang,t}=useLang();
 const[selected,setSelected]=useState<{index:number;card:HTMLElement}|null>(null);
 return <section id="servicos" className="plans" data-theme="dark">
  <Ambient glows={planGlows} beads={planBeads}/>
  <div className="bg-word plans-word" data-speed-x=".3" aria-hidden="true">{t.plansSection.word}</div>
  <div className="plans-copy" data-speed=".1">
   <div data-reveal>
    <p className="label"><i className="dot"/>{t.plansSection.label}</p>
    <h2><Rich text={t.plansSection.title}/></h2>
    <p className="section-lede">{t.plansSection.lede}</p>
    <ArrowRight className="long-arrow"/>
   </div>
  </div>
  <div className="plan-grid">
   {plansFor(lang).map((p,i)=><div key={p.name} className="plan-slot" data-speed={[".04","-.08",".1"][i]}>
    <article className={"plan-card glass"+(p.featured?" is-featured":"")} data-tilt="5" data-reveal style={vars({"--i":i})}>
     {p.featured&&<span className="plan-badge">{t.plansSection.featured}</span>}
     <span className="plan-number">{p.number}</span>
     <h3>{p.name}</h3>
     <p className="plan-intro">{p.intro}</p>
     <p className="plan-price">{p.price}</p>
     <p className="plan-deadline">{t.labels.deadline}: {p.details.deadline}</p>
     <p className="plan-payment">{t.payment.parts.map((x,i)=><Fragment key={i}>{i>0&&" · "}<span>{x}</span></Fragment>)}</p>
     {p.note&&<p className="plan-note">{p.note}</p>}
     <ul className="plan-items">{p.items.map(x=><li key={x}><Check/>{x}</li>)}</ul>
     <button className={"btn "+(p.featured?"btn-light":"btn-outline")+" plan-button"} onClick={e=>{const card=e.currentTarget.closest<HTMLElement>(".plan-card");if(card)setSelected({index:i,card})}} aria-haspopup="dialog"><span className="btn-dash" aria-hidden="true"/>{t.plansSection.seeDetails}<ArrowRight className="btn-arrow"/></button>
    </article>
   </div>)}
  </div>
  <p className="plans-aside" aria-hidden="true" data-speed="-.12">{t.plansSection.aside[0]}<br/>{t.plansSection.aside[1]}<br/><span><i className="dot"/>{t.plansSection.aside[2]}</span></p>
  <PlanDialog selected={selected} onClose={()=>setSelected(null)}/>
 </section>
}

const aboutGlows:Glow[]=[
 {tone:"copper",x:84,y:30,size:46,speed:.24,depth:.4},
 {tone:"deep",x:62,y:70,size:32,speed:-.2,depth:-.3},
 {tone:"light",x:20,y:60,size:40,speed:.12,depth:.2},
];
const aboutBeads:Bead[]=[
 {x:47,y:20,size:52,speed:-.34,depth:1.1,rotate:2},
 {x:96,y:78,size:28,speed:-.5,depth:1.5,blur:1},
 {x:6,y:88,size:14,speed:.16,depth:.4},
];

function About(){
 const{t}=useLang();
 return <section id="sobre" className="about" data-theme="light">
  <Ambient glows={aboutGlows} beads={aboutBeads}/>
  <div className="bg-word about-word" data-speed-x="-.3" aria-hidden="true">{t.about.word}</div>
  <div className="about-copy" data-speed=".12">
   <div data-reveal>
    <p className="label"><i className="dot"/>{t.about.label}</p>
    <h2><Rich text={t.about.title}/></h2>
    <p className="section-lede">{t.about.lede}</p>
    <ul className="stack">{stack.map(s=><li key={s}>{s}</li>)}</ul>
   </div>
  </div>
  <ol className="process">
   {t.steps.map((s,i)=><li key={i} data-speed={(-.03-i*.03).toFixed(3)}>
    <div className="process-row glass" data-tilt="4" data-reveal style={vars({"--i":i})}>
     <span className="process-number">0{i+1}</span>
     <div><h3>{s.title}</h3><p>{s.text}</p></div>
    </div>
   </li>)}
  </ol>
 </section>
}

function CopyEmail(){
 const{t}=useLang();
 const[copied,setCopied]=useState(false);
 const copy=()=>{
  const done=()=>{setCopied(true);window.setTimeout(()=>setCopied(false),2400)};
  const select=()=>{const el=document.querySelector("a.contact-mail[href^='mailto:']");const sel=window.getSelection();if(el&&sel){const r=document.createRange();r.selectNodeContents(el);sel.removeAllRanges();sel.addRange(r)}};
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(contact.email).then(done,select);else select();
 };
 return <button type="button" className="copy-mail" onClick={copy} aria-live="polite">{copied?t.contact.copied:t.contact.copy}</button>
}

const contactGlows:Glow[]=[
 {tone:"copper",x:76,y:54,size:46,speed:.2,depth:.3},
 {tone:"light",x:88,y:10,size:22,speed:-.14,depth:-.3},
 {tone:"copper",x:10,y:92,size:32,speed:-.2,depth:.5},
];
const contactBeads:Bead[]=[
 {x:58,y:16,size:36,speed:-.3,depth:1.1,rotate:2},
 {x:94,y:74,size:60,speed:-.46,depth:1.5,blur:1},
 {x:52,y:88,size:14,speed:.16,depth:.4},
];

function Contact(){
 const{t}=useLang();
 return <section id="contato" className="contact" data-theme="dark" data-scene>
  <Ambient glows={contactGlows} beads={contactBeads}/>
  <div className="bg-word contact-word" data-speed-x="-.26" aria-hidden="true">{t.contact.label}</div>
  <FoxLogo tone="white" speed=".12" depth=".4"/>
  <div className="contact-inner" data-speed="-.05">
   <div data-reveal>
    <p className="label"><i className="dot"/>{t.contact.label}</p>
    <h2><Rich text={t.contact.title}/></h2>
    <p className="section-lede">{t.contact.lede}</p>
    <div className="contact-actions">
     <a className="btn btn-light" href={whatsappUrl(t)} target="_blank" rel="noopener noreferrer">{t.contact.whatsappButton} <ArrowRight className="btn-arrow"/></a>
     <a className="btn btn-outline" href={`mailto:${contact.email}?subject=${encodeURIComponent(t.contact.subject)}`}>{t.contact.emailButton} <ArrowRight className="btn-arrow"/></a>
    </div>
    <dl className="contact-list glass">
     <div><dt>WhatsApp</dt><dd><a className="contact-mail" href={whatsappUrl(t)} target="_blank" rel="noopener noreferrer">{contact.whatsapp.display}</a></dd></div>
     <div><dt>{t.contact.email}</dt><dd><a className="contact-mail" href={"mailto:"+contact.email}>{contact.email}</a><CopyEmail/></dd></div>
    </dl>
   </div>
  </div>
 </section>
}

function Footer(){
 const{t}=useLang();
 return <footer className="site-footer" data-theme="dark">
  <a className="brand" href="#top" aria-label={t.footer.backToTop}><BrandMark/><span>Volpe</span></a>
  <p>© {new Date().getFullYear()} Vitor Volpato · {contact.city}</p>
  <nav aria-label={t.footer.nav}>{t.nav.slice(1).map(n=><a key={n.id} href={"#"+n.id}>{n.label}</a>)}<a href="#top">{t.footer.top}</a></nav>
 </footer>
}

/** Título, descrição, idioma e endereço canônico da página acompanham o idioma escolhido. */
function useDocumentLang(lang:Lang){
 useEffect(()=>{
  const l=languages.find(x=>x.id===lang)!,m=copy[lang].meta;
  document.documentElement.lang=l.htmlLang;
  document.title=m.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content",m.description);
  document.querySelector('link[rel="canonical"]')?.setAttribute("href",site+l.path);
 },[lang]);
}

function App(){
 const[lang,setLangState]=useState<Lang>(()=>langFromPath(location.pathname));
 const setLang=(l:Lang)=>{
  if(l===lang)return;
  try{history.pushState(null,"",languages.find(x=>x.id===l)!.path+location.hash)}catch{/* iframe sem URL própria */}
  setLangState(l);
 };
 useEffect(()=>{const onPop=()=>setLangState(langFromPath(location.pathname));window.addEventListener("popstate",onPop);return()=>window.removeEventListener("popstate",onPop)},[]);
 useDocumentLang(lang);
 useReveal();useParallax();useTilt();useLogoSpin();useInPageLinks();
 const t=copy[lang];
 return <LangContext.Provider value={{lang,t,setLang}}>
  <a className="skip-link" href="#projetos">{t.skip}</a>
  <Header/>
  <main>
   <Hero/>
   <Projects/>
   <Marquee/>
   <Plans/>
   <About/>
   <Contact/>
  </main>
  <Footer/>
 </LangContext.Provider>
}

createRoot(document.getElementById("root")!).render(<StrictMode><App/></StrictMode>);
