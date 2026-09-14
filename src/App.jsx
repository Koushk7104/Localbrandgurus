import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const services = [
  { number: '01', title: 'CREATE', label: 'IDEA / 001', copy: 'Positioning, strategy, art direction. We find the story people want to step into.', tags: 'BRAND CONTENT / SEO / STRATEGY', image: 'image-one' },
  { number: '02', title: 'CAPTURE', label: 'ROLL / 002', copy: 'Production with texture. Reels, short-form, photography and all the good in-between.', tags: 'VIDEO / PHOTO / REELS', image: 'image-two' },
  { number: '03', title: 'DISTRIBUTE', label: 'SIGNAL / 003', copy: 'Smart systems turn a great piece of content into a living, breathing campaign.', tags: 'SOCIAL / PAID ADS / AUTOMATION', image: 'image-three' },
  { number: '04', title: 'CONVERT', label: 'RESULT / 004', copy: 'We follow the signal all the way to action: attention into enquiries, reach into growth.', tags: 'CONVERSION / REPORTING / GROWTH', image: 'image-four' },
];

const ringSeeds = [
  { background: 'linear-gradient(145deg, #d6e4d7, #73988b 48%, #24483f)' },
  { background: 'linear-gradient(145deg, #b85f47, #f0c99d 48%, #2d5a4f)' },
  { background: 'repeating-linear-gradient(125deg, #1e3c34 0 14px, #b85f47 15px 16px, #172620 17px 42px)' },
  { background: 'radial-gradient(circle at 65% 25%, #f2ede4 0 3%, transparent 3.5%), linear-gradient(135deg, #27483f, #a8c6ad)' },
  { background: 'linear-gradient(160deg, #3e6c62 0%, #1a3d36 40%, #c9dccd 100%)' },
  { background: 'radial-gradient(circle at 30% 70%, #a87568 0%, #2d5a4f 55%, #1f3830 100%)' },
];

const testimonials = [
  ['They gave us a point of view — then made sure the whole city could see it.', 'MAYA CHANDRA / FOUNDER, THE COMMON ROOM'],
  ['The work finally sounds like us, only louder. Every frame has a job to do.', 'ARJUN MEHTA / CREATIVE DIRECTOR, FORM / FUNCTION'],
  ['We stopped chasing attention and started building something people wanted to follow.', 'NIA SANTOS / CO-FOUNDER, ONE GOOD TURN'],
];

function Loader() {
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setInterval(() => setCount((value) => Math.min(value + 7, 100)), 90);
    const exit = window.setTimeout(() => setDone(true), reduced ? 50 : 2450);
    return () => { window.clearInterval(timer); window.clearTimeout(exit); };
  }, []);
  if (done) return null;
  return <div className="site-loader"><div className="loader-top"><span>LOCAL BRAND GURUS</span><span>PRODUCTION STUDIO / 2026</span></div><div className="loader-wordmark"><span>LOCAL</span><span>BRAND</span><span>GURUS.</span></div><div className="loader-bottom"><span>LOADING EXPERIENCE</span><span>{String(count).padStart(2, '0')}%</span></div><div className="loader-line"><span style={{ width: `${count}%` }} /></div></div>;
}

/* ─── ImageWheel ───────────────────────────────────────────────────────────
   Desktop  → horizontal conveyor belt driven by drag + scroll energy
   Mobile   → circular orbital ring driven purely by page-scroll delta
   ─────────────────────────────────────────────────────────────────────── */
