/* =============================================================
   MEOULAB — homepage interactions
   Vanilla JS, no dependencies.
   ============================================================= */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* -------------------- Carousel -------------------- */
    var carousel = document.querySelector('.carousel');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
        var dotsWrap = carousel.querySelector('.carousel__dots');
        var nextBtn = carousel.querySelector('[data-action="next"]');
        var prevBtn = carousel.querySelector('[data-action="prev"]');
        var index = 0;
        var timer = null;
        var DELAY = 6000;

        // Build dots
        var dots = slides.map(function (_, i) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel__dot';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Slide ' + (i + 1));
            dot.addEventListener('click', function () { go(i); restart(); });
            dotsWrap.appendChild(dot);
            return dot;
        });

        function render() {
            slides.forEach(function (slide, i) {
                var active = i === index;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            dots.forEach(function (dot, i) {
                var active = i === index;
                dot.classList.toggle('is-active', active);
                dot.setAttribute('aria-selected', active ? 'true' : 'false');
            });
        }

        function go(i) {
            index = (i + slides.length) % slides.length;
            render();
        }

        function move(step) { go(index + step); }

        function start() {
            window.clearInterval(timer);   // guarantee a single active timer
            if (reduceMotion) return;
            timer = window.setInterval(function () { move(1); }, DELAY);
        }
        function stop() { window.clearInterval(timer); }
        function restart() { start(); }

        nextBtn.addEventListener('click', function () { move(1); restart(); });
        prevBtn.addEventListener('click', function () { move(-1); restart(); });

        // Pause on hover / focus
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        carousel.addEventListener('focusin', stop);
        carousel.addEventListener('focusout', start);

        // Pause when tab hidden
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) { stop(); } else { start(); }
        });

        // Keyboard
        carousel.setAttribute('tabindex', '0');
        carousel.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { move(1); restart(); }
            else if (e.key === 'ArrowLeft') { move(-1); restart(); }
        });

        // Touch / swipe
        var startX = 0, dx = 0, swiping = false;
        carousel.addEventListener('touchstart', function (e) {
            startX = e.touches[0].clientX; dx = 0; swiping = true; stop();
        }, { passive: true });
        carousel.addEventListener('touchmove', function (e) {
            if (swiping) dx = e.touches[0].clientX - startX;
        }, { passive: true });
        carousel.addEventListener('touchend', function () {
            if (swiping && Math.abs(dx) > 45) { move(dx < 0 ? 1 : -1); }
            swiping = false; start();
        });

        render();
        start();
    }

    /* -------------------- Mobile nav -------------------- */
    var toggle = document.querySelector('.nav__toggle');
    var menu = document.getElementById('main-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        menu.addEventListener('click', function (e) {
            if (e.target.closest('a')) {
                menu.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* -------------------- Sticky nav shadow -------------------- */
    var nav = document.querySelector('.nav');
    if (nav) {
        var sentinel = nav.offsetTop;
        window.addEventListener('scroll', function () {
            nav.classList.toggle('is-stuck', window.scrollY > sentinel + 4);
        }, { passive: true });
    }

    /* -------------------- Scroll-spy -------------------- */
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__menu a[href^="#"]'));
    var targets = links
        .map(function (a) { return document.querySelector(a.getAttribute('href')); })
        .filter(Boolean);

    if (targets.length && 'IntersectionObserver' in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    links.forEach(function (a) {
                        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
        targets.forEach(function (t) { spy.observe(t); });
    }

    /* -------------------- Reveal on scroll -------------------- */
    var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (reveals.length) {
        if (reduceMotion || !('IntersectionObserver' in window)) {
            reveals.forEach(function (el) { el.classList.add('is-in'); });
        } else {
            var io = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-in');
                        obs.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
            reveals.forEach(function (el) { io.observe(el); });
        }
    }

    /* -------------------- Contact form (FormSubmit AJAX) -------------------- */
    var form = document.getElementById('contact-form');
    if (form) {
        var statusEl = form.querySelector('.form__status');
        var submitBtn = form.querySelector('.form__submit');

        function setStatus(kind, msg) {
            statusEl.className = 'form__status ' + (kind === 'ok' ? 'is-ok' : 'is-err');
            statusEl.textContent = msg;
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Honeypot: silently succeed for bots
            if (form.querySelector('[name="_honey"]') && form.querySelector('[name="_honey"]').value) {
                return;
            }

            var endpoint = form.getAttribute('data-endpoint') || form.action;
            var data = {};
            new FormData(form).forEach(function (value, key) { data[key] = value; });

            submitBtn.disabled = true;
            var originalLabel = submitBtn.textContent;
            submitBtn.textContent = 'Αποστολή…';
            statusEl.className = 'form__status';

            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(function (res) { return res.json().catch(function () { return {}; }).then(function (body) { return { ok: res.ok, body: body }; }); })
                .then(function (r) {
                    if (r.ok) {
                        setStatus('ok', 'Το μήνυμά σας στάλθηκε! Θα επικοινωνήσουμε μαζί σας σύντομα.');
                        form.reset();
                    } else {
                        setStatus('err', (r.body && r.body.message) || 'Κάτι πήγε στραβά. Δοκιμάστε ξανά ή καλέστε μας.');
                    }
                })
                .catch(function () {
                    setStatus('err', 'Δεν ήταν δυνατή η αποστολή. Ελέγξτε τη σύνδεσή σας ή καλέστε μας στο 24310 38880.');
                })
                .then(function () {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalLabel;
                });
        });
    }

    /* -------------------- Footer year -------------------- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();
