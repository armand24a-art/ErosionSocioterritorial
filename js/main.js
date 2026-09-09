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

  // ==================== MAPA DE LOCALIDADES (Leaflet) ====================
  const mapLocEl = document.getElementById('map-loc');
  if (mapLocEl && typeof L !== 'undefined') {
    const locMap = L.map('map-loc').setView([18.25, -93.3], 9);

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap', maxZoom: 19
    });
    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri', maxZoom: 19
    });
    const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenTopoMap', maxZoom: 17
    });

    let activeLayer = osmLayer;
    osmLayer.addTo(locMap);

    const selector = document.getElementById('map-select');
    if (selector) {
      selector.addEventListener('change', function() {
        locMap.removeLayer(activeLayer);
        if (this.value === 'sat') { activeLayer = satLayer; }
        else if (this.value === 'topo') { activeLayer = topoLayer; }
        else { activeLayer = osmLayer; }
        activeLayer.addTo(locMap);
      });
    }

    // ==================== TEMATIC LAYERS (GeoJSON dynamic viewer) ====================
    const layerPanel = document.getElementById('layer-panel');
    const layerStatus = document.getElementById('layer-status');
    const geoCache = {};
    const geoGroups = {};

    const setStatus = (msg) => { if (layerStatus) layerStatus.textContent = msg; };

    const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const tooltipHtml = (title, rows) => {
      if (!rows || !rows.length) rows = [['Información', '—']];
      return '<div class="geojson-tt"><h6>' + esc(title) + '</h6><table>' +
        rows.map(r => '<tr><td class="tt-key">' + esc(r[0]) + '</td><td class="tt-val">' + esc(r[1]) + '</td></tr>').join('') +
        '</table></div>';
    };

    const ttRows = (p, keys) => keys
      .filter(([k]) => p[k] !== null && p[k] !== undefined && p[k] !== '')
      .map(([k, l]) => [l, p[k]]);

    const geoLayers = [
      {
        id: 'tabasco', color: '#0c2340',
        label: 'Límite estatal de Tabasco',
        url: 'data/Tabasco_wgs84.geojson', js: 'data/layers/tabasco.js',
        style: () => ({ color: '#0c2340', weight: 1.6, opacity: 0.85, fill: false }),
        tooltip: (p) => ({ title: 'Estado de Tabasco', rows: ttRows(p, [['ENTIDAD', 'Entidad'], ['CAPITAL', 'Capital']]) })
      },
      {
        id: 'clip', color: '#c8a415',
        label: 'Franja costera afectada (buffers 1–20 km)',
        url: 'data/Sanchez_Paraiso_Frontera_clip_wgs84.geojson', js: 'data/layers/clip.js',
        style: (f) => {
          const d = Number(f.properties && f.properties.distance);
          return {
            color: '#c8a415', weight: 1.1, opacity: 0.75,
            fillColor: '#c8a415',
            fillOpacity: d === 1000 ? 0.14 : d === 5000 ? 0.09 : d === 10000 ? 0.06 : 0.04
          };
        },
        tooltip: (p) => ({ title: 'Franja costera (buffer)', rows: [['Distancia', (Number(p.distance) / 1000) + ' km']] })
      },
      {
        id: 'symdiff', color: '#7d3c98',
        label: 'Diferencia simétrica de la franja costera',
        url: 'data/Sanchez_Paraiso_Frontera_SymDiff_wgs84.geojson', js: 'data/layers/symdiff.js',
        style: (f) => {
          const d = Number(f.properties && f.properties.distance);
          return {
            color: '#7d3c98', weight: 1.2, opacity: 0.75,
            fillColor: '#7d3c98',
            fillOpacity: d === 1000 ? 0.16 : d === 5000 ? 0.1 : d === 10000 ? 0.07 : 0.05
          };
        },
        tooltip: (p) => ({ title: 'Diferencia de franja costera', rows: [['Distancia', (Number(p.distance) / 1000) + ' km']] })
      },
      {
        id: 'pozos', color: '#c0392b',
        label: 'Pozos petroleros terrestres',
        url: 'data/Pozos_Loc.geojson', js: 'data/layers/pozos.js',
        pointStyle: () => ({ color: '#ffffff', weight: 1, radius: 4, fillColor: '#c0392b', fillOpacity: 0.9 }),
        tooltip: (p) => ({ title: p.pozo || 'Pozo', rows: ttRows(p, [
          ['campo', 'Campo'], ['ubicacin', 'Ubicación'], ['clasificac', 'Clasificación'],
          ['estado_act', 'Estado'], ['tipo_de_hi', 'Tipo'], ['profundida', 'Prof. (m)'], ['trayectori', 'Trayectoria']
        ]) })
      },
      {
        id: 'aguas', color: '#1a7a9e',
        label: 'Pozos en aguas someras',
        url: 'data/Posos_Aguas_Someras_Loc.geojson', js: 'data/layers/aguas.js',
        pointStyle: () => ({ color: '#ffffff', weight: 1, radius: 4, fillColor: '#1a7a9e', fillOpacity: 0.9 }),
        tooltip: (p) => ({ title: p.pozo || 'Pozo', rows: ttRows(p, [
          ['campo', 'Campo'], ['entidad', 'Entidad'], ['estado_act', 'Estado'],
          ['tipo_de_hi', 'Tipo'], ['profundida', 'Prof. (m)']
        ]) })
      },
      {
        id: 'ductos', color: '#2c3e50',
        label: 'Ductos petroleros',
        url: 'data/Ductos_Petroleros_Loc.geojson', js: 'data/layers/ductos.js',
        style: () => ({ color: '#2c3e50', weight: 3, opacity: 0.85 }),
        tooltip: (p) => ({ title: p.ducto || 'Ducto', rows: ttRows(p, [
          ['regin', 'Región'], ['servicio', 'Servicio'], ['longitud', 'Longitud (km)'], ['capacidad_', 'Capacidad (b/d)']
        ]) })
      },
      {
        id: 'reservas', color: '#27ae60',
        label: 'Reservas',
        url: 'data/Reservas_Loc.geojson', js: 'data/layers/reservas.js',
        style: () => ({ color: '#27ae60', weight: 1.4, opacity: 0.8, fillColor: '#27ae60', fillOpacity: 0.18 }),
        tooltip: (p) => ({ title: p.nombre || 'Reserva', rows: ttRows(p, [
          ['superficie', 'Superficie (km²)'], ['ubicacin', 'Ubicación'], ['petrleo_cr', 'Petróleo crudo'], ['gas_natura', 'Gas natural']
        ]) })
      },
      {
        id: 'concesiones', color: '#16a085',
        label: 'Concesiones con recursos',
        url: 'data/Con_Recursos_Loc.geojson', js: 'data/layers/concesiones.js',
        style: () => ({ color: '#16a085', weight: 1.4, opacity: 0.8, fillColor: '#16a085', fillOpacity: 0.18 }),
        tooltip: (p) => ({ title: p.nombre || 'Concesión', rows: ttRows(p, [['comentario', 'Comentario']]) })
      }
    ];

    const onEach = (cfg) => (feature, layer) => {
      layer.bindTooltip(() => {
        const tip = cfg.tooltip(feature.properties || {});
        return tooltipHtml(tip.title, tip.rows);
      }, { sticky: true, className: 'geojson-tip' });
    };

    const geoOptions = (cfg) => ({
      style: cfg.style,
      pointToLayer: cfg.pointStyle
        ? (f, latlng) => L.circleMarker(latlng, cfg.pointStyle(f.properties || {}))
        : undefined,
      onEachFeature: onEach(cfg)
    });

    async function loadGeo(cfg) {
      if (!geoCache[cfg.id]) {
        try {
          const res = await fetch(cfg.url);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          geoCache[cfg.id] = await res.json();
        } catch (err) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = cfg.js;
            s.onload = () => { geoCache[cfg.id] = window.GEO_LAYER_DATA && window.GEO_LAYER_DATA[cfg.id]; resolve(); };
            s.onerror = () => reject(new Error('No se pudo cargar ' + cfg.js));
            document.head.appendChild(s);
          });
        }
      }
      return geoCache[cfg.id];
    }

    async function enableLayer(cfg, item) {
      const cb = item.querySelector('input');
      if (geoGroups[cfg.id]) { geoGroups[cfg.id].addTo(locMap); return; }
      item.classList.add('loading');
      setStatus('Cargando «' + cfg.label + '»…');
      try {
        const data = await loadGeo(cfg);
        const grp = L.geoJSON(data, geoOptions(cfg));
        grp.addTo(locMap);
        geoGroups[cfg.id] = grp;
        const n = data.features ? data.features.length : 0;
        setStatus('«' + cfg.label + '»: ' + n + (n === 1 ? ' elemento' : ' elementos') + '.');
      } catch (err) {
        cb.checked = false;
        setStatus('No se pudo cargar «' + cfg.label + '»: ' + err.message);
      } finally {
        item.classList.remove('loading');
      }
    }

    function disableLayer(cfg) {
      if (geoGroups[cfg.id]) locMap.removeLayer(geoGroups[cfg.id]);
      setStatus('Capa «' + cfg.label + '» desactivada.');
    }

    if (layerPanel) {
      geoLayers.forEach(cfg => {
        const item = document.createElement('label');
        item.className = 'layer-item';
        item.innerHTML = '<input type="checkbox" aria-label="' + esc(cfg.label) + '">' +
          '<span class="layer-swatch" style="background:' + cfg.color + '"></span>' +
          '<span class="layer-name">' + esc(cfg.label) + '</span>';
        item.querySelector('input').addEventListener('change', (e) => {
          if (e.target.checked) enableLayer(cfg, item); else disableLayer(cfg);
        });
        layerPanel.appendChild(item);
      });
      // Límite estatal visible por defecto
      const first = Array.from(layerPanel.querySelectorAll('.layer-item'))[0];
      if (first) {
        first.querySelector('input').checked = true;
        enableLayer(geoLayers[0], first);
      }
    }

    const mkIcon = (color) => L.divIcon({
      className: '', html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);"></div>`,
      iconSize: [20,20], iconAnchor: [10,10], popupAnchor: [0,-14]
    });

    const locData = [
      { name:'El Bosque, Centla', lat:18.55, lng:-92.633, color:'#c0392b',
        pop:'172 hab.', alt:'0 m.s.n.m.', act:'Pesca artesanal',
        desc:'Pueblo costero reubicado por cambio climático. Erosión severa.' },
      { name:'Sánchez Magallanes, Cárdenas', lat:18.2957, lng:-93.8610, color:'#27ae60',
        pop:'9,787 hab.', alt:'10 m.s.n.m.', act:'Pesca de ostiones',
        desc:'Puerto pesquero en la Barra de Santa Ana. Mayor productor de ostiones de Tabasco.' },
      { name:'El Pénjamo, Paraíso', lat:18.48, lng:-93.22, color:'#0e4d6f',
        pop:'1,966 hab. (sección)', alt:'0-20 m.s.n.m.', act:'Petróleo (PEMEX)',
        desc:'Cercano a Dos Bocas y la Refinería Olmeca. Economía petrolera dominante.' }
    ];

    locData.forEach(d => {
      L.marker([d.lat,d.lng],{icon:mkIcon(d.color)}).addTo(locMap)
        .bindPopup(`<div style="min-width:200px;font-family:'Source Sans 3',sans-serif;">
          <h4 style="margin:0 0 6px;color:${d.color};font-size:13px;">${d.name}</h4>
          <p style="margin:2px 0;font-size:12px;"><b>Población:</b> ${d.pop}</p>
          <p style="margin:2px 0;font-size:12px;"><b>Altitud:</b> ${d.alt}</p>
          <p style="margin:2px 0;font-size:12px;"><b>Actividad:</b> ${d.act}</p>
          <p style="margin:6px 0 0;font-size:11px;color:#555;">${d.desc}</p>
        </div>`,{maxWidth:260});
      L.circle([d.lat,d.lng],{color:d.color,fillColor:d.color,fillOpacity:.12,radius:8000}).addTo(locMap);
    });

    L.control.scale().addTo(locMap);
    setTimeout(() => locMap.invalidateSize(), 300);
  }

  // ==================== TABS DE CARACTERIZACIÓN ====================
  document.querySelectorAll('.loc-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.loc-card-body');
      parent.querySelectorAll('.loc-tab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.loc-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      parent.querySelector('#' + btn.dataset.loc)?.classList.add('active');
    });
  });

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
