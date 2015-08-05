// For YouTube's iframe and data APi
var req;
var yt;

// Socket for communication with server
var socket = io();

// For keeping track of what's displayed in the preview table
var items = new Array();

// For displaying items in grid
var NUM_VIDS = 9;
var ROW = 3;
var COL = 3;

// My subscriptions
var subs = [
    { username: "VanossGaming",         videos: new Array() },
    { username: "screwattack",          videos: new Array() },
    { username: "MatthewPatrick13",     videos: new Array() },
    { username: "ExplosmEntertainment", videos: new Array() },
    { username: "SecretAgentBob",       videos: new Array() },
    { username: "TeamFourStar",         videos: new Array() },
    { username: "lindseystomp",         videos: new Array() },
    { username: "engadget",             videos: new Array() },
    { username: "thenewboston",         videos: new Array() }
];

// Main
// -----------------------------------------------------------------------------
// Spawned from onYouTubeIframeAPIReady() since that is called when
// all the external APIs are finished loading. Yes this function is gross, and
// yes I plan on redoing this eventually.
function main() {
    // Hide the iframe and get ready to show the thumbnail preview
    $("#player").hide();
    $("#preview").show();
    items = [];

    // First time the page is loaded display the first video of each sub
    var index = 0;
    for(var i = 0; i < subs.length; i++) {
        getUploads(subs[i].username, function(data) {
            for(var j = 0; j < data.length; j++) {
                subs[index].videos.push(data[j].snippet);
                // i will always be 9 once it gets to this point, so another
                // counter is needed to be used hence "index".
                if(j == data.length - 1) {
                    index++;
                    if(index == data.length) {
                        index = 0;
                        clearPreviews(function() {
                            subscriptionPreview(subs);
                        });
                    }
                }
            }
        });
    }
}

// Socket stuff
// -----------------------------------------------------------------------------
// Sockets methods for recieivng messages //
// Lets the server know that the player is ready

// Will show the first video of each sub (grid of 9)
socket.on("subscriptions", function(data) {
    console.log("subscriptions " + data);
    yt.player.pauseVideo();
    items = [];
    items.length = 0;
    main();
});

function showNewestSubs() {
    yt.player.stopVideo();
    items = [];
    items.length = 0;
    main();
}

socket.on("select", function(data) {
    console.log("select " + data);
    data = data - 1;
    yt.player.stopVideo();
    if(items[data].resourceId) {
        yt.player.loadVideoById(items[data].resourceId.videoId);
    }
    else if(items[data].id.videoId) {
        yt.player.loadVideoById(items[data].id.videoId);
    }
    else {
        yt.loadNewestByUsername(items[data].snippet.channelTitle);
    }
    $("#preview").hide();
    $("#player").show();
});

function select(num) {
    num = num - 1;
    yt.player.stopVideo();
    if(items[num].resourceId) {
        yt.player.loadVideoById(items[num].resourceId.videoId);
    }
    else if(items[num].id.videoId) {
        yt.player.loadVideoById(items[num].id.videoId);
    }
    else {
        yt.loadNewestByUsername(items[num].snippet.channelTitle);
    }
    $("#preview").hide();
    $("#player").show();
    console.log(yt.player);
}

socket.on("query", function(query) {
    console.log("Searching for " + query);
    yt.player.stopVideo();
    clearPreviews(function() {
        item = [];
        items.length = 0;
        req.search(query, 9, function(data) {
            console.log("Search finished");
            console.log(data);
            for(var i = 0; i < 9; i++) {
                items[i] = data.items[i];
            }
            searchPreview();
        });
    });
});

function search(query) {
    yt.player.stopVideo();
    clearPreviews(function() {
        item = [];
        items.length = 0;
        req.search(query, 9, function(data) {
            console.log("Search finished");
            console.log(data);
            for(var i = 0; i < 9; i++) {
                items[i] = data.items[i];
            }
            searchPreview();
        });
    });
}

socket.on("play", function(data) {
    console.log("play " + data);
    yt.player.playVideo();
    $("#preview").hide();
});

socket.on("pause", function(data) {
    console.log("pause " + data);
    yt.player.pauseVideo();
});

socket.on("stop", function(data) {
    console.log("stop " + data);
    yt.player.stopVideo();
    $("#preview").show();
});

socket.on("next", function(data) {
    console.log("next " + data);
    yt.player.nextVideo();
});

socket.on("previous", function(data) {
    console.log("previous " + data);
    yt.player.previousVideo();
})

socket.on("forward", function(data) {
    console.log("forward " + data);
    var seconds = data * 60;
    yt.player.seekTo(yt.player.getCurrentTime() + seconds);
});

socket.on("reverse", function(data) {
    console.log("reverse " + data);
    var seconds = data * 60;
    yt.player.seekTo(yt.player.getCurrentTime() - seconds);
});

function ff(seconds) {
    yt.player.seekTo(yt.player.getCurrentTime() + seconds);
}

function reverse(seconds) {
    yt.player.seekTo(yt.player.getCurrentTime - seconds);
}

socket.on("shuffle", function(data) {
    console.log("shuffle " + data);
    yt.player.setShuffle(true);
});

// Volume only accepts value of 0-100
socket.on("volume", function(data) {
    console.log("volume " + data);
    var volume = data * 10;
    yt.player.setVolume(volume);
});

// Function for teting
function changeVideo(username) {
    socket.emit("changeVideo", username);
}

