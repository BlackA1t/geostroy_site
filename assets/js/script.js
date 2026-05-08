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

window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 50);
    scrollTopBtn?.classList.toggle('visible', window.scrollY > 500);
});

burger?.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileMenu?.classList.toggle('active');
    document.body.style.overflow = mobileMenu?.classList.contains('active') ? 'hidden' : '';
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
