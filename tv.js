var http = require("http");

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        // if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
        //      context.fail("Invalid Application ID");
        // }

        if(event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if(event.request.type === "LaunchRequest") {
            onLaunch(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
                context.succeed(buildResponse(sessionAttributes, speechletResponse));
             });
        }
        else if(event.request.type === "IntentRequest") {
            onIntent(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
                 context.succeed(buildResponse(sessionAttributes, speechletResponse));
             });
        }
        else if(event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    }
    catch(e) {
        context.fail("Exception: " + e);
    }
};

// Session started for the first time
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId + ", sessionId=" + session.sessionId);
}

// Session started, but intent not given.
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId + ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

// Intent is specified
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent
    var intentName = intentRequest.intent.name;

    var cardTitle = intentName;
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
    var cmd = "";
    var val = "";
    var tmp = "";

    if(intentName == "Search") {
        // If the user began speaking after invoking
        if(intent.slots.itema.value) {
            // Construct user's full utterance
            val += intent.slots.itema.value;
            val += ".";

            if(intent.slots.itemb.value) {
                val += intent.slots.itemb.value;
                val += ".";
            }
            if(intent.slots.itemc.value) {
                val += intent.slots.itemc.value;
                val += ".";
            }
            if(intent.slots.itemd.value) {
                val += intent.slots.itemd.value;
                val += ".";
            }
            if(intent.slots.iteme.value) {
                val += intent.slots.iteme.value;
                val += ".";
            }
            if(intent.slots.itemf.value) {
                val += intent.slots.itemf.value;
                val += ".";
            }
            tmp = val;

            speechOutput = "Searching for, " + tmp.split(".").join(" ");
            cmd = "query";
        }
        else {
            throw "Invalid intent";
        }
    }
    else if(intentName == "TV") {
        if(intent.slots.select.value) {
            speechOutput = "Playing video " + intent.slots.select.value;
            cmd = "select";
            val = intent.slots.select.value;
        }
        else if(intent.slots.forward.value) {
            if(intent.slots.forward.value == 1) {
                speechOutput = "fast forward " + intent.slots.forward.value + " minute";
            }
            else {
                speechOutput = "fast forward " + intent.slots.forward.value + " minutes";
            }

            cmd = "forward";
            val = intent.slots.forward.value;
        }
        else if(intent.slots.reverse.value) {
            if(intent.slots.reverse.value == 1) {
                speechOutput = "reverse " + intent.slots.reverse.value + " minute";
            }
            else {
                speechOutput = "reverse " + intent.slots.reverse.value + " minutes";
            }
            cmd = "reverse";
            val = intent.slots.reverse.value;
        }
        else if(intent.slots.volume.value) {
            speechOutput = "volume, " + intent.slots.volume.value;
            cmd = "volume";
            val = intent.slots.volume.value;
        }
        else if(intent.slots.play.value) {
            cmd = "play";
            val = intent.slots.play.value;
        }
        else if(intent.slots.pause.value) {
            cmd = "pause";
            val = intent.slots.pause.value;
        }
        else if(intent.slots.stop.value) {
            cmd = "stop";
            val = intent.slots.stop.value;
        }
        else if(intent.slots.next.value) {
            speechOutput = "Playing next video";
            cmd = "next";
            val = intent.slots.next.value;
        }
        else if(intent.slots.previous.value) {
            speechOutput = "Playing previous video";
            cmd = "previous";
            val = intent.slots.previous.value;
        }
        else if(intent.slots.shuffle.value) {
            speechOutput = "Suffling playlist";
            cmd = "shuffle";
            val = intent.slots.shuffle.value;
        }
        else if(intent.slots.subscriptions.value) {
            cmd = "subscriptions";
            val = intent.slots.subscriptions.value;
        }
        else {
            throw "Invalid intent";
        }
    }
    else {
        throw "Invalid intent";
    }

    var path = "/echo/tv?cmd=" + cmd + "&val=" + val;

    var options = {
		host: "030db3bd.ngrok.io",
		path: path,
		port: "80",
		method: "GET"
	};

	var req = http.request(options, function(res) {
        callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, shouldEndSession));
	});

    req.end();
}

// Called on session end, but not on shouldEndSession = true
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId + ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "TV";
    var speechOutput = "Starting TV. What would you like to do?,";
    var repromptText = "I didn't catch that. What would you like to do?";
    var shouldEndSession = false;

    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

	req.end();
}

// --------------- Helpers that build all of the responses ---------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    }
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    }
}
