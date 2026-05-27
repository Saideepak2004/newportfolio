import React, { useEffect, useRef, useState } from 'react';
import './app.css'; // Make sure to import the CSS!

export default function App() {
  // UI and Upload states
  const [photo, setPhoto] = useState('/photo.png');
  const [statusIdx, setStatusIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statusWords = [
    'Open to Internships',
    'Seeking AIML roles',
    'Building cool things'
  ];

  // DOM Refs for animations
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Status Word Rotator Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % statusWords.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [statusWords.length]);

  // 2. Physics-Based Constellation Background Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize particles (Tech Theme: Cyan & Purple)
    const particles = [];
    const particleCount = 100;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        // Mix of Neon Cyan (190) and Deep Purple (270)
        hue: Math.random() > 0.5 ? 190 : 270 
      });
    }

    // Orb background highlights
    const orbs = [
      { px: 0.15, py: 0.2, r: 300, hue: 270, sx: 0.2, sy: 0.2, amp: 0.05 },
      { px: 0.85, py: 0.15, r: 250, hue: 190, sx: 0.3, sy: 0.3, amp: 0.06 },
      { px: 0.5, py: 0.8, r: 350, hue: 280, sx: 0.15, sy: 0.15, amp: 0.04 },
    ];

    let t = 0;
    let animationFrameId;

    const renderLoop = () => {
      t += 0.005; // Slowed down for an elegant feel
      ctx.clearRect(0, 0, width, height);

      // Render drifting orbs (Soft glows)
      orbs.forEach((o) => {
        const ox = o.px * width + Math.sin(t * o.sx) * o.amp * width;
        const oy = o.py * height + Math.cos(t * o.sy) * o.amp * height;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        g.addColorStop(0, `hsla(${o.hue}, 80%, 50%, 0.05)`);
        g.addColorStop(1, `hsla(${o.hue}, 80%, 50%, 0)`);
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Render floating connection web
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.alpha})`;
        ctx.fill();
      });

      // Connect particles close to each other
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = `rgba(138, 43, 226, ${opacity})`; // Purple tint
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 3. Custom Elastic Cursor Follower Effect
  useEffect(() => {
    const cur = cursorRef.current;
    const ctr = followerRef.current;
    if (!cur || !ctr) return;

    let mx = 0, my = 0; 
    let cx = 0, cy = 0; 

    const handleMouseMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      cur.style.transform = `translate(${mx}px, ${my}px)`;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    const tick = () => {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      ctr.style.transform = `translate(${cx}px, ${cy}px)`;
      animationFrameId = requestAnimationFrame(tick);
    };
    tick();

    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, .proj, .sk-chip');
      if (target) {
        ctr.classList.add('hover');
        cur.style.opacity = 0;
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('a, button, .proj, .sk-chip');
      if (target) {
        ctr.classList.remove('hover');
        cur.style.opacity = 1;
      }
    };

    document.body.addEventListener('mouseover', handleMouseOver);
    document.body.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      document.body.removeEventListener('mouseover', handleMouseOver);
      document.body.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  // 4. Scroll Reveal Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vis');
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const revealElements = document.querySelectorAll('.fu');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="portfolio-container">
      <canvas ref={canvasRef} id="bg-canvas"></canvas>
      <div ref={cursorRef} id="cur"></div>
      <div ref={followerRef} id="ctr"></div>

      <nav id="nav">
        <a className="nav-logo" href="#">SD<span>.</span></a>
        <div className="nav-links">
          <a className="nav-link" href="#about">About</a>
          <a className="nav-link" href="#projects">Projects</a>
          <a className="nav-link" href="#skills">Skills</a>
        </div>
      </nav>

      <main className="wrap">
        {/* HERO SECTION */}
        <section className="hero">
          <div className="fu">
            <h1 className="hero-name">Sai <span className="accent">Deepak</span></h1>
            <div className="hero-role">
              <div className="live-dot"></div>
              <span>Currently — <b className="status-text">{statusWords[statusIdx]}</b></span>
            </div>
            <p className="hero-bio">
              Creative Developer & AIML Researcher from IIITDM Kancheepuram. 
              I build things that matter — from ML models to full-stack apps.
            </p>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section className="section fu" id="projects">
          <p className="sec-eyebrow">01 — Projects</p>
          <h2 className="sec-title">Things I've <em>built</em></h2>
          <div className="proj-grid">
            <div className="proj">
              <div className="proj-glow"></div>
              <div className="proj-content">
                <div className="proj-head">
                  <h3 className="proj-title">Fake News Detection using BERT</h3>
                </div>
                <p className="proj-desc">Developed an NLP system to classify news articles as real or fake using deep learning contextual understanding.</p>
                <div className="proj-pills">
                  <span>Python</span><span>PyTorch</span><span>NLP</span><span>BERT</span>
                </div>
              </div>
            </div>

            <div className="proj">
              <div className="proj-glow"></div>
              <div className="proj-content">
                <div className="proj-head">
                  <h3 className="proj-title">Bitcoin Price Prediction</h3>
                </div>
                <p className="proj-desc">LSTM-based deep learning model predicting cryptocurrency prices from historical time-series data, outperforming standard regression.</p>
                <div className="proj-pills">
                  <span>Python</span><span>PyTorch</span><span>Pandas</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section className="section fu" id="skills">
          <p className="sec-eyebrow">02 — Skills</p>
          <h2 className="sec-title">Tools of my <em>trade</em></h2>
          <div className="sk-chips">
            <div className="sk-chip">🐍 Python</div>
            <div className="sk-chip">⚛️ React</div>
            <div className="sk-chip">🧠 Machine Learning</div>
            <div className="sk-chip">🔥 PyTorch</div>
            <div className="sk-chip">🗄️ SQL</div>
            <div className="sk-chip">🐳 Docker</div>
            <div className="sk-chip">⚡ C</div>
          </div>
        </section>
      </main>
    </div>
  );
}