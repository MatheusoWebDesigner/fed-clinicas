/* ============================================================
   FED Marketing · Landing Clínicas
   GSAP ScrollTrigger: entradas por rolagem, contadores,
   header inteligente, FAQ, navegação mobile e formulário.
============================================================ */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  gsap.defaults({ ease: 'power3.out' });

  /* ------------------------------------------------------------
     0 · Rolagem fluida com inércia (ScrollSmoother)
        data-lag / data-speed nos elementos criam o parallax
  ------------------------------------------------------------ */
  let smoother = null;
  if (!prefersReducedMotion) {
    smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.4,
      effects: true,
      smoothTouch: false
    });
  }

  /* ------------------------------------------------------------
     1 · Barra de progresso de leitura
  ------------------------------------------------------------ */
  gsap.to('#progress-fill', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.4 }
  });

  /* ------------------------------------------------------------
     2 · Headline do hero: revelação linha a linha
  ------------------------------------------------------------ */
  function splitIntoLines(el) {
    // separa por palavras preservando spans existentes (.grad)
    const nodes = Array.from(el.childNodes);
    const frag = document.createDocumentFragment();

    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((piece) => {
          if (!piece) return;
          if (/^\s+$/.test(piece)) {
            frag.appendChild(document.createTextNode(' '));
          } else {
            const w = document.createElement('span');
            w.className = 'w';
            w.style.display = 'inline-block';
            w.textContent = piece;
            frag.appendChild(w);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.style.display = 'inline-block';
        node.classList.add('w');
        frag.appendChild(node);
      }
    });

    el.innerHTML = '';
    el.appendChild(frag);
    return el.querySelectorAll('.w');
  }

  const heroHeadline = document.getElementById('hero-headline');
  if (heroHeadline && !prefersReducedMotion) {
    const words = splitIntoLines(heroHeadline);
    gsap.set(words, { yPercent: 110, opacity: 0, rotate: 2 });
    gsap.to(words, {
      yPercent: 0,
      opacity: 1,
      rotate: 0,
      duration: 1.1,
      stagger: 0.045,
      delay: 0.25,
      ease: 'power4.out'
    });
  }

  /* entrada do formulário do hero (animada no card interno pra
     não disputar transform com o data-lag do ScrollSmoother) */
  if (!prefersReducedMotion) {
    gsap.from('.lead-form', { y: 64, opacity: 0, duration: 1.2, delay: 0.5 });
  }

  /* ------------------------------------------------------------
     3 · Entradas genéricas por rolagem
        [data-reveal]  → fade + sobe
        [data-stagger] → filhos em cascata
        [data-split]   → títulos de seção com máscara
  ------------------------------------------------------------ */
  if (!prefersReducedMotion) {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        y: 44,
        opacity: 0,
        duration: 1,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });

    document.querySelectorAll('[data-stagger]').forEach((wrap) => {
      const items = wrap.children;
      gsap.from(items, {
        y: 56,
        opacity: 0,
        duration: 0.95,
        stagger: 0.12,
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: wrap, start: 'top 82%', once: true }
      });
    });

    document.querySelectorAll('[data-split]').forEach((title) => {
      // envolve o texto numa máscara de linha
      const inner = document.createElement('span');
      inner.style.display = 'block';
      while (title.firstChild) inner.appendChild(title.firstChild);
      const mask = document.createElement('span');
      mask.style.cssText = 'display:block;overflow:hidden;';
      mask.appendChild(inner);
      title.appendChild(mask);

      gsap.from(inner, {
        yPercent: 105,
        duration: 1.15,
        ease: 'power4.out',
        scrollTrigger: { trigger: title, start: 'top 85%', once: true }
      });
    });

    /* Linhas da tabela comparativa: comum entra da esquerda, FED da direita */
    document.querySelectorAll('[data-compare]').forEach((row, i) => {
      const common = row.querySelector('.col-common');
      const fed = row.querySelector('.col-fed');
      const trig = { trigger: row, start: 'top 88%', once: true };
      gsap.from(common, { x: -44, opacity: 0, duration: 0.85, delay: i * 0.04, scrollTrigger: trig });
      gsap.from(fed, { x: 44, opacity: 0, duration: 0.85, delay: i * 0.04 + 0.08, scrollTrigger: trig });
    });

    /* Linhas do problema (índice editorial): traço desenha,
       número, título e texto entram em cascata */
    document.querySelectorAll('.problem-row').forEach((row) => {
      const trig = { trigger: row, start: 'top 84%', once: true };
      const line = row.querySelector('.row-line');
      if (line) {
        gsap.from(line, { scaleX: 0, duration: 1.3, ease: 'power3.inOut', scrollTrigger: trig });
      }
      gsap.from(row.querySelectorAll('.row-idx, .row-title, .row-text'), {
        y: 48,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        clearProps: 'transform,opacity',
        scrollTrigger: trig
      });
    });
    const endLine = document.querySelector('.problem-end-line');
    if (endLine) {
      gsap.from(endLine, {
        scaleX: 0, duration: 1.3, ease: 'power3.inOut',
        scrollTrigger: { trigger: endLine, start: 'top 92%', once: true }
      });
    }
  }

  /* ------------------------------------------------------------
     4 · Contadores da seção de mercado
  ------------------------------------------------------------ */
  document.querySelectorAll('.counter').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: target,
          duration: prefersReducedMotion ? 0 : 2,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = obj.v.toFixed(decimals).replace('.', ',') + suffix;
          }
        });
      }
    });
  });

  /* ------------------------------------------------------------
     5 · Header inteligente (esconde ao descer, mostra ao subir)
        + CTA fixo do mobile depois do hero
  ------------------------------------------------------------ */
  const header = document.getElementById('header');

  // header sempre visível; só ganha o fundo com blur ao sair do topo
  ScrollTrigger.create({
    start: 80,
    onUpdate: () => {
      header.classList.toggle('is-scrolled', window.scrollY > 60);
    }
  });

  /* ------------------------------------------------------------
     6 · Navegação mobile (overlay com trava de rolagem)
  ------------------------------------------------------------ */
  const navToggle = document.getElementById('nav-toggle');
  const navClose = document.getElementById('nav-close');
  const mainNav = document.getElementById('main-nav');

  // trava de rolagem: pausa o ScrollSmoother (desktop) e bloqueia o
  // touchmove (mobile, onde smoothTouch é false e o scroll é nativo)
  function lockTouch(e) { e.preventDefault(); }

  function setNav(open) {
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    if (smoother) smoother.paused(open);
    if (open) {
      document.addEventListener('touchmove', lockTouch, { passive: false });
    } else {
      document.removeEventListener('touchmove', lockTouch, { passive: false });
    }
  }

  navToggle.addEventListener('click', () => {
    setNav(!document.body.classList.contains('nav-open'));
  });
  navClose.addEventListener('click', () => setNav(false));

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNav(false));
  });

  // Esc fecha o menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) setNav(false);
  });

  /* ------------------------------------------------------------
     7 · FAQ: abre/fecha com animação de altura
  ------------------------------------------------------------ */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const summary = item.querySelector('summary');
    const answer = item.querySelector('.faq-answer');

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (prefersReducedMotion) { item.open = !item.open; return; }

      if (item.open) {
        gsap.to(answer, {
          height: 0, opacity: 0, duration: 0.4, ease: 'power2.inOut',
          onComplete: () => { item.open = false; gsap.set(answer, { clearProps: 'all' }); }
        });
      } else {
        item.open = true;
        gsap.set(answer, { height: 'auto' });
        gsap.from(answer, { height: 0, opacity: 0, duration: 0.5, ease: 'power3.out', clearProps: 'all' });
      }
    });
  });

  /* ------------------------------------------------------------
     8 · Botões magnéticos (desktop)
  ------------------------------------------------------------ */
  if (window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const strength = 0.3;
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, {
          x: (e.clientX - r.left - r.width / 2) * strength,
          y: (e.clientY - r.top - r.height / 2) * strength,
          duration: 0.4
        });
      });
      btn.addEventListener('pointerleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ------------------------------------------------------------
     8b · Formulário com profundidade: tilt 3D seguindo o mouse
          + brilho que acompanha o cursor (desktop)
  ------------------------------------------------------------ */
  const formWrap = document.querySelector('.hero-form-wrap');
  const leadFormEl = document.getElementById('lead-form');

  if (formWrap && leadFormEl && window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
    const qRotX = gsap.quickTo(leadFormEl, 'rotationX', { duration: 0.7, ease: 'power3.out' });
    const qRotY = gsap.quickTo(leadFormEl, 'rotationY', { duration: 0.7, ease: 'power3.out' });

    formWrap.addEventListener('pointermove', (e) => {
      const r = formWrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0 → 1
      const py = (e.clientY - r.top) / r.height;   // 0 → 1
      qRotY((px - 0.5) * 7);
      qRotX((0.5 - py) * 6);
      leadFormEl.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      leadFormEl.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });

    formWrap.addEventListener('pointerleave', () => {
      gsap.to(leadFormEl, { rotationX: 0, rotationY: 0, duration: 1, ease: 'elastic.out(1, 0.5)' });
    });
  }

  /* ------------------------------------------------------------
     9 · Formulário: máscara de WhatsApp + estado de sucesso
        (integrar com CRM / webhook antes do lançamento)
  ------------------------------------------------------------ */
  const form = document.getElementById('lead-form');
  const whats = document.getElementById('f-whats');

  whats.addEventListener('input', () => {
    let v = whats.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 7) v = `(${v.slice(0, 2)}) ${v.slice(2, 3)} ${v.slice(3, 7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    whats.value = v;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    /* TODO produção:
       enviar payload pro endpoint/CRM e disparar eventos de conversão
       (Pixel Meta: fbq('track','Lead') · Google Ads: gtag conversion) */

    const success = document.createElement('div');
    success.className = 'form-success';
    success.innerHTML = '<strong>Recebido. Bom sinal pra sua clínica.</strong><p>Um sócio da FED analisa o seu cenário e responde em até 2 horas, em horário comercial.</p>';
    form.classList.add('is-sent');
    form.appendChild(success);
    gsap.from(success, { y: 20, opacity: 0, duration: 0.7 });
  });

  /* ------------------------------------------------------------
     10 · Rolagem suave para âncoras (compensa o header fixo)
  ------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (smoother) {
        smoother.scrollTo(target, true, 'top 90px');
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  /* ------------------------------------------------------------
     11 · Ano dinâmico no rodapé
  ------------------------------------------------------------ */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
