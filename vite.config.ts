import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {dirname,join,resolve} from "node:path";
import {defineConfig,type Plugin} from "vite";
import react from "@vitejs/plugin-react";
import {copy,languages,site} from "./src/content";

const attr=(s:string)=>s.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");

/**
 * Uma página por idioma: dist/index.html (português), dist/en/index.html e dist/it/index.html.
 * Cada uma sai com idioma, título, descrição, endereço e imagem de prévia (public/og/<idioma>.jpg) próprios
 * e com os links hreflang que ligam as três versões. O conteúdo vem de src/content.ts.
 */
function languagePages():Plugin{
 let outDir="dist";
 return{
  name:"language-pages",
  apply:"build",
  configResolved(config){outDir=resolve(config.root,config.build.outDir)},
  closeBundle(){
   const base=readFileSync(join(outDir,"index.html"),"utf8");
   const alternates=languages.map(l=>`<link rel="alternate" hreflang="${l.htmlLang}" href="${site}${l.path}"/>`).join("")
    +`<link rel="alternate" hreflang="x-default" href="${site}/"/>`;
   for(const l of languages){
    const m=copy[l.id].meta,url=site+l.path,image=`${site}/og/${l.id}.jpg`;
    const html=base
     .replace(/<html lang="[^"]*"/,()=>`<html lang="${l.htmlLang}"`)
     .replace(/<title>[\s\S]*?<\/title>/,()=>`<title>${attr(m.title)}</title>`)
     .replace(/(<meta name="description" content=")[^"]*/,(_,a)=>a+attr(m.description))
     .replace(/(<meta property="og:title" content=")[^"]*/,(_,a)=>a+attr(m.ogTitle))
     .replace(/(<meta property="og:description" content=")[^"]*/,(_,a)=>a+attr(m.ogDescription))
     .replace(/(<meta property="og:url" content=")[^"]*/,(_,a)=>a+url)
     .replace(/(<meta property="og:image" content=")[^"]*/,(_,a)=>a+image)
     .replace(/(<meta property="og:image:alt" content=")[^"]*/,(_,a)=>a+attr(m.ogImageAlt))
     .replace(/(<meta name="twitter:image" content=")[^"]*/,(_,a)=>a+image)
     .replace(/(<link rel="canonical" href=")[^"]*/,(_,a)=>a+url)
     .replace("</head>",()=>`<meta property="og:locale" content="${l.locale}"/>${alternates}</head>`);
    const file=join(outDir,l.path,"index.html");
    mkdirSync(dirname(file),{recursive:true});
    writeFileSync(file,html);
   }
  },
 };
}

export default defineConfig({plugins:[react(),languagePages()]});
