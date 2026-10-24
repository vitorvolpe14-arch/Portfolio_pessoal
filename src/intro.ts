// @ts-nocheck — o three.js (r170, em src/vendor) entra só aqui, por import dinâmico; os tipos dele não fazem parte do projeto.
/**
 * Abertura do site (primeira visita da sessão): uma bola de areia explode em 3D, a nuvem gira em volta da câmera
 * e se junta na raposa, que vira a logo com "VOLPE" embaixo. Depois a raposa desliza até o lugar da logo 3D do topo
 * e o fundo some, deixando a página no lugar. Clicar, rolar ou apertar Esc/Espaço adianta.
 */

const VB={x:-26.67,y:-26.67,w:541.33,h:940.33},S=1/200,AW=VB.w*S,AH=VB.h*S;
const clamp=(v:number)=>Math.min(1,Math.max(0,v));
const inOut=(t:number)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const outCubic=(t:number)=>1-Math.pow(1-t,3);

async function raster(url:string,w:number){
 const h=Math.round(w*VB.h/VB.w);
 const src=(await (await fetch(url)).text()).replace("<svg ",`<svg width="${w}" height="${h}" `);
 const blob=URL.createObjectURL(new Blob([src],{type:"image/svg+xml"}));
 const img=new Image();img.src=blob;await img.decode();
 const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d")!.drawImage(img,0,0,w,h);URL.revokeObjectURL(blob);
 return c;
}

const SAND=`
 uniform float uTime,uForm,uLoose,uSweep,uSolid,uAir,uPR,uH,uFocus,uGrain,uBoom;
 attribute float aTone,aKind;attribute vec4 aSeed;
 varying float vTone,vGlow,vA;
 mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
 void main(){
  vec3 lp;float a=1.,e=0.;
  float th=aSeed.y*6.2832,ph=acos(2.*aSeed.z-1.);
  vec3 dir=vec3(sin(ph)*cos(th),cos(ph),sin(ph)*sin(th));
  float tb=max(uTime-uBoom,0.);
  float burst=1.-exp(-tb*3.4);
  float r0=aKind<.5?(1.8+aSeed.w*6.):(3.+aSeed.w*10.);
  float ball=.34*pow(aSeed.w,.33)*(1.+.07*sin(uTime*22.+aSeed.x*40.));
  vec3 E=dir*mix(ball,r0,burst);
  E.xz=rot(tb*(.32+.45*aSeed.x)*burst)*E.xz;
  E+=vec3(sin(uTime*1.3+aSeed.x*20.),cos(uTime*1.1+aSeed.y*20.),sin(uTime*.9+aSeed.z*20.))*.28*burst;
  if(aKind<.5){
   float f=smoothstep(aSeed.x,aSeed.x+.42,uForm);
   e=f*f*(3.-2.*f);
   lp=mix(E,position,e);
   lp.xz=rot((1.-e)*(1.-e)*2.4)*lp.xz;
   float loose=step(aSeed.w,.08)*smoothstep(aSeed.z*.6,aSeed.z*.6+.4,uLoose);
   lp.x+=loose*uLoose*5.*(.5+aSeed.y);lp.y+=loose*(sin(uLoose*5.+aSeed.x*20.)*.3+uLoose*.8*(aSeed.x-.2));lp.z+=loose*uLoose*1.5*(aSeed.z-.5);
   a=(1.-loose*smoothstep(.2,1.,uLoose))*(1.-uSolid);
   float band=dot(position.xy,normalize(vec2(1.,.5)));
   vGlow=exp(-pow((band-uSweep)/.3,2.))*e;
  }else{
   lp=E+vec3(.35,-.3,0.)*tb;
   a=uAir*(.5+.5*aSeed.w)*.32;vGlow=0.;
  }
  vec4 mv=modelViewMatrix*vec4(lp,1.);
  gl_Position=projectionMatrix*mv;
  float depth=-mv.z;
  float coc=abs(depth-uFocus)*.5*(1.-e*.9);
  float base=uGrain*(aKind<.5?(.8+.4*aSeed.y):(.7+.5*aSeed.y));
  float size=base*(1.25-.25*e)+coc*.04;
  gl_PointSize=clamp(size*uH*uPR/(depth*.536),1.,70.*uPR);
  vA=a*clamp(base*base/(size*size),.06,1.)*(.72+.28*e);
  vTone=aTone;
 }`;

