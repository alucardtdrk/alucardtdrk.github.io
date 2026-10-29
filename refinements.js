const projectDetails=document.querySelector('#fluxora-case');
document.querySelector('a[href="#fluxora-case"]').addEventListener('click',()=>{projectDetails.open=true;});

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
