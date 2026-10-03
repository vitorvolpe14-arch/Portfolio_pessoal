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

type Layer={el:HTMLElement;center:number;top:number;bottom:number;speed:number;speedX:number;depth:number};

/**
 * Motor de parallax.
 * - data-speed: deslocamento vertical relativo ao scroll (positivo = mais "ao fundo", negativo = mais "à frente").
 * - data-speed-x: deslocamento horizontal conforme o scroll.
 * - data-depth: deslocamento conforme o ponteiro (desktop).
 * Os valores viram as variáveis --sx/--sy/--mx/--my, aplicadas via `translate` no CSS.
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
   const els=[...document.querySelectorAll<HTMLElement>("[data-speed],[data-speed-x],[data-depth]")];
   els.forEach(el=>{el.style.removeProperty("--sy");el.style.removeProperty("--sx")});
   const y=window.scrollY;
   layers=els.map(el=>{
    const r=el.getBoundingClientRect();
    return{el,center:r.top+y+r.height/2,top:r.top+y,bottom:r.bottom+y,speed:Number(el.dataset.speed||0),speedX:Number(el.dataset.speedX||0),depth:Number(el.dataset.depth||0)};
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
   <a className="btn btn-outline" href="#contato">{t.header.cta} <ArrowRight className="btn-arrow"/></a>
  </div>
  <button className="menu-toggle" aria-expanded={open} aria-controls="menu" aria-label={open?t.header.closeMenu:t.header.openMenu} onClick={()=>setOpen(o=>!o)}><span/><span/></button>
 </header>
}

/** Camadas da espessura: afinam em perfil circular para trás, deixando a borda da logo arredondada. */
const layers=Array.from({length:20},(_,z)=>{const u=(19-z)/19;return{z,r:(1-.075*(1-Math.sqrt(1-u*u))).toFixed(4)}});

/** Logo pequena do cabeçalho e rodapé: versão preta sobre fundos claros, branca sobre escuros. */
function BrandMark(){
 return <span className="brand-mark" aria-hidden="true">
  <img className="is-black" src="/fox-vector-black-mark.svg" alt="" draggable={false}/>
  <img className="is-white" src="/fox-vector-white-mark.svg" alt="" draggable={false}/>
 </span>
}

/** Logo em 3D (preta no topo, branca no contato): SVG vetorizado, nítido em qualquer tamanho. */
function FoxLogo({tone,speed,depth}:{tone:"black"|"white";speed:string;depth:string}){
 const kind=" tone-"+tone;
 return <>
  <div className={"logo3d-shadow"+kind} data-speed={speed} data-depth={(-Number(depth)*.8).toFixed(2)} aria-hidden="true"/>
  <div className={"logo3d"+kind} data-speed={speed} data-depth={depth} aria-hidden="true">
   <div className="logo3d-float">
    <div className="logo3d-rig">
     {layers.map(l=><span key={l.z} className="logo3d-layer" style={vars({"--z":l.z,"--r":l.r})}/>)}
     <img className="logo3d-face" src={`/fox-vector-${tone}.svg`} alt="" draggable={false} decoding="async"/>
    </div>
   </div>
  </div>
 </>
}

const orbs=[
 {x:45,y:22,size:26,speed:-.22,depth:.9,blur:0},
 {x:78,y:66,size:64,speed:-.34,depth:1.3,blur:0},
 {x:85,y:17,size:14,speed:.12,depth:.35,blur:1},
 {x:53,y:84,size:42,speed:-.5,depth:1.6,blur:2},
 {x:74,y:10,size:10,speed:.22,depth:.25,blur:0},
 {x:93,y:86,size:120,speed:-.7,depth:2.2,blur:7},
];

function Hero(){
 const{t}=useLang();
 const current=useCycle(t.disciplines.length);
 return <section id="top" className="hero" data-theme="light" data-scene>
  <div className="hero-scene" aria-hidden="true">
   <div className="hero-word" data-speed=".3" data-speed-x="-.35">Volpe</div>
   <div className="hero-rings" data-speed=".2" data-depth=".2"><i/><i/><i/><b/></div>
   <span className="hero-line hero-line-a" data-speed=".08"/><span className="hero-line hero-line-b" data-speed="-.1"/>
   <FoxLogo tone="black" speed=".16" depth=".45"/>
   {orbs.map((o,i)=><span key={i} className={"orb orb-"+i} data-speed={o.speed} data-depth={o.depth} style={vars({"--x":o.x+"%","--y":o.y+"%","--size":o.size+"px","--blur":o.blur+"px"})}/>)}
  </div>

  <div className="hero-inner">
   <div className="hero-copy" data-speed=".1" data-depth="-.06">
    <p className="hero-kicker" data-reveal>{t.hero.kicker}</p>
    <h1 data-reveal>{t.hero.title.split("\n").map((line,i)=><span key={i}>{emphasis(line)}</span>)}</h1>
    <p className="hero-lede" data-reveal>{t.hero.lede}</p>
    <div className="hero-actions" data-reveal>
     <a className="btn btn-dark" href={whatsappUrl(t)} target="_blank" rel="noopener noreferrer">{t.hero.quote} <ArrowRight className="btn-arrow"/></a>
     <a className="play-link" href="#servicos"><span className="play-ring"><ArrowRight className="play-arrow"/></span>{t.hero.plans}</a>
    </div>
   </div>
  </div>

  <ul className="hero-disciplines" aria-label={t.hero.areas} data-speed=".14" data-depth="-.15">
   {t.disciplines.map((d,i)=><li key={i} className={i===current?"is-current":undefined}>{d}</li>)}
  </ul>
  <a className="hero-scroll" href="#projetos" aria-label={t.hero.scroll}>Scroll<i/></a>
  <p className="hero-signature" data-speed=".08">{t.hero.signature}<i/></p>
 </section>
}

