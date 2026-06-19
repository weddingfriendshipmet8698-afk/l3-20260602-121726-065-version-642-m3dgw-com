(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function renderSearch(panel, query) {
    if (!panel) {
      return;
    }
    var keyword = normalize(query);
    if (!keyword || typeof MOVIE_SEARCH_INDEX === 'undefined') {
      panel.classList.remove('open');
      panel.innerHTML = '';
      return;
    }
    var matches = MOVIE_SEARCH_INDEX.filter(function (item) {
      return normalize(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.genre).indexOf(keyword) !== -1;
    }).slice(0, 8);
    if (!matches.length) {
      panel.classList.remove('open');
      panel.innerHTML = '';
      return;
    }
    panel.innerHTML = matches.map(function (item) {
      return '<a href="./' + item.url + '"><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></a>';
    }).join('');
    panel.classList.add('open');
  }

  function initSearch() {
    qsa('[data-site-search]').forEach(function (input) {
      var wrap = input.parentElement;
      var panel = qs('[data-search-panel]', wrap);
      input.addEventListener('input', function () {
        renderSearch(panel, input.value);
      });
      input.addEventListener('focus', function () {
        renderSearch(panel, input.value);
      });
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          var first = panel ? qs('a', panel) : null;
          if (first) {
            window.location.href = first.getAttribute('href');
          }
        }
      });
      document.addEventListener('click', function (event) {
        if (!wrap.contains(event.target) && panel) {
          panel.classList.remove('open');
        }
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function run() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        run();
      });
    });
    hero.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });
    hero.addEventListener('mouseleave', run);
    show(0);
    run();
  }

  function initLocalFilter() {
    qsa('[data-local-filter-form]').forEach(function (form) {
      var input = qs('[data-local-filter]', form);
      var scope = qs('[data-filter-scope]', form.parentElement);
      var clear = qs('[data-clear-filter]', form);
      if (!input || !scope) {
        return;
      }
      function apply() {
        var keyword = normalize(input.value);
        qsa('.movie-card', scope).forEach(function (card) {
          var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-region'));
          card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
        });
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
      input.addEventListener('input', apply);
      if (clear) {
        clear.addEventListener('click', function () {
          input.value = '';
          apply();
        });
      }
    });
  }

  window.setupMoviePlayer = function (videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !sourceUrl) {
      return;
    }
    var attached = false;
    var instance = null;
    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(sourceUrl);
        instance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      attached = true;
    }
    function start() {
      attach();
      button.classList.add('is-hidden');
      video.controls = true;
      var play = video.play();
      if (play && play.catch) {
        play.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }
    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (instance) {
        instance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearch();
    initHero();
    initLocalFilter();
  });
})();
