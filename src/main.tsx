import{StrictMode,useEffect,useRef,useState,type CSSProperties}from"react";
import{createRoot}from"react-dom/client";
import"./styles.css";
import{contact,disciplines,nav,plans,projects,stack,steps,type Plan}from"./content";
import{ArrowRight,ArrowUpRight,Check}from"./art";

document.documentElement.classList.add("js");

const reducedMotion=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const vars=(v:Record<string,string|number>)=>v as CSSProperties;

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
  const sections=nav.map(n=>document.getElementById(n.id)).filter((el):el is HTMLElement=>!!el);
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

function Header(){
 const{active,theme}=useSectionState();
 const scrolled=useScrolled();
 const[open,setOpen]=useState(false);
 useEffect(()=>{document.body.classList.toggle("menu-open",open)},[open]);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[]);
 return <header className={"site-header theme-"+(open?"dark":theme)+(scrolled?" is-scrolled":"")+(open?" is-open":"")}>
  <a className="brand" href="#top" aria-label="Volpe — início"><BrandMark/></a>
  <nav id="menu" className="site-nav" aria-label="Principal">
   {nav.map(n=><a key={n.id} href={"#"+n.id} className={active===n.id?"is-active":undefined} aria-current={active===n.id?"true":undefined} onClick={()=>setOpen(false)}>{n.label}</a>)}
   <a className="btn btn-outline nav-cta-mobile" href="#contato" onClick={()=>setOpen(false)}>Vamos conversar <ArrowRight className="btn-arrow"/></a>
  </nav>
  <div className="header-side">
   <span className="location"><i className="dot"/>{contact.city}</span>
   <a className="btn btn-outline" href="#contato">Vamos conversar <ArrowRight className="btn-arrow"/></a>
  </div>
  <button className="menu-toggle" aria-expanded={open} aria-controls="menu" aria-label={open?"Fechar menu":"Abrir menu"} onClick={()=>setOpen(o=>!o)}><span/><span/></button>
 </header>
}

/** Logo Volpe em 3D: camadas empilhadas formam a espessura e a face é a raposa com textura aveludada. */
/** Camadas da espessura: afinam em perfil circular para trás, deixando a borda da logo arredondada. */
const layers=Array.from({length:20},(_,z)=>{const u=(19-z)/19;return{z,r:(1-.075*(1-Math.sqrt(1-u*u))).toFixed(4)}});

/** Logo pequena do cabeçalho e rodapé: versão preta sobre fundos claros, branca sobre escuros. */
function BrandMark(){
 return <span className="brand-mark" aria-hidden="true">
  <img className="is-black" src="/fox-fur-black.webp" alt="" draggable={false}/>
  <img className="is-white" src="/fox-fur-white.webp" alt="" draggable={false}/>
 </span>
}

function FurLogo({tone,speed,depth}:{tone:"black"|"white";speed:string;depth:string}){
 return <>
  <div className={"logo3d-shadow tone-"+tone} data-speed={speed} data-depth={(-Number(depth)*.8).toFixed(2)} aria-hidden="true"/>
  <div className={"logo3d tone-"+tone} data-speed={speed} data-depth={depth} aria-hidden="true">
   <div className="logo3d-float">
    <div className="logo3d-rig">
     {layers.map(l=><span key={l.z} className="logo3d-layer" style={vars({"--z":l.z,"--r":l.r})}/>)}
     <img className="logo3d-face" src={tone==="black"?"/fox-fur-black.webp":"/fox-fur-white.webp"} alt="" draggable={false} decoding="async"/>
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
 const current=useCycle(disciplines.length);
 return <section id="top" className="hero" data-theme="light" data-scene>
  <div className="hero-scene" aria-hidden="true">
   <div className="hero-word" data-speed=".3" data-speed-x="-.35">Volpe</div>
   <div className="hero-rings" data-speed=".2" data-depth=".2"><i/><i/><i/><b/></div>
   <span className="hero-line hero-line-a" data-speed=".08"/><span className="hero-line hero-line-b" data-speed="-.1"/>
   <FurLogo tone="black" speed=".16" depth=".45"/>
   {orbs.map((o,i)=><span key={i} className={"orb orb-"+i} data-speed={o.speed} data-depth={o.depth} style={vars({"--x":o.x+"%","--y":o.y+"%","--size":o.size+"px","--blur":o.blur+"px"})}/>)}
  </div>

  <div className="hero-inner">
   <div className="hero-copy" data-speed=".1" data-depth="-.06">
    <p className="hero-kicker" data-reveal>Vitor Volpato / Desenvolvedor de sites</p>
    <h1 data-reveal><span>Desenvolvo</span><span>sites que</span><span><em>vendem.</em></span></h1>
    <p className="hero-lede" data-reveal>Crio sites institucionais e lojas virtuais sob medida para a sua marca, do design à publicação no ar.</p>
    <div className="hero-actions" data-reveal>
     <a className="btn btn-dark" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Pedir orçamento <ArrowRight className="btn-arrow"/></a>
     <a className="play-link" href="#servicos"><span className="play-ring"><ArrowRight className="play-arrow"/></span>Ver planos e preços</a>
    </div>
   </div>
  </div>

  <ul className="hero-disciplines" aria-label="Áreas de atuação" data-speed=".14" data-depth="-.15">
   {disciplines.map((d,i)=><li key={d} className={i===current?"is-current":undefined}>{d}</li>)}
  </ul>
  <a className="hero-scroll" href="#projetos" aria-label="Rolar para projetos">Scroll<i/></a>
  <p className="hero-signature" data-speed=".08">Sites sob medida<br/>para marcas que querem vender<i/></p>
 </section>
}

