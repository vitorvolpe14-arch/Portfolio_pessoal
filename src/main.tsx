import React,{useEffect,useState}from"react";
import{createRoot}from"react-dom/client";
import"./styles.css";

const projects:Project[]=[
{number:"01",title:"MONTÊ",type:"E-commerce",description:"Experiência digital premium para uma marca de moda, com catálogo, checkout e uma interface pensada para conversão.",stack:["React","TypeScript","Render"],},
{number:"02",title:"KEY",type:"Brand / Commerce",description:"Direção digital para uma marca de moda com identidade visual minimalista e experiência de compra editorial.",stack:["UI/UX","Frontend","Deploy"],},
{number:"03",title:"Portfolio Lab",type:"Digital Product",description:"Sistemas de portfólio e apresentação comercial criados para transformar projetos em novas oportunidades.",stack:["React","Motion","SEO"],}
];

const plans:Plan[]=[
{name:"Essencial",price:"R$ 1.500",intro:"Uma presença digital enxuta e profissional.",pages:"Até 4 páginas/telas",timeline:"7–10 dias úteis",revisions:"2 rodadas de ajustes",support:"7 dias após publicação",integrations:"Formulário/WhatsApp, analytics e domínio",items:["Design visual responsivo","Desenvolvimento frontend","SEO básico","Publicação no Render","Otimização para celular","Configuração de domínio"]},
{name:"Profissional",price:"R$ 3.000",intro:"Uma experiência completa para apresentar e vender.",featured:true,pages:"Até 8 páginas/telas",timeline:"12–18 dias úteis",revisions:"3 rodadas de ajustes",support:"15 dias após publicação",integrations:"Formulários, WhatsApp, analytics e integrações externas",items:["Tudo do Essencial","Arquitetura de navegação personalizada","Animações e microinterações","Parallax e transições avançadas","SEO técnico e Open Graph","Integrações personalizadas","Deploy e configuração de produção"]},
{name:"Premium",price:"R$ 5.000",intro:"Uma experiência digital sob medida, do conceito ao lançamento.",pages:"Projeto sob medida",timeline:"20–30 dias úteis",revisions:"4 rodadas de ajustes",support:"30 dias após publicação",integrations:"Integrações sob escopo e APIs quando aplicável",items:["Tudo do Profissional","Direção visual exclusiva","Arquitetura completa de experiência","Motion design e interações avançadas","Estrutura preparada para evolução","Integrações sob medida","Acompanhamento pós-lançamento"]},
];


