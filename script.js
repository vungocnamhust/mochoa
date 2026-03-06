// ===== QUẾ HOA KNOWLEDGE SYSTEM — Interactive Script =====

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initParticles();
  initScrollAnimations();
  initCounters();
  initKnowledgeMap();
  initDomainCards();
});

// --- Navigation ---
function initNavigation() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
  });

  // Smooth scroll & close mobile menu
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      links.classList.remove('open');
      toggle.textContent = '☰';
    });
  });

  // Active link highlighting
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.getAttribute('id');
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });
}

// --- Hero Particles ---
function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (6 + Math.random() * 6) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
    container.appendChild(p);
  }
}

// --- Scroll Animations ---
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => {
    observer.observe(el);
  });
}

// --- Animated Counters ---
function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

function animateCounter(el, target) {
  const duration = 2000;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(target * eased).toLocaleString('vi-VN');
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// --- Knowledge Map Positioning ---
function initKnowledgeMap() {
  const container = document.getElementById('mapContainer');
  const nodes = document.querySelectorAll('.knowledge-node');
  const svg = document.getElementById('mapSvg');
  const center = document.querySelector('.map-center');

  // Only do orbital layout on desktop
  if (window.innerWidth <= 1024) return;

  function positionNodes() {
    const rect = container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const radius = Math.min(cx, cy) * 0.7;
    const count = nodes.length;

    // Clear SVG lines
    svg.innerHTML = '';
    svg.setAttribute('width', rect.width);
    svg.setAttribute('height', rect.height);

    nodes.forEach((node, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const x = cx + radius * Math.cos(angle) - 70;
      const y = cy + radius * Math.sin(angle) - 70;
      node.style.left = x + 'px';
      node.style.top = y + 'px';

      // Draw connection line from center to node
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy);
      line.setAttribute('x2', x + 70);
      line.setAttribute('y2', y + 70);

      // Active lines for nodes with data
      const status = node.querySelector('.node-status');
      if (status && status.classList.contains('done')) {
        line.classList.add('active');
      }
      svg.appendChild(line);
    });

    // Inter-node connections (adjacent nodes)
    for (let i = 0; i < count; i++) {
      const j = (i + 1) % count;
      const ni = nodes[i], nj = nodes[j];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', parseFloat(ni.style.left) + 70);
      line.setAttribute('y1', parseFloat(ni.style.top) + 70);
      line.setAttribute('x2', parseFloat(nj.style.left) + 70);
      line.setAttribute('y2', parseFloat(nj.style.top) + 70);
      line.style.opacity = '0.2';
      svg.appendChild(line);
    }
  }

  positionNodes();
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) positionNodes();
  });

  // Click node to scroll to domain
  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const domain = node.dataset.domain;
      const target = document.getElementById(domain) ||
        document.getElementById(domain + '-domain');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Pulse effect on target card
        target.style.boxShadow = '0 0 40px rgba(201, 168, 76, 0.4)';
        setTimeout(() => { target.style.boxShadow = ''; }, 2000);
      }
    });
  });
}

// --- Domain Card Expand/Collapse ---
function initDomainCards() {
  document.querySelectorAll('.domain-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't toggle if clicking a link
      if (e.target.closest('a')) return;

      const panel = card.querySelector('.detail-panel');
      if (!panel) return;

      const isOpen = panel.classList.contains('open');

      // Close all panels first
      document.querySelectorAll('.detail-panel').forEach(p => p.classList.remove('open'));

      // Toggle clicked panel
      if (!isOpen) {
        panel.classList.add('open');
        // Scroll panel into view
        setTimeout(() => {
          panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
      }
    });
  });

  // Animate progress bars on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll('.fill');
        fills.forEach(fill => {
          const width = fill.style.width;
          fill.style.width = '0';
          setTimeout(() => { fill.style.width = width; }, 100);
        });
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.domain-card').forEach(card => observer.observe(card));
}

// --- QR Scan Simulation ---
function simulateScan() {
  const btn = document.getElementById('scanBtn');
  const result = document.getElementById('qrResult');
  const phoneScreen = btn.closest('.phone-screen');

  // Disable button during animation
  btn.disabled = true;
  btn.textContent = '🔄 Đang quét...';

  // Flash effect on phone screen
  phoneScreen.style.background = 'rgba(201, 168, 76, 0.15)';
  setTimeout(() => {
    phoneScreen.style.background = '#0d1117';
  }, 300);

  // Activate result after short delay
  setTimeout(() => {
    result.classList.add('active');
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    btn.textContent = '✅ Đã quét!';

    // Re-enable after a pause
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = '📱 Quét lại';
    }, 2000);
  }, 1200);
}

// Make simulateScan globally accessible
window.simulateScan = simulateScan;