function Projects(){
 return <section id="projetos" className="projects" data-theme="light">
  <div className="projects-copy" data-speed=".08">
   <div data-reveal>
    <p className="label"><i className="dot"/>Projetos</p>
    <h2>Marcas reais.<br/><em>Resultados reais.</em></h2>
    <p className="section-lede">Sites e lojas virtuais que desenvolvi para marcas reais. Clique na logo para visitar.</p>
    <a className="text-cta" href="#contato"><i className="dot"/>Quero um projeto assim <ArrowRight className="btn-arrow"/></a>
   </div>
  </div>
  <ul className="project-logos">
   {projects.map((p,i)=><li key={p.title} data-speed={i%2?".04":"-.04"}>
    <a className={"project-logo font-"+p.font} href={p.url} target="_blank" rel="noopener noreferrer" data-reveal style={vars({"--i":i})} aria-label={p.title+" — abrir o site em nova aba"}>
     <span className="project-logo-mark">{p.wordmark}</span>
     <span className="project-logo-go" aria-hidden="true"><ArrowUpRight/></span>
    </a>
   </li>)}
  </ul>
 </section>
}

function Marquee(){
 const words=[...disciplines,...disciplines,...disciplines];
 return <div className="marquee" data-theme="dark" aria-hidden="true">
  <div className="marquee-row" data-speed-x=".55">{words.map((w,i)=><span key={i}>{w}<i/></span>)}</div>
  <div className="marquee-row is-outline" data-speed-x="-.55">{words.map((w,i)=><span key={i}>{w}<i/></span>)}</div>
 </div>
}

function PlanDialog({plan,onClose}:{plan:Plan|null;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  const d=ref.current;if(!d)return;
  if(plan&&!d.open)d.showModal();
  if(!plan&&d.open)d.close();
 },[plan]);
 return <dialog ref={ref} className="plan-dialog" onClose={onClose} onClick={e=>{if(e.target===ref.current)onClose()}} aria-labelledby="plan-dialog-title">
  {plan&&<div className="plan-dialog-body">
   <button className="dialog-close" onClick={onClose} aria-label="Fechar detalhes">×</button>
   <p className="label"><i className="dot"/>Plano {plan.number}</p>
   <h3 id="plan-dialog-title">{plan.name}</h3>
   <p className="plan-intro">{plan.intro}</p>
   <p className="plan-price">{plan.price}<small> / projeto</small></p>
   <dl className="plan-facts">{plan.details.map(d=><div key={d.label}><dt>{d.label}</dt><dd>{d.value}</dd></div>)}</dl>
   <div className="plan-lists">
    <ul>{plan.items.map(x=><li key={x}><Check/>{x}</li>)}</ul>
    <ul>{plan.extras.map(x=><li key={x}><Check/>{x}</li>)}</ul>
   </div>
   <a className="btn btn-light" href={`mailto:${contact.email}?subject=${encodeURIComponent("Interesse no plano "+plan.name)}`}>Quero este plano <ArrowRight className="btn-arrow"/></a>
  </div>}
 </dialog>
}

function Plans(){
 const[selected,setSelected]=useState<Plan|null>(null);
 return <section id="servicos" className="plans" data-theme="dark">
  <div className="bg-word plans-word" data-speed-x=".3" aria-hidden="true">Planos</div>
  <div className="plans-copy" data-speed=".1">
   <div data-reveal>
    <p className="label"><i className="dot"/>Planos</p>
    <h2>Escolha o plano<br/><em>ideal</em> para sua marca.</h2>
    <p className="section-lede">Soluções completas para diferentes momentos do seu negócio.</p>
    <ArrowRight className="long-arrow"/>
   </div>
  </div>
  <div className="plan-grid">
   {plans.map((p,i)=><div key={p.name} className="plan-slot" data-speed={[".04","-.08",".1"][i]}>
    <article className={"plan-card"+(p.featured?" is-featured":"")} data-reveal style={vars({"--i":i})}>
     {p.featured&&<span className="plan-badge">Mais escolhido</span>}
     <span className="plan-number">{p.number}</span>
     <h3>{p.name}</h3>
     <p className="plan-intro">{p.intro}</p>
     <p className="plan-price">{p.price}</p>
     <ul className="plan-items">{p.items.map(x=><li key={x}><Check/>{x}</li>)}</ul>
     <button className={"btn "+(p.featured?"btn-light":"btn-outline")+" plan-button"} onClick={()=>setSelected(p)} aria-haspopup="dialog"><span className="btn-dash" aria-hidden="true"/>Ver detalhes<ArrowRight className="btn-arrow"/></button>
    </article>
   </div>)}
  </div>
  <p className="plans-aside" aria-hidden="true" data-speed="-.12">Tecnologia<br/>Criatividade<br/><span><i className="dot"/>Resultado</span></p>
  <PlanDialog plan={selected} onClose={()=>setSelected(null)}/>
 </section>
}

