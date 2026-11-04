const scene = document.querySelector('.stack-scene');
const ring = scene.querySelector('.stack-ring');
const cardStep = 360 / scene.querySelectorAll('.stack-card').length;
let dragged = false;
let resumeRotation = () => {};
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  scene.tabIndex = 0;
  scene.setAttribute('aria-label', 'Tecnologias. Arraste para girar ou use as setas do teclado.');
  let angle = 0, pointer = null, startX = 0, startAngle = 0, controlled = false;
  function takeControl() {
    if (controlled) return;
    controlled = true;
    const animation = ring.getAnimations()[0];
    angle = animation ? (Number(animation.currentTime) % 32000) / 32000 * 360 : 0;
    ring.style.animation = 'none';
    render();
  }
  function render() {
    ring.style.transform = `rotateX(-8deg) rotateY(${angle}deg)`;
  }
  resumeRotation = () => {
    const time = ((angle % 360 + 360) % 360) / 360 * 32000;
    controlled = false;
    pointer = null;
    dragged = false;
    ring.style.animation = '';
    ring.style.transform = '';
    const animation = ring.getAnimations()[0];
    if (animation) animation.currentTime = time;
  };
  scene.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    takeControl();
    pointer = event.pointerId; startX = event.clientX; startAngle = angle;
    dragged = false;
  });
  scene.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer || event.buttons !== 1) return;
    if (!dragged && Math.abs(event.clientX - startX) < 6) return;
    dragged = true;
    scene.setPointerCapture(pointer);
    scene.classList.add('dragging');
    angle = startAngle + (event.clientX - startX) * .4;
    render();
  });
  function release(event) {
    if (event.pointerId !== pointer) return;
    pointer = null;
    scene.classList.remove('dragging');
  }
  scene.addEventListener('pointerup', release);
  scene.addEventListener('pointercancel', release);
  scene.addEventListener('lostpointercapture', release);
  scene.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); takeControl();
    angle += event.key === 'ArrowRight' ? -cardStep : cardStep;
    render();
  });
  scene.addEventListener('focusin', event => {
    const card = event.target.closest('.stack-card');
    if (!card || pointer !== null || !card.matches(':focus-visible')) return;
    takeControl();
    angle = -Number(card.style.getPropertyValue('--index')) * cardStep;
    render();
  });
}

const details = {
  JavaScript: ['A base das minhas integrações', 'Utilizo JavaScript em aplicações web, APIs e automações, conectando necessidades de operação à lógica de software.', ['Manipulação de dados', 'Integrações entre sistemas', 'Desenvolvimento web'], 'Projeto RESTful', 'https://github.com/alucardtdrk/Projeto-Restful'],
  'Node.js': ['Lógica de negócio no servidor', 'Minha experiência com Node.js envolve APIs REST e integrações. No projeto RESTful, pratiquei rotas e operações de gerenciamento de usuários com Express.', ['APIs REST', 'Express', 'Operações CRUD'], 'Projeto RESTful', 'https://github.com/alucardtdrk/Projeto-Restful'],
  TypeScript: ['Clareza nos contratos do código', 'O Fluxora utiliza TypeScript em uma aplicação que conecta interface e servidor para acompanhar automações n8n.', ['Tipagem', 'Integração entre interface e API', 'Organização do código'], 'Fluxora', 'https://github.com/alucardtdrk/Fluxora'],
  n8n: ['Processos conectados de ponta a ponta', 'Tenho conhecimento avançado em n8n, com experiência em automações financeiras e operacionais, integrações com APIs e webhooks.', ['Cobranças e conciliação bancária', 'Onboarding e offboarding', 'Pipefy e Conta Azul'], 'Fluxora', 'https://github.com/alucardtdrk/Fluxora'],
  React: ['Interfaces para acompanhar a operação', 'No Fluxora, React compõe a interface que organiza a visão geral, o catálogo de workflows e o histórico de execuções das automações.', ['Componentes de interface', 'Visualização de dados operacionais', 'Estados de carregamento e ausência de dados'], 'Fluxora', 'https://github.com/alucardtdrk/Fluxora'],
  'Next.js': ['Aplicações completas para a operação', 'Utilizo Next.js nas aplicações de reservas de sala e reset de senha de terceiros, conectando interfaces, rotas de API e automações n8n.', ['Rotas de API e lógica no servidor', 'Autenticação Google no reset de terceiros', 'Integrações com n8n e serviços corporativos'], null, null],
  'Firebase / Firestore': ['Estado e persistência das reservas', 'Na aplicação de reservas de sala, utilizo Firebase/Firestore para armazenar o estado das reservas e apoiar o controle de confirmações e cancelamentos.', ['Persistência de dados no Firestore', 'Integração pelo servidor com Firebase Admin', 'Estado das reservas conectado ao fluxo n8n'], null, null],
  PostgreSQL: ['Dados como parte da solução', 'PostgreSQL faz parte do meu repertório de tecnologias de banco de dados. É uma competência complementar ao meu foco em desenvolvimento e integração de sistemas.', ['Banco de dados relacional', 'Organização de dados', 'Desenvolvimento de sistemas'], null, null],
  Git: ['Evolução do código com histórico', 'Utilizo Git no versionamento dos meus projetos e tenho formação complementar em Git e GitHub pela Rocketseat.', ['Versionamento', 'Histórico de alterações', 'Organização dos projetos'], 'Meus repositórios', 'https://github.com/alucardtdrk?tab=repositories'],
  GitHub: ['Projetos que mostram minha evolução', 'Mantenho projetos públicos no GitHub como parte da minha evolução em desenvolvimento, incluindo o Fluxora e a API RESTful.', ['Repositórios públicos', 'Documentação dos projetos', 'Compartilhamento de código'], 'Conhecer meu GitHub', 'https://github.com/alucardtdrk']
};
const dialog = document.createElement('dialog');
dialog.className = 'skill-dialog';
dialog.setAttribute('aria-labelledby', 'skill-name');
dialog.innerHTML = '<button type="button" class="skill-close" aria-label="Fechar detalhes">×</button><img class="skill-icon" alt="" width="58" height="58"><div class="eyebrow">Tecnologia na prática</div><h2 id="skill-name"></h2><h3 class="skill-subtitle"></h3><p class="skill-description"></p><ul class="skill-topics"></ul><a class="button skill-project" target="_blank" rel="noopener noreferrer"></a>';
document.body.append(dialog);
dialog.querySelector('.skill-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog.addEventListener('close', () => {
  document.body.classList.remove('skill-open');
  resumeRotation();
});
scene.addEventListener('click', event => {
  const card = event.target.closest('.stack-card');
  if (!card || (dragged && event.detail !== 0)) return;
  const name = card.querySelector('span').textContent;
  const [subtitle, description, topics, label, url] = details[name];
  dialog.querySelector('.skill-icon').src = card.querySelector('.stack-icon').dataset.src;
  dialog.querySelector('#skill-name').textContent = name;
  dialog.querySelector('.skill-subtitle').textContent = subtitle;
  dialog.querySelector('.skill-description').textContent = description;
  dialog.querySelector('.skill-topics').replaceChildren(...topics.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  const link = dialog.querySelector('.skill-project');
  link.hidden = !url;
  if (url) { link.href = url; link.textContent = label + ' ↗'; }
  document.body.classList.add('skill-open');
  dialog.showModal();
});
