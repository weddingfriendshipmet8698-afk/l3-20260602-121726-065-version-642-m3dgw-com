(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (menuButton && navMenu) {
    menuButton.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
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

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restartTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restartTimer();
      });
    });

    startTimer();
  }

  var filterScope = document.querySelector('[data-filter-scope]');
  if (filterScope) {
    var filterInput = filterScope.querySelector('[data-local-filter]');
    var yearSelect = filterScope.querySelector('[data-local-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));

    function applyLocalFilter() {
      var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var text = card.innerText.toLowerCase();
        var yearText = card.querySelector('.movie-meta span');
        var cardYear = yearText ? yearText.textContent.trim() : '';
        var yearMatch = true;
        if (yearValue === 'older') {
          yearMatch = Number(cardYear) < 2020;
        } else if (yearValue) {
          yearMatch = cardYear === yearValue;
        }
        card.classList.toggle('is-hidden', Boolean(query && text.indexOf(query) === -1) || !yearMatch);
      });
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyLocalFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyLocalFilter);
    }
  }

  var video = document.querySelector('.movie-video');
  var overlay = document.querySelector('.player-overlay');
  if (video && overlay) {
    var streamUrl = video.getAttribute('data-stream');
    var attached = false;

    function attachAndPlay() {
      overlay.classList.add('is-hidden');
      if (!attached) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        attached = true;
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    overlay.addEventListener('click', attachAndPlay);
    video.addEventListener('click', function () {
      if (!attached) {
        attachAndPlay();
      }
    });
  }
})();
