// Todo o conteúdo editável do site fica aqui.

/** Por enquanto os cards mostram só o nome; descrição, tags e link ficam guardados para depois. */
export type Project={
 number:string;
 title:string;
 description:string;
 tags:string[];
 /** Link público do projeto. Sem link, o botão leva para o contato. */
 url?:string;
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

export const stats=[
 {value:"2",label:"Projetos"},
 {value:"+50K",label:"Usuários alcançados"},
 {value:"100%",label:"Foco em resultado"},
];

export const projects:Project[]=[
 {number:"01",title:"Montê",description:"E-commerce de bolsas em couro com identidade visual e experiência premium.",tags:["E-commerce","Branding","UI/UX"]},
 {number:"02",title:"Key",description:"Marca de moda com identidade minimalista e e-commerce integrado.",tags:["E-commerce","Branding","UI/UX"]},
];

export const plans:Plan[]=[
 {
  number:"01",name:"Start",price:"R$ 1.500",intro:"Ideal para marcas que estão começando.",
  items:["Site institucional (até 5 páginas)","Design personalizado","Responsivo (mobile e desktop)","Integração com redes sociais","Suporte por 30 dias"],
  details:[{label:"Prazo",value:"7–10 dias úteis"},{label:"Ajustes",value:"2 rodadas"},{label:"Suporte",value:"30 dias após a publicação"}],
  extras:["SEO básico","Formulário / WhatsApp","Publicação e configuração de domínio"],
 },
 {
  number:"02",name:"Studio",price:"R$ 3.500",intro:"Para marcas que querem crescer.",featured:true,
  items:["E-commerce completo","Design exclusivo e estratégico","Integração com pagamentos e envio","Área administrativa","Suporte por 90 dias"],
  details:[{label:"Prazo",value:"12–18 dias úteis"},{label:"Ajustes",value:"3 rodadas"},{label:"Suporte",value:"90 dias após a publicação"}],
  extras:["Animações e microinterações","SEO técnico e Open Graph","Deploy e configuração de produção"],
 },
 {
  number:"03",name:"Signature",price:"R$ 6.500",intro:"Solução completa e personalizada.",
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
