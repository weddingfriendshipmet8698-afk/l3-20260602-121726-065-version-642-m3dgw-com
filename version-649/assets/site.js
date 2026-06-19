(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav-links");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-slide") || 0));
        play();
      });
    });

    play();
  }

  function setupCatalogSearch() {
    var search = document.querySelector(".catalog-search");
    var year = document.querySelector(".year-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".catalog-grid .movie-card"));
    if (!cards.length || (!search && !year)) {
      return;
    }

    function apply() {
      var word = search ? search.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
        var yearMatch = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var textMatch = !word || text.indexOf(word) !== -1;
        card.classList.toggle("is-filtered-out", !(yearMatch && textMatch));
      });
    }

    if (search) {
      search.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
  }

  function bindVideo(video) {
    if (!video || video.dataset.ready === "1") {
      return;
    }
    var stream = video.getAttribute("data-stream");
    if (!stream) {
      return;
    }
    video.dataset.ready = "1";

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hlsPlayer = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    }
  }

  function setupPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".video-box"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play]");
      if (!video) {
        return;
      }

      function start() {
        bindVideo(video);
        if (button) {
          button.classList.add("is-hidden");
        }
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }
      video.addEventListener("play", function () {
        bindVideo(video);
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.classList.remove("is-hidden");
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupCarousel();
    setupCatalogSearch();
    setupPlayers();
  });
})();
