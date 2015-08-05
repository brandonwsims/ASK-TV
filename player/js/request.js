// Globals
var SEARCH = "https://www.googleapis.com/youtube/v3/search";
var CHANNELS = "https://www.googleapis.com/youtube/v3/channels";
var PLAYLIST_ITEMS = "https://www.googleapis.com/youtube/v3/playlistItems";

// Constructor
var Request = function(key) {
    this.key = key;
}

// Methods
// -----------------------------------------------------------------------------
// Gets the Id, by username, of a channels "type" playlist. This is used
// in getting the newest videos uploaded by a user on a channel.
Request.prototype.getPlaylistByUsername = function(username, type, callback) {
    $.get(CHANNELS, {
            part: "contentDetails",
            forUsername: username,
            key: this.key,
        },
        function(data) {
            var id;
            var playlists;
            if(type == "uploads") {
                playlists = data.items[0].contentDetails.relatedPlaylists;
                id = playlists.uploads;
            }
            callback(id);
        }
    );
}

Request.prototype.search = function(query, max, callback) {
    $.get(SEARCH, {
            part: "snippet",
            maxResults: max,
            q: query,
            key: this.key,
        },
        function(data) {
            callback(data);
        }
    );
}

// Request.prototype.getPlaylistById = null;

// Works in tandem with the function above to get the individual videos info
// in a playlist.
Request.prototype.getUploadsById = function(uploadsID, max, callback) {
    $.get(PLAYLIST_ITEMS, {
            part: "snippet",
            maxResults: max,
            playlistId: uploadsID,
            key: this.key
        },
        function(data) {
            callback(data.items);
        }
    );
}
