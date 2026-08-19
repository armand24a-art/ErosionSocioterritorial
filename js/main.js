document.addEventListener('DOMContentLoaded', () => {

  // ==================== NAVBAR ====================
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  // Active nav on scroll
  const sections = document.querySelectorAll('.section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (scrollY >= top) current = section.getAttribute('id');
    });
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === '#' + current) item.classList.add('active');
    });
  });

  // ==================== TABS ====================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target)?.classList.add('active');
    });
  });

  // ==================== HERO PARTICLES ====================
  const particlesContainer = document.querySelector('.hero-particles');
  if (particlesContainer) {
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (8 + Math.random() * 12) + 's';
      particle.style.animationDelay = Math.random() * 10 + 's';
      particle.style.width = (2 + Math.random() * 4) + 'px';
      particle.style.height = particle.style.width;
      particlesContainer.appendChild(particle);
    }
  }

  // ==================== SCROLL REVEAL ====================
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => revealObserver.observe(el));

  // ==================== BACK TO TOP ====================
  const backToTop = document.querySelector('.back-to-top');
  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.scrollY > 500);
  });
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ==================== LIGHTBOX ====================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox?.querySelector('img');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-item[data-src]').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.src;
      const caption = item.dataset.caption || '';
      if (lightboxImg) {
        lightboxImg.src = src;
        lightboxImg.alt = caption;
      }
      lightbox?.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  function closeLightbox() {
    lightbox?.classList.remove('active');
    document.body.style.overflow = '';
    if (lightboxImg) lightboxImg.src = '';
  }

  // ==================== MAP (Leaflet) ====================
  const mapEl = document.getElementById('map');
  if (mapEl && typeof L !== 'undefined') {
    const map = L.map('map', {
      center: [18.45, -93.15],
      zoom: 10,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const communities = [
      {
        name: 'El Bosque, Centla',
        coords: [18.4311, -93.0833],
        color: '#27ae60',
        description: 'Comunidad pesquera con alta dependencia de la pesca artesanal y procesos de erosión costera.'
      },
      {
        name: 'Sánchez Magallanes, Cárdenas',
        coords: [18.3944, -93.2083],
        color: '#1a7a9e',
        description: 'Villa y Puerto con infraestructura petrolera cercana y transformaciones productivas.'
      },
      {
        name: 'El Pénjamo, Paraíso',
        coords: [18.4167, -93.2500],
        color: '#c8a415',
        description: 'Zona de convergencia entre actividad petrolera offshore y pesca artesanal.'
      }
    ];

    communities.forEach(c => {
      const marker = L.circleMarker(c.coords, {
        radius: 10,
        fillColor: c.color,
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: 'Source Sans 3', sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px; font-size: 1rem; color: #0c2340;">${c.name}</h3>
          <p style="margin: 0; font-size: 0.85rem; color: #6c757d; line-height: 1.5;">${c.description}</p>
        </div>
      `);
    });

    // Georreferenciar la zona del proyecto
    const projectArea = L.polygon([
      [18.50, -93.00],
      [18.50, -93.35],
      [18.35, -93.35],
      [18.35, -93.00]
    ], {
      color: '#c8a415',
      fillColor: '#c8a415',
      fillOpacity: 0.05,
      weight: 2,
      dashArray: '8, 8'
    }).addTo(map);

    projectArea.bindPopup('<strong>Zona de estudio:</strong> Costa de Tabasco, Golfo de México');

    // Forzar recalcule del mapa
    setTimeout(() => map.invalidateSize(), 200);
  }

  // ==================== COUNTER ANIMATION ====================
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = Math.floor(current) + suffix;
        }, 20);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

});
