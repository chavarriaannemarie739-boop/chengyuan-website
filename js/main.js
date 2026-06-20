/**
 * 诚远汽车零部件 — 主站共享 JavaScript
 * 负责：页头/页脚渲染、导航、滚动动画、通用工具
 */

// ============================================================
//  SVG Icons
// ============================================================
const ICONS = {
  phone: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mail: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  mapPin: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  chevronUp: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
  arrowRight: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  image: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  clock: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
};

// ============================================================
//  Navigation Items
// ============================================================
const NAV_ITEMS = [
  { label: '首页', href: 'index.html', id: 'home' },
  { label: '关于我们', href: 'about.html', id: 'about' },
  { label: '产品中心', href: 'products.html', id: 'products' },
  { label: '联系我们', href: 'contact.html', id: 'contact' },
];

// ============================================================
//  Get current page ID from filename
// ============================================================
function getCurrentPageId() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  const match = NAV_ITEMS.find(item => item.href === filename);
  return match ? match.id : '';
}

// ============================================================
//  Render Header
// ============================================================
function renderHeader() {
  const data = CMS.get('company');
  const currentPage = getCurrentPageId();

  const header = document.createElement('header');
  header.className = 'header header--transparent';
  header.id = 'site-header';

  const logoHTML = data.logo
    ? `<img src="${data.logo}" alt="${data.name}" class="header__logo-img">`
    : `<div class="header__logo-placeholder">诚</div>`;

  const navLinks = NAV_ITEMS.map(item =>
    `<a href="${item.href}" class="header__nav-link ${item.id === currentPage ? 'header__nav-link--active' : ''}">${item.label}</a>`
  ).join('');

  header.innerHTML = `
    <div class="header__inner">
      <a href="index.html" class="header__logo">
        ${logoHTML}
        <div class="header__logo-text">
          <span class="header__logo-name">${data.name}</span>
          <span class="header__logo-sub">${data.nameEn}</span>
        </div>
      </a>
      <nav class="header__nav" id="main-nav">
        ${navLinks}
      </nav>
      <div class="header__menu-toggle" id="menu-toggle">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  document.body.prepend(header);

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mainNav.classList.toggle('header__nav--open');
  });

  // Close mobile menu on link click
  mainNav.querySelectorAll('.header__nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mainNav.classList.remove('header__nav--open');
    });
  });
}

// ============================================================
//  Render Footer
// ============================================================
function renderFooter() {
  const data = CMS.get('company');

  const footer = document.createElement('footer');
  footer.className = 'footer';

  const logoHTML = data.logo
    ? `<img src="${data.logo}" alt="${data.name}" class="header__logo-img">`
    : `<div class="header__logo-placeholder" style="font-size:16px;">诚</div>`;

  footer.innerHTML = `
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <div class="footer__brand-logo">
            ${logoHTML}
            <span class="footer__brand-name">${data.name}</span>
          </div>
          <p class="footer__brand-desc">${data.description}</p>
        </div>
        <div>
          <h4 class="footer__title">快速导航</h4>
          <div class="footer__links">
            <a href="index.html" class="footer__link">首页</a>
            <a href="about.html" class="footer__link">关于我们</a>
            <a href="products.html" class="footer__link">产品中心</a>
            <a href="contact.html" class="footer__link">联系我们</a>
          </div>
        </div>
        <div>
          <h4 class="footer__title">产品分类</h4>
          <div class="footer__links">
            <a href="products.html" class="footer__link">乘用车散热器</a>
            <a href="products.html" class="footer__link">商用车散热器</a>
            <a href="products.html" class="footer__link">工程机械散热器</a>
            <a href="products.html" class="footer__link">配套散热件</a>
          </div>
        </div>
        <div>
          <h4 class="footer__title">联系我们</h4>
          <div class="footer__contact-item">
            <div class="footer__contact-icon">${ICONS.phone}</div>
            <div>
              <div>${data.phone}</div>
              <div>${data.mobile}</div>
            </div>
          </div>
          <div class="footer__contact-item">
            <div class="footer__contact-icon">${ICONS.mail}</div>
            <div>${data.email}</div>
          </div>
          <div class="footer__contact-item">
            <div class="footer__contact-icon">${ICONS.mapPin}</div>
            <div>${data.address}</div>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <div>© ${new Date().getFullYear()} ${data.fullName} 版权所有 ${data.icp}</div>
        <div>
          <a href="admin.html" style="color: rgba(255,255,255,0.3); font-size: 12px;">网站管理</a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(footer);
}

// ============================================================
//  Render Scroll-to-Top Button
// ============================================================
function renderScrollTop() {
  const btn = document.createElement('div');
  btn.className = 'scroll-top';
  btn.id = 'scroll-top';
  btn.innerHTML = ICONS.chevronUp;
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================================
//  Render Page Loader
// ============================================================
function renderPageLoader() {
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.id = 'page-loader';
  loader.innerHTML = '<div class="page-loader__spinner"></div>';
  document.body.prepend(loader);
}

// ============================================================
//  Header Scroll Effect
// ============================================================
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 50) {
      header.classList.remove('header--transparent');
      header.classList.add('header--solid');
    } else {
      header.classList.remove('header--solid');
      header.classList.add('header--transparent');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ============================================================
//  Scroll-to-Top Visibility
// ============================================================
function initScrollTopVisibility() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('scroll-top--visible');
    } else {
      btn.classList.remove('scroll-top--visible');
    }
  }, { passive: true });
}

// ============================================================
//  Scroll Reveal Animation
// ============================================================
function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

// ============================================================
//  Counter Animation
// ============================================================
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const duration = 2000;
        const startTime = Date.now();
        const isFloat = target % 1 !== 0;

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * target;
          el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
          if (progress < 1) requestAnimationFrame(animate);
        };

        animate();
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// ============================================================
//  Image placeholder helper
// ============================================================
function getImageHTML(src, alt, placeholderText) {
  if (src) {
    return `<img src="${src}" alt="${alt || ''}">`;
  }
  return `
    <div class="img-placeholder" style="width:100%;height:100%;">
      ${ICONS.image}
      <span>${placeholderText || '暂无图片'}</span>
    </div>
  `;
}

// ============================================================
//  Toast notification
// ============================================================
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast--error' : type === 'warning' ? 'toast--warning' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================================
//  Page Init
// ============================================================
async function initPage() {
  renderPageLoader();

  // 确保全局数据已成功拉取
  if (window.CMS && typeof window.CMS.loadData === 'function') {
    await window.CMS.loadData();
  }

  renderHeader();
  renderFooter();
  renderScrollTop();

  // Wait for DOM to be fully ready
  window.addEventListener('load', () => {
    // Hide loader
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.classList.add('page-loader--hidden');
      setTimeout(() => loader.remove(), 500);
    }

    initHeaderScroll();
    initScrollTopVisibility();
    initRevealAnimations();
    animateCounters();
  });
}

// Expose utilities
window.initPage = initPage;
window.getImageHTML = getImageHTML;
window.showToast = showToast;
window.ICONS = ICONS;
