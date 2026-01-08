// Регистрируем плагины GSAP
gsap.registerPlugin(ScrollTrigger, TextPlugin);

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. ИНИЦИАЛИЗАЦИЯ ИКОНОК (Lucide)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. МОБИЛЬНОЕ МЕНЮ
    const burger = document.getElementById('burger-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const body = document.body;
    const mobileLinks = document.querySelectorAll('.mobile-menu__link');

    const toggleMenu = (forceClose = false) => {
        if (!mobileMenu || !burger) return;
        
        const isOpen = forceClose ? false : !mobileMenu.classList.contains('active');
        
        mobileMenu.classList.toggle('active', isOpen);
        burger.classList.toggle('active', isOpen);
        body.style.overflow = isOpen ? 'hidden' : '';
        
        // Анимация полосок бургера
        gsap.to(burger.children[0], { y: isOpen ? 8 : 0, rotate: isOpen ? 45 : 0, duration: 0.3 });
        gsap.to(burger.children[1], { opacity: isOpen ? 0 : 1, duration: 0.2 });
        gsap.to(burger.children[2], { y: isOpen ? -9 : 0, rotate: isOpen ? -45 : 0, duration: 0.3 });
    };

    if (burger) burger.addEventListener('click', () => toggleMenu());
    mobileLinks.forEach(link => link.addEventListener('click', () => toggleMenu(true)));

    // 3. ЭФФЕКТ ХЕДЕРА ПРИ СКРОЛЛЕ
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('header--scrolled', window.scrollY > 50);
        }
    });

    // 4. АНИМАЦИЯ HERO 
    // Напоминание: в CSS у .hero__content, .svg-block и т.д. должно быть opacity: 0
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl
        .to('.hero__content', { opacity: 1, y: 0, duration: 1, delay: 0.5 })
        .to('.svg-block', { opacity: 1, y: -20, stagger: 0.1, duration: 0.8 }, "-=0.5")
        .to('.svg-core', { 
            opacity: 1, 
            scale: 1, 
            rotation: 360, 
            duration: 1.2, 
            transformOrigin: "center center" 
        }, "-=0.8")
        .to('.svg-line', { opacity: 1, strokeDashoffset: 0, duration: 1 }, "<");

    // Параллакс мыши в Hero
    const heroVisual = document.querySelector('.hero__visual');
    if (heroVisual) {
        heroVisual.addEventListener('mousemove', (e) => {
            const { offsetX, offsetY, target } = e;
            const { clientWidth, clientHeight } = target;
            const xPos = (offsetX / clientWidth - 0.5) * 20;
            const yPos = (offsetY / clientHeight - 0.5) * 20;
            gsap.to('.hero-svg', { x: xPos, y: yPos, duration: 1, ease: "power2.out" });
        });
        heroVisual.addEventListener('mouseleave', () => {
            gsap.to('.hero-svg', { x: 0, y: 0, duration: 1 });
        });
    }

    // 5. СКРОЛЛ-АНИМАЦИИ (Карточки, Bento, Skills)
    
    // Карточки платформы
    gsap.utils.toArray('.platform-card').forEach((card, i) => {
        gsap.to(card, {
            scrollTrigger: { trigger: card, start: "top 85%" },
            opacity: 1, y: 0, duration: 0.8, delay: i * 0.2
        });
    });

    // Bento Grid
    gsap.to('.bento__item', {
        scrollTrigger: { trigger: '.bento', start: "top 70%" },
        opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)"
    });

    // Skills (Шкалы)
    document.querySelectorAll('.skill-item').forEach(item => {
        const fill = item.querySelector('.skill-item__fill');
        const count = item.querySelector('.count');
        const targetValue = fill.getAttribute('data-progress');

        const tl = gsap.timeline({
            scrollTrigger: { trigger: item, start: "top 85%" }
        });

        tl.to(fill, { width: targetValue + "%", duration: 2, ease: "power4.out" })
          .to(count, { innerText: targetValue, duration: 2, snap: { innerText: 1 } }, "<");
    });

    // 6. AI CODE EDITOR
    const codeContainer = document.getElementById('ai-code');
    if (codeContainer) {
        const finalCode = `// Задача: Оптимизировать массив\nasync function solveTask(data) {\n  const patterns = await ai.analyze(data);\n  return data.map(item => ({ ...item, score: 'A+' }));\n}`;
        
        gsap.timeline({
            scrollTrigger: { trigger: '#ai-demo', start: "top 60%" }
        })
        .to(codeContainer, {
            duration: 5,
            text: { value: finalCode, delimiter: "" },
            ease: "none"
        });
    }

    // 7. КОНТАКТЫ: ВРЕМЯ И ФОРМА
    const updateTime = () => {
        const timeEl = document.getElementById('current-time');
        if (timeEl) {
            const ukTime = new Intl.DateTimeFormat('en-GB', { 
                timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit' 
            }).format(new Date());
            timeEl.textContent = `London: ${ukTime}`;
        }
    };
    setInterval(updateTime, 1000);
    updateTime();

    // Логика капчи
    const captchaLabel = document.getElementById('captcha-label');
    const captchaInput = document.getElementById('captcha-input');
    let n1, n2, correctAnswer;

    const generateCaptcha = () => {
        n1 = Math.floor(Math.random() * 10) + 1;
        n2 = Math.floor(Math.random() * 5) + 1;
        correctAnswer = n1 + n2;
        if (captchaLabel) {
            captchaLabel.textContent = `Решите пример: ${n1} + ${n2} = ?`;
        }
    };
    generateCaptcha();

    // Обработка отправки формы
    const contactForm = document.getElementById('main-form');
    if (contactForm) {
        const phoneInput = document.getElementById('phone-input');
        
        // Только цифры в телефоне
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9+]/g, '');
            });
        }

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const successMsg = document.getElementById('form-success');
            const errorMsg = document.getElementById('form-error');

            // Скрываем старые сообщения
            if (successMsg) successMsg.style.display = 'none';
            if (errorMsg) errorMsg.style.display = 'none';

            // Проверка капчи
            if (parseInt(captchaInput.value) !== correctAnswer) {
                if (errorMsg) {
                    errorMsg.style.display = 'flex';
                    gsap.from(errorMsg, { x: 20, repeat: 3, yoyo: true, duration: 0.1 });
                }
                return;
            }

            // Имитация отправки
            const btn = contactForm.querySelector('button');
            const originalBtnText = btn.textContent;
            btn.disabled = true;
            btn.textContent = "Отправка...";

            setTimeout(() => {
                btn.style.display = 'none';
                if (successMsg) {
                    successMsg.style.display = 'flex';
                    gsap.from(successMsg, { y: 20, opacity: 0, duration: 0.5 });
                }
                contactForm.reset();
                generateCaptcha(); // Обновляем капчу для следующего раза
            }, 1500);
        });
    }
});