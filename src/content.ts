// Todo o conteúdo editável do site fica aqui.

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

export type Plan={
 number:string;
 name:string;
 price:string;
 intro:string;
 items:string[];
 featured?:boolean;
 details:{label:string;value:string}[];
 /** Observação curta abaixo do preço (ex.: o que é cobrado à parte). */
 note?:string;
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

export const disciplines=["Sites","E-commerce","Design","Branding"];

export const projects:Project[]=[
 {title:"FØRN.LY",url:"https://fornly-loja.onrender.com/",logo:{image:"/projects/fornly-logo.svg"}},
 {title:"Key",url:"https://key-site-jaut.onrender.com/",logo:{text:"KEY",font:"playfair"}},
 {title:"Caroline e Leandro",url:"https://casamento-carol-e-leandro.vitorvolpe14.workers.dev/",logo:{text:"Caroline e Leandro",font:"wedding",script:"e"}},
 {title:"Montê",url:"https://oficialmontee.com.br/",logo:{text:"MONTÊ",font:"lovelo"},hidden:true},
];

/** Forma de pagamento, igual para todos os planos (aparece no cartão e nos detalhes). */
export const payment={parts:["50% ao contratar","50% na entrega"],full:"50% ao contratar e 50% na entrega"};

/** Quanto mais caro o plano, mais serviços: cada um inclui tudo do anterior. */
export const plans:Plan[]=[
 {
  number:"01",name:"Start",price:"R$ 799",intro:"Ideal para marcas que estão começando.",note:"+ R$ 49/mês de hospedagem e domínio",
  items:["Site institucional (até 5 páginas)","Design personalizado","Site 100% responsivo","Catálogo de produtos com pedido pelo WhatsApp","Integração com redes sociais","Suporte por 30 dias"],
  details:[{label:"Prazo",value:"12–18 dias"},{label:"Ajustes",value:"2 rodadas"},{label:"Suporte",value:"30 dias após a publicação"}],
  extras:["SEO básico e indexação no Google","Política de privacidade","Publicação e configuração de domínio","Mensalidade: hospedagem na Cloudflare, domínio, HTTPS e pequenos ajustes"],
 },
 {
  number:"02",name:"Studio",price:"R$ 1.300",intro:"Para marcas que querem vender online.",featured:true,note:"+ R$ 89/mês de hospedagem e domínio",
  items:["Tudo do plano Start","Loja virtual com gateway de pagamento","Cadastro e catálogo de produtos","Página própria para cada produto","Login de admin da loja","Gerenciador de pedidos e ganhos","Suporte por 90 dias"],
  details:[{label:"Prazo",value:"10–12 dias"},{label:"Ajustes",value:"3 rodadas"},{label:"Suporte",value:"90 dias após a publicação"}],
  extras:["Banco de dados integrado","Termos de uso e política de privacidade","Animações e microinterações","Mensalidade: hospedagem na Cloudflare, domínio, HTTPS e pequenos ajustes"],
 },
 {
  number:"03",name:"Signature",price:"R$ 2.000",intro:"Loja completa, pronta para crescer.",note:"Domínio e hospedagem inclusos",
  items:["Tudo do plano Studio","Login de clientes","Pop-ups de promoções","SEO e copy prontos para tráfego pago","Métricas e indexação nos buscadores","Integração com IA (site reconhecido pelas IAs)","Acompanhamento contínuo"],
  details:[{label:"Prazo",value:"15–20 dias"},{label:"Ajustes",value:"4 rodadas"},{label:"Suporte",value:"Acompanhamento contínuo"}],
  extras:["Direção visual exclusiva","Motion design e interações avançadas","Estrutura preparada para evoluir","Hospedagem na Cloudflare, domínio e HTTPS sem mensalidade"],
 },
];

export const steps=[
 {title:"Briefing & direção",text:"Entendo objetivo, público e o que precisa acontecer para o projeto funcionar."},
 {title:"Design & estrutura",text:"Transformo estratégia em hierarquia visual, navegação e componentes consistentes."},
 {title:"Desenvolvimento",text:"Construo interface, responsividade e integrações com foco em performance."},
 {title:"Lançamento & evolução",text:"Publico, testo, acompanho e deixo a base pronta para a próxima fase."},
];

export const stack=["React","TypeScript","JavaScript","CSS","GitHub","Render","Supabase"];
