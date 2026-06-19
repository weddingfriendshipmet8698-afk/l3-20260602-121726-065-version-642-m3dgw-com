(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const searchInput = document.querySelector('[data-search-input]');
  const categoryFilter = document.querySelector('[data-category-filter]');
  const cards = Array.from(document.querySelectorAll('.cards-root .movie-card'));

  function applyFilters() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const category = categoryFilter ? categoryFilter.value : 'all';

    cards.forEach(function (card) {
      const text = (card.dataset.search || '').toLowerCase();
      const cardCategory = card.dataset.category || 'all';
      const matchesText = !query || text.indexOf(query) !== -1;
      const matchesCategory = category === 'all' || cardCategory === category;
      card.classList.toggle('is-hidden', !(matchesText && matchesCategory));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  function startPlayer(box) {
    const video = box.querySelector('video');
    const cover = box.querySelector('.player-cover');
    const source = box.dataset.src;

    if (!video || !source) {
      return;
    }

    if (!video.dataset.bound) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.dataset.bound = '1';
    }

    if (cover) {
      cover.classList.add('hidden');
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  document.querySelectorAll('.player-box').forEach(function (box) {
    const cover = box.querySelector('.player-cover');
    const video = box.querySelector('video');

    if (cover) {
      cover.addEventListener('click', function () {
        startPlayer(box);
      });
    }

    box.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      if (cover && cover.classList.contains('hidden')) {
        return;
      }
      startPlayer(box);
    });
  });
})();
