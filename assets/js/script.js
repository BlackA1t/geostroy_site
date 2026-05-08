const NAV_ITEMS = [
    { label: 'О компании', href: './index.html#about' },
    { label: 'Станочный парк', href: './machines.html' },
    { label: 'Услуги', href: './services.html' },
    { label: 'Портфолио', href: './portfolio.html' },
    { label: 'Контакты', href: './contacts.html' },
];

const PHONE = '8 (831) 304-70-23';
const PHONE_HREF = 'tel:88313047023';

function normalizeHomeLink(href) {
    const isHome = location.pathname.endsWith('/') || location.pathname.endsWith('/index.html');
    return isHome ? href.replace('./index.html#', '#') : href;
}

function renderNavLinks() {
    return NAV_ITEMS
        .map(item => `<a href="${normalizeHomeLink(item.href)}">${item.label}</a>`)
        .join('');
}

function renderSharedLayout() {
    const headerMount = document.getElementById('siteHeader');
    const mobileMenuMount = document.getElementById('siteMobileMenu');
    const footerMount = document.getElementById('siteFooter');
    const scrollTopMount = document.getElementById('scrollTopMount');

    if (headerMount) {
        headerMount.outerHTML = `
            <header class="header" id="header">
                <div class="header-inner">
                    <a href="./index.html" class="logo">
                        <img src="./assets/img/logo.png" alt="Логотип ООО Геострой" class="logo-img">
                        <div class="logo-text">Гео<span>строй</span></div>
                    </a>
                    <nav class="nav">
                        ${renderNavLinks()}
                        <a href="${PHONE_HREF}" class="nav-phone">${PHONE}</a>
                    </nav>
                    <div class="burger" id="burger" aria-label="Открыть меню" role="button" tabindex="0">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </header>
        `;
    }

    if (mobileMenuMount) {
        mobileMenuMount.outerHTML = `
            <div class="mobile-menu" id="mobileMenu">
                ${renderNavLinks()}
                <a href="${PHONE_HREF}" class="mobile-phone">${PHONE}</a>
            </div>
        `;
    }

    if (footerMount) {
        footerMount.outerHTML = `
            <footer class="footer">
                <div class="footer-inner">
                    <div class="footer-copy">© 2026 ООО «Геострой». Все права защищены.</div>
                    <div class="footer-links">
                        ${renderNavLinks()}
                    </div>
                </div>
            </footer>
        `;
    }

    if (scrollTopMount) {
        scrollTopMount.outerHTML = `
            <button class="scroll-top" id="scrollTopBtn" type="button" aria-label="Наверх">
                ↑
            </button>
        `;
    }
}

renderSharedLayout();

const header = document.getElementById('header');
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const modal = document.getElementById('modal');
const contactForm = document.getElementById('contactForm');
const scrollTopBtn = document.getElementById('scrollTopBtn');

function closeMobileMenu() {
    burger?.classList.remove('active');
    mobileMenu?.classList.remove('active');
    document.body.style.overflow = '';
}

function closeModal() {
    modal?.classList.remove('active');
}

function toggleMobileMenu() {
    burger?.classList.toggle('active');
    mobileMenu?.classList.toggle('active');
    document.body.style.overflow = mobileMenu?.classList.contains('active') ? 'hidden' : '';
}

window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 50);
    scrollTopBtn?.classList.toggle('visible', window.scrollY > 500);
});

burger?.addEventListener('click', toggleMobileMenu);
burger?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMobileMenu();
    }
});

mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 1180) closeMobileMenu();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMobileMenu();
        closeModal();
    }
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(element => {
    revealObserver.observe(element);
});

contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    modal?.classList.add('active');
    contactForm.reset();
});

modal?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

document.getElementById('modalClose')?.addEventListener('click', closeModal);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

function animateCounters() {
    document.querySelectorAll('.hero-stat-num').forEach(counter => {
        const text = counter.textContent.trim();
        const num = parseFloat(text);
        if (text.includes('+') || text.includes('/') || isNaN(num)) return;

        let current = 0;
        const increment = num / 60;
        const isDecimal = text.includes('.');

        const timer = setInterval(() => {
            current += increment;
            if (current >= num) {
                counter.textContent = text;
                clearInterval(timer);
                return;
            }

            counter.textContent = isDecimal ? current.toFixed(2) : Math.floor(current);
        }, 20);
    });
}

setTimeout(animateCounters, 500);

scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
