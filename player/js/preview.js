// For request to YouTube's data api
var request = new Request("key goes here");
var numVids = 9;
var row = 3;
var col = 3;

getUploads();

// Get uploads by id related to username
function getUploads(name) {
    request.getUploadsIdByUsername(name, function(channelId) {
        request.getUploadsById(channelId, numVids, addVideo);
	});
}

function addVideo(videos) {
	var thumbnails = new Array();
	var temp = new Array();
	var resolution;

    for(var i = 0; i < videos.length; i++) {
		if(videos[i].snippet.thumbnails.maxres != undefined) {
			resoultion = videos[i].snippet.thumbnails.maxres.url
		}
		else if(videos[i].snippet.thumbnails.high != undefined) {
			resoultion = videos[i].snippet.thumbnails.high.url
		}
		else if(videos[i].snippet.thumbnails.medium != undefined) {
			resoultion = videos[i].snippet.thumbnails.medium.url
		}
		else {
			resoultion = videos[i].snippet.thumbnails.default.url
		}
		thumbnails.push({
			title: videos[i].snippet.title,
			description: videos[i].snippet.description,
			thumbnail: resoultion,
			videoId: videos[i].snippet.resourceId.videoId
		});
    }

	while(thumbnails.length) {
		temp.push(thumbnails.splice(0, col));
	}

	thumbnails = temp;

	var html;
	var num = 1;
	for(var i = 0; i < row; i++) {
		html = "<tr>"
		for(var j = 0; j < col; j++) {
			html += "<td id='video" + num + "'>";
			html += "<p class='title'>" + thumbnails[i][j].title + "</p>";
			html += "<img class='thumbnail' src='";
			html += thumbnails[i][j].thumbnail + "'>";
			html += "</td>";
			num++;
		}
		html += "</tr>";
		$(".thumbnailContainer").append(html);
	}
}