function ProjectMark({logo}:{logo:Project["logo"]}){
 if("image" in logo)return <img className="project-logo-img" src={logo.image} alt="" draggable={false}/>;
 if(!logo.script)return <>{logo.text}</>;
 const [before,after]=logo.text.split(" "+logo.script+" ");
 return <>{before} <i>{logo.script}</i> {after}</>;
}

function Projects(){
 const{t}=useLang();
 return <section id="projetos" className="projects" data-theme="light">
  <div className="projects-copy" data-speed=".08">
   <div data-reveal>
    <p className="label"><i className="dot"/>{t.projects.label}</p>
    <h2><Rich text={t.projects.title}/></h2>
    <p className="section-lede">{t.projects.lede}</p>
    <a className="text-cta" href="#contato"><i className="dot"/>{t.projects.cta} <ArrowRight className="btn-arrow"/></a>
   </div>
  </div>
  <ul className="project-logos">
   {projects.filter(p=>!p.hidden).map((p,i)=><li key={p.title} data-speed={i%2?".04":"-.04"}>
    <a className={"project-logo"+("font" in p.logo?" font-"+p.logo.font:" has-image")} href={p.url} target="_blank" rel="noopener noreferrer" data-reveal style={vars({"--i":i})} aria-label={p.title+" — "+t.projects.open}>
     <span className="project-logo-mark"><ProjectMark logo={p.logo}/></span>
     <span className="project-logo-go" aria-hidden="true"><ArrowUpRight/></span>
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

function PlanDialog({index,onClose}:{index:number|null;onClose:()=>void}){
 const{lang,t}=useLang();
 const plan=index===null?null:plansFor(lang)[index];
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  const d=ref.current;if(!d)return;
  if(plan&&!d.open)d.showModal();
  if(!plan&&d.open)d.close();
 },[plan]);
 return <dialog ref={ref} className="plan-dialog" onClose={onClose} onClick={e=>{if(e.target===ref.current)onClose()}} aria-labelledby="plan-dialog-title">
  {plan&&<div className="plan-dialog-body">
   <button className="dialog-close" onClick={onClose} aria-label={t.plansSection.closeDetails}>×</button>
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

function Plans(){
 const{lang,t}=useLang();
 const[selected,setSelected]=useState<number|null>(null);
 return <section id="servicos" className="plans" data-theme="dark">
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
    <article className={"plan-card"+(p.featured?" is-featured":"")} data-reveal style={vars({"--i":i})}>
     {p.featured&&<span className="plan-badge">{t.plansSection.featured}</span>}
     <span className="plan-number">{p.number}</span>
     <h3>{p.name}</h3>
     <p className="plan-intro">{p.intro}</p>
     <p className="plan-price">{p.price}</p>
     <p className="plan-deadline">{t.labels.deadline}: {p.details.deadline}</p>
     <p className="plan-payment">{t.payment.parts.map((x,i)=><Fragment key={i}>{i>0&&" · "}<span>{x}</span></Fragment>)}</p>
     {p.note&&<p className="plan-note">{p.note}</p>}
     <ul className="plan-items">{p.items.map(x=><li key={x}><Check/>{x}</li>)}</ul>
     <button className={"btn "+(p.featured?"btn-light":"btn-outline")+" plan-button"} onClick={()=>setSelected(i)} aria-haspopup="dialog"><span className="btn-dash" aria-hidden="true"/>{t.plansSection.seeDetails}<ArrowRight className="btn-arrow"/></button>
    </article>
   </div>)}
  </div>
  <p className="plans-aside" aria-hidden="true" data-speed="-.12">{t.plansSection.aside[0]}<br/>{t.plansSection.aside[1]}<br/><span><i className="dot"/>{t.plansSection.aside[2]}</span></p>
  <PlanDialog index={selected} onClose={()=>setSelected(null)}/>
 </section>
}

function About(){
 const{t}=useLang();
 return <section id="sobre" className="about" data-theme="light">
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
   {t.steps.map((s,i)=><li key={i} data-speed={(-.03-i*.025).toFixed(3)}>
    <div className="process-row" data-reveal style={vars({"--i":i})}>
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

function Contact(){
 const{t}=useLang();
 return <section id="contato" className="contact" data-theme="dark" data-scene>
  <div className="contact-glow" data-speed=".2" aria-hidden="true"/>
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
    <dl className="contact-list">
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
 useReveal();useParallax();useInPageLinks();
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
