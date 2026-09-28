import{StrictMode,useEffect,useRef,useState}from"react";
import{createRoot}from"react-dom/client";
import"./styles.css";
import{contact,disciplines,nav,plans,projects,stack,stats,steps,type Plan}from"./content";
import{ArrowRight,ArrowUpRight,BagArt,BoxArt,Check,Cliffs,FoxMark,FoxSculpture,Play,Rocks}from"./art";

document.documentElement.classList.add("js");

const reducedMotion=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useReveal(){
 useEffect(()=>{
  const els=[...document.querySelectorAll<HTMLElement>("[data-reveal]")];
  if(!("IntersectionObserver" in window)||reducedMotion()){els.forEach(el=>el.classList.add("is-visible"));return}
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("is-visible");io.unobserve(e.target)}}),{threshold:.14,rootMargin:"0px 0px -6% 0px"});
  els.forEach(el=>io.observe(el));
  return()=>io.disconnect();
 },[]);
}

function useActiveSection(){
 const[active,setActive]=useState("top");
 useEffect(()=>{
  const sections=nav.map(n=>document.getElementById(n.id)).filter((el):el is HTMLElement=>!!el);
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)setActive(e.target.id)}),{rootMargin:"-45% 0px -50% 0px"});
  sections.forEach(s=>io.observe(s));
  return()=>io.disconnect();
 },[]);
 return active;
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

/** Parallax do hero (scroll) e leve rotação da raposa (ponteiro). */
function useHeroMotion(ref:React.RefObject<HTMLElement|null>){
 useEffect(()=>{
  const el=ref.current;if(!el||reducedMotion())return;
  let raf=0,px=0,py=0;
  const paint=()=>{
   raf=0;
   const y=Math.min(window.scrollY,window.innerHeight);
   el.style.setProperty("--hero-scroll",String(y));
   el.style.setProperty("--pointer-x",px.toFixed(3));
   el.style.setProperty("--pointer-y",py.toFixed(3));
  };
  const queue=()=>{if(!raf)raf=requestAnimationFrame(paint)};
  const onPointer=(e:PointerEvent)=>{px=e.clientX/window.innerWidth-.5;py=e.clientY/window.innerHeight-.5;queue()};
  paint();
  window.addEventListener("scroll",queue,{passive:true});
  window.addEventListener("pointermove",onPointer,{passive:true});
  return()=>{cancelAnimationFrame(raf);window.removeEventListener("scroll",queue);window.removeEventListener("pointermove",onPointer)};
 },[ref]);
}

/** Inclinação 3D dos cards ao passar o ponteiro. */
function useTilt(){
 useEffect(()=>{
  if(reducedMotion()||!window.matchMedia("(hover: hover)").matches)return;
  const cleanups=[...document.querySelectorAll<HTMLElement>("[data-tilt]")].map(el=>{
   const move=(e:PointerEvent)=>{const r=el.getBoundingClientRect();el.style.setProperty("--tx",((e.clientX-r.left)/r.width-.5).toFixed(3));el.style.setProperty("--ty",((e.clientY-r.top)/r.height-.5).toFixed(3))};
   const leave=()=>{el.style.setProperty("--tx","0");el.style.setProperty("--ty","0")};
   el.addEventListener("pointermove",move);el.addEventListener("pointerleave",leave);
   return()=>{el.removeEventListener("pointermove",move);el.removeEventListener("pointerleave",leave)};
  });
  return()=>cleanups.forEach(fn=>fn());
 },[]);
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
 const active=useActiveSection();
 const scrolled=useScrolled();
 const[open,setOpen]=useState(false);
 useEffect(()=>{document.body.classList.toggle("menu-open",open)},[open]);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[]);
 return <header className={"site-header"+(scrolled?" is-scrolled":"")+(open?" is-open":"")}>
  <a className="brand" href="#top" aria-label="Volpe — início"><FoxMark className="brand-mark"/></a>
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

