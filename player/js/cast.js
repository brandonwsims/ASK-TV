// Functions for initialization
window["__onGCastApiAvailable"] = function(loaded, errorInfo) {
    if(loaded) {
        initializeCastApi();
    }
    else {
        console.log(errorInfo);
    }
}

initializeCastApi = function() {
      console.log("Initalizing chromecast");
      var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
      var sessionRequest = new chrome.cast.SessionRequest(applicationID);
      var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);
      chrome.cast.initialize(apiConfig, onInitSuccess, onInitError);
}

// Functions for chromecast session
function sessionListener() {
    console.log("Listening on a new session");
}

function receiverListener(reciever) {
    if( reciever === chrome.cast.ReceiverAvailability.AVAILABLE) {
        console.log("Reciever available: " + reciever);
    }
    else {
        console.log("Reciever unavailable: " + reciever);
    }
}

function onInitSuccess() {
    console.log("Chromecast initialized");
}

function onInitError() {
    console.log("Chromecast failed to initialize");
}

function onRequestSessionSuccess(newSession) {
    console.log("User launched session.");
    this.session = newSession;
    var currentMediaURL = "https://www.youtube.com/watch?v=NcJZUrqEwDA";
    currentMediaURL = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/"

    // Form request for media
    var mediaInfo = new chrome.cast.media.MediaInfo(currentMediaURL);
    var request = new chrome.cast.media.LoadRequest(mediaInfo);

    request.autoplay = true;

    // Load media
    this.session.loadMedia(request, onMediaDiscovered.bind(this, 'loadMedia'), onMediaError);
}

function onLaunchError() {
    console.log("Session failed to launch");
}

function onMediaDiscovered(how, media) {
    console.log("Successfully loaded media");
    currentMedia = media;

    // Play media
    currentMedia.play(null, console.log("Media now playing"), console.log("Media failed to play"));
}

function onMediaError() {
    console.log("Failed to load media");
}

// Handlers for user clicks
function start() {
    chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
}
