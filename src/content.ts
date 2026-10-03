// Todo o conteúdo editável do site fica aqui, nos três idiomas (português, inglês e italiano).
// Nos títulos, "\n" quebra a linha e *palavra* fica em itálico.

export type Lang="pt"|"en"|"it";

/** Idiomas do site: o português fica em "/", os outros em "/en/" e "/it/". */
export const languages:{id:Lang;label:string;name:string;path:string;htmlLang:string;locale:string}[]=[
 {id:"pt",label:"PT",name:"Português",path:"/",htmlLang:"pt-BR",locale:"pt_BR"},
 {id:"en",label:"EN",name:"English",path:"/en/",htmlLang:"en",locale:"en_US"},
 {id:"it",label:"IT",name:"Italiano",path:"/it/",htmlLang:"it",locale:"it_IT"},
];

export const site="https://volpedev.com.br";

/** Logo escrita em texto, na fonte que a própria marca usa. */
export type TextLogo={
 text:string;
 /** Lovelo Black (Montê), Playfair Display (Key) ou Italiana + Mrs Saint Delafield (casamento). */
 font:"lovelo"|"playfair"|"wedding";
 /** Palavra do texto escrita em letra cursiva (ex.: o "e" de "Caroline e Leandro"). */
 script?:string;
};

/** Cada projeto aparece como a logo da marca, com link para o site publicado. */
export type Project={
 title:string;
 url:string;
 /** Imagem da logo (SVG em public/projects) ou logo em texto. */
 logo:{image:string}|TextLogo;
 /** Fora do site por enquanto; os dados ficam guardados para voltar depois. */
 hidden?:boolean;
};

/** Textos de um plano em um idioma. Número, nome e preço ficam em `planBase`. */
export type PlanText={
 intro:string;
 /** Observação curta abaixo do preço (ex.: o que é cobrado à parte). */
 note?:string;
 /** Aparece no cartão. */
 items:string[];
 details:{deadline:string;revisions:string;support:string};
 /** Aparece só em "Ver detalhes". */
 extras:string[];
};

export type Plan=PlanText&{number:string;name:string;price:string;featured?:boolean};

export const contact={
 email:"vitorvolpe14@gmail.com",
 whatsapp:{display:"(85) 99715-6891",number:"5585997156891"},
 city:"Fortaleza, BR",
};

export const projects:Project[]=[
 {title:"FØRN.LY",url:"https://fornly.com.br/",logo:{image:"/projects/fornly-logo.svg"}},
 {title:"Key",url:"https://key-site-jaut.onrender.com/",logo:{text:"KEY",font:"playfair"}},
 {title:"Caroline e Leandro",url:"https://casamento-carol-e-leandro.vitorvolpe14.workers.dev/",logo:{text:"Caroline e Leandro",font:"wedding",script:"e"}},
 {title:"Montê",url:"https://oficialmontee.com.br/",logo:{text:"MONTÊ",font:"lovelo"},hidden:true},
];

/**
 * Quanto mais caro o plano, mais serviços: cada um inclui tudo do anterior.
 * Preço em reais (`brl`, versão em português), dólares (`usd`, inglês) e euros (`eur`, italiano).
 * Dólar e euro não são conversão do real: são preços de lançamento, abaixo do que freelancers
 * cobram nos EUA e na Itália enquanto ainda não há clientes lá fora, com o plano maior abaixo de 1.500.
 */
export const planBase:{number:string;name:string;brl:number;usd:number;eur:number;featured?:boolean}[]=[
 {number:"01",name:"Start",brl:799,usd:550,eur:490},
 {number:"02",name:"Studio",brl:1300,usd:1050,eur:950,featured:true},
 {number:"03",name:"Signature",brl:2000,usd:1450,eur:1390},
];

export const stack=["React","TypeScript","JavaScript","CSS","GitHub","Cloudflare"];

export type Copy={
 meta:{title:string;description:string;ogTitle:string;ogDescription:string};
 nav:{id:string;label:string}[];
 disciplines:string[];
 header:{home:string;cta:string;mainNav:string;openMenu:string;closeMenu:string;language:string};
 skip:string;
 hero:{kicker:string;title:string;lede:string;quote:string;plans:string;areas:string;scroll:string;signature:string};
 projects:{label:string;title:string;lede:string;cta:string;open:string};
 plansSection:{word:string;label:string;title:string;lede:string;featured:string;perProject:string;seeDetails:string;closeDetails:string;plan:string;choose:string;
  /** Assunto do e-mail; {plan} vira o nome do plano. */
  subject:string;aside:string[]};
 labels:{deadline:string;revisions:string;support:string;payment:string};
 /** Forma de pagamento, igual para todos os planos (aparece no cartão e nos detalhes). */
 payment:{parts:string[];full:string};
 /** Na mesma ordem de `planBase`. */
 plans:PlanText[];
 about:{word:string;label:string;title:string;lede:string};
 steps:{title:string;text:string}[];
 contact:{label:string;title:string;lede:string;whatsappButton:string;emailButton:string;email:string;subject:string;copy:string;copied:string;
  /** Mensagem que já vem escrita no WhatsApp. */
  message:string};
 footer:{nav:string;top:string;backToTop:string};
};

