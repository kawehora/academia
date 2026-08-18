// scripts/main.js
// TODO: editar mensagens ou textos exibidos (em Português) conforme necessário.

/* Estrutura funcional, mensagens em Português, comentários indicando onde mexer. */

(function(){
  'use strict';

  // utilitários
  const qs = (s, ctx=document) => ctx.querySelector(s);
  const qsa = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

  // TOAST — feedback rápido em Português
  const Toast = (function(){
    let container;
    function ensure(){
      if (container) return container;
      container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.right = '18px';
      container.style.bottom = '18px';
      container.style.zIndex = 9999;
      document.body.appendChild(container);
      return container;
    }
    function show(msg, timeout = 3000){
      const c = ensure();
      const el = document.createElement('div');
      el.textContent = msg; // Mensagem em português (editar se necessário)
      el.style.background = 'rgba(0,0,0,0.75)';
      el.style.color = '#fff';
      el.style.padding = '10px 14px';
      el.style.borderRadius = '6px';
      el.style.marginTop = '8px';
      el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.5)';
      c.appendChild(el);
      setTimeout(()=>{
        el.style.transition = 'opacity 250ms ease, transform 250ms ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(6px)';
        setTimeout(()=> el.remove(), 300);
      }, timeout);
    }
    return { show };
  })();

  // Smooth scroll para âncoras internas
  function initSmoothScroll(){
    qsa('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', function(e){
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        if (href === '#contato') return; // reservado ao modal
        const target = document.querySelector(href);
        if (target){
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // Gerenciador de Planos (persistência em localStorage)
  const Plans = (function(){
    const KEY = 'powerfit:selectedPlan';
    function selectPlan(name){
      qsa('.plan').forEach(p => p.classList.toggle('selected', p.dataset.plan === name));
      localStorage.setItem(KEY, name);
      Toast.show(`Plano "${name}" selecionado`);
    }
    function bind(){
      qsa('.plan').forEach(p=>{
        p.addEventListener('click', (e)=>{
          if (e.target.closest('a')) return; // não interferir com links
          selectPlan(p.dataset.plan);
        });
        const btn = p.querySelector('a[href="#contato"]');
        if (btn){
          btn.addEventListener('click', (ev)=>{
            ev.preventDefault();
            selectPlan(p.dataset.plan);
            ContactModal.open({ prefillPlan: p.dataset.plan });
          });
        }
      });
    }
    function restore(){
      const saved = localStorage.getItem(KEY);
      if (saved) selectPlan(saved);
    }
    return { bind, restore, selectPlan };
  })();

  // Modal de contato (criado dinamicamente). Mensagens em PT-BR.
  const ContactModal = (function(){
    let modal;
    function build(){
      modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.inset = '0';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.background = 'rgba(0,0,0,0.6)';
      modal.style.zIndex = 10000;

      const dialog = document.createElement('div');
      dialog.style.width = 'min(520px, 92vw)';
      dialog.style.background = '#0e0e0e';
      dialog.style.borderRadius = '10px';
      dialog.style.padding = '18px';
      dialog.style.boxShadow = '0 10px 40px rgba(0,0,0,0.6)';
      dialog.style.color = '#fff';

      const title = document.createElement('h3');
      title.textContent = 'Contato';
      title.style.marginTop = '0';
      dialog.appendChild(title);

      const form = document.createElement('form');
      form.innerHTML = `
        <div style="display:flex;gap:8px;flex-direction:column">
          <input name="name" placeholder="Seu nome" required style="padding:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:#fff;" />
          <input name="email" placeholder="Email" type="email" required style="padding:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:#fff;" />
          <textarea name="message" placeholder="Mensagem" rows="4" style="padding:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:#fff;"></textarea>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
            <button type="button" class="cancel" style="padding:10px 14px;border-radius:6px;background:transparent;border:1px solid rgba(255,255,255,0.08);color:#fff">Cancelar</button>
            <button type="submit" style="padding:10px 14px;border-radius:6px;background:var(--accent);border:none;color:#fff">Enviar</button>
          </div>
        </div>
      `;

      dialog.appendChild(form);
      modal.appendChild(dialog);

      // eventos
      form.querySelector('.cancel').addEventListener('click', close);
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const data = new FormData(form);
        const obj = Object.fromEntries(data.entries());
        // Simulação: salvar localmente e mostrar toast.
        const inbox = JSON.parse(localStorage.getItem('powerfit:inbox') || '[]');
        inbox.push({ ...obj, date: new Date().toISOString() });
        localStorage.setItem('powerfit:inbox', JSON.stringify(inbox));
        Toast.show('Mensagem enviada — obrigado!');
        close();
      });

      modal.addEventListener('click', (ev)=>{ if (ev.target === modal) close(); });

      return modal;
    }
    function open(opts = {}){
      if (!modal) modal = build();
      const form = modal.querySelector('form');
      if (opts.prefillPlan){
        // preenche a mensagem com referência ao plano escolhido
        form.elements['message'].value = `Olá, tenho interesse no plano: ${opts.prefillPlan}`;
      }
      document.body.appendChild(modal);
      form.elements['name'].focus();
    }
    function close(){
      if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
    }
    return { open, close };
  })();

  // Reveal on scroll — re-animar ao subir/voltar
  function initReveal(){
    try{
      const selectors = ['.card', '.program', '.trainer', '.plan', '.cta-banner', 'h2', '.hero-inner'];
      const nodes = qsa(selectors.join(','));
      if (!nodes.length) return;

      const io = new IntersectionObserver((entries)=>{
        entries.forEach(ent=>{
          const el = ent.target;
          if (ent.isIntersecting){
            el.classList.add('in-view');
            if (el.classList.contains('hero-inner')) revealHeroText(el, true);
          } else {
            el.classList.remove('in-view');
            if (el.classList.contains('hero-inner')) revealHeroText(el, false);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

      nodes.forEach(n=>{
        if (!n.classList.contains('reveal')) n.classList.add('reveal');
        io.observe(n);
      });
    } catch(e){ console.warn('reveal init failed', e); }
  }

  // Hero split por letra e animação (em Português — editar intervalo abaixo)
  function revealHeroText(heroInner, enter){
    try{
      const h1 = heroInner.querySelector('h1');
      if (!h1) return;
      if (!h1.dataset.split){
        const text = h1.textContent.trim();
        h1.textContent = '';
        const frag = document.createDocumentFragment();
        for (let i=0;i<text.length;i++){
          const ch = text[i];
          const span = document.createElement('span');
          span.className = 'hero-char';
          span.textContent = ch === ' ' ? '\u00A0' : ch;
          span.dataset.i = String(i);
          frag.appendChild(span);
        }
        h1.appendChild(frag);
        h1.dataset.split = '1';
      }
      const chars = Array.from(h1.querySelectorAll('.hero-char'));
      // intervalo por caractere (editar aqui se quiser mais lento/rápido)
      const interval = 55; // ms por caractere — editar para acelerar/diminuir
      chars.forEach((sp, idx)=>{
        sp.style.transitionDelay = `${idx * interval}ms`;
        if (enter) requestAnimationFrame(()=> requestAnimationFrame(()=> sp.classList.add('in')));
        else sp.classList.remove('in');
      });
    } catch(e){ console.warn('hero reveal failed', e); }
  }

  // Inicialização do header fixo e toggle de classe quando rola
  function initHeaderScroll(headerEl, navToggle){
    (function(){
      let ticking = false;
      function update(){
        const scrolled = window.scrollY > 20;
        headerEl.classList.toggle('scrolled', scrolled);
        ticking = false;
      }
      window.addEventListener('scroll', function(){
        if (!ticking){
          requestAnimationFrame(update);
          ticking = true;
        }
      }, { passive: true });
      requestAnimationFrame(()=> headerEl.classList.toggle('scrolled', window.scrollY > 20));
    })();
  }

  // Inicialização geral
  function init(){
    initSmoothScroll();
    Plans.bind();
    Plans.restore();
    initReveal();

    // menu mobile toggle
    const navToggle = document.getElementById('nav-toggle');
    const headerEl = document.querySelector('header');
    const mainNav = document.getElementById('main-nav');
    if (navToggle && headerEl){
      navToggle.addEventListener('click', ()=>{
        const isOpen = headerEl.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
      });
      if (mainNav){
        qsa('#main-nav a').forEach(a=>{
          a.addEventListener('click', ()=>{
            if (headerEl.classList.contains('nav-open')){
              headerEl.classList.remove('nav-open');
              navToggle.setAttribute('aria-expanded', 'false');
            }
          });
        });
      }
      document.addEventListener('keydown', (e)=>{
        if (e.key === 'Escape' && headerEl.classList.contains('nav-open')){
          headerEl.classList.remove('nav-open');
          navToggle.setAttribute('aria-expanded', 'false');
          navToggle.focus();
        }
      });
    }

    // intercepta links para contato e abre modal
    qsa('a[href="#contato"]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        e.preventDefault();
        ContactModal.open();
      });
    });

    // destaque quando botão de dentro do plano recebe foco
    qsa('.plan a').forEach(a=>{
      a.addEventListener('focus', ()=> a.closest('.plan')?.classList.add('focused'));
      a.addEventListener('blur', ()=> a.closest('.plan')?.classList.remove('focused'));
    });

    // header scroll behavior
    initHeaderScroll(document.querySelector('header'), navToggle);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();