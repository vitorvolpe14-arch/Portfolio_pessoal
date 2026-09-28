import{FOX_PATH,FOX_VIEWBOX}from"./foxPath";

export function FoxMark({className}:{className?:string}){
 return <svg className={className} viewBox={FOX_VIEWBOX} aria-hidden="true"><path d={FOX_PATH} fill="currentColor"/></svg>
}

/** Face frontal da logo 3D: raposa preta em mármore negro, com veios, textura e relevo iluminado. */
export function StoneFace(){
 return <svg className="logo3d-face" viewBox={FOX_VIEWBOX} aria-hidden="true">
  <defs>
   <filter id="stone" x="-4%" y="-3%" width="108%" height="106%" colorInterpolationFilters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="grain"/>
    <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="7" result="bumps"/>
    <feTurbulence type="fractalNoise" baseFrequency=".01 .018" numOctaves="3" seed="11" result="cloud"/>
    <feTurbulence type="turbulence" baseFrequency=".005 .013" numOctaves="4" seed="21" result="vein"/>
    <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .33 .33 .33 0 0" result="grainA"/>
    <feColorMatrix in="bumps" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .33 .33 .33 0 0" result="bumpsA"/>
    <feColorMatrix in="cloud" type="matrix" values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1" result="cloudGrey"/>
    <feColorMatrix in="vein" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .33 .33 .33 0 0" result="veinA"/>
    <feComponentTransfer in="veinA" result="veinLines"><feFuncA type="table" tableValues="1 .7 .25 0 0 0 0 0 0 0 0 0 0 0"/></feComponentTransfer>
    <feFlood floodColor="#d9cfc4" floodOpacity=".3" result="veinTint"/>
    <feComposite in="veinTint" in2="veinLines" operator="in" result="veins"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="bevel"/>
    <feComposite in="bevel" in2="bumpsA" operator="arithmetic" k2="1" k3=".52" result="relief"/>
    <feComposite in="relief" in2="grainA" operator="arithmetic" k2="1" k3=".1" result="height"/>
    <feDiffuseLighting in="height" surfaceScale="9" diffuseConstant="1" lightingColor="#fffaf3" result="diffuse">
     <feDistantLight azimuth="225" elevation="55"/>
    </feDiffuseLighting>
    <feSpecularLighting in="height" surfaceScale="9" specularConstant="1.1" specularExponent="30" lightingColor="#fff1e4" result="spec">
     <feDistantLight azimuth="225" elevation="28"/>
    </feSpecularLighting>
    <feComposite in="SourceGraphic" in2="diffuse" operator="arithmetic" k1="1.2" result="lit"/>
    <feComposite in="lit" in2="cloudGrey" operator="arithmetic" k2="1" k3=".05" result="toned"/>
    <feMerge result="marble"><feMergeNode in="toned"/><feMergeNode in="veins"/></feMerge>
    <feComposite in="marble" in2="spec" operator="arithmetic" k2="1" k3=".75" result="shine"/>
    <feComposite in="shine" in2="SourceAlpha" operator="in"/>
   </filter>
  </defs>
  <path d={FOX_PATH} fill="#1b1918" filter="url(#stone)"/>
 </svg>
}

/** Ilustração do card Montê: bolsa de couro. */
export function BagArt(){
 return <svg className="project-art" viewBox="0 0 320 280" aria-hidden="true">
  <defs>
   <radialGradient id="bag-light" cx=".35" cy=".3" r=".75"><stop offset="0" stopColor="#f2b27a" stopOpacity=".55"/><stop offset="1" stopColor="#f2b27a" stopOpacity="0"/></radialGradient>
   <linearGradient id="bag-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a8622f"/><stop offset=".45" stopColor="#6e3616"/><stop offset="1" stopColor="#2e1407"/></linearGradient>
   <linearGradient id="bag-flap" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stopColor="#bd7440"/><stop offset=".6" stopColor="#7a3d19"/><stop offset="1" stopColor="#4a220c"/></linearGradient>
   <linearGradient id="bag-handle" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c17b45"/><stop offset=".5" stopColor="#6b3314"/><stop offset="1" stopColor="#3b1a08"/></linearGradient>
   <linearGradient id="bag-sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0"/><stop offset=".5" stopColor="#ffe3c8" stopOpacity=".35"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient>
   <filter id="bag-soft"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <ellipse cx="170" cy="120" rx="170" ry="140" fill="url(#bag-light)"/>
  <ellipse cx="172" cy="262" rx="120" ry="12" fill="#000" opacity=".55" filter="url(#bag-soft)"/>
  <path d="M112,104 C108,34 236,34 232,104" fill="none" stroke="url(#bag-handle)" strokeWidth="13" strokeLinecap="round"/>
  <path d="M116,100 C114,44 230,44 228,100" fill="none" stroke="#e8b88c" strokeOpacity=".35" strokeWidth="2"/>
  <path d="M82,112 Q80,100 94,98 L250,98 Q264,100 262,112 L280,238 Q282,256 264,258 L80,258 Q62,256 64,238 Z" fill="url(#bag-body)"/>
  <path d="M86,104 L258,104 L248,168 Q172,190 96,168 Z" fill="url(#bag-flap)"/>
  <path d="M96,168 Q172,190 248,168" fill="none" stroke="#1d0c03" strokeOpacity=".6" strokeWidth="5"/>
  <path d="M94,110 L250,110 L242,162 Q172,182 102,162 Z" fill="none" stroke="#f5cfa6" strokeOpacity=".4" strokeWidth="1.2" strokeDasharray="4 4"/>
  <rect x="158" y="168" width="28" height="24" rx="4" fill="none" stroke="#e4bf85" strokeWidth="3.5"/>
  <rect x="170" y="164" width="4" height="30" rx="2" fill="#e4bf85"/>
  <path d="M92,120 L100,240" stroke="url(#bag-sheen)" strokeWidth="18" opacity=".5"/>
 </svg>
}

