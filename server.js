// My node modules
// var chromecast = require("chromecast");

// Node modules
var url = require("url");
var fs = require("fs");
var express = require("express");
var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);

// Start listening on port 4242
server.listen(4242);

// HTML, CSS, and JS files
app.use(express.static("player"));

app.get("/tv", function (req, res) {
    console.log("test");
    res.end();
});

// Triggered when client connects
io.on("connection", function(socket) {
    // AWS service echo app will be sending post request to this route
    app.get("/echo/tv", function(req, res) {
        var query;
        var date;
        var time;

        query = url.parse(req.url, true);
        query = query.query;

        date = new Date();
        time = date.getMonth() + "/" + date.getDate() + "/" + date.getYear();
        time += " - " + date.getHours() + ":" + date.getMinutes() + ":";
        time += date.getSeconds() + ":" + date.getMilliseconds() + " - ";

        // If the echo passed along wildcard text, replace "." with " "
        if(query.cmd == "query") {
            query.val = query.val.split(".").join(" ");
        }

        console.log(time + query.cmd + " " + query.val);
        io.emit(query.cmd, query.val);
        res.end();
    });

    // When YouTube player is ready
    socket.on("playerReady", function(msg) {
        console.log(msg);
    });

    // Left for testing
    socket.on("changeVideo", function(username) {
        console.log("Chaning all players to " + username);
        io.emit("updateVideo", username);
    });
});