export const copy:Record<Lang,Copy>={
 pt:{
  meta:{
   title:"Volpe — Desenvolvedor de sites | Vitor Volpato",
   description:"Vitor Volpato, desenvolvedor de sites em Fortaleza. Sites institucionais e lojas virtuais sob medida, do design à publicação.",
   ogTitle:"Volpe — Desenvolvedor de sites",
   ogDescription:"Sites institucionais e lojas virtuais sob medida, do design à publicação.",
  },
  nav:[
   {id:"top",label:"Início"},
   {id:"projetos",label:"Projetos"},
   {id:"servicos",label:"Serviços"},
   {id:"sobre",label:"Sobre"},
   {id:"contato",label:"Contato"},
  ],
  disciplines:["Sites","E-commerce","Design","Branding"],
  header:{home:"Volpe — início",cta:"Vamos conversar",mainNav:"Principal",openMenu:"Abrir menu",closeMenu:"Fechar menu",language:"Idioma"},
  skip:"Pular para o conteúdo",
  hero:{
   kicker:"Vitor Volpato / Desenvolvedor de sites",
   title:"Eu crio\nseu *site.*",
   lede:"Crio sites institucionais e lojas virtuais sob medida para a sua marca, do design à publicação no ar.",
   quote:"Pedir orçamento",plans:"Ver planos e preços",areas:"Áreas de atuação",scroll:"Rolar para projetos",signature:"Sites sob medida",
  },
  projects:{
   label:"Projetos",
   title:"Marcas reais.\n*Resultados reais.*",
   lede:"Lojas virtuais e sites que desenvolvi para marcas e pessoas reais. Clique na logo para visitar.",
   cta:"Quero um projeto assim",open:"abrir o site em nova aba",
  },
  plansSection:{
   word:"Planos",label:"Planos",
   title:"Escolha o plano\n*ideal* para sua marca.",
   lede:"Soluções completas para diferentes momentos do seu negócio.",
   featured:"Mais escolhido",perProject:"/ projeto",seeDetails:"Ver detalhes",closeDetails:"Fechar detalhes",plan:"Plano",choose:"Quero este plano",
   subject:"Interesse no plano {plan}",aside:["Tecnologia","Criatividade","Resultado"],
  },
  labels:{deadline:"Prazo",revisions:"Ajustes",support:"Suporte",payment:"Pagamento"},
  payment:{parts:["50% ao contratar","50% na entrega"],full:"50% ao contratar e 50% na entrega"},
  plans:[
   {
    intro:"Ideal para marcas que estão começando.",note:"+ R$ 49/mês de hospedagem e domínio",
    items:["Site institucional (até 5 páginas)","Design personalizado","Site 100% responsivo","Catálogo de produtos com pedido pelo WhatsApp","Integração com redes sociais","Suporte por 30 dias"],
    details:{deadline:"12–18 dias",revisions:"2 rodadas",support:"30 dias após a publicação"},
    extras:["SEO básico e indexação no Google","Política de privacidade","Publicação e configuração de domínio","Mensalidade: hospedagem na Cloudflare, domínio, HTTPS e pequenos ajustes"],
   },
   {
    intro:"Para marcas que querem vender online.",note:"+ R$ 89/mês de hospedagem e domínio",
    items:["Tudo do plano Start","Loja virtual com gateway de pagamento","Cadastro e catálogo de produtos","Página própria para cada produto","Login de admin da loja","Gerenciador de pedidos e ganhos","Suporte por 90 dias"],
    details:{deadline:"10–12 dias",revisions:"3 rodadas",support:"90 dias após a publicação"},
    extras:["Banco de dados integrado","Termos de uso e política de privacidade","Animações e microinterações","Mensalidade: hospedagem na Cloudflare, domínio, HTTPS e pequenos ajustes"],
   },
   {
    intro:"Loja completa, pronta para crescer.",note:"Domínio e hospedagem inclusos",
    items:["Tudo do plano Studio","Login de clientes","Pop-ups de promoções","SEO e copy prontos para tráfego pago","Métricas e indexação nos buscadores","Integração com IA (site reconhecido pelas IAs)","Acompanhamento contínuo"],
    details:{deadline:"15–20 dias",revisions:"4 rodadas",support:"Acompanhamento contínuo"},
    extras:["Direção visual exclusiva","Motion design e interações avançadas","Estrutura preparada para evoluir","Hospedagem na Cloudflare, domínio e HTTPS sem mensalidade"],
   },
  ],
  about:{
   word:"Design + Código",label:"Sobre",
   title:"Design que\nencontra *código.*",
   lede:"Sou Vitor Volpato. Meu trabalho conecta direção visual e desenvolvimento para criar experiências com estética, lógica e função — uma presença digital que faz sentido para o negócio, não só um site no ar.",
  },
  steps:[
   {title:"Briefing & direção",text:"Entendo objetivo, público e o que precisa acontecer para o projeto funcionar."},
   {title:"Design & estrutura",text:"Transformo estratégia em hierarquia visual, navegação e componentes consistentes."},
   {title:"Desenvolvimento",text:"Construo interface, responsividade e integrações com foco em performance."},
   {title:"Lançamento & evolução",text:"Publico, testo, acompanho e deixo a base pronta para a próxima fase."},
  ],
  contact:{
   label:"Contato",
   title:"Tem uma ideia?\nVamos dar *forma*\na ela.",
   lede:"Me conte o que você quer criar, onde está hoje e o que precisa acontecer. A próxima etapa começa por uma conversa.",
   whatsappButton:"Chamar no WhatsApp",emailButton:"Enviar e-mail",email:"E-mail",subject:"Novo projeto",copy:"Copiar e-mail",copied:"E-mail copiado",
   message:"Olá, Vitor! Vim pelo seu portfólio e quero conversar sobre um projeto.",
  },
  footer:{nav:"Rodapé",top:"Topo ↑",backToTop:"Volpe — voltar ao topo"},
 },

 en:{
  meta:{
   title:"Volpe — Web Developer | Vitor Volpato",
   description:"Vitor Volpato, web developer based in Fortaleza, Brazil. Custom websites and online stores, from design to launch.",
   ogTitle:"Volpe — Web Developer",
   ogDescription:"Custom websites and online stores, from design to launch.",
  },
  nav:[
   {id:"top",label:"Home"},
   {id:"projetos",label:"Work"},
   {id:"servicos",label:"Services"},
   {id:"sobre",label:"About"},
   {id:"contato",label:"Contact"},
  ],
  disciplines:["Websites","E-commerce","Design","Branding"],
  header:{home:"Volpe — home",cta:"Let's talk",mainNav:"Main",openMenu:"Open menu",closeMenu:"Close menu",language:"Language"},
  skip:"Skip to content",
  hero:{
   kicker:"Vitor Volpato / Web developer",
   title:"I build\nyour *site.*",
   lede:"I create custom websites and online stores for your brand, from design to launch.",
   quote:"Get a quote",plans:"See plans and pricing",areas:"What I do",scroll:"Scroll to projects",signature:"Custom-made websites",
  },
  projects:{
   label:"Work",
   title:"Real brands.\n*Real results.*",
   lede:"Online stores and websites I've built for real brands and people. Click a logo to visit.",
   cta:"I want a project like this",open:"open the site in a new tab",
  },
  plansSection:{
   word:"Plans",label:"Plans",
   title:"Choose the *right*\nplan for your brand.",
   lede:"Complete solutions for every stage of your business.",
   featured:"Most popular",perProject:"/ project",seeDetails:"See details",closeDetails:"Close details",plan:"Plan",choose:"I want this plan",
   subject:"Interested in the {plan} plan",aside:["Technology","Creativity","Results"],
  },
  labels:{deadline:"Timeline",revisions:"Revisions",support:"Support",payment:"Payment"},
  payment:{parts:["50% upfront","50% on delivery"],full:"50% upfront and 50% on delivery"},
  plans:[
   {
    intro:"Ideal for brands that are just starting out.",note:"+ $25/month for hosting and domain",
    items:["Business website (up to 5 pages)","Custom design","Fully responsive website","Product catalog with WhatsApp ordering","Social media integration","30 days of support"],
    details:{deadline:"12–18 days",revisions:"2 rounds",support:"30 days after launch"},
    extras:["Basic SEO and Google indexing","Privacy policy","Launch and domain setup","Monthly fee: Cloudflare hosting, domain, HTTPS and small tweaks"],
   },
   {
    intro:"For brands that want to sell online.",note:"+ $45/month for hosting and domain",
    items:["Everything in Start","Online store with payment gateway","Product management and catalog","A dedicated page for each product","Store admin login","Order and revenue manager","90 days of support"],
    details:{deadline:"10–12 days",revisions:"3 rounds",support:"90 days after launch"},
    extras:["Integrated database","Terms of use and privacy policy","Animations and micro-interactions","Monthly fee: Cloudflare hosting, domain, HTTPS and small tweaks"],
   },
   {
    intro:"A complete store, ready to grow.",note:"Domain and hosting included",
    items:["Everything in Studio","Customer accounts","Promotional pop-ups","SEO and copy ready for paid ads","Analytics and search engine indexing","AI integration (site recognized by AI assistants)","Ongoing support"],
    details:{deadline:"15–20 days",revisions:"4 rounds",support:"Ongoing support"},
    extras:["Exclusive visual direction","Motion design and advanced interactions","A structure built to evolve","Cloudflare hosting, domain and HTTPS with no monthly fee"],
   },
  ],
  about:{
   word:"Design + Code",label:"About",
   title:"Design that\nmeets *code.*",
   lede:"I'm Vitor Volpato. My work brings visual direction and development together to create experiences with aesthetics, logic and purpose — a digital presence that makes sense for the business, not just a website online.",
  },
  steps:[
   {title:"Briefing & direction",text:"I learn the goal, the audience and what has to happen for the project to work."},
   {title:"Design & structure",text:"I turn strategy into visual hierarchy, navigation and consistent components."},
   {title:"Development",text:"I build the interface, responsiveness and integrations with a focus on performance."},
   {title:"Launch & growth",text:"I publish, test, follow up and leave the foundation ready for the next phase."},
  ],
  contact:{
   label:"Contact",
   title:"Got an idea?\nLet's give it\n*shape.*",
   lede:"Tell me what you want to create, where you are today and what needs to happen. The next step starts with a conversation.",
   whatsappButton:"Message on WhatsApp",emailButton:"Send an email",email:"Email",subject:"New project",copy:"Copy email",copied:"Email copied",
   message:"Hi Vitor! I found your portfolio and would like to talk about a project.",
  },
  footer:{nav:"Footer",top:"Top ↑",backToTop:"Volpe — back to top"},
 },

 it:{
  meta:{
   title:"Volpe — Sviluppatore web | Vitor Volpato",
   description:"Vitor Volpato, sviluppatore web a Fortaleza, in Brasile. Siti istituzionali e negozi online su misura, dal design alla pubblicazione.",
   ogTitle:"Volpe — Sviluppatore web",
   ogDescription:"Siti istituzionali e negozi online su misura, dal design alla pubblicazione.",
  },
  nav:[
   {id:"top",label:"Home"},
   {id:"projetos",label:"Progetti"},
   {id:"servicos",label:"Servizi"},
   {id:"sobre",label:"Chi sono"},
   {id:"contato",label:"Contatti"},
  ],
  disciplines:["Siti web","E-commerce","Design","Branding"],
  header:{home:"Volpe — home",cta:"Parliamone",mainNav:"Principale",openMenu:"Apri menu",closeMenu:"Chiudi menu",language:"Lingua"},
  skip:"Vai al contenuto",
  hero:{
   kicker:"Vitor Volpato / Sviluppatore web",
   title:"Creo\nil tuo *sito.*",
   lede:"Creo siti istituzionali e negozi online su misura per il tuo brand, dal design alla messa online.",
   quote:"Richiedi un preventivo",plans:"Vedi piani e prezzi",areas:"Di cosa mi occupo",scroll:"Scorri ai progetti",signature:"Siti su misura",
  },
  projects:{
   label:"Progetti",
   title:"Marche reali.\n*Risultati reali.*",
   lede:"Negozi online e siti che ho sviluppato per marche e persone reali. Clicca su un logo per visitarli.",
   cta:"Voglio un progetto così",open:"apri il sito in una nuova scheda",
  },
  plansSection:{
   word:"Piani",label:"Piani",
   title:"Scegli il piano\n*ideale* per il tuo brand.",
   lede:"Soluzioni complete per ogni fase della tua attività.",
   featured:"Il più scelto",perProject:"/ progetto",seeDetails:"Vedi dettagli",closeDetails:"Chiudi dettagli",plan:"Piano",choose:"Voglio questo piano",
   subject:"Interesse per il piano {plan}",aside:["Tecnologia","Creatività","Risultati"],
  },
  labels:{deadline:"Tempi",revisions:"Revisioni",support:"Assistenza",payment:"Pagamento"},
  payment:{parts:["50% alla firma","50% alla consegna"],full:"50% alla firma e 50% alla consegna"},
  plans:[
   {
    intro:"Ideale per i brand che stanno iniziando.",note:"+ € 19/mese per hosting e dominio",
    items:["Sito istituzionale (fino a 5 pagine)","Design personalizzato","Sito 100% responsive","Catalogo prodotti con ordini via WhatsApp","Integrazione con i social network","Assistenza per 30 giorni"],
    details:{deadline:"12–18 giorni",revisions:"2 revisioni",support:"30 giorni dopo la pubblicazione"},
    extras:["SEO di base e indicizzazione su Google","Informativa sulla privacy","Pubblicazione e configurazione del dominio","Canone mensile: hosting su Cloudflare, dominio, HTTPS e piccole modifiche"],
   },
   {
    intro:"Per i brand che vogliono vendere online.",note:"+ € 35/mese per hosting e dominio",
    items:["Tutto il piano Start","Negozio online con gateway di pagamento","Gestione e catalogo prodotti","Una pagina dedicata per ogni prodotto","Accesso admin al negozio","Gestione di ordini e incassi","Assistenza per 90 giorni"],
    details:{deadline:"10–12 giorni",revisions:"3 revisioni",support:"90 giorni dopo la pubblicazione"},
    extras:["Database integrato","Termini d'uso e informativa sulla privacy","Animazioni e microinterazioni","Canone mensile: hosting su Cloudflare, dominio, HTTPS e piccole modifiche"],
   },
   {
    intro:"Un negozio completo, pronto a crescere.",note:"Dominio e hosting inclusi",
    items:["Tutto il piano Studio","Area clienti con login","Pop-up promozionali","SEO e copy pronti per le campagne a pagamento","Metriche e indicizzazione sui motori di ricerca","Integrazione con l'IA (sito riconosciuto dalle IA)","Assistenza continua"],
    details:{deadline:"15–20 giorni",revisions:"4 revisioni",support:"Assistenza continua"},
    extras:["Direzione visiva esclusiva","Motion design e interazioni avanzate","Una struttura pronta a evolversi","Hosting su Cloudflare, dominio e HTTPS senza canone mensile"],
   },
  ],
  about:{
   word:"Design + Codice",label:"Chi sono",
   title:"Il design\nincontra il *codice.*",
   lede:"Sono Vitor Volpato. Il mio lavoro unisce direzione visiva e sviluppo per creare esperienze con estetica, logica e funzione: una presenza digitale che ha senso per l'attività, non solo un sito online.",
  },
  steps:[
   {title:"Briefing e direzione",text:"Capisco l'obiettivo, il pubblico e cosa serve perché il progetto funzioni."},
   {title:"Design e struttura",text:"Trasformo la strategia in gerarchia visiva, navigazione e componenti coerenti."},
   {title:"Sviluppo",text:"Realizzo interfaccia, versione responsive e integrazioni, con attenzione alle prestazioni."},
   {title:"Lancio ed evoluzione",text:"Pubblico, testo, seguo il progetto e lascio la base pronta per la fase successiva."},
  ],
  contact:{
   label:"Contatti",
   title:"Hai un'idea?\nDiamole\n*forma.*",
   lede:"Raccontami cosa vuoi creare, a che punto sei oggi e cosa deve succedere. Il prossimo passo inizia da una conversazione.",
   whatsappButton:"Scrivimi su WhatsApp",emailButton:"Invia un'email",email:"Email",subject:"Nuovo progetto",copy:"Copia email",copied:"Email copiata",
   message:"Ciao Vitor! Ho visto il tuo portfolio e vorrei parlare di un progetto.",
  },
  footer:{nav:"Piè di pagina",top:"Su ↑",backToTop:"Volpe — torna su"},
 },
};

/** Preço do plano na moeda e no formato do idioma: R$ 1.300 (pt), $1,400 (en), € 1.000 (it). */
export const formatPrice=(plan:{brl:number;usd:number;eur:number},lang:Lang)=>
 lang==="en"?"$"+plan.usd.toLocaleString("en-US"):lang==="it"?"€ "+plan.eur.toLocaleString("it-IT"):"R$ "+plan.brl.toLocaleString("pt-BR");

/** Planos completos (dados fixos + textos) no idioma pedido. */
export const plansFor=(lang:Lang):Plan[]=>planBase.map((b,i)=>({...copy[lang].plans[i],number:b.number,name:b.name,price:formatPrice(b,lang),featured:b.featured}));

/** Idioma pelo endereço: /en/ e /it/; o resto é português. */
export const langFromPath=(path:string):Lang=>{const m=/^\/(en|it)(\/|$)/.exec(path);return m?m[1] as Lang:"pt"};
