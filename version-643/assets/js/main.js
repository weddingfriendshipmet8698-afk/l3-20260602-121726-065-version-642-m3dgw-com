(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function applyFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterYear ? filterYear.value : '';

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-tags') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();

      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || (card.getAttribute('data-year') || '') === year;

      card.classList.toggle('is-hidden', !(matchKeyword && matchYear));
    });
  }

  if (filterInput || filterYear) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && filterInput) {
      filterInput.value = query;
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (filterYear) {
      filterYear.addEventListener('change', applyFilter);
    }

    applyFilter();
  }
})();
