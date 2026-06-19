(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        var scope = form.closest('section') || document;
        var input = form.querySelector('[data-search-input]');
        var yearFilter = form.querySelector('[data-filter-year]');
        var typeFilter = form.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var empty = scope.querySelector('[data-empty-state]');

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var year = yearFilter ? yearFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchYear = !year || cardYear.indexOf(year) !== -1;
                var matchType = !type || cardType.indexOf(type) !== -1;
                var show = matchQuery && matchYear && matchType;

                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilter);
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', applyFilter);
        }
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }
})();