/** Ilustração do card Key: caixa rosé com fita. */
export function BoxArt(){
 return <svg className="project-art" viewBox="0 0 320 280" aria-hidden="true">
  <defs>
   <radialGradient id="box-light" cx=".4" cy=".25" r=".8"><stop offset="0" stopColor="#ffe3d8" stopOpacity=".55"/><stop offset="1" stopColor="#ffe3d8" stopOpacity="0"/></radialGradient>
   <linearGradient id="box-front" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f0c3b2"/><stop offset="1" stopColor="#c48b7b"/></linearGradient>
   <linearGradient id="box-side" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c68f80"/><stop offset="1" stopColor="#9d665a"/></linearGradient>
   <linearGradient id="box-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fbdccf"/><stop offset="1" stopColor="#e7b3a2"/></linearGradient>
   <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff1ea"/><stop offset="1" stopColor="#e3b0a1"/></linearGradient>
   <filter id="box-soft"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <ellipse cx="180" cy="110" rx="170" ry="140" fill="url(#box-light)"/>
  <g stroke="#7d4f45" strokeOpacity=".45" strokeWidth="1.4" fill="none">
   <path d="M262,18 C252,50 250,80 256,112"/><path d="M256,52 C270,44 282,46 292,40"/><path d="M252,78 C240,70 228,72 220,64"/>
  </g>
  <g fill="#f7cfc3" opacity=".75"><circle cx="292" cy="40" r="5"/><circle cx="220" cy="64" r="4"/><circle cx="262" cy="18" r="4"/><circle cx="283" cy="45" r="3"/></g>
  <ellipse cx="170" cy="258" rx="125" ry="12" fill="#5a2f27" opacity=".45" filter="url(#box-soft)"/>
  <polygon points="72,122 206,138 206,256 72,240" fill="url(#box-front)"/>
  <polygon points="206,138 262,112 262,226 206,256" fill="url(#box-side)"/>
  <polygon points="66,118 122,92 268,108 210,134" fill="url(#box-top)"/>
  <polygon points="66,118 210,134 210,152 66,136" fill="#e9b8a7"/>
  <polygon points="210,134 268,108 268,126 210,152" fill="#b98072"/>
  <polygon points="94,121 108,123 108,245 94,243" fill="url(#ribbon)" opacity=".9"/>
  <polygon points="94,121 108,123 150,103 136,101" fill="url(#ribbon)" opacity=".9"/>
  <path d="M101,236 C80,222 70,244 84,252 C92,256 100,246 101,236 Z" fill="url(#ribbon)"/>
  <path d="M101,236 C120,224 132,244 118,252 C110,256 102,246 101,236 Z" fill="url(#ribbon)"/>
  <path d="M100,238 L90,270 M102,238 L112,268" stroke="#f2cabd" strokeWidth="5" strokeLinecap="round"/>
  <g transform="matrix(1 .118 0 1 0 0)">
   <text x="126" y="180" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="38" fontStyle="italic" fill="#fbe2d8" opacity=".6">CLÉ</text>
   <text x="125" y="179" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="38" fontStyle="italic" fill="#b17868" opacity=".75">CLÉ</text>
  </g>
 </svg>
}

export function ArrowRight({className}:{className?:string}){
 return <svg className={className} viewBox="0 0 20 12" aria-hidden="true"><path d="M1 6h17M13 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
export function ArrowUpRight({className}:{className?:string}){
 return <svg className={className} viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 12.5l9-9M5.5 3.5h7v7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
export function Check(){
 return <svg className="check" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="currentColor"/><path d="M4.6 8.2l2.2 2.2 4.6-4.8" fill="none" stroke="#0b0a09" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
export function Play(){
 return <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" fill="currentColor"/></svg>
}
