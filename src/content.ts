// Todo o conteúdo editável do site fica aqui.

/** Cada projeto aparece como a logo da marca, com link para o site publicado. */
export type Project={
 title:string;
 /** Texto da logo, escrito como a marca usa. */
 wordmark:string;
 /** Fonte da logo: Lovelo Black (Montê) ou Playfair Display (Key). */
 font:"lovelo"|"playfair";
 url:string;
};

export type Plan={
 number:string;
 name:string;
 price:string;
 intro:string;
 items:string[];
 featured?:boolean;
 details:{label:string;value:string}[];
 extras:string[];
};

export const contact={
 email:"vitorvolpe14@gmail.com",
 whatsapp:{display:"(85) 99715-6891",number:"5585997156891",message:"Olá, Vitor! Vim pelo seu portfólio e quero conversar sobre um projeto."},
 city:"Fortaleza, BR",
};

export const nav=[
 {id:"top",label:"Início"},
 {id:"projetos",label:"Projetos"},
 {id:"servicos",label:"Serviços"},
 {id:"sobre",label:"Sobre"},
 {id:"contato",label:"Contato"},
];

export const disciplines=["Design","Web","Branding","E-commerce","Estratégia"];

export const projects:Project[]=[
 {title:"Montê",wordmark:"MONTÊ",font:"lovelo",url:"https://monte-site-itjk.onrender.com/"},
 {title:"Key",wordmark:"KEY",font:"playfair",url:"https://key-site-jaut.onrender.com/"},
];

export const plans:Plan[]=[
 {
  number:"01",name:"Start",price:"R$ 799",intro:"Ideal para marcas que estão começando.",
  items:["Site institucional (até 5 páginas)","Design personalizado","Responsivo (mobile e desktop)","Integração com redes sociais","Suporte por 30 dias"],
  details:[{label:"Prazo",value:"7–10 dias úteis"},{label:"Ajustes",value:"2 rodadas"},{label:"Suporte",value:"30 dias após a publicação"}],
  extras:["SEO básico","Formulário / WhatsApp","Publicação e configuração de domínio"],
 },
 {
  number:"02",name:"Studio",price:"R$ 1.300",intro:"Para marcas que querem crescer.",featured:true,
  items:["E-commerce completo","Design exclusivo e estratégico","Integração com pagamentos e envio","Área administrativa","Suporte por 90 dias"],
  details:[{label:"Prazo",value:"12–18 dias úteis"},{label:"Ajustes",value:"3 rodadas"},{label:"Suporte",value:"90 dias após a publicação"}],
  extras:["Animações e microinterações","SEO técnico e Open Graph","Deploy e configuração de produção"],
 },
 {
  number:"03",name:"Signature",price:"R$ 2.000",intro:"Solução completa e personalizada.",
  items:["Tudo do plano Studio","Identidade visual da marca","Estratégia de conteúdo","Integrações avançadas (ERP, CRM, etc)","Acompanhamento contínuo"],
  details:[{label:"Prazo",value:"20–30 dias úteis"},{label:"Ajustes",value:"4 rodadas"},{label:"Suporte",value:"Acompanhamento contínuo"}],
  extras:["Direção visual exclusiva","Motion design e interações avançadas","Estrutura preparada para evoluir"],
 },
];

export const steps=[
 {title:"Briefing & direção",text:"Entendo objetivo, público e o que precisa acontecer para o projeto funcionar."},
 {title:"Design & estrutura",text:"Transformo estratégia em hierarquia visual, navegação e componentes consistentes."},
 {title:"Desenvolvimento",text:"Construo interface, responsividade e integrações com foco em performance."},
 {title:"Lançamento & evolução",text:"Publico, testo, acompanho e deixo a base pronta para a próxima fase."},
];

export const stack=["React","TypeScript","JavaScript","CSS","GitHub","Render","Supabase"];