function ThreeDLogo({large=false}:{large?:boolean}){
 return <div className={"logo-3d "+(large?"logo-3d-large":"")} aria-hidden="true"><img className="logo-3d-image" src="/fox-logo.svg" alt="" /></div>
}
function Logo(){
 return <a className="logo" href="#top" aria-label="Vitor Volpato início"><span className="logo-wordmark">VOLPE</span></a>
}
function useScrollParallax(){
 useEffect(()=>{
  const els=[...document.querySelectorAll<HTMLElement>("[data-parallax]")];let raf=0;
  const update=()=>{const y=window.scrollY;els.forEach(el=>{const speed=Number(el.dataset.speed||.12);const rect=el.getBoundingClientRect();const center=window.innerHeight/2;const offset=(rect.top+rect.height/2-center)*speed;el.style.setProperty("--parallax-y",offset+"px")});raf=0};
  const onScroll=()=>{if(!raf)raf=requestAnimationFrame(update)};
  update();window.addEventListener("scroll",onScroll,{passive:true});window.addEventListener("resize",onScroll);
  return()=>{cancelAnimationFrame(raf);window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",onScroll)}
 },[])
}
function useSceneInteractions(){
 useEffect(()=>{
  const cleanups:(()=>void)[]=[];
  document.querySelectorAll<HTMLElement>(".logo-3d").forEach(el=>{
   const move=(e:PointerEvent)=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;el.style.setProperty("--logo-rx",(-y*12)+"deg");el.style.setProperty("--logo-ry",(x*16)+"deg")};
   const leave=()=>{el.style.setProperty("--logo-rx","0deg");el.style.setProperty("--logo-ry","0deg")};
   el.addEventListener("pointermove",move);el.addEventListener("pointerleave",leave);cleanups.push(()=>{el.removeEventListener("pointermove",move);el.removeEventListener("pointerleave",leave)})
  });
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach(el=>{
   const move=(e:PointerEvent)=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;el.style.setProperty("--tilt-x",(y*-5)+"deg");el.style.setProperty("--tilt-y",(x*7)+"deg");el.style.setProperty("--tilt-xp",(x*12)+"px");el.style.setProperty("--tilt-yp",(y*12)+"px")};
   const leave=()=>{el.style.setProperty("--tilt-x","0deg");el.style.setProperty("--tilt-y","0deg");el.style.setProperty("--tilt-xp","0px");el.style.setProperty("--tilt-yp","0px")};
   el.addEventListener("pointermove",move);el.addEventListener("pointerleave",leave);cleanups.push(()=>{el.removeEventListener("pointermove",move);el.removeEventListener("pointerleave",leave)})
  });
  return()=>cleanups.forEach(fn=>fn())
 },[])
}
function App(){
 const[active,setActive]=useState<Plan|null>(null);
 useScrollParallax();useSceneInteractions();
 useEffect(()=>{const els=[...document.querySelectorAll<HTMLElement>("[data-reveal]")];const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("is-visible")}),{threshold:.12});els.forEach(e=>io.observe(e));return()=>io.disconnect()},[]);
 useEffect(()=>{const list=document.querySelector<HTMLElement>(".project-list");if(!list)return;const cards=Array.from(list.querySelectorAll<HTMLElement>(".project"));let raf=0;
  const update=()=>{const vh=window.innerHeight;cards.forEach((card,i)=>{const r=card.getBoundingClientRect();const center=(r.top+r.height/2-vh/2)/vh;const y=Math.max(-34,Math.min(34,-center*24));const z=Math.max(-18,Math.min(12,-Math.abs(center)*12));const rot=Math.max(-1.4,Math.min(1.4,-center*.9));card.style.setProperty("--project-stack-y",y+"px");card.style.setProperty("--project-stack-z",z+"px");card.style.setProperty("--project-stack-r",rot+"deg");card.style.zIndex=String(20-i)});raf=0};
  const onScroll=()=>{if(!raf)raf=requestAnimationFrame(update)};update();window.addEventListener("scroll",onScroll,{passive:true});window.addEventListener("resize",onScroll);
  return()=>{cancelAnimationFrame(raf);window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",onScroll)}
 },[]);
 return <div id="top">
  <header className="nav nav-rebuilt">
   <Logo/>
   <nav><a href="#projetos">Projetos</a><a href="#servicos">Serviços</a><a href="#processo">Processo</a><a href="#contato">Contato</a></nav>
   <a className="nav-cta" href="#contato">Iniciar projeto <span>↗</span></a>
  </header>

  <main>
   <section className="hero section-light hero-white rebuilt-hero">
    <div className="hero-content" data-reveal>
     <p className="eyebrow dark">VITOR VOLPATO / DIGITAL BUILDER</p>
     <h1>Sites que transformam<br/><em>ideias</em> em presença.</h1>
     <p className="hero-copy">Desenvolvimento web e experiências digitais para marcas e negócios que precisam parecer tão bons quanto aquilo que entregam.</p>
     <div className="hero-actions"><a className="button button-light" href="#projetos">Explorar projetos <span>↓</span></a><a className="text-link" href="#contato">Falar sobre seu projeto <span>↗</span></a></div>
    </div>
    <div className="hero-logo-stage rebuilt-logo-stage"><ThreeDLogo large/><div className="logo-shadow"></div></div>
    <div className="hero-meta"><span>FORTALEZA, BRASIL</span><span>WEB / UI / DIGITAL</span></div>
    <div className="hero-index">01</div>
   </section>

   <section className="intro-strip section-dark" data-reveal>
    <div className="intro-label">01 / CAPABILITIES</div>
    <p>Uma abordagem que une <strong>design, tecnologia e estratégia</strong> em uma única experiência digital.</p>
    <span className="intro-arrow">↓</span>
   </section>

   <section id="projetos" className="section-light projects rebuilt-projects">
    <div className="section-head" data-reveal>
     <div><p className="eyebrow dark">SELECTED WORK / 02</p><h2>Projetos que<br/><em>ganham vida.</em></h2></div>
     <p className="section-intro">Produtos, marcas e experiências digitais construídos para comunicar melhor, gerar confiança e criar oportunidades.</p>
    </div>
    <div className="project-list">
     {projects.map((p,i)=><article className="project tilt-card" data-tilt data-reveal key={p.title}><div className={"project-visual visual-"+i} data-parallax data-speed={i%2===0?".055":"-.045"}><div className="project-shine"></div><div className="project-depth-label" data-parallax data-speed="-.12">{p.type}</div><span data-parallax data-speed=".16">{p.number}</span><div className="visual-word" data-parallax data-speed={i%2===0?".12":"-.1"}>{p.title}</div><div className="visual-orbit" data-parallax data-speed="-.18"></div><div className="visual-cross" data-parallax data-speed=".22">＋</div></div><div className="project-info"><p className="project-type">{p.type}</p><h3>{p.title}</h3><p>{p.description}</p><div className="chips">{p.stack.map(s=><span key={s}>{s}</span>)}</div><button className="arrow-btn" aria-label={"Ver projeto "+p.title}>↗</button></div></article>)}
    </div>
   </section>

   <section id="servicos" className="section-dark plans rebuilt-services">
    <div className="plans-bg-word">SERVICES</div>
    <div className="section-head" data-reveal><div><p className="eyebrow">SERVICES / 03</p><h2>Uma solução<br/>para cada <em>fase.</em></h2></div><p className="section-intro">Do site essencial ao projeto completo. Escopo claro, tecnologia atual e uma experiência pensada para funcionar.</p></div>
    <div className="plans-grid">{plans.map((p,i)=><div className={"plan-card-shell "+(p.featured?"featured ":"")+(active?.name===p.name?" is-flipped":"")} key={p.name} data-reveal tabIndex={0} role="button" aria-label={"Ver detalhes do plano "+p.name} onClick={()=>setActive(active?.name===p.name?null:p)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setActive(active?.name===p.name?null:p)}}}><div className="plan-card-inner"><div className="plan-face plan-front"><div className="plan-top"><span>0{i+1}</span>{p.featured&&<b>MAIS PROCURADO</b>}</div><h3>{p.name}</h3><p className="plan-intro">{p.intro}</p><div className="price">{p.price}<small> / projeto</small></div><div className="plan-tease">{p.items.slice(0,3).map(x=><span key={x}>+ {x}</span>)}</div><span className="plan-link">Clique para ver detalhes ↻</span></div><div className="plan-face plan-back"><div className="plan-top"><span>0{i+1}</span><b>DETALHES</b></div><h3>{p.name}</h3><div className="price">{p.price}<small> / projeto</small></div><div className="plan-details-grid"><div><h4>Incluído</h4><ul>{p.items.map(x=><li key={x}>{x}</li>)}</ul></div><div><h4>Escopo</h4><dl><div><dt>Páginas/telas</dt><dd>{p.pages}</dd></div><div><dt>Prazo</dt><dd>{p.timeline}</dd></div><div><dt>Revisões</dt><dd>{p.revisions}</dd></div><div><dt>Suporte</dt><dd>{p.support}</dd></div><div><dt>Integrações</dt><dd>{p.integrations}</dd></div></dl></div></div><a className="button button-light plan-detail-cta" href={"mailto:vitorvolpe14@gmail.com?subject=Interesse no plano "+p.name}>Quero este plano ↗</a></div></div></div>)}</div>
   </section>

   <section id="processo" className="section-light process rebuilt-process">
    <div className="section-head" data-reveal><div><p className="eyebrow dark">PROCESS / 04</p><h2>Clareza do<br/>briefing ao <em>launch.</em></h2></div><p className="section-intro">Menos ruído. Mais direção. Cada etapa tem um objetivo claro para que o projeto avance sem perder a intenção.</p></div>
    <div className="process-grid">{["Briefing & direção","Design & estrutura","Desenvolvimento","Launch & evolução"].map((x,i)=><div className="step" data-reveal key={x}><span>0{i+1}</span><h3>{x}</h3><p>{["Entendo objetivo, público, conteúdo e o que precisa acontecer para o projeto funcionar.","Transformo estratégia em hierarquia visual, navegação e componentes consistentes.","Construo interface, responsividade, interações e integrações com foco em performance.","Publico, testo, acompanho e deixo a base pronta para a próxima evolução."][i]}</p></div>)}</div>
   </section>

   <section className="section-dark about rebuilt-about">
    <div className="about-bg">VV</div>
    <div className="about-inner" data-reveal><p className="eyebrow">ABOUT / 05</p><h2>Design encontra<br/><em>código.</em></h2><p className="about-copy">Meu trabalho conecta direção visual e desenvolvimento para criar experiências que têm estética, lógica e função. O objetivo não é só lançar um site — é construir uma presença digital que faça sentido para o negócio.</p><div className="stack-row">{["React","TypeScript","JavaScript","CSS","GitHub","Render","Supabase"].map(x=><span key={x}>{x}</span>)}</div></div>
   </section>

   <section id="contato" className="contact section-light rebuilt-contact">
    <div data-reveal><p className="eyebrow dark">CONTACT / 06</p><h2>Tem uma ideia?<br/><em>Vamos construir.</em></h2><p>Me conte o que você quer criar, onde está hoje e o que precisa acontecer. A próxima etapa começa por uma conversa.</p><div className="contact-actions"><a className="contact-mail" href="mailto:vitorvolpe14@gmail.com">vitorvolpe14@gmail.com <span>↗</span></a><a className="button button-dark" href="mailto:vitorvolpe14@gmail.com?subject=Novo projeto">Começar conversa <span>↗</span></a></div></div>
   </section>
  </main>
  <footer className="footer section-dark rebuilt-footer"><Logo/><p>© {new Date().getFullYear()} Vitor Volpato</p><div><a href="#projetos">Projetos</a><a href="#contato">Contato</a><a href="#top">Topo ↑</a></div></footer>
 </div>
}
createRoot(document.getElementById("root")!).render(<App/>);