// Iframe interactions //
// -----------------------------------------------------------------------------
// Wait till YouTube API finishes loading
function onYouTubeIframeAPIReady() {
    var events = { "onReady": main, "onStateChange": onStateChange };
    yt = new YouTube("player", 390, 640, events);
    req = new Request("key goes here");
}

// Responds to YouTube Iframe API onReady event
function onPlayerReady(event) {
    console.log("YouTube player is ready");
    socket.emit("playerReady", "YouTube player is ready");
    // yt.loadNewestByUsername("GoogleDevelopers");
    // getUploads("GoogleDevelopers");
    // req.search("Witcher 3", 9, function(data) {
    //     console.log("Search finished");
    //     console.log(data);
    // });
}

// Will fire when player changes state, (pauses, starts, ends);
function onStateChange() {
    if(yt.player.getPlayerState() == 0) {
        if(yt.player.B.playlist == null) {
            $("#preview").show();
        }
        else if(yt.player.B.playlistIndex == yt.player.B.playlist.length - 1) {
            console.log("Last video in playlist ended");
            $("#preview").show();
        }
    }
}

// Other functions //
// -----------------------------------------------------------------------------
// Get uploads by id related to username
function getUploads(username, callback) {
    req.getPlaylistByUsername(username, "uploads", function(channelId) {
        req.getUploadsById(channelId, NUM_VIDS, callback);
	});
}

// Clear preview thumbnails
function clearPreviews(callback) {
    $("#preview").empty();
    callback();
}

function searchPreview() {
    var html;
    var start = 0;
    var videos = new Array();

    for(var i = 0; i < ROW; i++) {
        videos.push(items.slice(start, COL + start));
        start += COL;
    }
    console.log(videos);

    // <tr> x 3
    //     <td id="video#"> x 9
    //         <div id="subUsername" class="textContainer">
    //             <p class="title">Video Title</p>
    //         </div>
    //     </td>
    // <tr>
    var title;
    var channelTitle;
    var num = 0;
    for(var i = 0; i < ROW; i++) {
        html = "<tr>";
        for(var j = 0; j < COL; j++) {
            console.log(videos[i][j]);
            title = videos[i][j].snippet.title;
            channelTitle = videos[i][j].snippet.channelTitle;
            console.log("title: " + title);
            console.log("channelTitle: " + channelTitle);
            html += "<td id='video" + num + "'>";
			html += "<div id='" + videos[i][j].snippet.title + "'";
            html += "class='textContainer'>";
            html += "<p class='title'>" + title
            html += "<p class='title'>" + channelTitle +"</p>";
            html += "</div>";
			html += "</td>";
            num++;
        }
        html += "</tr>";
        $("#preview").append(html);
    }

    var thumbnail;
    for(var i = 0; i < num; i++) {
        if(items[i].snippet.thumbnails.maxres != undefined) {
			thumbnail = items[i].snippet.thumbnails.maxres.url
		}
		else if(items[i].snippet.thumbnails.high != undefined) {
			thumbnail = items[i].snippet.thumbnails.high.url
		}
		else if(items[i].snippet.thumbnails.medium != undefined) {
			thumbnail = items[i].snippet.thumbnails.medium.url
		}
		else {
			thumbnail = items[i].snippet.thumbnails.default.url
		}

        $("#video" + i).css("background-image", "url(" + thumbnail + ")");
    }

    $("#preview").show();
}

// Takes array of subscriptions and gets the newest video for each
function subscriptionPreview() {
    var html;
    var start = 0;
    var videos = new Array();

    for(var i = 0; i < ROW; i++) {
        videos.push(subs.slice(start, COL + start));
        start += COL;
    }

    // <tr> x 3
    //     <td id="video#"> x 9
    //         <div id="subUsername" class="textContainer">
    //             <p class="title">Video Title</p>
    //         </div>
    //     </td>
    // <tr>

    var title;
    var channelTitle;
    var num = 0;
    for(var i = 0; i < ROW; i++) {
        html = "<tr>";
        for(var j = 0; j < COL; j++) {
            title = subs[num].videos[0].title;
            channelsTitle = subs[num].videos[0].channelTitle;
            html += "<td id='video" + num + "'>";
			html += "<div id='" + subs[num].username + "'";
            html += "class='textContainer'>";
            html += "<p class='title'>" + title + "</p>";
            html += "<p class='title'>" + channelsTitle + "</p>";
            html += "</div>";
			html += "</td>";
            num++;
        }
        html += "</tr>";
        $("#preview").append(html);
    }

    var thumbnail;
    for(var i = 0; i < num; i++) {
        if(subs[i].videos[0].thumbnails.maxres != undefined) {
			thumbnail = subs[i].videos[0].thumbnails.maxres.url
		}
		else if(subs[i].videos[0].thumbnails.high != undefined) {
			thumbnail = subs[i].videos[0].thumbnails.high.url
		}
		else if(subs[i].videos[0].thumbnails.medium != undefined) {
			thumbnail = subs[i].videos[0].thumbnails.medium.url
		}
		else {
			thumbnail = subs[i].videos[0].thumbnails.default.url
		}

        $("#video" + i).css("background-image", "url(" + thumbnail + ")");

        // While we're at it, add these videos to the items array
        items[i] = subs[i].videos[0];
    }

    $("#preview").show();
}

// Cleanup
// -----------------------------------------------------------------------------
// Close socket when page is about to unload
$(window).on('beforeunload', function(){
    socket.close();
});
