(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.getElementById('siteHeader');
  const menuBtn = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const themeBtn = document.querySelector('.theme-toggle');

  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 18);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  menuBtn?.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!open));
    mobileMenu.classList.toggle('open', !open);
    document.body.classList.toggle('menu-open', !open);
  });
  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
  }));

  let savedTheme = null;
  try { savedTheme = localStorage.getItem('painIndexTheme'); } catch (error) {}
  if (savedTheme === 'night') document.body.classList.add('theme-night');
  const syncThemeIcon = () => {
    const icon = themeBtn?.querySelector('i');
    if (!icon) return;
    const night = document.body.classList.contains('theme-night');
    icon.className = night ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  };
  syncThemeIcon();
  themeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('theme-night');
    try { localStorage.setItem('painIndexTheme', document.body.classList.contains('theme-night') ? 'night' : 'light'); } catch (error) {}
    syncThemeIcon();
  });

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .13 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  document.querySelectorAll('.faq-item button').forEach(button => {
    button.addEventListener('click', () => {
      const current = button.closest('.faq-item');
      document.querySelectorAll('.faq-item').forEach(item => {
        const btn = item.querySelector('button');
        const panel = item.querySelector('.faq-answer');
        const shouldOpen = item === current && !item.classList.contains('is-open');
        item.classList.toggle('is-open', shouldOpen);
        btn.setAttribute('aria-expanded', String(shouldOpen));
        panel.hidden = !shouldOpen;
      });
    });
  });

  document.querySelectorAll('[data-demo-focus]').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(() => document.getElementById('nombre')?.focus({ preventScroll: true }), 700);
    });
  });

  const form = document.getElementById('leadForm');
  const fields = form ? [...form.querySelectorAll('input[required],select[required]')] : [];
  const validateField = field => {
    const wrapper = field.closest('.field');
    const error = wrapper?.querySelector('.error');
    let message = '';
    if (field.type === 'checkbox' && !field.checked) message = 'Debes aceptar el uso de tus datos.';
    else if (!field.value.trim()) message = 'Este campo es obligatorio.';
    else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) message = 'Escribe un correo válido.';
    else if (field.type === 'tel' && field.value.replace(/\D/g, '').length !== 10) message = 'Escribe un número a 10 dígitos.';
    else if (field.name === 'sucursales' && Number(field.value) < 10) message = 'PainIndex está dirigido a operaciones con 10 o más sucursales.';
    wrapper?.classList.toggle('has-error', Boolean(message));
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) error.textContent = message;
    return !message;
  };
  fields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.field')?.classList.contains('has-error')) validateField(field);
    });
  });

  form?.addEventListener('submit', event => {
    event.preventDefault();
    const valid = fields.map(validateField).every(Boolean);
    if (!valid) {
      form.querySelector('.has-error input,.has-error select')?.focus();
      return;
    }
    const button = form.querySelector('.submit-button');
    button.disabled = true;
    button.querySelector('span').textContent = 'Enviando…';
    const data = Object.fromEntries(new FormData(form).entries());
    try { sessionStorage.setItem('painIndexLead', JSON.stringify(data)); } catch (error) {}
    setTimeout(() => { window.location.href = 'gracias.html'; }, 650);
  });

  function initParticles(section) {
    const canvas = section.querySelector('canvas.particles');
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = 0, height = 0, raf = 0;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = section.clientWidth; height = section.clientHeight;
      canvas.width = width * ratio; canvas.height = height * ratio;
      canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
      ctx.setTransform(ratio,0,0,ratio,0,0);
      const count = Math.min(70, Math.max(26, Math.floor(width / 22)));
      particles = Array.from({length:count}, () => ({
        x:Math.random()*width,y:Math.random()*height,r:Math.random()*1.8+.4,
        vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,alpha:Math.random()*.35+.12
      }));
    };
    const draw = () => {
      ctx.clearRect(0,0,width,height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x<0)p.x=width;if(p.x>width)p.x=0;if(p.y<0)p.y=height;if(p.y>height)p.y=0;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(143,211,194,${p.alpha})`;ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf); else draw();
    });
  }
  document.querySelectorAll('.particles-section').forEach(initParticles);

  const platformMockup = document.querySelector('.platform-mockup');
  const mockupShell = platformMockup?.closest('.dashboard-shell');
  if (platformMockup && mockupShell) {
    const nativeWidth = 1078;
    const nativeHeight = 744;
    const shellPadding = 26;
    const fitPlatformMockup = () => {
      const availableWidth = Math.max(mockupShell.clientWidth - shellPadding, 1);
      const scale = availableWidth / nativeWidth;
      platformMockup.style.transform = `scale(${scale})`;
      mockupShell.style.height = `${nativeHeight * scale + shellPadding}px`;
    };
    fitPlatformMockup();
    new ResizeObserver(fitPlatformMockup).observe(mockupShell);
  }
})();
