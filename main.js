import { db, collection, getDocs } from './firebase-config.js';

/* ===== MAIN.JS – LVS JEWELLERY ===== */

// ─── PRELOADER ───────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
    document.querySelector('.hero').classList.add('loaded');
  }, 2200);
});

// ─── NAVBAR SCROLL ───────────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Navbar solidify
  navbar.classList.toggle('scrolled', scrollY > 60);

  // Back to top button
  backToTop.classList.toggle('visible', scrollY > 500);

  // Active nav links based on scroll
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
});

// ─── BACK TO TOP ─────────────────────────────────────────────────────────────
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ─── MOBILE MENU ─────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.classList.toggle('no-scroll');
});

// Close mobile menu on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.classList.remove('no-scroll');
  });
});

// ─── SEARCH OVERLAY ──────────────────────────────────────────────────────────
const searchBtn     = document.getElementById('searchBtn');
const searchOverlay = document.getElementById('searchOverlay');
const searchClose   = document.getElementById('searchClose');
const searchInput   = document.getElementById('searchInput');

searchBtn.addEventListener('click', () => {
  searchOverlay.classList.add('active');
  document.body.classList.add('no-scroll');
  setTimeout(() => searchInput.focus(), 300);
});
searchClose.addEventListener('click', closeSearch);
searchOverlay.addEventListener('click', e => { if (e.target === searchOverlay) closeSearch(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
function closeSearch() {
  searchOverlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
  searchInput.value = '';
}

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const query = searchInput.value.toLowerCase().trim();
    if (query) {
      closeSearch();
      
      const featuredSec = document.getElementById('featured');
      if (featuredSec) {
        featuredSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      const productCards = document.querySelectorAll('.product-card');
      let found = false;
      productCards.forEach(card => {
        const title = card.querySelector('.product-name').textContent.toLowerCase();
        const category = card.dataset.category.toLowerCase();
        
        const match = title.includes(query) || category.includes(query);
        card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        if (match) {
          found = true;
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          requestAnimationFrame(() => setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 20));
        } else {
          card.classList.add('hidden');
        }
      });
      
      if (!found) {
        if (typeof showToast === 'function') {
          showToast('No products found for "' + query + '"');
        }
      }
      
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    }
  }
});

// ─── INTERSECTION OBSERVER – REVEAL ──────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings
      const siblings = entry.target.parentElement.querySelectorAll('.reveal');
      let delay = 0;
      siblings.forEach((el, idx) => {
        if (el === entry.target) delay = idx * 100;
      });
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── IMAGE LOADING HANDLERS ──────────────────────────────────────────────────
function handleImageLoad(img) {
  const loader = img.parentElement?.querySelector('.image-loader');
  if (loader) loader.style.display = 'none';
  img.style.opacity = '1';
  console.log(`✓ Image loaded: ${img.alt}`);
}

function handleImageError(img, productName) {
  const loader = img.parentElement?.querySelector('.image-loader');
  if (loader) loader.style.display = 'none';
  
  console.error(`✗ Failed to load image for: ${productName}`);
  console.error(`  Image URL: ${img.src}`);
  
  // Create fallback placeholder
  const placeholder = document.createElement('div');
  placeholder.className = 'image-placeholder';
  placeholder.innerHTML = `
    <div style="font-size:3rem; margin-bottom:8px;">📷</div>
    <div style="font-size:0.85rem; font-weight:500;">Image not available</div>
  `;
  placeholder.style.cssText = 'width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--bg-light); color:var(--text-light);';
  
  img.replaceWith(placeholder);
}

// ─── STAT COUNTER ────────────────────────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString('en-IN');
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-number').forEach(animateCounter);
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ─── DYNAMIC FEATURED PRODUCTS ───────────────────────────────────────────────
const defaultProducts = [
  { id: '1', name: 'Eternal Solitaire Ring', category: 'rings', price: '1,85,000', image: 'images/rings.png', badge: 'Bestseller' },
  { id: '2', name: 'Royal Diamond Necklace', category: 'necklaces', price: '3,20,000', image: 'images/necklace.png', badge: 'New' },
  { id: '3', name: 'Sapphire Drop Earrings', category: 'earrings', price: '79,500', image: 'images/earrings.png', badge: '' },
  { id: '4', name: 'Diamond Tennis Bracelet', category: 'bracelets', price: '2,45,000', image: 'images/bracelets.png', badge: 'Limited' },
  { id: '5', name: 'Vintage Halo Ring', category: 'rings', price: '1,19,000', image: 'images/rings.png', badge: '' },
  { id: '6', name: 'Pearl & Diamond Pendant', category: 'necklaces', price: '88,000', image: 'images/necklace.png', badge: 'New' }
];

