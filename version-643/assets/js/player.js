function initStaticMoviePlayer(streamUrl) {
  var video = document.getElementById('movieVideo');
  var layer = document.querySelector('.player-cover');
  var button = document.querySelector('[data-player-button]');
  var attached = false;
  var ready = false;
  var hlsInstance = null;
  var pendingPlay = false;

  if (!video || !streamUrl) {
    return;
  }

  function runPlay() {
    video.controls = true;

    if (layer) {
      layer.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && promise.catch) {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  function attach() {
    if (attached) {
      if (ready || video.canPlayType('application/vnd.apple.mpegurl')) {
        runPlay();
      } else {
        pendingPlay = true;
      }
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      ready = true;
      runPlay();
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        ready = true;

        if (pendingPlay) {
          pendingPlay = false;
        }

        runPlay();
      });
    } else {
      video.src = streamUrl;
      ready = true;
      runPlay();
    }
  }

  function play() {
    pendingPlay = true;
    attach();
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      play();
    });
  }

  if (layer) {
    layer.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance && hlsInstance.destroy) {
      hlsInstance.destroy();
    }
  });
}
