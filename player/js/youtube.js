// Recommended way to load YouTube's Iframe API
var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Constructor
function YouTube(div, height, width, events) {
	this.player = new YT.Player(div, {
		height: height,
		width: width,
		playerVars: { autohide: 1 },
		events: events
	});
}

// Methods
// -----------------------------------------------------------------------------
// Iframe methods

// Playest newest videos uploaded by a user
YouTube.prototype.loadNewestByUsername = function(username) {
	this.player.loadPlaylist({
		listType: "user_uploads",
		list: username
	});
}

// id expects a playlist id or an array of video ids
YouTube.prototype.loadPlaylistById = function(id) {
	this.player.loadPlaylist({
		listType: "playlist",
		list: id
	});
}

// Starts playing search results video in order that they are returned
YouTube.prototype.search = function(query) {
	this.player.loadPlaylist({
		listType: "search",
		list: query
	});
}

// Data methods
YouTube.prototype.cueVideos = function(videos, callback) {
	for(var i = 0; i < videos.length; i++) {
		this.queue.push(videos[i]);
		this.player.cueVideoById(videos[i].snippet.resourceId.videoId);
		console.log(i);
	}
	callback();
}

/* Methods already defined by YouTube's Iframe API that are useful here
 * player.loadVideoById();
 * player.cueVideoById();
 * player.cuePlaylist();
 * player.playVideo();
 * player.pauseVideo();
 * player.stopVideo();
 * player.seekTo();
 * player.nextVideo();
 * player.previousVideo();
 * player.mute();
 * player.unMute();
 * player.setVolume();
 * player.getPlayerState();
 * player.getCurrentTime();
 */
