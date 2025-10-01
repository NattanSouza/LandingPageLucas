// ===== Mobile menu toggle
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.style.display === 'flex';
    menu.style.display = open ? 'none' : 'flex';
    toggle.setAttribute('aria-expanded', String(!open));
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (window.innerWidth <= 900) {
      menu.style.display = 'none';
      toggle.setAttribute('aria-expanded', 'false');
    }
  }));
}

// ===== Year in footer
const ano = document.getElementById('ano');
if (ano) ano.textContent = new Date().getFullYear();

// ===== Stats count-up
document.querySelectorAll('.stat__num').forEach(el => {
  const target = Number(el.dataset.target || 0);
  let current = 0;
  const step = Math.max(1, Math.round(target / 80));
  const int = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(int); }
    el.textContent = current.toLocaleString('pt-BR');
  }, 20);
});

// ===== Reveal on scroll
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('is-visible'); observer.unobserve(e.target); }
  });
}, {threshold: .15});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// ===== Back to top button
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  if (!toTop) return;
  const show = window.scrollY > 600;
  toTop.style.display = show ? 'grid' : 'none';
});
if (toTop) toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

// ===== NAV: sombra ao rolar
(function(){
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => {
    if (window.scrollY > 8) nav.classList.add('nav--scrolled');
    else nav.classList.remove('nav--scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
})();

// ===== NAV: hover (brilho segue o mouse)
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const links = document.querySelectorAll('.nav__menu a, .nav__cta .btn');
  if (!links.length) return;

  links.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      el.style.setProperty('--mx', (x / r.width * 100) + '%');
      el.style.setProperty('--my', (y / r.height * 100) + '%');

      if (!reduce) {
        const strength = 4;
        const cx = r.width/2, cy = r.height/2;
        const rx = ((y - cy) / cy) * -strength;
        const ry = ((x - cx) / cx) *  strength;
        el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      }
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

// ===== Scroll suave compensando navbar
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.nav');
  const menu = document.getElementById('menu');
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(a => {
    a.addEventListener('click', (e) => {
      const hash = a.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      if (window.innerWidth <= 900 && menu && toggle) {
        menu.style.display = 'none';
        toggle.setAttribute('aria-expanded', 'false');
      }
      const navH = header ? header.getBoundingClientRect().height : 0;
      const top = window.scrollY + target.getBoundingClientRect().top - (navH + 8);
      reduce ? window.scrollTo(0, top) : window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', hash);
    });
  });
})();

// ===== Brilho dos botões acompanha o mouse
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const btns = document.querySelectorAll('.btn--primary, .nav__cta .btn');
  btns.forEach(el=>{
    el.addEventListener('mousemove', (e)=>{
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left)/r.width*100)+'%');
      el.style.setProperty('--my', ((e.clientY - r.top)/r.height*100)+'%');
    });
    el.addEventListener('mouseleave', ()=>{ el.style.removeProperty('--mx'); el.style.removeProperty('--my'); });
  });
})();

