(() => {
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.querySelector('.site-loader');
  const loaderCount = document.querySelector('.loader-count');
  body.classList.add('is-loading');

  let count = 0;
  const countTimer = setInterval(() => {
    count = Math.min(100, count + Math.ceil(Math.random() * 11));
    if (loaderCount) loaderCount.textContent = String(count).padStart(2, '0');
    if (count >= 100) clearInterval(countTimer);
  }, 90);
  window.setTimeout(() => {
    loader?.classList.add('is-done');
    body.classList.remove('is-loading');
  }, reducedMotion ? 50 : 2350);

  const cursor = document.querySelector('.cursor');
  const cursorLabel = document.querySelector('.cursor-label');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let cursorX = mouseX, cursorY = mouseY;
  window.addEventListener('pointermove', (event) => { mouseX = event.clientX; mouseY = event.clientY; }, { passive: true });
  const cursorLoop = () => {
    cursorX += (mouseX - cursorX) * .18; cursorY += (mouseY - cursorY) * .18;
    if (cursor) cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    requestAnimationFrame(cursorLoop);
  };
  if (!reducedMotion && cursor) cursorLoop();
  document.querySelectorAll('a, button, .magnetic').forEach((el) => {
    el.addEventListener('mouseenter', () => { cursor?.classList.add('is-hover'); cursorLabel.textContent = el.matches('.cta-button') ? 'OPEN' : 'VIEW'; });
    el.addEventListener('mouseleave', () => { cursor?.classList.remove('is-hover', 'is-magnetic'); cursorLabel.textContent = ''; });
  });
  document.querySelectorAll('[data-cursor="FOCUS"]').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor?.classList.add('is-focus'));
    el.addEventListener('mouseleave', () => cursor?.classList.remove('is-focus'));
  });
  document.querySelectorAll('.cta-button').forEach((el) => {
    el.addEventListener('mouseenter', () => { cursor?.classList.add('is-magnetic'); cursorLabel.textContent = 'GO'; });
  });
  document.querySelectorAll('.service-slide').forEach((el) => {
    el.addEventListener('mouseenter', () => { cursor?.classList.add('is-hover'); cursorLabel.textContent = el.querySelector('h3')?.textContent || 'VIEW'; });
    el.addEventListener('mouseleave', () => { cursor?.classList.remove('is-hover'); cursorLabel.textContent = ''; });
  });

  const menuButton = document.querySelector('.menu-trigger');
  const menu = document.querySelector('.site-menu');
  const setMenu = (open) => { menuButton?.setAttribute('aria-expanded', String(open)); menu?.setAttribute('aria-hidden', String(!open)); menu?.classList.toggle('is-open', open); };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  const progress = document.querySelector('.scroll-progress span');
  const heroCamera = document.querySelector('.hero-camera');
  const productionImage = document.querySelector('.production-image');
  const serviceSection = document.querySelector('.services-section');
  const serviceTrack = document.querySelector('.services-track');
  const kinetic = document.querySelector('.kinetic-section');
  const kineticWords = document.querySelectorAll('.kinetic-word');
  const kineticFinal = document.querySelector('.kinetic-final');
  let ticking = false;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const sectionProgress = (section) => { const rect = section.getBoundingClientRect(); return clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height)); };
  const onScroll = () => {
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.height = `${scrollMax ? window.scrollY / scrollMax * 100 : 0}%`;
    if (!reducedMotion) {
      const heroRect = document.querySelector('.hero')?.getBoundingClientRect();
      if (heroRect && heroCamera) { const p = clamp(-heroRect.top / (heroRect.height * .65)); heroCamera.style.transform = `translate3d(${p * 10}px, ${p * 42}px, 0) scale(${1 + p * .82}) rotate(${p * -3}deg)`; heroCamera.style.filter = `blur(${p * 2}px)`; }
      if (productionImage) { const p = sectionProgress(document.querySelector('.production-section')); productionImage.style.transform = `scale(${1.07 + p * .09}) translate3d(${(mouseX / window.innerWidth - .5) * -1.8}%, ${(mouseY / window.innerHeight - .5) * -1.8}%, 0)`; }
      if (serviceSection && serviceTrack && window.innerWidth > 900) { const r = serviceSection.getBoundingClientRect(); const p = clamp(-r.top / (r.height - window.innerHeight)); const distance = serviceTrack.scrollWidth - window.innerWidth; serviceTrack.style.transform = `translate3d(${-distance * p}px, 0, 0)`; document.querySelector('.rail-count').textContent = `${String(Math.min(4, Math.max(1, Math.ceil(p * 4)))).padStart(2, '0')}—04`; }
      if (kinetic) { const p = sectionProgress(kinetic); kineticWords.forEach((word, i) => { const shifts = [-170, 80, -110, 120]; word.style.transform = `translate3d(${shifts[i] * p}px, ${(i % 2 ? -1 : 1) * 80 * p}px, 0) rotate(${(i - 1.5) * p * 3}deg)`; word.style.opacity = String(1 - clamp((p - .52) * 2.2)); }); if (kineticFinal) { const finalP = clamp((p - .48) * 2); kineticFinal.style.opacity = String(finalP); kineticFinal.style.transform = `scale(${.45 + finalP * .55}) rotate(${-9 + finalP * 9}deg)`; } }
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  const numberObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target; const end = Number(target.dataset.count || 0); const start = performance.now(); const duration = reducedMotion ? 0 : 1200;
      const tick = (now) => { const p = duration ? clamp((now - start) / duration) : 1; target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString(); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick); observer.unobserve(target);
    });
  }, { threshold: .5 });
  document.querySelectorAll('[data-count]').forEach((node) => numberObserver.observe(node));

  const dashObserver = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')), { threshold: .25 });
  document.querySelectorAll('.dashboard-section').forEach((node) => dashObserver.observe(node));

  const testimonials = [
    ['They gave us a point of view — then made sure the whole city could see it.', 'MAYA CHANDRA / FOUNDER, THE COMMON ROOM'],
    ['The work finally sounds like us, only louder. Every frame has a job to do.', 'ARJUN MEHTA / CREATIVE DIRECTOR, FORM / FUNCTION'],
    ['We stopped chasing attention and started building something people wanted to follow.', 'NIA SANTOS / CO-FOUNDER, ONE GOOD TURN'],
  ];
  const quoteText = document.querySelector('.quote-text');
  const quotePerson = document.querySelector('.quote-person');
  const quoteCount = document.querySelector('.quote-count');
  const quoteButtons = document.querySelectorAll('.quote-controls button');
  let quoteIndex = 0;
  const updateQuote = (direction) => {
    quoteIndex = (quoteIndex + direction + testimonials.length) % testimonials.length;
    const [quote, person] = testimonials[quoteIndex];
    if (reducedMotion) { quoteText.textContent = quote; quotePerson.textContent = person; }
    else {
      quoteText.style.opacity = '0'; quotePerson.style.opacity = '0';
      window.setTimeout(() => { quoteText.textContent = quote; quotePerson.textContent = person; quoteCount.textContent = `${String(quoteIndex + 1).padStart(2, '0')} — 03`; quoteText.style.opacity = '1'; quotePerson.style.opacity = '1'; }, 260);
    }
  };
  quoteButtons[0]?.addEventListener('click', () => updateQuote(-1));
  quoteButtons[1]?.addEventListener('click', () => updateQuote(1));

  const enquiryForm = document.querySelector('#project-enquiry-form');
  const enquiryStatus = document.querySelector('.form-status');
  enquiryForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(enquiryForm);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const brand = String(data.get('brand') || '').trim() || 'Not provided';
    const service = String(data.get('service') || '').trim();
    const date = String(data.get('date') || '').trim() || 'Flexible';
    const time = String(data.get('time') || '').trim() || 'Flexible';
    const message = String(data.get('message') || '').trim();
    const subject = `Project enquiry — ${brand}`;
    const body = [`Hi Local Brand Gurus,`, ``, `Name: ${name}`, `Email: ${email}`, `Brand / business: ${brand}`, `Service: ${service}`, `Preferred date: ${date}`, `Preferred time: ${time}`, ``, `Project brief:`, message].join('\n');
    const mailto = `mailto:localbrandgurus.info@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    enquiryStatus.textContent = 'Opening your email app with the enquiry details…';
    window.location.href = mailto;
  });

  const phone = document.querySelector('.phone-wrap');
  window.addEventListener('pointermove', (event) => { if (reducedMotion || !phone || window.innerWidth < 900) return; const x = (event.clientX / window.innerWidth - .5) * 8; const y = (event.clientY / window.innerHeight - .5) * -6; phone.style.transform = `translateX(-50%) rotate(${5 + x / 3}deg) translate3d(${x}px, ${y}px, 0)`; }, { passive: true });
})();