function ImageWheel({ className = '' }) {
  const [items, setItems] = useState(ringSeeds);
  const shellRef = useRef(null);
  const trackRef = useRef(null);
  const uploadedUrls = useRef([]);

  // shared motion state
  const motion = useRef({ offset: 0, momentum: 0, scrollEnergy: 0, dragging: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    let frame = 0;
    let previousScroll = window.scrollY;
    const isMobile = () => window.innerWidth <= 900;

    // ── scroll energy accumulator ──
    const onScroll = () => {
      const delta = Math.abs(window.scrollY - previousScroll);
      if (isMobile()) {
        // On mobile, direction matters for ring rotation
        const dir = window.scrollY > previousScroll ? 1 : -1;
        motion.current.scrollEnergy = Math.min(3.2, motion.current.scrollEnergy + dir * delta * 0.009);
      } else {
        motion.current.scrollEnergy = Math.min(1.8, motion.current.scrollEnergy + delta * 0.006);
      }
      previousScroll = window.scrollY;
    };

    const tick = () => {
      const state = motion.current;
      const mobile = isMobile();

      if (mobile) {
        // ── CIRCULAR RING MODE ──
        // offset accumulates as degrees of rotation
        if (!state.dragging) {
          state.offset += 0.18 + state.scrollEnergy + state.momentum;
          state.momentum *= 0.92;
        }
        state.scrollEnergy *= 0.88;

        if (trackRef.current) {
          trackRef.current.style.setProperty('--ring-rotation', `${state.offset}deg`);
        }
      } else {
        // ── HORIZONTAL WHEEL MODE ──
        if (!state.dragging) {
          state.offset += 0.34 + state.scrollEnergy + state.momentum;
          state.momentum *= 0.94;
        }
        state.scrollEnergy *= 0.9;
        const cycle = trackRef.current ? trackRef.current.scrollWidth / 2 : 1;
        if (cycle > 1) state.offset = ((state.offset % cycle) + cycle) % cycle;
        if (trackRef.current) trackRef.current.style.setProperty('--wheel-offset', `${state.offset}px`);
      }

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      uploadedUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // ── pointer drag (horizontal wheel on desktop, orbital drag on mobile) ──
  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    motion.current.dragging = true;
    motion.current.lastX = event.clientX;
    motion.current.lastY = event.clientY;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event) => {
    if (!motion.current.dragging) return;
    const mobile = window.innerWidth <= 900;
    if (mobile) {
      const dy = event.clientY - motion.current.lastY;
      const dx = event.clientX - motion.current.lastX;
      // tangential drag → rotate ring
      motion.current.offset -= (dx + dy) * 0.45;
      motion.current.momentum = -(dx + dy) * 0.09;
      motion.current.lastY = event.clientY;
    } else {
      const dx = event.clientX - motion.current.lastX;
      motion.current.offset -= dx;
      motion.current.momentum = -dx * 0.12;
    }
    motion.current.lastX = event.clientX;
  };
  const onPointerUp = (event) => {
    motion.current.dragging = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const addImages = (event) => {
    const files = [...event.target.files].filter((file) => file.type.startsWith('image/'));
    const additions = files.map((file) => {
      const url = URL.createObjectURL(file);
      uploadedUrls.current.push(url);
      return { src: url, label: file.name };
    });
    if (additions.length) setItems((current) => [...current, ...additions]);
    event.target.value = '';
  };

  // Desktop: duplicate items for infinite scroll
  const wheelItems = [...items, ...items];
  const wheelY = [-28, -62, -18, 24, -8, 34];
  const wheelTilt = [-11, 8, -6, 10, -9, 7];

  // Mobile: one full set, each card placed at equal angle intervals
  const cardCount = items.length;
  const angleStep = 360 / cardCount;

  return (
    <div
      className={`image-wheel-shell ${className}`}
      ref={shellRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label="Draggable image wheel"
    >
      {/* ── DESKTOP: horizontal conveyor track ── */}
      <div className="image-wheel-track image-wheel-track--desktop" ref={trackRef}>
        {wheelItems.map((item, index) => {
          const position = index % items.length;
          return (
            <figure
              className="image-wheel-card"
              key={`${item.src || item.background}-${index}`}
              style={{ '--wheel-y': `${wheelY[position]}px`, '--wheel-tilt': `${wheelTilt[position]}deg` }}
            >
              {item.src ? <img src={item.src} alt={item.label || 'Campaign image'} /> : <span style={{ background: item.background }} />}
            </figure>
          );
        })}
      </div>

      {/* ── MOBILE: circular orbital ring ── */}
      <div className="image-ring-orbit" ref={trackRef} aria-hidden="true">
        <div className="image-ring-orbit__wheel">
          {items.map((item, index) => (
            <figure
              className="image-wheel-card image-wheel-card--orbital"
              key={`orbital-${item.src || item.background}-${index}`}
              style={{ '--card-angle': `${index * angleStep}deg` }}
            >
              {item.src ? <img src={item.src} alt={item.label || 'Campaign image'} /> : <span style={{ background: item.background }} />}
            </figure>
          ))}
        </div>
      </div>

      <label className="wheel-upload mono">+ ADD IMAGES<input type="file" accept="image/*" multiple onChange={addImages} /></label>
    </div>
  );
}

/* ─── NOTE: trackRef is shared between both track divs.
   We need to split the refs properly. ─────────────────────────────────── */
// Rewrite ImageWheel properly with two separate refs:
function ImageWheelFixed({ className = '' }) {
  const [items, setItems] = useState(ringSeeds);
  const desktopTrackRef = useRef(null);
  const mobileWheelRef = useRef(null);
  const uploadedUrls = useRef([]);
  const motion = useRef({ offset: 0, momentum: 0, scrollEnergy: 0, dragging: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    let frame = 0;
    let previousScroll = window.scrollY;
    const isMobile = () => window.innerWidth <= 900;

    const onScroll = () => {
      const delta = window.scrollY - previousScroll;
      if (isMobile()) {
        motion.current.scrollEnergy = Math.min(3.5, motion.current.scrollEnergy + delta * 0.01);
      } else {
        motion.current.scrollEnergy = Math.min(1.8, motion.current.scrollEnergy + Math.abs(delta) * 0.006);
      }
      previousScroll = window.scrollY;
    };

    const tick = () => {
      const state = motion.current;
      const mobile = isMobile();

      if (mobile) {
        // CIRCULAR: offset = degrees
        if (!state.dragging) {
          state.offset += 0.22 + state.scrollEnergy * 1.4 + state.momentum;
          state.momentum *= 0.91;
        }
        state.scrollEnergy *= 0.86;
        if (mobileWheelRef.current) {
          mobileWheelRef.current.style.transform = `rotate(${state.offset}deg)`;
        }
      } else {
        // HORIZONTAL: offset = pixels
        if (!state.dragging) {
          state.offset += 0.34 + state.scrollEnergy + state.momentum;
          state.momentum *= 0.94;
        }
        state.scrollEnergy *= 0.9;
        const cycle = desktopTrackRef.current ? desktopTrackRef.current.scrollWidth / 2 : 1;
        if (cycle > 1) state.offset = ((state.offset % cycle) + cycle) % cycle;
        if (desktopTrackRef.current) desktopTrackRef.current.style.setProperty('--wheel-offset', `${state.offset}px`);
      }

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      uploadedUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    motion.current.dragging = true;
    motion.current.lastX = event.clientX;
    motion.current.lastY = event.clientY;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event) => {
    if (!motion.current.dragging) return;
    const mobile = window.innerWidth <= 900;
    if (mobile) {
      const dx = event.clientX - motion.current.lastX;
      const dy = event.clientY - motion.current.lastY;
      motion.current.offset -= (dx + dy) * 0.5;
      motion.current.momentum = -(dx + dy) * 0.1;
      motion.current.lastY = event.clientY;
    } else {
      const dx = event.clientX - motion.current.lastX;
      motion.current.offset -= dx;
      motion.current.momentum = -dx * 0.12;
    }
    motion.current.lastX = event.clientX;
  };
  const onPointerUp = (event) => {
    motion.current.dragging = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const addImages = (event) => {
    const files = [...event.target.files].filter((f) => f.type.startsWith('image/'));
    const additions = files.map((f) => {
      const url = URL.createObjectURL(f);
      uploadedUrls.current.push(url);
      return { src: url, label: f.name };
    });
    if (additions.length) setItems((c) => [...c, ...additions]);
    event.target.value = '';
  };

  const wheelItems = [...items, ...items];
  const wheelY = [-28, -62, -18, 24, -8, 34];
  const wheelTilt = [-11, 8, -6, 10, -9, 7];
  const angleStep = 360 / items.length;

  return (
    <div
      className={`image-wheel-shell ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label="Draggable image wheel"
    >
      {/* DESKTOP — horizontal conveyor */}
      <div className="image-wheel-track" ref={desktopTrackRef}>
        {wheelItems.map((item, index) => {
          const pos = index % items.length;
          return (
            <figure
              className="image-wheel-card"
              key={`d-${item.src || item.background}-${index}`}
              style={{ '--wheel-y': `${wheelY[pos]}px`, '--wheel-tilt': `${wheelTilt[pos]}deg` }}
            >
              {item.src ? <img src={item.src} alt={item.label || 'Campaign image'} /> : <span style={{ background: item.background }} />}
            </figure>
          );
        })}
      </div>

      {/* MOBILE — circular orbital ring */}
      <div className="orbital-ring-shell" aria-hidden="true">
        <div className="orbital-ring-wheel" ref={mobileWheelRef}>
          {items.map((item, index) => (
            <figure
              className="orbital-ring-card"
              key={`m-${item.src || item.background}-${index}`}
              style={{ '--card-angle': `${index * angleStep}deg` }}
            >
              {item.src ? <img src={item.src} alt="" /> : <span style={{ background: item.background }} />}
            </figure>
          ))}
        </div>
      </div>

      <label className="wheel-upload mono">+ ADD IMAGES<input type="file" accept="image/*" multiple onChange={addImages} /></label>
    </div>
  );
}

function Header({ open, setOpen }) {
  return <>
    <header className="site-header">
      <a className="brand-mark" href="#top" aria-label="Local Brand Gurus home"><img className="brand-logo" src="/assets/local-brand-gurus-logo.png" alt="Local Brand Gurus logo" /></a>
      <div className="header-center mono"><span className="nav-dot" /><span>DIGITAL MARKETING + PRODUCTION STUDIO</span><span className="nav-arrow">↗</span></div>
      <button className="menu-trigger" type="button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((value) => !value)}><span className="menu-text">MENU</span><span className="menu-icon"><i /><i /></span></button>
    </header>
    <aside className={`site-menu ${open ? 'is-open' : ''}`} id="site-menu" aria-hidden={!open}><div className="menu-panel"><div className="menu-kicker mono">NAVIGATE THE CONTROL ROOM / 00—05</div><nav className="menu-links">{[['01', 'OUR APPROACH', '#approach'], ['02', 'THE SYSTEM', '#services'], ['03', 'CAMPAIGNS', '#campaign'], ['04', 'SELECTED WORK', '#work'], ['05', 'START A PROJECT', '#contact']].map(([number, label, href]) => <a key={label} href={href} onClick={() => setOpen(false)}><span>{number}</span>{label}</a>)}</nav><div className="menu-footer mono"><span>INSTAGRAM @LOCALBRANDGURUS</span><span>POWERED BY @URE_PRODUCTIONS</span></div></div></aside>
  </>;
}

function Hero() {
  return <section className="hero" id="approach"><div className="hero-grid" /><div className="hero-meta mono"><span>THE LOCAL BRAND<br />CONTROL ROOM</span><span>SCROLL TO OPERATE<br />THE CAMERA</span></div><div className="hero-copy"><p className="eyebrow reveal-up">A CREATIVE MARKETING STUDIO FOR BRANDS WITH SOMEWHERE TO GO <em>↘</em></p><h1 className="hero-title"><span className="line"><span className="line-inner">MAKE YOUR</span></span><span className="line"><span className="line-inner accent-word">LOCAL BRAND</span></span><span className="line"><span className="line-inner">UNMISSABLE<span className="period">.</span></span></span></h1><p className="hero-intro reveal-up">Smart marketing for local brands.<br /><span>Instagram · SEO · Ads · Automation · Production</span></p></div><div className="hero-camera"><img src="/assets/camera-hero.png" alt="Professional cinema camera in a warm studio" /><div className="camera-glass" /><div className="camera-focus mono">FOCUS / 01<br /><span>38.0mm</span></div></div><div className="hero-scroll mono"><span className="scroll-arrow">↓</span><span>KEEP MOVING<br />TO REVEAL</span></div></section>;
}

function LensTransition() { return <section className="lens-transition" aria-label="Attention is engineered transition"><div className="lens-cut lens-cut-left" /><div className="lens-cut lens-cut-right" /><div className="lens-ring ring-outer" /><div className="lens-ring ring-mid" /><div className="lens-ring ring-inner" /><div className="lens-copy"><span className="mono">THE LENS BECOMES THE SCREEN</span><strong>ATTENTION<br />IS A CHOICE.</strong></div><div className="lens-reveal"><span className="mono reveal-index">01 / CAMERA → CONTENT</span><small className="mono reveal-kicker">WE BUILD THE MOMENT<br />BEFORE THE CLICK.</small><strong>Attention is<br /><em>engineered.</em></strong><p>Your best story deserves more than a post. We make the image, the edit, the message and the machine behind it work as one continuous signal.</p></div><div className="shutter-line" /></section>; }

function Statement() { return null; }

function Services() {
  return (
    <section className="services-section" id="services">
      <div className="services-sticky">
        <div className="section-index mono">02 / THE SYSTEM</div>
        <div className="services-headline">
          <span>CREATE.</span><span>CAPTURE.</span><span>DISTRIBUTE.</span><span>CONVERT.</span>
        </div>
        <div className="services-rail mono">
          <span>VERTICAL SCROLL / HORIZONTAL STORY</span>
          <span className="rail-count">01—04</span>
        </div>
        <div className="services-track">
          {services.map((service) => (
            <article className="service-slide" key={service.number}>
              <div className={`service-image ${service.image}`}>
                <div className="image-caption mono">{service.label}</div>
              </div>
              <div className="service-copy">
                <span className="service-number">{service.number}</span>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
                <div className="service-tags mono">{service.tags}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Campaign() { return <section className="campaign-section" id="campaign"><div className="section-index mono">03 / LIVE CAMPAIGN</div><div className="campaign-intro"><p className="eyebrow">THE FEED IS A STAGE <em>↘</em></p><h2>Make the scroll<br /><span>stop scrolling.</span></h2></div><div className="campaign-stage"><div className="feed-wall"><div className="feed-post post-a"><span className="post-label mono">@LOCALBRANDGURUS</span><strong>MAKE<br />IT<br />LOCAL.</strong><span className="post-foot mono">01 / 04</span></div><div className="feed-post post-b"><span className="post-label mono">A LITTLE MORE SIGNAL</span><div className="signal-bars"><i /><i /><i /><i /><i /><i /></div><strong>GOOD<br />CONTENT<br />TRAVELS.</strong></div><div className="feed-post post-c"><span className="post-label mono">THE EDIT / 03</span><div className="edit-circle" /><strong>ROLL<br />WITH IT.</strong></div></div><div className="phone-wrap"><div className="phone-shadow" /><div className="phone"><div className="phone-speaker" /><div className="phone-screen"><div className="insta-top"><span className="insta-word">local.</span><span>♡　◎</span></div><div className="insta-story-row"><i /><i /><i /><i /></div><div className="insta-image"><div className="insta-cross" /><span className="mono">CONTENT / 01</span></div><div className="insta-actions">♡　♧　↗ <span>•••</span></div><strong className="insta-likes">4,892 likes</strong><p><b>localbrandgurus</b> What happens when the story finds its audience?</p><small>View all 46 comments</small></div></div></div><div className="live-metric metric-reach"><span className="mono">REACH</span><strong data-count="238">0</strong><em>+38.4%</em></div><div className="live-metric metric-likes"><span className="mono">LIKES</span><strong data-count="4892">0</strong><em>THIS CAMPAIGN</em></div></div><div className="campaign-bottom mono"><span>CAMPAIGN STATUS</span><span className="status-dot" /><span>LIVE / LEARNING / MOVING</span></div></section>; }

function Dashboard() { return <section className="dashboard-section"><div className="section-index mono">04 / CONTROL ROOM</div><div className="dashboard-header"><p className="eyebrow">EVERYTHING IN FRAME <em>↘</em></p><h2>Signals worth<br /><span>following.</span></h2><p>Creative instinct, backed by a clear view of what is moving. The dashboard is where the story becomes a growth loop.</p></div><div className="dashboard-shell"><div className="dash-top mono"><span>CAMPAIGN / LOCAL—001</span><span>LIVE DATA <i className="status-dot" /></span><span>14—09—26</span></div><div className="dash-grid">{[['REACH', '824', '+24.8%'], ['ENGAGEMENT', '682', '+18.2%'], ['LEADS', '146', '+31.6%'], ['CONVERSIONS', '78', '+42.9%']].map(([label, value, delta]) => <div className="dash-stat" key={label}><span className="mono">{label}</span><strong data-count={value}>0</strong><small>{delta}</small></div>)}<div className="dash-chart"><div className="chart-title mono">ATTENTION / LAST 30 DAYS <span>↗ 34.6%</span></div><svg viewBox="0 0 760 220" preserveAspectRatio="none" aria-label="Campaign attention graph"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3e6c62" stopOpacity=".28" /><stop offset="1" stopColor="#3e6c62" stopOpacity="0" /></linearGradient></defs><path className="chart-fill" d="M0 188 C40 164, 50 177, 92 160 S145 142, 180 150 S225 118, 260 135 S310 110, 348 124 S395 94, 430 109 S490 74, 530 88 S565 70, 606 82 S656 35, 700 52 S735 24, 760 14 V220 H0Z" /><path className="chart-line" d="M0 188 C40 164, 50 177, 92 160 S145 142, 180 150 S225 118, 260 135 S310 110, 348 124 S395 94, 430 109 S490 74, 530 88 S565 70, 606 82 S656 35, 700 52 S735 24, 760 14" /></svg><div className="chart-axis mono"><span>01 SEP</span><span>15 SEP</span><span>30 SEP</span></div></div><div className="dash-sources"><div className="chart-title mono">SOURCE MIX</div>{[['Instagram', '78%'], ['Search', '54%'], ['Paid', '36%'], ['Direct', '22%']].map(([source, value]) => <div className="source-row" key={source}><span>{source}</span><b><i style={{ width: value }} /></b><em>{value}</em></div>)}</div></div><div className="dash-bottom mono"><span>REPORTING IS NOT THE END OF THE STORY.</span><span>IT IS WHERE THE NEXT SHOT STARTS. ↗</span></div></div></section>; }

function Production() { return <section className="production-section"><div className="production-image"><img src="/assets/camera-hero.png" alt="Camera ready for production" /></div><div className="production-overlay" /><div className="section-index mono">05 / PRODUCTION FLOOR</div><div className="production-copy"><p className="eyebrow">REAL LIGHT. REAL PEOPLE. REAL MOMENTUM. <em>↘</em></p><h2>Give the<br />story <span>a pulse.</span></h2><p>From the first frame to the final cut, we make work that feels like it happened for a reason.</p><a className="text-link magnetic" href="#enquiry-form">BOOK THE STUDIO <span>↘</span></a></div><div className="production-specs mono"><span>CAMERA / ALEXA MINI</span><span>LENS / 38MM PRIME</span><span>LIGHT / 3200K</span></div></section>; }

function Kinetic() { return <section className="kinetic-section"><div className="kinetic-word word-we">WE</div><div className="kinetic-word word-make">MAKE</div><div className="kinetic-word word-brands">BRANDS</div><div className="kinetic-word word-move">MOVE<span>.</span></div><div className="kinetic-final"><span>GROWTH.</span></div><div className="kinetic-note mono">THE ONLY DIRECTION<br />WORTH MOVING IN.</div></section>; }

function Work() {
  return (
    <section className="work-section" id="work">
      <div className="work-sticky">
        <div className="section-index mono">06 / SELECTED WORK</div>
        <div className="work-heading">
          <p className="eyebrow">A FEW THINGS WE HAVE SET IN MOTION <em>↘</em></p>
          <h2>Proof in<br /><span>the wild.</span></h2>
        </div>
        <div className="work-track">
          {[
            ['01', 'HOSPITALITY', 'THE COMMON ROOM', '+184% QUALIFIED LEADS ↗', 'graphic-one'],
            ['02', 'DESIGN + RETAIL', 'FORM / FUNCTION', '3.8M ORGANIC IMPRESSIONS ↗', 'graphic-two'],
            ['03', 'FOOD + CULTURE', 'ONE GOOD TURN', '4.2X RETURN ON AD SPEND ↗', 'graphic-three'],
          ].map(([number, category, title, result, graphic]) => (
            <a className="work-item" href="#enquiry-form" key={number}>
              <div className="work-visual">
                {/* Clean gradient graphic only — no image wheel on work cards */}
                <div className={`work-graphic ${graphic}`}>
                  <span className="mono">{number} / {category}</span>
                  <strong>{title}</strong>
                </div>
              </div>
              <div className="work-meta">
                <span className="mono">{number} / {category}</span>
                <h3>{title}</h3>
                <span className="work-result mono">{result}</span>
              </div>
            </a>
          ))}
        </div>
        {/* Mobile rail: mirrors the services-rail progress indicator */}
        <div className="work-rail mono">
          <span>VERTICAL SCROLL / HORIZONTAL STORY</span>
          <span className="work-rail-count">01—03</span>
        </div>
      </div>
    </section>
  );
}

function Testimonials() { const [index, setIndex] = useState(0); return <section className="testimonial-section"><div className="section-index mono">07 / ON THE RECORD</div><div className="quote-mark">"</div><blockquote className="quote-text">{testimonials[index][0]}</blockquote><div className="testimonial-meta"><span className="quote-person mono">{testimonials[index][1]}</span><span className="quote-count mono">{String(index + 1).padStart(2, '0')} — 03</span></div><div className="quote-controls"><button type="button" aria-label="Previous testimonial" onClick={() => setIndex((index + testimonials.length - 1) % testimonials.length)}>←</button><span /><button type="button" aria-label="Next testimonial" onClick={() => setIndex((index + 1) % testimonials.length)}>→</button></div></section>; }

function EnquiryForm() { const [status, setStatus] = useState(''); const submit = (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const name = String(data.get('name') || '').trim(); const email = String(data.get('email') || '').trim(); const brand = String(data.get('brand') || '').trim() || 'Not provided'; const service = String(data.get('service') || '').trim(); const date = String(data.get('date') || '').trim() || 'Flexible'; const time = String(data.get('time') || '').trim() || 'Flexible'; const message = String(data.get('message') || '').trim(); const subject = `Project enquiry — ${brand}`; const body = [`Hi Local Brand Gurus,`, ``, `Name: ${name}`, `Email: ${email}`, `Brand / business: ${brand}`, `Service: ${service}`, `Preferred date: ${date}`, `Preferred time: ${time}`, ``, `Project brief:`, message].join('\n'); setStatus('Opening your email app with the enquiry details…'); window.location.href = `mailto:localbrandgurus.info@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; }; return <div className="enquiry-wrap" id="enquiry-form"><div className="enquiry-intro"><span className="mono">TELL US WHAT YOU'RE BUILDING</span><p>Share a few details and we'll reply directly with the best next step for your brand.</p></div><form className="enquiry-form" onSubmit={submit}><div className="form-row"><label><span className="mono">YOUR NAME *</span><input name="name" type="text" autoComplete="name" required placeholder="Your name" /></label><label><span className="mono">EMAIL *</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label></div><div className="form-row"><label><span className="mono">BRAND / BUSINESS</span><input name="brand" type="text" autoComplete="organization" placeholder="Your brand" /></label><label><span className="mono">WHAT DO YOU NEED? *</span><select name="service" required defaultValue=""><option value="" disabled>Select a service</option><option>Instagram marketing</option><option>Social media content</option><option>SEO</option><option>Paid advertising</option><option>Marketing automation</option><option>Video / photo production</option><option>Reels / short-form content</option><option>Brand content</option><option>Not sure yet</option></select></label></div><div className="form-row"><label><span className="mono">PREFERRED DATE</span><input name="date" type="date" /></label><label><span className="mono">PREFERRED TIME</span><select name="time" defaultValue=""><option value="">Flexible</option><option>Morning (9am–12pm)</option><option>Afternoon (12pm–4pm)</option><option>Evening (4pm–7pm)</option></select></label></div><label><span className="mono">YOUR BRIEF *</span><textarea name="message" required rows="4" placeholder="Tell us about the project, launch, challenge, or idea." /></label><div className="form-submit-row"><button className="form-submit magnetic" type="submit"><span>SEND ENQUIRY</span><b>↗</b></button><span className="form-note mono">YOUR EMAIL APP WILL OPEN WITH THE DETAILS PRE-FILLED.</span></div><p className="form-status" role="status" aria-live="polite">{status}</p></form></div>; }

function CTA() { return <section className="cta-section" id="contact"><div className="cta-grid" /><div className="section-index mono">08 / YOUR TURN</div><div className="cta-copy"><p className="eyebrow">ROLL CREDITS? NOT YET. <em>↘</em></p><h2>LET'S MAKE YOUR<br />BRAND <span>IMPOSSIBLE<br />TO IGNORE.</span></h2><a className="cta-button magnetic" href="#enquiry-form"><span>START A PROJECT</span><b>↘</b></a></div><EnquiryForm /><div className="cta-bottom mono"><span>LOCALBRANDGURUS.INFO@GMAIL.COM</span><a href="https://instagram.com/localbrandgurus" target="_blank" rel="noreferrer">INSTAGRAM @LOCALBRANDGURUS</a><span>POWERED BY @URE_PRODUCTIONS</span></div></section>; }

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const appRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = () => window.innerWidth <= 900;

    const ctx = gsap.context(() => {
      // ── Smooth scroll (desktop only — mobile uses native) ──
      const lenis = reduced || isMobile() ? null : new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
      let rafId = 0;
      const raf = (time) => { lenis?.raf(time); rafId = requestAnimationFrame(raf); };
      if (lenis) rafId = requestAnimationFrame(raf);
      gsap.ticker.lagSmoothing(1000, 16);

      // ── Intro title animation ──
      const intro = gsap.timeline({ delay: reduced ? 0 : 2.15 });
      intro
        .to('.line-inner', { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: 'power4.out' })
        .to('.reveal-up', { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out' }, '-=.8');

      if (!reduced) {
        // ── Hero camera parallax ──
        gsap.to('.hero-camera', {
          y: 48, scale: 1.18, rotate: -3, filter: 'blur(2px)', ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 2 },
        });
        gsap.to('.camera-glass', {
          rotate: 70, scale: 1.35, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 2 },
        });

        // ── Lens transition ──
        gsap.to('.ring-inner', {
          scale: 1.14, rotate: 20, ease: 'none',
          scrollTrigger: { trigger: '.lens-transition', start: 'top bottom', end: 'bottom top', scrub: 2 },
        });
        // Door opens once section is centred in view, finishes at 65% up
        const lensDoorScroll = { trigger: '.lens-transition', start: 'top 60%', end: 'center 25%', scrub: 2 };
        gsap.to('.lens-cut-left', { xPercent: -100, ease: 'none', scrollTrigger: lensDoorScroll });
        gsap.to('.lens-cut-right', { xPercent: 100, ease: 'none', scrollTrigger: lensDoorScroll });
        gsap.to('.lens-ring, .lens-copy, .shutter-line', { scale: 0.72, opacity: 0, y: -24, ease: 'none', scrollTrigger: lensDoorScroll });
        gsap.fromTo('.lens-reveal',
          { opacity: 0, y: 70, scale: 0.84 },
          { opacity: 1, y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.lens-transition', start: 'center 45%', end: 'center 20%', scrub: 2 } },
        );

        // ── Services: horizontal scroll (desktop + mobile via GSAP pin) ──
        const serviceTrack = document.querySelector('.services-track');
        if (serviceTrack) {
          const distance = () => serviceTrack.scrollWidth - window.innerWidth;
          gsap.to(serviceTrack, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: '.services-section',
              start: 'top top',
              end: () => `+=${distance() + window.innerWidth * 0.5}`,
              scrub: 2.5,
              pin: '.services-sticky',
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const el = document.querySelector('.rail-count');
                if (el) el.textContent = `${String(Math.min(4, Math.max(1, Math.ceil(self.progress * 4)))).padStart(2, '0')}—04`;
              },
            },
          });
        }

        // ── Campaign section: pin on mobile, parallax on desktop ──
        if (isMobile()) {
          gsap.fromTo('.phone-wrap',
            { y: -80, rotate: -5 },
            {
              y: 0, rotate: 3, ease: 'none',
              scrollTrigger: {
                trigger: '.campaign-section',
                start: 'top top',
                end: '+=700',
                scrub: 2,
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
              },
            },
          );
        } else {
          // Desktop: feed posts reveal when section is mostly in view
          gsap.from('.feed-post', { y: 80, rotate: 0, opacity: 0, stagger: 0.12, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.campaign-section', start: 'top 80%' } });
          gsap.fromTo('.phone-wrap',
            { y: -220, rotate: -8, opacity: 0 },
            { y: 90, rotate: 5, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.campaign-section', start: 'top 92%', end: 'bottom 20%', scrub: 2 } },
          );
        }

        // ── Production parallax ──
        gsap.to('.production-image', {
          scale: 1.12, xPercent: -2, ease: 'none',
          scrollTrigger: { trigger: '.production-section', start: 'top bottom', end: 'bottom top', scrub: 1.8 },
        });

        // ── Kinetic typography: pinned, words explode then GROWTH fades in ──
        const kineticWords = gsap.utils.toArray('.kinetic-word');
        const kineticShift = isMobile() ? [-28, 32, -36, 40] : [-170, 80, -110, 120];
        const kineticTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: '.kinetic-section',
            start: 'top top',
            end: isMobile() ? '+=1000' : '+=1800',
            scrub: 2,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          },
        });
        kineticWords.forEach((word, index) =>
          kineticTimeline.to(word, { x: kineticShift[index], y: index % 2 ? -50 : 50, rotate: (index - 1.5) * 3, opacity: 0, ease: 'none' }, 0),
        );
        kineticTimeline.fromTo('.kinetic-final',
          { opacity: 0, scale: 0.72, rotate: -5 },
          { opacity: 1, scale: 1, rotate: 0, ease: 'none' },
          0.35, // starts after words have cleared 35% of the way
        );

        // ── Work section: horizontal scroll (mobile) / fade-in (desktop) ──
        ScrollTrigger.matchMedia({
          '(max-width: 900px)': () => {
            const workTrack = document.querySelector('.work-track');
            if (!workTrack) return;
            const workDistance = () => workTrack.scrollWidth - window.innerWidth;
            gsap.to(workTrack, {
              x: () => -workDistance(),
              ease: 'none',
              scrollTrigger: {
                trigger: '.work-section',
                start: 'top top',
                end: () => `+=${workDistance() + window.innerWidth * 0.4}`,
                scrub: 2.5,
                pin: '.work-sticky',
                pinSpacing: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  const el = document.querySelector('.work-rail-count');
                  if (el) el.textContent = `${String(Math.min(3, Math.max(1, Math.ceil(self.progress * 3)))).padStart(2, '0')}—03`;
                },
              },
            });
          },
          '(min-width: 901px)': () => {
            // Desktop: stagger in when section is well into view
            gsap.from('.work-item', { y: 100, opacity: 0, stagger: 0.22, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.work-section', start: 'top 80%' } });
          },
        });
      }

      // ── Animated counters ──
      gsap.utils.toArray('[data-count]').forEach((node) => {
        const end = Number(node.dataset.count);
        gsap.fromTo(node,
          { textContent: 0 },
          { textContent: end, duration: reduced ? 0 : 1.4, ease: 'power3.out', snap: { textContent: 1 }, scrollTrigger: { trigger: node, start: 'top 85%' }, onUpdate: () => { node.textContent = Number(node.textContent).toLocaleString(); } },
        );
      });

      // ── Dashboard chart ──
      gsap.to('.chart-line', { strokeDashoffset: 0, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: '.dashboard-section', start: 'top 65%' } });
      gsap.to('.chart-fill', { opacity: 1, duration: 1.3, scrollTrigger: { trigger: '.dashboard-section', start: 'top 65%' } });

      // ── Magnetic hover (desktop only) ──
      if (!isMobile()) {
        const magnetic = (event) => { const item = event.currentTarget; const rect = item.getBoundingClientRect(); const x = (event.clientX - rect.left - rect.width / 2) * 0.12; const y = (event.clientY - rect.top - rect.height / 2) * 0.12; gsap.to(item, { x, y, duration: 0.35, ease: 'power3.out' }); };
        const resetMagnetic = (event) => gsap.to(event.currentTarget, { x: 0, y: 0, duration: 0.45, ease: 'elastic.out(1, .45)' });
        document.querySelectorAll('.magnetic').forEach((item) => { item.addEventListener('pointermove', magnetic); item.addEventListener('pointerleave', resetMagnetic); });
        return () => {
          cancelAnimationFrame(rafId);
          lenis?.destroy();
          document.querySelectorAll('.magnetic').forEach((item) => { item.removeEventListener('pointermove', magnetic); item.removeEventListener('pointerleave', resetMagnetic); });
        };
      }

      return () => { cancelAnimationFrame(rafId); lenis?.destroy(); };
    }, appRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={appRef} className="react-app">
      <Loader />
      <div className="noise" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true"><span /></div>
      <Header open={menuOpen} setOpen={setMenuOpen} />
      <main id="top">
        <Hero />
        <LensTransition />
        <Statement />
        <Services />
        <Campaign />
        <Dashboard />
        <Production />
        <Kinetic />
        <Work />
        <Testimonials />
        <CTA />
      </main>
      <footer className="site-footer mono">
        <span>© 2026 LOCAL BRAND GURUS</span>
        <span>MADE TO MOVE</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </div>
  );
}

export default App;
