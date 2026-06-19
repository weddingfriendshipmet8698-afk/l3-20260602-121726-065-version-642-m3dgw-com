(function (global) {
    function initStaticPlayer(source) {
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('[data-player-overlay]');
        var button = document.querySelector('[data-player-button]');
        var loaded = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (global.Hls && global.Hls.isSupported()) {
                hls = new global.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        }

        function startPlayer(event) {
            if (event) {
                event.preventDefault();
            }

            loadSource();
            hideOverlay();

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayer);
        }

        if (button) {
            button.addEventListener('click', startPlayer);
        }

        video.addEventListener('click', function () {
            if (!loaded) {
                startPlayer();
            }
        });

        video.addEventListener('play', hideOverlay);
    }

    global.initStaticPlayer = initStaticPlayer;
})(window);
