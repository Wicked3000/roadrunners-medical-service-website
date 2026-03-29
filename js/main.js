/* ============================================
   ROADRUNNERS Medical Consultants
   Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // --- HEADER SCROLL EFFECT ---
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });

    // --- MOBILE NAVIGATION ---
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            nav.classList.toggle('open');
            document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
        });

        // Close on link click
        nav.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                nav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // --- PROGRESS BAR & BACK TO TOP ---
    const progressBar = document.getElementById('progressBar');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / height) * 100;
        
        if (progressBar) progressBar.style.width = scrolled + '%';
        
        if (backToTop) {
            if (window.scrollY > 400) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }
    }, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- SCROLL REVEAL ---
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- STAT COUNTER ANIMATION ---
    const stats = document.querySelectorAll('.stat-number');
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                let current = 0;
                const duration = 2000; // 2 seconds
                const step = duration / (target / (target > 100 ? 5 : 1)); 
                
                const updateCount = () => {
                    const increment = target / (duration / 20);
                    if (current < target) {
                        current += increment;
                        entry.target.innerText = Math.ceil(current) + (entry.target.hasAttribute('data-suffix') ? entry.target.getAttribute('data-suffix') : '');
                        setTimeout(updateCount, 20);
                    } else {
                        entry.target.innerText = target + (entry.target.hasAttribute('data-suffix') ? entry.target.getAttribute('data-suffix') : '');
                    }
                };
                updateCount();
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => countObserver.observe(stat));

    // --- CARD MOUSE GLOW EFFECT ---
    const glowCards = document.querySelectorAll('.care-card, .service-card, .wellbeing-card, .vm-card');

    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });

    // --- SMOOTH SCROLL FOR ANCHOR LINKS ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });

    // --- CONTACT FORM HANDLING ---
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Success Animation Logic
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span><svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="animation: spin 1s linear infinite"><circle cx="12" cy="12" r="10" stroke-opacity="0.2"/><path d="M12 2a10 10 0 0110 10" stroke-linecap="round"/></svg> Sending...</span>';

            setTimeout(() => {
                contactForm.style.opacity = '0';
                contactForm.style.transform = 'translateY(-20px)';
                contactForm.style.transition = 'all 0.4s ease';
                
                setTimeout(() => {
                    contactForm.style.display = 'none';
                    formSuccess.style.display = 'flex';
                    formSuccess.style.flexDirection = 'column';
                    formSuccess.style.alignItems = 'center';
                    formSuccess.style.opacity = '0';
                    formSuccess.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        formSuccess.style.transition = 'all 0.6s ease';
                        formSuccess.style.opacity = '1';
                        formSuccess.style.transform = 'translateY(0)';
                    }, 50);
                }, 400);
            }, 1500);
        });

        // Input focus effects
        contactForm.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('focus', function () {
                this.parentElement.classList.add('focused');
            });
            input.addEventListener('blur', function () {
                this.parentElement.classList.remove('focused');
            });
        });
    }

    // --- ACTIVE NAV HIGHLIGHT ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else if (currentPage === '' && href === 'index.html') {
            link.classList.add('active');
        }
    });

    // --- FAQ ACCORDION ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items for a cleaner accordion feel
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- HERO SLIDER ---
    const heroSlider = document.getElementById('heroSlider');
    const slides = heroSlider ? heroSlider.querySelectorAll('.hero__slide') : [];
    let currentSlide = 0;

    if (slides.length > 1) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 6000); // 6 seconds per slide
    }
});

// Inline Styles for JS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner { margin-right: 8px; vertical-align: middle; }
`;
document.head.appendChild(styleSheet);
