const projectDetails=document.querySelector('#fluxora-case');
const detailControllers=new Map();
const automationCards=[...document.querySelectorAll('.automation-case')];
const categoryIcons={
  'AGENDAMENTO':'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h3"/>',
  'OBSERVABILIDADE':'<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  'AUTOSSERVIÇO':'<circle cx="8" cy="8" r="4"/><path d="m11 11 9 9m-3-3 3-3m-6 0 3-3"/>',
  'SUPORTE INTERNO':'<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V11a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z"/><path d="M8 9h8m-8 4h5"/>',
  'GESTÃO DE ACESSOS':'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  'COLABORADORES':'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-17a3 3 0 0 1 0 6m1 5a5 5 0 0 1 3 5"/>',
  'ORQUESTRAÇÃO':'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6m-6 4h6m-6 4h3"/>',
  'ANÁLISE DE DADOS':'<path d="M4 3v18h17M8 16l4-5 4 2 5-8"/>'
};
const cardEffects=matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
const revealObserver=cardEffects.matches&&'IntersectionObserver' in window?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('case-revealed');
    revealObserver.unobserve(entry.target);
  });
},{threshold:.08,rootMargin:'0px 0px -24px 0px'}):null;
automationCards.forEach(card=>{
  const label=card.querySelector('.number');
  const category=Object.keys(categoryIcons).find(key=>label.textContent.includes(key));
  if(category)label.insertAdjacentHTML('afterbegin','<svg class="case-category-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+categoryIcons[category]+'</svg>');
  card.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||!cardEffects.matches)return;
    const bounds=card.getBoundingClientRect();
    card.style.setProperty('--light-x',(event.clientX-bounds.left)+'px');
    card.style.setProperty('--light-y',(event.clientY-bounds.top)+'px');
  });
  if(revealObserver){
    card.classList.add('case-reveal-ready');
    revealObserver.observe(card);
  }
});
if(typeof HTMLDialogElement!=='undefined'&&HTMLDialogElement.prototype.showModal){
  const panel=document.createElement('dialog');
  panel.className='automation-dialog';
  panel.id='automation-dialog';
  panel.setAttribute('aria-labelledby','automation-title');
  panel.innerHTML='<header class="automation-dialog-header"><span class="eyebrow">Por dentro da automação</span><button type="button" class="automation-close" aria-label="Fechar detalhes da automação" autofocus>×</button></header><div class="automation-dialog-body"><div class="number automation-category"></div><h2 id="automation-title"></h2><p class="automation-description"></p><div class="automation-context"></div><div class="automation-content"></div></div>';
  document.body.append(panel);
  let opener=null;
  panel.querySelector('.automation-close').addEventListener('click',()=>panel.close());
  panel.addEventListener('click',event=>{
    if(event.target!==panel)return;
    const bounds=panel.getBoundingClientRect();
    if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)panel.close();
  });
  panel.addEventListener('close',()=>{
    document.body.classList.remove('automation-open');
    opener?.focus({preventScroll:true});
  });
  automationCards.forEach(card=>{
    const details=card.querySelector('.project-case');
    const trigger=document.createElement('button');
    trigger.type='button';
    trigger.className='case-trigger';
    trigger.setAttribute('aria-haspopup','dialog');
    trigger.setAttribute('aria-controls',panel.id);
    trigger.setAttribute('aria-label','Ver como funciona: '+card.querySelector('h3').textContent);
    trigger.innerHTML='Ver como funciona <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M15 4v16M7 9h4M7 13h3"/></svg>';
    details.before(trigger);
    details.hidden=true;
    trigger.addEventListener('click',()=>{
      opener=trigger;
      panel.querySelector('.automation-category').textContent=card.querySelector('.number').textContent;
      panel.querySelector('#automation-title').textContent=card.querySelector('h3').textContent;
      panel.querySelector('.automation-description').textContent=card.querySelector(':scope > p').textContent;
      panel.querySelector('.automation-context').replaceChildren(...[...card.querySelectorAll(':scope > .tags,:scope > .case-metrics')].map(node=>node.cloneNode(true)));
      panel.querySelector('.automation-content').replaceChildren(...[...details.children].filter(node=>node.tagName!=='SUMMARY').map(node=>node.cloneNode(true)));
      panel.querySelectorAll('.process-flow span,.process-flow b').forEach((node,index)=>node.style.setProperty('--flow-step',index));
      document.body.classList.add('automation-open');
      panel.showModal();
      panel.scrollTop=0;
    });
  });
}
document.querySelectorAll('.project-case:not([hidden])').forEach(details=>{
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
