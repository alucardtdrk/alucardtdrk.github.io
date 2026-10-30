const projectDetails=document.querySelector('#fluxora-case');
const detailControllers=new Map();
document.querySelectorAll('.project-case').forEach(details=>{
  const summary=details.querySelector('summary');
  const content=document.createElement('div');
  content.className='case-content';
  while(summary.nextSibling)content.append(summary.nextSibling);
  details.append(content);
  let animation=null,fade=null,expanded=details.open;
  function setExpanded(next){
    expanded=next;
    const start=details.getBoundingClientRect().height;
    if(animation){animation.onfinish=null;animation.cancel();}
    fade?.cancel();
    details.style.height='';
    details.style.overflow='';
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){details.open=next;return;}
    const wasOpen=details.open;
    details.open=false;
    const collapsed=details.getBoundingClientRect().height;
    details.open=true;
    const end=next?details.getBoundingClientRect().height:collapsed;
    details.style.overflow='hidden';
    animation=details.animate([{height:start+'px'},{height:end+'px'}],{duration:next?360:280,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
    fade=content.animate([{opacity:wasOpen?getComputedStyle(content).opacity:0,transform:next?'translateY(6px)':'translateY(0)'},{opacity:next?1:0,transform:next?'translateY(0)':'translateY(4px)'}],{duration:next?300:180,easing:'ease-out',fill:'both'});
    animation.onfinish=()=>{
      details.open=next;
      details.style.overflow='';
      animation.cancel();animation=null;
      fade.cancel();fade=null;
    };
  }
  summary.addEventListener('click',event=>{event.preventDefault();setExpanded(!expanded);});
  detailControllers.set(details,setExpanded);
});
document.querySelector('a[href="#fluxora-case"]').addEventListener('click',()=>{detailControllers.get(projectDetails)(true);});

const links=[...document.querySelectorAll('body > header nav a')];
const sections=links.map(link=>document.querySelector(link.hash));
function updateNavigation(){
  const threshold=document.querySelector('body > header').getBoundingClientRect().height+140;
  let active=0;
  sections.forEach((section,index)=>{if(section.getBoundingClientRect().top<=threshold)active=index;});
  if(window.scrollY+innerHeight>=document.documentElement.scrollHeight-10)active=sections.length-1;
  links.forEach((link,index)=>{if(index===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
}
window.addEventListener('scroll',updateNavigation,{passive:true});
window.addEventListener('resize',updateNavigation);
updateNavigation();

const copyButton=document.querySelector('#copy-email');
const status=document.querySelector('#copy-status');
copyButton.addEventListener('click',async()=>{
  copyButton.disabled=true;
  try{await navigator.clipboard.writeText('lucasescouto05@gmail.com');status.textContent='E-mail copiado.';}
  catch{status.textContent='Não foi possível copiar. Selecione o e-mail acima para copiar manualmente.';}
  finally{copyButton.disabled=false;}
});