export async function playIntro({target,skipLabel}:{target:()=>DOMRect|null;skipLabel:string}):Promise<void>{
 let THREE:any,art:HTMLCanvasElement,renderer:any;
 try{
  [THREE,art]=await Promise.all([import("./vendor/three.module.min.js"),raster("/fox-vector-black.svg",1100)]);
 }catch{return}

 const el=document.createElement("div");el.className="intro";el.setAttribute("aria-hidden","true");
 const canvas=document.createElement("canvas");
 const mark=document.createElement("p");mark.className="intro-mark";mark.textContent="Volpe";
 const skipBtn=document.createElement("button");skipBtn.type="button";skipBtn.className="intro-skip";skipBtn.textContent=skipLabel;skipBtn.removeAttribute("aria-hidden");
 el.append(canvas,mark,skipBtn);
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true})}catch{return}
 document.body.append(el);

 // ---------- Grãos: amostrados da própria arte ----------
 const narrow=innerWidth<700;
 const FOX=narrow?34000:56000,AIR=narrow?4000:8000,COUNT=FOX+AIR;
 const small=document.createElement("canvas");small.width=360;small.height=Math.round(360*VB.h/VB.w);
 const sx=small.getContext("2d")!;sx.drawImage(art,0,0,small.width,small.height);
 const px=sx.getImageData(0,0,small.width,small.height).data;
 const inside:number[]=[];for(let y=0;y<small.height;y++)for(let x=0;x<small.width;x++){if(px[(y*small.width+x)*4+3]>140)inside.push(x,y)}
 const pos=new Float32Array(COUNT*3),tone=new Float32Array(COUNT),seed=new Float32Array(COUNT*4),kind=new Float32Array(COUNT);
 for(let i=0;i<COUNT;i++){
  seed[i*4]=Math.random();seed[i*4+1]=Math.random();seed[i*4+2]=Math.random();seed[i*4+3]=Math.random();
  if(i<FOX){
   const k=(Math.random()*inside.length/2|0)*2,x=inside[k]+Math.random(),y=inside[k+1]+Math.random();
   const o=((y|0)*small.width+(x|0))*4,l=(px[o]+px[o+1]+px[o+2])/765;
   tone[i]=Math.min(1,l/.5);
   pos[i*3]=(x/small.width-.5)*AW;pos[i*3+1]=-(y/small.height-.5)*AH;pos[i*3+2]=(l-.18)*.5;
   seed[i*4]=.4*Math.random()+.16*(1-y/small.height);
  }else{kind[i]=1;tone[i]=.4+Math.random()*.6}
 }
 const foxArea=AW*AH*(inside.length/2)/(small.width*small.height);
 const geo=new THREE.BufferGeometry();
 geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
 geo.setAttribute("aTone",new THREE.BufferAttribute(tone,1));
 geo.setAttribute("aSeed",new THREE.BufferAttribute(seed,4));
 geo.setAttribute("aKind",new THREE.BufferAttribute(kind,1));
 const U={uTime:{value:0},uForm:{value:0},uLoose:{value:0},uSweep:{value:-9},uSolid:{value:0},uAir:{value:1},uPR:{value:1},uH:{value:800},uFocus:{value:16},uGrain:{value:Math.sqrt(3.6*foxArea/FOX)},uBoom:{value:.5}};
 const sand=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,depthTest:false,
  blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,
  vertexShader:SAND,
  fragmentShader:`varying float vTone,vGlow,vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.15,d)*vA*.85;if(a<.003)discard;vec3 c=vec3(.045+.3*vTone)+vec3(.3)*vGlow;gl_FragColor=vec4(c*a,a);}`});
 const points=new THREE.Points(geo,sand);points.frustumCulled=false;

 // Fundo creme com grão (alpha controla o rastro do vento e a saída)
 const bgMat=new THREE.ShaderMaterial({uniforms:{uK:{value:1},uAspect:{value:1},uTime:U.uTime},depthTest:false,depthWrite:false,transparent:true,
  vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",
  fragmentShader:`uniform float uK,uAspect,uTime;varying vec2 vUv;
   float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
   void main(){vec2 q=(vUv-vec2(.5,.47))*vec2(uAspect,1.);vec3 c=mix(vec3(1.),vec3(.965,.95,.93),smoothstep(0.,1.1,length(q)*1.3));
    c+=(h(gl_FragCoord.xy+fract(uTime*7.)*517.)-.5)*.03;gl_FragColor=vec4(c,uK);}`});
 const bgScene=new THREE.Scene();bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),bgMat));
 bgScene.children[0].frustumCulled=false;

 const tex=new THREE.CanvasTexture(art);tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
 const artMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,uniforms:{uT:{value:tex},uO:{value:0}},
  vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
  fragmentShader:"uniform sampler2D uT;uniform float uO;varying vec2 vUv;void main(){vec4 c=texture2D(uT,vUv);gl_FragColor=vec4(c.rgb,c.a*uO);}"});
 const plane=new THREE.Mesh(new THREE.PlaneGeometry(AW,AH),artMat);

 const scene=new THREE.Scene(),group=new THREE.Group();group.add(plane,points);plane.renderOrder=0;points.renderOrder=1;scene.add(group);
 const camera=new THREE.PerspectiveCamera(30,1,.1,100);
 renderer.autoClear=false;renderer.setClearColor(0xfaf8f5,0);
 const PR=Math.min(devicePixelRatio||1,2);renderer.setPixelRatio(PR);U.uPR.value=PR;
 const TAN=Math.tan(THREE.MathUtils.degToRad(15));

 let W=1,H=1,Z=16.5;const LIFT=.4;
 const resize=()=>{
  W=Math.max(1,innerWidth);H=Math.max(1,innerHeight);
  renderer.setSize(W,H,false);camera.aspect=W/H;
  Z=16.5*Math.max(1,(AW*1.9)/(2*TAN*camera.aspect*16.5));
  camera.position.set(0,0,Z);camera.lookAt(0,0,0);camera.updateProjectionMatrix();camera.updateMatrixWorld();
  U.uH.value=H;U.uFocus.value=Z;bgMat.uniforms.uAspect.value=W/H;
  const v=new THREE.Vector3(0,-AH/2+.2+LIFT,0).project(camera);
  mark.style.top=((1-v.y)/2*H+Math.max(22,H*.04))+"px";
 };
 addEventListener("resize",resize);resize();

 // ---------- Linha do tempo (segundos) ----------
 const HAND=5.65,HAND_DUR=1.15,END=HAND+HAND_DUR+.05;
 let t0=0,t=0,skipTo=0,raf=0,to:{x:number;y:number;s:number}|null=null;
 return new Promise<void>(resolve=>{
  const frame=(now:number)=>{
   if(!t0)t0=now;
   t=(now-t0)/1000+skipTo;
   U.uTime.value=t;
   U.uForm.value=clamp((t-1)/2.9);
   const turn=inOut(clamp((t-.3)/3.9)),dolly=inOut(clamp(t/4.3));
   group.rotation.set(.3*(1-turn),1.05*(1-turn),.05*(1-turn));
   const sh=t>.5&&t<1.4?.14*Math.exp(-(t-.5)*6):0;
   camera.position.set((Math.random()-.5)*sh,(Math.random()-.5)*sh,Z*(1+.28*(1-dolly)));camera.lookAt(0,0,0);
   U.uFocus.value=camera.position.z;
   U.uSweep.value=-3.4+6.8*clamp((t-3.9)/1.1);
   U.uLoose.value=clamp((t-4)/2.2);
   artMat.uniforms.uO.value=outCubic(clamp((t-4)/.8));
   U.uSolid.value=inOut(clamp((t-4.15)/.75));
   U.uAir.value=1-clamp((t-4.6)/1.3);
   el.classList.toggle("mark-in",t>5.15&&t<HAND);
   // saída: a raposa desliza até a logo do topo e o fundo some
   let lift=LIFT*inOut(clamp((t-4.6)/.9));
   const h=inOut(clamp((t-HAND)/HAND_DUR));
   if(t>=HAND&&!to){
    const r=target(),ppw=H/(2*Z*TAN);
    to=r?{x:(r.left+r.width/2-W/2)/ppw,y:-(r.top+r.height/2-H/2)/ppw,s:r.height/(AH*ppw)}:{x:0,y:LIFT,s:1};
   }
   if(to){group.position.set(to.x*h,lift+(to.y-lift)*h,0);group.scale.setScalar(1+(to.s-1)*h)}
   else group.position.set(0,lift,0);
   // rastro do vento enquanto a areia voa; imagem limpa quando assenta
   const k=t<.5?1:t<1.7?.42:t<3.7?.6:t<4.4?.6+.4*inOut((t-3.7)/.7):1;
   bgMat.uniforms.uK.value=k>=1?1-h:k;
   renderer.clearDepth();
   if(k>=1)renderer.clear();
   renderer.render(bgScene,camera);renderer.render(scene,camera);
   if(t<END)raf=requestAnimationFrame(frame);else finish();
  };
  const finish=()=>{
   cancelAnimationFrame(raf);removeEventListener("resize",resize);removeEventListener("keydown",onKey);removeEventListener("wheel",skip);removeEventListener("touchmove",skip);
   el.style.transition="opacity .45s ease";el.style.opacity="0";el.style.pointerEvents="none";
   setTimeout(()=>{el.remove();geo.dispose();sand.dispose();bgMat.dispose();artMat.dispose();tex.dispose();renderer.dispose()},500);
   resolve();
  };
  const skip=()=>{if(t<4.3)skipTo+=4.3-t;else if(t<HAND)skipTo+=HAND-t};
  const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"||e.key===" "||e.key==="Enter"){e.preventDefault();skip()}};
  el.addEventListener("click",skip);
  addEventListener("keydown",onKey);addEventListener("wheel",skip,{passive:true});addEventListener("touchmove",skip,{passive:true});
  raf=requestAnimationFrame(frame);
 });
}
