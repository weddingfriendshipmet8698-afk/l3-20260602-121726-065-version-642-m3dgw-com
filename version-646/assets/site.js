(function () {
    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initNavigation() {
        var toggle = select("[data-nav-toggle]");
        var menu = select("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = select("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var title = select("[data-hero-title]", hero);
        var text = select("[data-hero-text]", hero);
        var link = select("[data-hero-link]", hero);
        var poster = select("[data-hero-poster]", hero);
        var meta = select("[data-hero-meta]", hero);
        var active = 0;

        function setActive(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
            var current = slides[active];
            if (title) {
                title.textContent = current.getAttribute("data-title") || "";
            }
            if (text) {
                text.textContent = current.getAttribute("data-text") || "";
            }
            if (link) {
                link.setAttribute("href", current.getAttribute("data-link") || "./index.html");
            }
            if (poster) {
                poster.setAttribute("src", current.getAttribute("data-cover") || "");
                poster.setAttribute("alt", current.getAttribute("data-title") || "");
            }
            if (meta) {
                meta.textContent = current.getAttribute("data-meta") || "";
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                setActive(i);
            });
        });
        setActive(0);
        if (slides.length > 1) {
            window.setInterval(function () {
                setActive(active + 1);
            }, 5200);
        }
    }

    function initHomeSearch() {
        selectAll("[data-home-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = select("input", form);
                var query = input ? input.value.trim() : "";
                var url = "./search.html";
                if (query) {
                    url += "?q=" + encodeURIComponent(query);
                }
                window.location.href = url;
            });
        });
    }

    function initCardFilters() {
        selectAll("[data-card-filter]").forEach(function (input) {
            var target = input.getAttribute("data-card-filter");
            var root = target ? select(target) : document;
            if (!root) {
                return;
            }
            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                selectAll(".movie-card", root).forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    card.style.display = !keyword || text.indexOf(keyword) !== -1 ? "" : "none";
                });
            });
        });
    }

    window.initMoviePlayer = function (source) {
        var video = select("[data-player-video]");
        var cover = select("[data-player-cover]");
        var button = select("[data-player-button]");
        var loaded = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            video.controls = true;
            loaded = true;
        }

        function startPlayback() {
            loadSource();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", startPlayback);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                startPlayback();
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    function createMovieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\" data-search=\"" + escapeHtml([movie.title, movie.region, movie.type, movie.genre, (movie.tags || []).join(" ")].join(" ").toLowerCase()) + "\">",
            "<div class=\"poster-wrap\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"year-pill\">" + escapeHtml(movie.year) + "</span>",
            "<span class=\"play-float\">▶</span>",
            "</div>",
            "<div class=\"movie-body\">",
            "<h3>" + escapeHtml(movie.title) + "</h3>",
            "<p>" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"card-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genre) + "</div>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "</div>",
            "</a>"
        ].join("");
    }

    window.initSearchPage = function () {
        var data = window.siteMovies || [];
        var keywordInput = select("[data-search-keyword]");
        var regionSelect = select("[data-search-region]");
        var genreSelect = select("[data-search-genre]");
        var results = select("[data-search-results]");
        var form = select("[data-search-form]");
        if (!keywordInput || !regionSelect || !genreSelect || !results || !form) {
            return;
        }

        function uniqueValues(key) {
            var values = [];
            data.forEach(function (movie) {
                String(movie[key] || "").split(/[\/，,、]+/).forEach(function (part) {
                    var value = part.trim();
                    if (value && values.indexOf(value) === -1) {
                        values.push(value);
                    }
                });
            });
            return values.sort();
        }

        uniqueValues("region").forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            regionSelect.appendChild(option);
        });
        uniqueValues("genre").slice(0, 80).forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            genreSelect.appendChild(option);
        });

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        if (initialQuery) {
            keywordInput.value = initialQuery;
        }

        function render() {
            var keyword = keywordInput.value.trim().toLowerCase();
            var region = regionSelect.value;
            var genre = genreSelect.value;
            var filtered = data.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
                var hitKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var hitRegion = !region || movie.region.indexOf(region) !== -1;
                var hitGenre = !genre || movie.genre.indexOf(genre) !== -1;
                return hitKeyword && hitRegion && hitGenre;
            }).slice(0, 96);
            if (!filtered.length) {
                results.innerHTML = "<div class=\"empty-state\">没有找到匹配的影片</div>";
                return;
            }
            results.innerHTML = filtered.map(createMovieCard).join("");
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            render();
        });
        [keywordInput, regionSelect, genreSelect].forEach(function (input) {
            input.addEventListener("input", render);
            input.addEventListener("change", render);
        });
        render();
    };

    document.addEventListener("DOMContentLoaded", function () {
        initNavigation();
        initHero();
        initHomeSearch();
        initCardFilters();
    });
}());