function Hero(){
 const ref=useRef<HTMLElement>(null);
 useHeroMotion(ref);
 const current=useCycle(disciplines.length);
 return <section id="top" className="hero" ref={ref}>
  <div className="hero-scene" aria-hidden="true">
   <div className="scene-haze"/>
   <div className="scene-beam"><i/></div>
   <span className="scene-line scene-line-a"/><span className="scene-line scene-line-b"/>
   <Cliffs/>
   <div className="scene-fox"><div className="scene-fox-inner"><FoxSculpture/></div></div>
   <Rocks/>
   <div className="scene-fog fog-a"/><div className="scene-fog fog-b"/>
   <div className="scene-dust">{Array.from({length:14},(_,i)=><i key={i} style={{"--i":i} as React.CSSProperties}/>)}</div>
  </div>

  <div className="hero-inner">
   <div className="hero-copy">
    <p className="hero-kicker" data-reveal>Volpe / Desenvolvimento · Design · Estratégia</p>
    <h1 data-reveal><span>Ideias</span><span>que <em>ganham</em></span><span>forma</span></h1>
    <p className="hero-lede" data-reveal>Transformo marcas em experiências reais através de design, tecnologia e estratégia.</p>
    <div className="hero-actions" data-reveal>
     <a className="btn btn-light" href="#projetos">Ver projetos <ArrowRight className="btn-arrow"/></a>
     <a className="play-link" href="#sobre"><span className="play-ring"><Play/></span>Como trabalho</a>
    </div>
   </div>
   <dl className="hero-stats" data-reveal>
    {stats.map(s=><div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}
   </dl>
  </div>

  <ul className="hero-disciplines" aria-label="Áreas de atuação">
   {disciplines.map((d,i)=><li key={d} className={i===current?"is-current":undefined}>{d}</li>)}
  </ul>
  <a className="hero-scroll" href="#projetos" aria-label="Rolar para projetos">Scroll<i/></a>
  <p className="hero-signature">Desenvolvimento<br/>que impulsiona marcas<i/></p>
 </section>
}

function Projects(){
 return <section id="projetos" className="projects">
  <div className="projects-copy" data-reveal>
   <p className="label"><i className="dot"/>Projetos</p>
   <h2>Marcas reais.<br/>Resultados reais.</h2>
   <p className="section-lede">Projetos que unem design, tecnologia e estratégia para criar experiências que geram valor.</p>
   <a className="text-cta" href="#contato"><i className="dot"/>Quero um projeto assim <ArrowRight className="btn-arrow"/></a>
  </div>
  <div className="project-deck">
   {projects.map((p,i)=><article key={p.title} className={"project-card theme-"+p.theme} data-tilt data-reveal style={{"--i":i} as React.CSSProperties}>
    <div className="project-card-inner">
     <div className="project-media">{p.theme==="leather"?<BagArt/>:<BoxArt/>}</div>
     <div className="project-body">
      <span className="project-number">{p.number}</span>
      <h3>{p.title}</h3>
      <p>{p.description}</p>
      <ul className="tags">{p.tags.map(t=><li key={t}>{t}</li>)}</ul>
      <a className="project-link" href={p.url||"#contato"} {...(p.url?{target:"_blank",rel:"noreferrer"}:{})}>Acessar projeto <ArrowRight className="btn-arrow"/></a>
     </div>
     <a className="round-link" href={p.url||"#contato"} aria-label={"Acessar projeto "+p.title} tabIndex={-1} {...(p.url?{target:"_blank",rel:"noreferrer"}:{})}><ArrowUpRight/></a>
    </div>
   </article>)}
  </div>
 </section>
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
 return <section id="servicos" className="plans">
  <div className="plans-copy" data-reveal>
   <p className="label"><i className="dot"/>Planos</p>
   <h2>Escolha o plano<br/>ideal para sua marca.</h2>
   <p className="section-lede">Soluções completas para diferentes momentos do seu negócio.</p>
   <ArrowRight className="long-arrow"/>
  </div>
  <div className="plan-grid">
   {plans.map(p=><article key={p.name} className={"plan-card"+(p.featured?" is-featured":"")} data-reveal>
    {p.featured&&<span className="plan-badge">Mais escolhido</span>}
    <span className="plan-number">{p.number}</span>
    <h3>{p.name}</h3>
    <p className="plan-intro">{p.intro}</p>
    <p className="plan-price">{p.price}</p>
    <ul className="plan-items">{p.items.map(x=><li key={x}><Check/>{x}</li>)}</ul>
    <button className={"btn "+(p.featured?"btn-light":"btn-outline")+" plan-button"} onClick={()=>setSelected(p)} aria-haspopup="dialog"><span className="btn-dash" aria-hidden="true"/>Ver detalhes<ArrowRight className="btn-arrow"/></button>
   </article>)}
  </div>
  <p className="plans-aside" aria-hidden="true">Tecnologia<br/>Criatividade<br/><span><i className="dot"/>Resultado</span></p>
  <PlanDialog plan={selected} onClose={()=>setSelected(null)}/>
 </section>
}

function About(){
 return <section id="sobre" className="about">
  <div className="about-copy" data-reveal>
   <p className="label"><i className="dot"/>Sobre</p>
   <h2>Design que<br/>encontra código.</h2>
   <p className="section-lede">Sou Vitor Volpato. Meu trabalho conecta direção visual e desenvolvimento para criar experiências com estética, lógica e função — uma presença digital que faz sentido para o negócio, não só um site no ar.</p>
   <ul className="stack">{stack.map(s=><li key={s}>{s}</li>)}</ul>
  </div>
  <ol className="process">
   {steps.map((s,i)=><li key={s.title} data-reveal style={{"--i":i} as React.CSSProperties}>
    <span className="process-number">0{i+1}</span>
    <div><h3>{s.title}</h3><p>{s.text}</p></div>
   </li>)}
  </ol>
 </section>
}

function Contact(){
 return <section id="contato" className="contact">
  <div className="contact-glow" aria-hidden="true"/>
  <FoxMark className="contact-mark"/>
  <div className="contact-inner" data-reveal>
   <p className="label"><i className="dot"/>Contato</p>
   <h2>Tem uma ideia?<br/>Vamos dar <em>forma</em> a ela.</h2>
   <p className="section-lede">Me conte o que você quer criar, onde está hoje e o que precisa acontecer. A próxima etapa começa por uma conversa.</p>
   <div className="contact-actions">
    <a className="btn btn-light" href={`mailto:${contact.email}?subject=${encodeURIComponent("Novo projeto")}`}>Vamos conversar <ArrowRight className="btn-arrow"/></a>
    <a className="contact-mail" href={"mailto:"+contact.email}>{contact.email}</a>
   </div>
  </div>
 </section>
}

function Footer(){
 return <footer className="site-footer">
  <a className="brand" href="#top" aria-label="Volpe — voltar ao topo"><FoxMark className="brand-mark"/><span>Volpe</span></a>
  <p>© {new Date().getFullYear()} Vitor Volpato · {contact.city}</p>
  <nav aria-label="Rodapé"><a href="#projetos">Projetos</a><a href="#servicos">Serviços</a><a href="#contato">Contato</a><a href="#top">Topo ↑</a></nav>
 </footer>
}

function App(){
 useReveal();useTilt();
 return <>
  <a className="skip-link" href="#projetos">Pular para o conteúdo</a>
  <Header/>
  <main>
   <Hero/>
   <Projects/>
   <Plans/>
   <About/>
   <Contact/>
  </main>
  <Footer/>
 </>
}

createRoot(document.getElementById("root")!).render(<StrictMode><App/></StrictMode>);
