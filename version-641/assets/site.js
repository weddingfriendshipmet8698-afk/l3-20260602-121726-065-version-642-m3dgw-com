(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMenu();
        initHero();
        initFilterAndSort();
        initPlayers();
        initSearchQuery();
    });

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-menu-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                schedule();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                schedule();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                schedule();
            });
        });
        show(0);
        schedule();
    }

    function initSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (!q) {
            return;
        }
        var input = document.querySelector('.js-search');
        if (input) {
            input.value = q;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function initFilterAndSort() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('.js-filter-scope'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('.js-search');
            var select = scope.querySelector('.js-sort');
            var container = scope.querySelector('.js-sort-container');
            var counter = scope.querySelector('.js-result-count');
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.children);

            function applyFilter() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var keep = !keyword || haystack.indexOf(keyword) !== -1;
                    card.classList.toggle('is-hidden', !keep);
                    if (keep) {
                        visible += 1;
                    }
                });
                if (counter) {
                    counter.textContent = String(visible);
                }
            }

            function valueOf(card, name) {
                var value = Number(card.getAttribute('data-' + name));
                return Number.isFinite(value) ? value : 0;
            }

            function applySort() {
                var mode = select ? select.value : 'year-desc';
                var sorted = cards.slice().sort(function (a, b) {
                    if (mode === 'heat-desc') {
                        return valueOf(b, 'heat') - valueOf(a, 'heat');
                    }
                    if (mode === 'rating-desc') {
                        return valueOf(b, 'rating') - valueOf(a, 'rating');
                    }
                    if (mode === 'title-asc') {
                        return (a.getAttribute('data-search') || '').localeCompare(b.getAttribute('data-search') || '', 'zh-Hans-CN');
                    }
                    return valueOf(b, 'year') - valueOf(a, 'year');
                });
                sorted.forEach(function (card) {
                    container.appendChild(card);
                });
                cards = sorted;
                applyFilter();
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }
            if (select) {
                select.addEventListener('change', applySort);
            }
            applySort();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));
        players.forEach(function (video) {
            var source = video.getAttribute('data-src');
            var wrap = video.closest('[data-player-wrap]');
            var bigPlay = wrap ? wrap.querySelector('[data-big-play]') : null;
            if (!source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            }

            function playOrPause() {
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            }

            if (bigPlay) {
                bigPlay.addEventListener('click', playOrPause);
            }
            video.addEventListener('play', function () {
                if (wrap) {
                    wrap.classList.add('is-playing');
                }
            });
            video.addEventListener('pause', function () {
                if (wrap) {
                    wrap.classList.remove('is-playing');
                }
            });
        });
    }
}());