async function renderHomepageProducts() {
  const grid = document.getElementById('dynamicProductsGrid');
  if (!grid) return;
  
  grid.innerHTML = '<p style="color:var(--text-light);text-align:center;grid-column:1/-1;">Loading from Database...</p>';
  let products = [];
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Validate image field exists
      if (!data.image) {
        console.warn(`Product "${data.name}" missing image URL`);
      }
      products.push({ id: doc.id, ...data });
    });
    // Sort by newest first
    products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    console.log(`✓ Loaded ${products.length} products from Firebase`);
  } catch (err) {
    console.error("Firebase fetch error", err);
    showToast('⚠️ Failed to load from database. Using default products.');
  }

  // Fallback to default dummy data if database is empty or fails
  if (products.length === 0) {
    console.log('⚠️ No products in Firebase. Using default fallback products.');
    products = defaultProducts;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card reveal visible" data-category="${p.category}" data-product-id="${p.id || p.dbId}">
      <div class="product-image-wrap">
        <div class="image-loader"><span class="spinner"></span></div>
        <img loading="lazy" src="${p.image}" alt="${p.name}" class="product-img" onerror="handleImageError(this, '${p.name}')" onload="handleImageLoad(this)" />
        ${p.badge ? `<div class="product-badge ${p.badge.toLowerCase() === 'new' ? 'new' : ''}">${p.badge}</div>` : ''}
        <button class="product-wish" aria-label="Wishlist">♡</button>
        <div class="product-actions">
          <button class="product-view-btn">Quick View</button>
        </div>
      </div>
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-rating">★★★★★</div>
        <div class="product-price">
          <span class="price-current">₹ ${p.price}</span>
        </div>
        <button class="btn-add-cart">Add to Cart</button>
      </div>
    </div>
  `).join('');
  // Ensure image load/error handlers are attached for newly injected images
  attachGlobalImageHandlers();
  attachProductListeners();
}

function attachProductListeners() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  // Filter Logic
  filterBtns.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      newBtn.classList.add('active');
      const filter = newBtn.dataset.filter;
      productCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        if (match) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          requestAnimationFrame(() => setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 20));
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Wishlist Logic
  document.querySelectorAll('.product-wish').forEach(btn => {
    btn.addEventListener('click', () => {
      const isActive = btn.classList.toggle('active');
      btn.textContent = isActive ? '♥' : '♡';
      showToast(isActive ? '♥ Added to Wishlist' : 'Removed from Wishlist');
    });
  });

  // Cart Logic
  const cartCountEl = document.querySelector('.cart-count');
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      window.cartCount = (window.cartCount || 0) + 1;
      cartCountEl.textContent = window.cartCount;
      cartCountEl.style.transform = 'scale(1.5)';
      setTimeout(() => cartCountEl.style.transform = 'scale(1)', 300);
      const name = btn.closest('.product-card').querySelector('.product-name').textContent;
      showToast(`🛍️ "${name}" added to cart`);
      btn.textContent = '✓ Added!';
      btn.style.background = 'linear-gradient(135deg, #2d6a4f, #40916c)';
      setTimeout(() => {
        btn.textContent = 'Add to Cart';
        btn.style.background = '';
      }, 1800);
    });
  });

  // Tilt Logic
  productCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
      card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
}

// Call on load
renderHomepageProducts();

// Ensure image loaders are hidden when images load or error out, even if inline handlers are missing.
function attachGlobalImageHandlers() {
  // Select all product images that may be added dynamically.
  const imgs = document.querySelectorAll('img.product-img');
  imgs.forEach(img => {
    // Remove any existing listeners to avoid duplicates.
    img.removeEventListener('load', img._loadHandler);
    img.removeEventListener('error', img._errorHandler);

    const loadHandler = () => handleImageLoad(img);
    const errorHandler = () => handleImageError(img, img.alt);
    img._loadHandler = loadHandler;
    img._errorHandler = errorHandler;
    img.addEventListener('load', loadHandler);
    img.addEventListener('error', errorHandler);
  });
}

// Run after initial render and also after any future dynamic renders.
attachGlobalImageHandlers();

// ─── TESTIMONIAL SLIDER ──────────────────────────────────────────────────────
const testimonialCards = document.querySelectorAll('.testimonial-card');
const dots            = document.querySelectorAll('.dot');
const prevBtn         = document.getElementById('testiPrev');
const nextBtn         = document.getElementById('testiNext');
let currentTesti      = 0;
let testiTimer;

function goToTesti(idx) {
  testimonialCards[currentTesti].classList.remove('active');
  dots[currentTesti].classList.remove('active');
  currentTesti = (idx + testimonialCards.length) % testimonialCards.length;
  testimonialCards[currentTesti].classList.add('active');
  dots[currentTesti].classList.add('active');
}

function startTestiAuto() {
  testiTimer = setInterval(() => goToTesti(currentTesti + 1), 5000);
}

prevBtn.addEventListener('click', () => { clearInterval(testiTimer); goToTesti(currentTesti - 1); startTestiAuto(); });
nextBtn.addEventListener('click', () => { clearInterval(testiTimer); goToTesti(currentTesti + 1); startTestiAuto(); });
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => { clearInterval(testiTimer); goToTesti(i); startTestiAuto(); });
});
startTestiAuto();

// ─── NEWSLETTER ──────────────────────────────────────────────────────────────
document.getElementById('newsletterForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('newsletterEmail');
  showToast('🎉 Welcome to the LVS Circle!');
  email.value = '';
});

// ─── CONTACT FORM ────────────────────────────────────────────────────────────
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  showToast('✉️ Message sent! We\'ll be in touch shortly.');
  e.target.reset();
});

// ─── TOAST NOTIFICATION ──────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── SMOOTH SCROLL FOR ANCHOR LINKS ──────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── PARALLAX HERO ───────────────────────────────────────────────────────────
const heroImg = document.querySelector('.hero-img');
window.addEventListener('scroll', () => {
  if (heroImg && window.scrollY < window.innerHeight) {
    heroImg.style.transform = `scale(1) translateY(${window.scrollY * 0.25}px)`;
  }
});

// ─── CURSOR GLOW (DESKTOP) ───────────────────────────────────────────────────
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed; width:300px; height:300px;
    background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
    border-radius:50%; pointer-events:none; z-index:9998;
    transform:translate(-50%,-50%); transition:transform 0.1s ease;
    top:0; left:0;
  `;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.top  = e.clientY + 'px';
    glow.style.left = e.clientX + 'px';
  });
}

// ─── COLLECTION CARD TILT ───────────────────────────────────────────────────────
document.querySelectorAll('.collection-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
    card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
