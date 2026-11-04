import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/environments/RoomEnvironment.js';

// The original HTML remains the fallback if WebGL or the CDN is unavailable.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  await document.fonts.ready;
  try { await start(); } catch (error) { console.warn('Modo estático ativado.', error); }
}
async function start() {

  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true});
  const brand = new Image(); brand.src = "brand.webp"; await brand.decode();
  if (document.documentElement.dataset.glassFallback === 'true') { renderer.dispose(); return; }
  const githubMark = new Path2D('M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12');
  renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio,1.5),2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(30,1,1,12000);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  scene.environment=pmrem.fromScene(room,.04).texture;
  scene.environmentIntensity=.42;
  room.dispose(); pmrem.dispose();
  const key=new THREE.DirectionalLight(0xcbd9ff,3); key.position.set(-500,600,900);scene.add(key);
  const fill=new THREE.PointLight(0x7950ef,18000,2500);fill.position.set(450,-100,700);scene.add(fill);
  const group=new THREE.Group();scene.add(group);
  const stage=document.createElement('div');stage.id='glass-stage';stage.setAttribute('aria-label','Apresentação interativa em vidro');stage.append(renderer.domElement);document.body.append(stage);
  const back=document.createElement('button');back.id='glass-back';back.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m11 5-7 7 7 7M4 12h16"/></svg><span>Voltar à apresentação</span>';document.querySelector('body > header').append(back);
  let W,H,bw,bh,pw,ph,navH,scale,portrait,pieces=[],texture,open=false,target=0,progress=1,last=performance.now(),geometryTime=0,hover=-1,active=false;
  let transitionStart=performance.now(),transitionFrom=1,transitioning=true,destination='#projetos';
  const pointer=new THREE.Vector2(2,2),ray=new THREE.Raycaster(),cursor=new THREE.Vector3();
  const glow={value:new THREE.Vector3(10000,10000,0)},glowAmount={value:0};
  const baseMaterial=new THREE.MeshPhysicalMaterial({color:0x17131f,roughness:.36,clearcoat:.7,clearcoatRoughness:.12,specularIntensity:.7,iridescence:.55,iridescenceIOR:1.3,iridescenceThicknessRange:[250,650],envMapIntensity:1});
  baseMaterial.onBeforeCompile=shader=>{
    shader.uniforms.cursorWorld=glow;shader.uniforms.cursorAmount=glowAmount;
    shader.vertexShader='varying vec3 glassWorld;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nglassWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
    shader.fragmentShader='uniform vec3 cursorWorld; uniform float cursorAmount; varying vec3 glassWorld;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(.42,.37,.62)*.16*cursorAmount*exp(-1.6*pow(distance(glassWorld.xy,cursorWorld.xy)/300.0,2.0));');
  };
  function shape(points) {
    const c=points.reduce((a,p)=>[a[0]+p[0]/points.length,a[1]+p[1]/points.length],[0,0]);
    const pts=points.map(p=>{const d=Math.hypot(p[0]-c[0],p[1]-c[1]);return new THREE.Vector2(p[0]+(c[0]-p[0])*Math.min(6*scale/d,.15),p[1]+(c[1]-p[1])*Math.min(6*scale/d,.15));});
    const s=new THREE.Shape(),r=20*scale;
    const corners=pts.map((p,i)=>{const prev=pts[(i+pts.length-1)%pts.length],next=pts[(i+1)%pts.length];return [p.clone().lerp(prev,Math.min(r/p.distanceTo(prev),.2)),p,p.clone().lerp(next,Math.min(r/p.distanceTo(next),.2))];});
    s.moveTo(corners[0][0].x,corners[0][0].y);
    corners.forEach(([a,b,c],i)=>{if(i)s.lineTo(a.x,a.y);s.quadraticCurveTo(b.x,b.y,c.x,c.y);});s.closePath();return s;
  }
  function pattern(t) {
    const points=[[0,0],[.22,0],[.515,0],[.84,0],[1,0],[1,1],[.865,1],[.34,1],[0,1],[.385,.72],[.48,.62],[.716,.49]];
    return points.map(([x,y],i)=>{
      if (![0,4,5,8].includes(i)) {x+=Math.sin(t*(.36+i*.019)+i)*.018;if(i>8)y+=Math.sin(t*.41+i)*.027;
        const ux=cursor.x/pw+.5,uy=.5-(cursor.y+navH/2+7)/ph;
        const dx=x-ux,dy=y-uy,d=Math.hypot(dx,dy);if(active&&d<.6&&d>.001){const push=(1-d/.6)*.035;x+=dx/d*push;if(i>8)y+=dy/d*push;}}
      if(portrait)[x,y]=[y,x];
      return [(x-.5)*pw,(.5-y)*ph-navH/2-7];
    });
  }
  function rebuild(t) {
    const p=pattern(t),cells=[[0,1,9,7,8],[1,2,10,9],[2,3,11,10],[9,10,11,6,7],[3,4,5,6,11]];
    const mobileCuts=[0,.20,.80,.86,.93,1];const bodyOutlines=portrait?mobileCuts.slice(0,-1).map((cut,i)=>[[-pw/2,ph/2-cut*ph-navH/2-7],[pw/2,ph/2-cut*ph-navH/2-7],[pw/2,ph/2-mobileCuts[i+1]*ph-navH/2-7],[-pw/2,ph/2-mobileCuts[i+1]*ph-navH/2-7]]):cells.map(c=>c.map(i=>p[i]));
    const top=bh/2;const outlines=[[[ -bw/2,top],[bw/2,top],[bw/2,top-navH],[-bw/2,top-navH]],...bodyOutlines];
    outlines.forEach((points,i)=>{
      const s=shape(points),g=new THREE.ExtrudeGeometry(s,{depth:13*scale,bevelEnabled:true,bevelThickness:2.6*scale,bevelSize:2.6*scale,bevelSegments:3,steps:1,curveSegments:6});
      const face=new THREE.ShapeGeometry(s,6),pos=face.attributes.position,uv=face.attributes.uv;
      for(let j=0;j<pos.count;j++)uv.setXY(j,pos.getX(j)/bw+.5,pos.getY(j)/bh+.5);
      uv.needsUpdate=true;
      const item=pieces[i];item.mesh.geometry.dispose();item.mesh.geometry=g;item.print.geometry.dispose();item.print.geometry=face;item.pick.geometry=face;
      item.center.set(points.reduce((sum,p)=>sum+p[0]/points.length,0),points.reduce((sum,p)=>sum+p[1]/points.length,0),0);
      item.dom.style.clipPath='polygon('+points.map(([x,y])=>`${(x/bw+.5)*100}% ${( .5-y/bh)*100}%`).join(',')+')';
    });
  }
  function canvasContent() {
    const c=document.createElement('canvas'),dpr=Math.min(3,renderer.capabilities.maxTextureSize/Math.max(bw,bh));c.width=Math.round(bw*dpr);c.height=Math.round(bh*dpr);const x=c.getContext('2d');x.scale(dpr,dpr);
    const pad=portrait?26:Math.max(45,bw*.045),top=navH+14,fs=portrait?Math.min(bw*.125,ph*.16):Math.min(bw*.078,ph*.20),hy=top+ph*.26;
    const logoSize=Math.min(navH-12,68);x.drawImage(brand,pad-8,(navH-logoSize)/2,logoSize,logoSize);
    x.font='12px Inter, Arial';x.fillStyle='#c6bfd1';x.textBaseline='middle';x.fillText('Projetos',bw-pad-230,navH/2);x.fillText('Sobre',bw-pad-135,navH/2);x.fillText('Contato',bw-pad-65,navH/2);
    x.font=`${Math.max(10,11*scale)}px Inter, Arial`;x.fillStyle='#bba4df';x.fillText('N8N  /  INTEGRAÇÕES  /  DESENVOLVIMENTO',pad,top+ph*.135);
    x.textBaseline='top';x.font=`500 ${fs}px Inter, Arial`;const gradient=x.createLinearGradient(0,hy,0,hy+fs*2);gradient.addColorStop(0,'#f2edf9');gradient.addColorStop(1,'#bda2ed');x.fillStyle=gradient;x.fillText('Do processo',pad,hy);x.fillText('à solução.',pad,hy+fs*.99);
    const sy=hy+fs*2.3,small=portrait?13:Math.max(14,17*scale);x.font=`${small}px Inter, Arial`;x.fillStyle='#b7b0c2';
    const lines=portrait?['Sou Lucas Escouto. Conecto sistemas,','desenvolvo ferramentas e automatizo','processos com n8n e JavaScript.']:['Sou Lucas Escouto. Conecto sistemas, desenvolvo ferramentas','e transformo processos de negócio com n8n e JavaScript.'];
    lines.forEach((l,i)=>x.fillText(l,pad,sy+i*small*1.6));
    const by=sy+lines.length*small*1.6+28,buttonW=portrait?170:190,buttonH=42;
    x.fillStyle='#2864e8';x.beginPath();x.roundRect(pad,by,buttonW,buttonH,6);x.fill();x.fillStyle='#fff';x.font='13px Inter, Arial';x.textBaseline='middle';const label='Explorar meus projetos',labelSize=Math.min(13,13*(buttonW-48)/x.measureText(label).width);x.font=`${labelSize}px Inter, Arial`;x.fillText(label,pad+16,by+21);x.save();x.strokeStyle='#fff';x.lineWidth=1.5;x.lineCap='round';x.lineJoin='round';const arrowX=pad+buttonW-20,arrowY=by+21;x.beginPath();x.moveTo(arrowX-6,arrowY);x.lineTo(arrowX+4,arrowY);x.moveTo(arrowX,arrowY-4);x.lineTo(arrowX+4,arrowY);x.lineTo(arrowX,arrowY+4);x.stroke();x.restore();x.font='13px Inter, Arial';x.fillStyle='#c9bedc';x.fillText('GitHub',pad+buttonW+23,by+21);x.save();x.translate(pad+buttonW+77,by+13);x.scale(16/24,16/24);x.fill(githubMark);x.restore();
    x.font='10px Inter, Arial';x.fillStyle='#82778e';x.fillText('Lucas Escouto · Desenvolvimento & automação',pad,bh-26);if(!portrait)x.fillText('MOVA O CURSOR · EXPLORE AS CONEXÕES',bw-pad-245,bh-26);
    const links=[['Projetos','#projetos',bw-pad-245,navH/2-20,80,40],['Sobre','#sobre',bw-pad-150,navH/2-20,70,40],['Contato','#contato',bw-pad-75,navH/2-20,85,40],['Explorar meus projetos','#projetos',pad,by,buttonW,buttonH],['GitHub','https://github.com/alucardtdrk',pad+buttonW+16,by,90,buttonH]];
    const html=`<h1 style="left:${pad}px;top:${hy}px;font-size:${fs}px">Do processo<br>à solução.</h1><p style="left:${pad}px;top:${sy}px;font-size:${small}px">${lines.join('<br>')}</p>`+links.map(([label,url,l,t,w,h])=>`<a href="${url}" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px">${label}</a>`).join('');
    return {canvas:c,html};
  }
  function resize() {
    W=innerWidth;H=innerHeight;portrait=W<H*.85;const margin=portrait?16:W*.055;bw=W-2*margin;bh=H-(portrait?32:H*.17);scale=Math.max(.45,bw/1730);navH=Math.max(62,bh*.108);pw=bw;ph=bh-navH-14;
    renderer.setSize(W,H);camera.aspect=W/H;camera.position.z=H/(2*Math.tan(Math.PI/12));camera.updateProjectionMatrix();
    pieces.forEach(i=>{group.remove(i.mesh);i.mesh.geometry.dispose();i.print.geometry.dispose();i.mesh.material.dispose();i.print.material.dispose();i.dom.remove();});pieces=[];texture?.dispose();
    const content=canvasContent();texture=new THREE.CanvasTexture(content.canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
    for(let i=0;i<6;i++){
      const mesh=new THREE.Mesh(new THREE.BufferGeometry(),baseMaterial.clone());mesh.material.onBeforeCompile=baseMaterial.onBeforeCompile;
      const print=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));print.position.z=15.6*scale+1;mesh.add(print);group.add(mesh);
      const pick=new THREE.Mesh(print.geometry,print.material);
      const dom=document.createElement('div');dom.className='glass-dom';dom.style.width=bw+'px';dom.style.height=bh+'px';dom.innerHTML=content.html;stage.append(dom);
      // One accessible copy; clipped visual copies share the same keyboard-free hit areas.
      if(i) {dom.setAttribute('aria-hidden','true');dom.querySelectorAll('a').forEach(a=>a.tabIndex=-1);}
      dom.addEventListener('click',e=>{const a=e.target.closest('a');if(a?.getAttribute('href').startsWith('#')){e.preventDefault();reveal(a.hash);}});
      pieces.push({mesh,print,pick,dom,center:new THREE.Vector3(),tiltX:0,tiltY:0,lift:0,velocity:0,index:i});
    }
    rebuild(0);
  }
  // Homography maps each selectable DOM slice onto its moving glass face.
  function projectDOM(item) {
    const z=15.6*scale+1,pts=[[-bw/2,bh/2],[bw/2,bh/2],[bw/2,-bh/2],[-bw/2,-bh/2]].map(([x,y])=>{const v=new THREE.Vector3(x,y,z);item.mesh.localToWorld(v);v.project(camera);return [(v.x+1)*W/2,(1-v.y)*H/2];});
    const source=[[0,0],[bw,0],[bw,bh],[0,bh]],a=[];
    for(let i=0;i<4;i++){const [x,y]=source[i],[u,v]=pts[i];a.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);}
    for(let i=0;i<8;i++){let k=i;for(let j=i+1;j<8;j++)if(Math.abs(a[j][i])>Math.abs(a[k][i]))k=j;[a[i],a[k]]=[a[k],a[i]];const d=a[i][i];if(Math.abs(d)<1e-10)return;for(let j=i;j<9;j++)a[i][j]/=d;for(let r=0;r<8;r++)if(r!==i){const f=a[r][i];for(let j=i;j<9;j++)a[r][j]-=f*a[i][j];}}
    const h=a.map(r=>r[8]);item.dom.style.transform=`matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`;
  }
  function reveal(hash='#projetos') {
    if(open||transitioning)return;
    open=true;target=1;destination=hash;transitionFrom=progress;transitionStart=performance.now();transitioning=true;stage.inert=true;
  }
  back.onclick=()=>{
    if(transitioning)return;
    open=false;target=0;transitionFrom=progress;transitionStart=performance.now();transitioning=true;stage.inert=true;active=false;
    window.scrollTo({top:0,behavior:'instant'});document.body.classList.remove('glass-open');last=performance.now();renderer.setAnimationLoop(animate);
  };
  document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();reveal('#projetos');});
  window.addEventListener('resize',resize);
  window.addEventListener('pointermove',e=>{active=e.pointerType!=='touch';pointer.set(e.clientX/W*2-1,1-e.clientY/H*2);});
  document.documentElement.addEventListener('pointerleave',()=>{active=false;pointer.set(2,2);});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer.setAnimationLoop(null);document.body.classList.remove('glass-ready','glass-open');stage.remove();back.remove();});
  resize();document.body.classList.add('glass-ready');
  function animate(now) {
    const dt=Math.min((now-last)/1000,.04);last=now;if(document.hidden)return;
    if(transitioning){
      const elapsed=Math.min((now-transitionStart)/900,1);
      progress=transitionFrom+(target-transitionFrom)*elapsed;
      if(open&&progress>.76&&!document.body.classList.contains('glass-open')){
        document.body.classList.add('glass-open');document.querySelector(destination)?.scrollIntoView({behavior:'instant'});
      }
      if(elapsed===1){transitioning=false;progress=target;stage.inert=open;if(open){back.focus({preventScroll:true});requestAnimationFrame(()=>{document.querySelector(destination)?.scrollIntoView({behavior:'instant'});});}else pieces[0].dom.querySelector('a')?.focus({preventScroll:true});}
    }
    if(open&&progress===1){renderer.clear();renderer.setAnimationLoop(null);return;}
    group.rotation.y=THREE.MathUtils.damp(group.rotation.y,active&&!open?pointer.x*.122-.021:0,3.3,dt);group.rotation.x=THREE.MathUtils.damp(group.rotation.x,active&&!open?-pointer.y*.096+.014:0,3.3,dt);
    glowAmount.value=THREE.MathUtils.damp(glowAmount.value,active&&!open?1:0,5,dt);
    cursor.x=THREE.MathUtils.damp(cursor.x,pointer.x*W/2,7,dt);cursor.y=THREE.MathUtils.damp(cursor.y,pointer.y*H/2,7,dt);glow.value.copy(cursor);
    if(now-geometryTime>1000/(active?12:4)&&!transitioning&&progress===0){rebuild(now/1000);geometryTime=now;}
    group.updateMatrixWorld(true);pieces.forEach(p=>p.pick.matrixWorld.copy(group.matrixWorld));
    ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(pieces.map(p=>p.pick),false);hover=active&&!open&&!transitioning&&hits.length?pieces.findIndex(p=>p.pick===hits[0].object):-1;
    const localHit=hits.length?group.worldToLocal(hits[0].point.clone()):new THREE.Vector3();
    pieces.forEach((p,i)=>{
      const lift=hover===i&&!open?(i?36:20)*scale:0;
      for(let step=0;step<3;step++){p.velocity+=(170*(lift-p.lift)-23*p.velocity)*dt/3;p.lift+=p.velocity*dt/3;}
      p.tiltX=THREE.MathUtils.damp(p.tiltX,hover===i?THREE.MathUtils.clamp((localHit.y-p.center.y)/ph,-.5,.5)*.22:0,8,dt);
      p.tiltY=THREE.MathUtils.damp(p.tiltY,hover===i?-THREE.MathUtils.clamp((localHit.x-p.center.x)/pw,-.5,.5)*.22:0,8,dt);
      const q=THREE.MathUtils.clamp((progress-i*.018)/.90,0,1),flight=q*q*q,dir=i%2?1:-1;
      const outwardX=i===0?.12:Math.sign(p.center.x)||dir;
      const outwardY=i===0?1:Math.sign(p.center.y)||-1;
      p.mesh.position.set(outwardX*flight*(W*.95+120),outwardY*flight*(H*.95+80),p.lift-flight*160*scale);
      p.mesh.rotation.set(flight*(.35+i*.045)+p.tiltX,flight*dir*(.4+i*.035)+p.tiltY,flight*dir*.18);
      p.mesh.position.add(p.center.clone().sub(p.center.clone().applyEuler(p.mesh.rotation)));
      p.mesh.material.iridescence=THREE.MathUtils.damp(p.mesh.material.iridescence,hover===i?1:.55,8,dt);p.mesh.material.envMapIntensity=THREE.MathUtils.damp(p.mesh.material.envMapIntensity,hover===i?1.45:1,8,dt);
      const opacity=1-THREE.MathUtils.smoothstep(q,.72,1);
      p.mesh.material.transparent=true;p.mesh.material.opacity=opacity;p.print.material.opacity=opacity;
      p.mesh.visible=opacity>.001;p.dom.hidden=transitioning||open;p.mesh.updateMatrixWorld(true);if(!p.dom.hidden)projectDOM(p);
    });
    renderer.render(scene,camera);
  }
  renderer.setAnimationLoop(animate);
}
