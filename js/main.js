/* ============================================
   ROADRUNNERS Medical Consultants
   Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // --- HEADER SCROLL EFFECT ---
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        if (!header) return;
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
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

    // --- SUPABASE INITIALIZATION ---
    // User: Replace these with your actual Supabase credentials
    const SUPABASE_URL = 'https://uaxumomkfborwamzuvke.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheHVtb21rZmJvcndhbXp1dmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTM1NjQsImV4cCI6MjA5MDM2OTU2NH0.QCqrMqWrbvgYPEWdmytDyP0xmTp-4adA6NnTsJnioYk';

    let supabase = null;
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    // --- CONTACT FORM HANDLING ---
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // UI Feedback
            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span><svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="animation: spin 1s linear infinite"><circle cx="12" cy="12" r="10" stroke-opacity="0.2"/><path d="M12 2a10 10 0 0110 10" stroke-linecap="round"/></svg> Processing...</span>';

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                // --- SUPABASE ONLY SUBMISSION ---
                if (!supabase) {
                    throw new Error('Supabase client was not initialized. Check your credentials.');
                }

                const { error } = await supabase
                    .from('inquiries')
                    .insert([{
                        name: data.name,
                        email: data.email,
                        subject: data.subject,
                        message: data.message,
                        created_at: new Date()
                    }]);

                if (error) {
                    console.error('Supabase Error:', error);
                    throw new Error(`[Database Error] ${error.message || JSON.stringify(error)}`);
                }

                // Success Logic
                // 1. Reset the form immediately so it's blank for the next time
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                // 2. Hide form and show success message with animation
                contactForm.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                contactForm.style.opacity = '0';
                contactForm.style.transform = 'translateY(-20px)';

                setTimeout(() => {
                    contactForm.style.display = 'none';
                    formSuccess.style.display = 'flex'; // Now showing the success message
                    formSuccess.style.flexDirection = 'column';
                    formSuccess.style.alignItems = 'center';
                    formSuccess.style.textAlign = 'center';
                    formSuccess.style.opacity = '0';
                    formSuccess.style.transform = 'translateY(20px)';

                    setTimeout(() => {
                        formSuccess.style.transition = 'all 0.6s ease';
                        formSuccess.style.opacity = '1';
                        formSuccess.style.transform = 'translateY(0)';
                    }, 50);

                    // 3. Auto-close success message and show blank form after 3 seconds
                    setTimeout(() => {
                        // Fade out success
                        formSuccess.style.opacity = '0';
                        formSuccess.style.transform = 'translateY(-20px)';
                        
                        setTimeout(() => {
                            formSuccess.style.display = 'none';
                            // Fade in blank form
                            contactForm.style.display = 'block';
                            setTimeout(() => {
                                contactForm.style.opacity = '1';
                                contactForm.style.transform = 'translateY(0)';
                            }, 10);
                        }, 400);
                    }, 3500); // 3.5 seconds total visible time

                }, 400);

                // 4. (Manual backup) Button to bring back the blank form
                const sendAnotherBtn = document.getElementById('sendAnotherBtn');
                if (sendAnotherBtn) {
                    sendAnotherBtn.onclick = (e) => {
                        e.preventDefault();
                        formSuccess.style.display = 'none';
                        contactForm.style.display = 'block';
                        setTimeout(() => {
                            contactForm.style.opacity = '1';
                            contactForm.style.transform = 'translateY(0)';
                        }, 10);
                    };
                }

            } catch (err) {
                console.error('Submission Error:', err);

                let errorMessage = 'Please note: There was an issue processing your request. ';
                if (err.message) {
                    errorMessage += '\n\n' + err.message;
                }

                alert(errorMessage + '\n\nPlease check your internet connection or call us directly.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
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
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(i => i.classList.remove('active'));
                if (!isActive) item.classList.add('active');
            });
        }
    });

    // --- WELLBEING ACCORDION ---
    document.querySelectorAll('.wellbeing-item').forEach(item => {
        const trigger = item.querySelector('.wellbeing-trigger');
        if (trigger) {
            trigger.onclick = () => {
                const isActive = item.classList.contains('active');
                document.querySelectorAll('.wellbeing-item').forEach(i => i.classList.remove('active'));
                if (!isActive) item.classList.add('active');
            };
        }
    });

    // --- HERO SLIDER ---
    const heroSlider = document.getElementById('heroSlider');
    if (heroSlider) {
        const slides = heroSlider.querySelectorAll('.hero__slide');
        let currentSlide = 0;

        if (slides.length > 1) {
            setInterval(() => {
                slides[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add('active');
            }, 6000);
        }
    }
});

// Inline Styles for JS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner { margin-right: 8px; vertical-align: middle; }
`;
document.head.appendChild(styleSheet);
