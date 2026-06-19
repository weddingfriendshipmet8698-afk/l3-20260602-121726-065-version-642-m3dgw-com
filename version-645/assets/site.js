(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var isOpen = panel.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === active);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === active);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(active + 1);
        }, 6500);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide") || 0));
        restartTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(active - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(active + 1);
        restartTimer();
      });
    }

    restartTimer();

    var searchInput = document.querySelector(".catalog-search");
    var yearSelect = document.querySelector(".catalog-year");
    var regionSelect = document.querySelector(".catalog-region");
    var typeSelect = document.querySelector(".catalog-type");
    var items = Array.prototype.slice.call(document.querySelectorAll(".filter-item"));

    function paramsQuery() {
      try {
        return new URLSearchParams(window.location.search).get("q") || "";
      } catch (error) {
        return "";
      }
    }

    function filterItems() {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";

      items.forEach(function (item) {
        var text = [
          item.getAttribute("data-title") || "",
          item.getAttribute("data-year") || "",
          item.getAttribute("data-region") || "",
          item.getAttribute("data-type") || "",
          item.getAttribute("data-tags") || "",
          item.textContent || ""
        ].join(" ").toLowerCase();

        var matched = true;

        if (q && text.indexOf(q) === -1) {
          matched = false;
        }

        if (year && item.getAttribute("data-year") !== year) {
          matched = false;
        }

        if (region && item.getAttribute("data-region") !== region) {
          matched = false;
        }

        if (type && item.getAttribute("data-type") !== type) {
          matched = false;
        }

        item.classList.toggle("is-hidden", !matched);
      });
    }

    if (searchInput) {
      var initialQuery = paramsQuery();

      if (initialQuery) {
        searchInput.value = initialQuery;
      }

      searchInput.addEventListener("input", filterItems);
    }

    [yearSelect, regionSelect, typeSelect].forEach(function (select) {
      if (select) {
        select.addEventListener("change", filterItems);
      }
    });

    if (items.length) {
      filterItems();
    }
  });
})();

function setupMoviePlayer(url) {
  var video = document.getElementById("movie-player");
  var overlay = document.getElementById("play-toggle");
  var attached = false;
  var hls = null;

  if (!video || !url) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }

    attached = true;
  }

  function start() {
    attach();

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var playResult = video.play();

    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        video.controls = true;
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (!attached || video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