function About(){
 return <section id="sobre" className="about" data-theme="light">
  <div className="bg-word about-word" data-speed-x="-.3" aria-hidden="true">Design + Código</div>
  <div className="about-copy" data-speed=".12">
   <div data-reveal>
    <p className="label"><i className="dot"/>Sobre</p>
    <h2>Design que<br/>encontra <em>código.</em></h2>
    <p className="section-lede">Sou Vitor Volpato. Meu trabalho conecta direção visual e desenvolvimento para criar experiências com estética, lógica e função — uma presença digital que faz sentido para o negócio, não só um site no ar.</p>
    <ul className="stack">{stack.map(s=><li key={s}>{s}</li>)}</ul>
   </div>
  </div>
  <ol className="process">
   {steps.map((s,i)=><li key={s.title} data-speed={(-.03-i*.025).toFixed(3)}>
    <div className="process-row" data-reveal style={vars({"--i":i})}>
     <span className="process-number">0{i+1}</span>
     <div><h3>{s.title}</h3><p>{s.text}</p></div>
    </div>
   </li>)}
  </ol>
 </section>
}

const whatsappUrl=`https://wa.me/${contact.whatsapp.number}?text=${encodeURIComponent(contact.whatsapp.message)}`;

function CopyEmail(){
 const[copied,setCopied]=useState(false);
 const copy=()=>{
  const done=()=>{setCopied(true);window.setTimeout(()=>setCopied(false),2400)};
  const select=()=>{const el=document.querySelector("a.contact-mail[href^='mailto:']");const sel=window.getSelection();if(el&&sel){const r=document.createRange();r.selectNodeContents(el);sel.removeAllRanges();sel.addRange(r)}};
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(contact.email).then(done,select);else select();
 };
 return <button type="button" className="copy-mail" onClick={copy} aria-live="polite">{copied?"E-mail copiado":"Copiar e-mail"}</button>
}

function Contact(){
 return <section id="contato" className="contact" data-theme="dark" data-scene>
  <div className="contact-glow" data-speed=".2" aria-hidden="true"/>
  <FurLogo tone="white" speed=".12" depth=".4"/>
  <div className="contact-inner" data-speed="-.05">
   <div data-reveal>
    <p className="label"><i className="dot"/>Contato</p>
    <h2>Tem uma ideia?<br/>Vamos dar <em>forma</em><br/>a ela.</h2>
    <p className="section-lede">Me conte o que você quer criar, onde está hoje e o que precisa acontecer. A próxima etapa começa por uma conversa.</p>
    <div className="contact-actions">
     <a className="btn btn-light" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp <ArrowRight className="btn-arrow"/></a>
     <a className="btn btn-outline" href={`mailto:${contact.email}?subject=${encodeURIComponent("Novo projeto")}`}>Enviar e-mail <ArrowRight className="btn-arrow"/></a>
    </div>
    <dl className="contact-list">
     <div><dt>WhatsApp</dt><dd><a className="contact-mail" href={whatsappUrl} target="_blank" rel="noopener noreferrer">{contact.whatsapp.display}</a></dd></div>
     <div><dt>E-mail</dt><dd><a className="contact-mail" href={"mailto:"+contact.email}>{contact.email}</a><CopyEmail/></dd></div>
    </dl>
   </div>
  </div>
 </section>
}

function Footer(){
 return <footer className="site-footer" data-theme="dark">
  <a className="brand" href="#top" aria-label="Volpe — voltar ao topo"><BrandMark/><span>Volpe</span></a>
  <p>© {new Date().getFullYear()} Vitor Volpato · {contact.city}</p>
  <nav aria-label="Rodapé"><a href="#projetos">Projetos</a><a href="#servicos">Serviços</a><a href="#sobre">Sobre</a><a href="#contato">Contato</a><a href="#top">Topo ↑</a></nav>
 </footer>
}

function App(){
 useReveal();useParallax();useInPageLinks();
 return <>
  <a className="skip-link" href="#projetos">Pular para o conteúdo</a>
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
 </>
}

createRoot(document.getElementById("root")!).render(<StrictMode><App/></StrictMode>);