// ===== Depoimentos: dots sincronizados com scroll-snap
(function(){
  const track = document.querySelector('.testimonials .t-track');
  const dotsWrap = document.querySelector('.testimonials .t-dots');
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.children);
  dotsWrap.innerHTML = '';
  const dots = cards.map((_, i)=>{
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Ir para depoimento ${i+1}`);
    if (i===0) b.setAttribute('aria-selected','true');
    b.addEventListener('click', ()=>{
      cards[i].scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
    });
    dotsWrap.appendChild(b);
    return b;
  });

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting) {
        const idx = cards.indexOf(entry.target);
        dots.forEach((d,j)=>d.setAttribute('aria-selected', String(j===idx)));
      }
    });
  }, { root: track, threshold: .6 });
  cards.forEach(card=>io.observe(card));

  const onResize = () => {
    const desk = window.matchMedia('(min-width: 900px)').matches;
    dotsWrap.style.display = desk ? 'none' : 'flex';
  };
  onResize();
  window.addEventListener('resize', onResize, {passive:true});
})();

// ===== Tilt 3D suave nos cards com mouse
(function(){
  const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (mediaReduced) return;

  const els = document.querySelectorAll('.card, .case, .contact__card');
  els.forEach(el => {
    const strength = 8;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const cx = r.width/2, cy = r.height/2;
      const rx = ((y - cy) / cy) * -strength;
      const ry = ((x - cx) / cx) *  strength;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.01)`;
      el.style.setProperty('--mx', (x / r.width * 100) + '%');
      el.style.setProperty('--my', (y / r.height * 100) + '%');
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

// ===== Form: validação sem LGPD
const form = document.getElementById('form-contato');
if (form) {
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    let ok = true;
    const setErr = (id, msg) => {
      const f = form.querySelector('#' + id);
      const err = f?.closest('.field')?.querySelector('.error');
      if (err) err.textContent = msg || '';
      if (msg) ok = false;
    };

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const tel = form.tel.value.trim();
    const assunto = form.assunto.value;
    const mensagem = form.mensagem.value.trim();
    const feedback = form.querySelector('.form__feedback');

    setErr('nome', nome ? '' : 'Informe seu nome.');
    setErr('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'E-mail inválido.');
    setErr('assunto', assunto ? '' : 'Selecione um assunto.');
    setErr('mensagem', mensagem ? '' : 'Descreva sua necessidade.');
    if (tel && !/^\+?\d[\d\s().-]{8,}$/.test(tel)) setErr('tel', 'Telefone inválido.'); else setErr('tel', '');

    if (!ok) return;

    const msg = encodeURIComponent(`Olá, me chamo ${nome}. Assunto: ${assunto}. ${mensagem} — Contato: ${tel || 'sem telefone'}`);
    const whatsapp = `https://wa.me/5524993055132?text=${msg}`;

    feedback.textContent = 'Mensagem pronta para envio via WhatsApp. Abrindo...';
    feedback.style.color = '#16a34a';

    window.open(whatsapp, '_blank', 'noopener');
    form.reset();
  });
}

// ===== Movimento por sensores (auto-permissão iOS na 1ª interação)
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const btn = document.getElementById('motion-toggle');
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const needsIOSPerm = typeof window.DeviceOrientationEvent === 'function'
                    && typeof window.DeviceOrientationEvent.requestPermission === 'function';
  const cards = document.querySelectorAll('.card, .case, .contact__card');
  if (!cards.length) return;

  let enabled = false;
  let rafId = null;
  let last = { rx: 0, ry: 0 };
  let target = { rx: 0, ry: 0 };
  const STRENGTH = 10;
  const SMOOTH = 0.08;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const apply = () => {
    last.rx += (target.rx - last.rx) * SMOOTH;
    last.ry += (target.ry - last.ry) * SMOOTH;
    const t = `perspective(900px) rotateX(${last.rx.toFixed(2)}deg) rotateY(${last.ry.toFixed(2)}deg) translateY(-4px)`;
    cards.forEach(el => { el.style.transform = t; });
    rafId = requestAnimationFrame(apply);
  };

  // Direção corrigida para acompanhar a inclinação
  const onOrientation = (e) => {
    const beta = e.beta ?? 0;   // frente/trás (+ inclina pra frente)
    const gamma = e.gamma ?? 0; // esquerda/direita (+ inclina pra direita)
    const rx = clamp( (beta / 45) * STRENGTH, -STRENGTH, STRENGTH);   // acompanha
    const ry = clamp( (gamma / 45) * STRENGTH, -STRENGTH, STRENGTH);  // acompanha
    target.rx = rx; target.ry = ry;
  };
  const onMotion = (e) => {
    const ax = e.accelerationIncludingGravity?.x ?? 0;
    const ay = e.accelerationIncludingGravity?.y ?? 0;
    const ry = clamp( ax * 1.5, -STRENGTH, STRENGTH);
    const rx = clamp( ay * 1.5, -STRENGTH, STRENGTH);
    target.rx = rx; target.ry = ry;
  };

  const start = () => {
    if (enabled) return;
    enabled = true;
    document.documentElement.classList.add('motion-active');
    if (btn){ btn.dataset.on = 'true'; btn.setAttribute('aria-pressed', 'true'); }
    if ('ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', onOrientation, true);
    } else if ('ondevicemotion' in window) {
      window.addEventListener('devicemotion', onMotion, true);
    }
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(apply);
  };

  const stop = () => {
    if (!enabled) return;
    enabled = false;
    document.documentElement.classList.remove('motion-active');
    if (btn){ btn.dataset.on = 'false'; btn.setAttribute('aria-pressed', 'false'); }
    window.removeEventListener('deviceorientation', onOrientation, true);
    window.removeEventListener('devicemotion', onMotion, true);
    cancelAnimationFrame(rafId);
    rafId = null;
    last = { rx: 0, ry: 0 };
    target = { rx: 0, ry: 0 };
    cards.forEach(el => { el.style.transform = ''; });
  };

  if (btn){
    btn.addEventListener('click', async () => {
      if (enabled) { stop(); return; }
      if (needsIOSPerm){
        try{
          const state = await window.DeviceOrientationEvent.requestPermission();
          if (state !== 'granted') return;
        }catch{ return; }
      }
      start();
    });
  }

  const autoTryStart = async () => {
    if (!isTouch) return;
    if (needsIOSPerm){
      const once = async () => {
        try{
          const state = await window.DeviceOrientationEvent.requestPermission();
          if (state === 'granted') start();
        }catch{}
        window.removeEventListener('touchend', once, true);
        window.removeEventListener('pointerdown', once, true);
        window.removeEventListener('keydown', once, true);
      };
      window.addEventListener('touchend', once, true);
      window.addEventListener('pointerdown', once, true);
      window.addEventListener('keydown', once, true);
    } else {
      start();
    }
  };

  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', autoTryStart, { once:true });
  } else {
    autoTryStart();
  }
})();
