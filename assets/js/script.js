// Header scroll
        const header = document.getElementById('header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // Burger menu
        const burger = document.getElementById('burger');
        const mobileMenu = document.getElementById('mobileMenu');

        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        function closeMobile() {
            burger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobile);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1180) {
                closeMobile();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobile();
            }
        });

        // Scroll reveal
        const revealElements = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => revealObserver.observe(el));

        // Form submit
        const contactForm = document.getElementById('contactForm');
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('modal').classList.add('active');
            contactForm.reset();
        });

        function closeModal() {
            document.getElementById('modal').classList.remove('active');
        }

        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Counter animation
        function animateCounters() {
            const counters = document.querySelectorAll('.hero-stat-num');
            counters.forEach(counter => {
                const text = counter.textContent;
                if (text.includes('+') || text.includes('/')) return;
                
                const num = parseFloat(text);
                if (isNaN(num)) return;
                
                let current = 0;
                const increment = num / 60;
                const isDecimal = text.includes('.');
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= num) {
                        counter.textContent = text;
                        clearInterval(timer);
                    } else {
                        counter.textContent = isDecimal ? current.toFixed(2) : Math.floor(current);
                    }
                }, 20);
            });
        }

        // Run counter animation when hero is visible
        setTimeout(animateCounters, 500);

        // Scroll to top button
        const scrollTopBtn = document.getElementById('scrollTopBtn');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
