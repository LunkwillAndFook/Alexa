/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

var SERVICESMARTAPPNAME = "Breezy",
    APPLICATIONID = "amzn1.ask.skill.f71cabf5-c327-41cf-b1c9-17f0ca34a141",
    SERVICESMARTAPPSPEECHNAME = "Breezy",
    SMARTENDPOINTS = "https://graph.api.smartthings.com/api/smartapps/endpoints",
    CLIENTID = "8716df2a-7b63-4376-90d4-4b982677e7a0",
    FANSURI = "/fans";

var request = require('request');


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        console.log("event.request.type=" + event.request.type);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

        if (event.session.application.applicationId !== APPLICATIONID) {
             context.fail("Invalid Application ID");
        }

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);

    console.log("Access Token: " + session.user.accessToken);

    var sessionAttributes = {};
    session.attributes = sessionAttributes;
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("START onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(session, callback);

    console.log("END onLaunch");
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    console.log("intentRequest.intent.name: " + intentName);

    // Dispatch to your skill's intent handlers
    if ("GetFans" === intentName) {
        getFans(intent, session, callback);
    } else if ("GetFanDetails" === intentName) {
        getFanDetails(intent, session, callback);
    } else if("SetFan" === intentName) {
        setFanValue(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getHelpResponse(session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        sayGoodbye(session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        sayGoodbye(session, callback);
    } else if ("QuitAppIntent" === intentName) {
        sayGoodbye(session, callback);
    } else if ("UnsupportedIntent" === intentName) {
        getUnsupportedResponse(session, callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

/**
 * Called when the user specifies an intent for this skill or attempts to end the session.
 */
function sayGoodbye(session, callback) {
    console.log("START sayGoodbye");
    var sessionAttributes = {};
    var speechletResponse = {
        outputSpeech: {
            type: "PlainText",
            text: "Goodbye!"
        },
        card: null,
        reprompt: null,
        shouldEndSession: true
    };

    callback(sessionAttributes, speechletResponse);
    console.log("END sayGoodbye");
}

/**
 * Gets the welcome response.
 */
function getWelcomeResponse(session, callback) {
    console.log("START getWelcomeResponse");

    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = null;
    var cardOutput = null;

    if (session.user.accessToken === undefined || session.user.accessToken === null || session.user.accessToken === "") {
        cardOutput = "Welcome to the " + SERVICESMARTAPPNAME + " skill. Please allow me to access your Smartthings devices.";
        speechOutput = "Welcome to the " + SERVICESMARTAPPSPEECHNAME + " skill. It looks like you haven't connected this skill to your Smart Things account. Please open the Alexa app and allow me to access your Smart Things devices.";

        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, null, true, cardOutput, "LinkAccount"));
    } else {
        speechOutput = "Welcome to " + SERVICESMARTAPPSPEECHNAME + ". What would you like me to do? You can say things like, what fans do I have.";
        var repromptText = "I didn't understand you. What would you like me to do? You can say things like, what fans do I have.";
        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, repromptText, false, null, null));
    }

    console.log("END getWelcomeResponse");
}

/**
 * Gets the unsupported response.
 */
function getUnsupportedResponse(session, callback) {
    console.log("START getUnsupportedResponse");

    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "I didn't understandd";
    var speechOutput = null;
    var cardOutput = null;

    if (session.user.accessToken === undefined || session.user.accessToken === null || session.user.accessToken === "") {
        cardOutput = "I can't connect to Smartthings right now. Please allow me to access your Smartthings devices.";
        speechOutput = "It looks like you haven't connected this skill to your Smart Things account. Please open the Alexa app and allow me to access your Smart Things devices.";

        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, null, true, cardOutput, "LinkAccount"));
    } else {
        speechOutput = "I didn't understand what you were trying to say. What would you like me to do? You can say things like, are any doors open or i'm going to bed.";
        var repromptText = "I didn't understand you. What would you like me to do? You can say things like, are any doors open or i'm going to bed.";
        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, repromptText, false, null, null));
    }

    console.log("END getUnsupportedResponse");
}

/**
 * Gets the help response.
 */
function getHelpResponse(session, callback) {
    console.log("START getHelpResponse");

    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Help";
    var speechOutput = null;
    var cardOutput = null;

    if (session.user.accessToken === undefined || session.user.accessToken === null || session.user.accessToken === "") {
        cardOutput = "Welcome to the " + SERVICESMARTAPPNAME + " skill. It looks like you haven't connected this skill to your Smartthings account. Before you can use this skill you will need to install the companion " + SERVICESMARTAPPNAME + " Smartapp for Smartthings. Then open the Alexa app, connect it with your Smartthings account, and choose the devices and routines you wish to allow it to access.";
        speechOutput = "Welcome to the " + SERVICESMARTAPPSPEECHNAME + " skill. It looks like you haven't connected this skill to your Smart Things account. Before you can use this skill you will need to install the companion " + SERVICESMARTAPPSPEECHNAME + " Smart App for Smart Things. Then open the Alexa app, connect it with your Smart Things account, and choose the devices and routines you wish to allow it to access.";

        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, null, true, cardOutput, "LinkAccount"));
    } else {
        cardOutput = "The " + SERVICESMARTAPPNAME + " skill is designed to add additional functionality for your Amazon Echo not currently offered by the built-in integration with Smartthings. You can ask if any doors are open, what the average temperature is, what the average humidity is, if anything has a low battery, if anything has a battery under X percent, or what routines can I run. You can tell this skill to execute a routine by name by saying, execute routine routine name. In addition, you can tell this skill that i'm awake, i'm back, i'm cleaning, i'm finished watching a movie, i'm going to bed, i'm leaving, or i'm watching a movie and it will execute the routine corresponding to that phrase which you configured using the companion " + SERVICESMARTAPPNAME + " SmartApp for Smartthings.";
        speechOutput = "The " + SERVICESMARTAPPSPEECHNAME + " skill is designed to add additional functionality for your Amazon Echo not currently offered by the built-in integration with Smart Things. You can ask if any doors are open, what the average temperature is, what the average humidity is, if anything has a low battery, if anything has a battery under X percent, or what routines can I run. You can tell this skill to execute a routine by name by saying, execute routine routine name. In addition, you can tell this skill that i'm awake, i'm back, i'm cleaning, i'm finished watching a movie, i'm going to bed, i'm leaving, or i'm watching a movie and it will execute the routine corresponding to that phrase which you configured using the companion " + SERVICESMARTAPPSPEECHNAME + " Smart App for Smart Things.";
        var repromptText = "I didn't understand you. What would you like me to do? You can say things like, are any doors open.";
        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, repromptText, false, cardOutput, null));
    }

    console.log("END getHelpResponse");
}

/**
 * Gets the fans which can be accessed.
 */
function getFans(intent, session, callback) {
    console.log("START getFans");

    var cardTitle = "Connect to SmartThings";
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "Hmmm. I am having trouble connecting to Smart Things. Please re-link your account using the Alexa app or try again later.";
    var cardType = "LinkAccount";

    getSmartthingsEndpoints(session, session.user.accessToken, function (endpointUri) {
        var fullEndpointUri = endpointUri + FANSURI;
        console.log("getFans full endpoint: " + fullEndpointUri);

        request.get({
            "headers": { "Content-Type": "application/json", "Authorization": "Bearer " + session.user.accessToken },
            "uri": fullEndpointUri, method: "GET", followRedirect: true
        }, function (err, res, body) {
            // console.log("SUCCESS: ", err);
            var fans = null;
            try {
                fans = JSON.parse(body);
                console.log("getFans BODY: " + body);
                if (fans !== null) {
                    cardTitle = "fans";
                    if (fans.length == 0) {
                        speechOutput = "Sorry. I could not find any fans.";
                        cardType = "Simple";
                        callback(sessionAttributes,
                            buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession, speechOutput, cardType));
                        return;
                    }

                    if (fans.length >= 1) {
                        cardTitle = "fans";
                        cardType = "Simple";
                        var cardOutput = "Fans: ";
                        speechOutput = "I found the following fans. ";
                        for (var i = 0; i < fans.length; i++) {
                            cardOutput += fans[i].displayName + " ";
                            if (i === fans.length - 1) {
                                speechOutput += "and " + fans[i].displayName + ".";
                            } else {
                                speechOutput += fans[i].displayName + ", ";
                            }
                        }

                        callback(sessionAttributes,
                            buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession, cardOutput, cardType));
                    }
                } else {
                    callback(sessionAttributes,
                        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession, speechOutput, cardType));
                }
            } catch (e) {
                console.log(e);
                console.log(body);
                callback(sessionAttributes,
                    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            }
        });
    });

    console.log("END getFans");
}

/**
 * Gets the details for the specified fan.
 */
function getFanDetails(intent, session, callback) {
    console.log("START getFanDetails");

    var cardTitle = "Connect to SmartThings";
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "Hmmm. I am having trouble connecting to Smart Things. Please re-link your account using the Alexa app or try again later.";
    var cardType = "LinkAccount";
    var deviceName = intent.slots.DeviceName.value;

    getSmartthingsEndpoints(session, session.user.accessToken, function (endpointUri) {
        var fullEndpointUri = endpointUri + FANSURI + "/" + deviceName;
        console.log("getFanDetails full endpoint: " + fullEndpointUri);

        request.get({
            "headers": { "Content-Type": "application/json", "Authorization": "Bearer " + session.user.accessToken },
            "uri": fullEndpointUri, method: "GET", followRedirect: true
        }, function (err, res, body) {
            // console.log("SUCCESS: ", err);
            var fans = null;
            try {
                fans = JSON.parse(body);
                console.log("getFanDetails BODY: " + body);
                cardTitle = "fans";
                if (fans == null || fans.length == 0) {
                    speechOutput = "Sorry. I could not find any fans.";
                    cardType = "Simple";
                    callback(sessionAttributes,
                        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession, speechOutput, cardType));
                    return;
                }

                if (fans.length > 1) {
                    repromptText = "More than one fan was found. Which fan did you want?"
                } else {
                    cardTitle = deviceName;
                    cardType = "Simple";
                    speechOutput = "";
                    if(fans[0].hasFanMode) {
                        speechOutput = fans[0].displayName + " is set to " + fans[0].currentMode + ".";
                        cardTitle = fans[0].displayName;
                        cardOutput = speechOutput;
                    } else {
                        speechOutput = fans[0].displayName + " is set to " + fans[0].currentSpeed + ".";
                        cardTitle = fans[0].displayName;
                        cardOutput = speechOutput;
                    }

                    if(speechOutput === ""){
                        repromptText = "I could not find any fans named " + deviceName + ". Which fan did you want?";
                    }
                }

                callback(sessionAttributes,
                    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession, cardOutput, cardType));
            } catch (e) {
                console.log(e);
                console.log(body);
                callback(sessionAttributes,
                    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            }
        });
    });

    console.log("END getFanDetails");
}

/**
 * Sets the value for the specified fan.
 */
function setFanValue(intent, session, callback) {
    console.log("START setFanValue");

    var cardTitle = "Connect to SmartThings";
    var repromptText = null;
    var deviceName = intent.slots.DeviceName.value;
    var fanMode = intent.slots.DeviceMode.value;
    var fanSpeed = intent.slots.DeviceSpeed.value;
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "Hmmm. I am having trouble connecting to Smart Things. Please re-link your account using the Alexa app or try again later.";
    var cardOutput = "Hmmm. I am having trouble connecting to Smart Things. Please re-link your account using the Alexa app or try again later.";
    var cardType = "LinkAccount";

    var deviceValue = "";
    console.log("setFanValue determining value");
    if(fanMode !== undefined && fanMode !== null) {
        deviceValue = fanMode;
    } else {
        deviceValue = fanSpeed;
    }
    console.log("setFanValue value determined: " + deviceValue);

    getSmartthingsEndpoints(session, session.user.accessToken, function (endpointUri) {
        var fullEndpointUri = endpointUri + FANSURI + "/" + deviceName + "/" + deviceValue;
        console.log("setFanValue full endpoint: " + fullEndpointUri);

        request.put({
            "headers": { "Content-Type": "application/json", "Authorization": "Bearer " + session.user.accessToken },
            "uri": fullEndpointUri, method: "PUT", followRedirect: true
        }, function (err, res, body) {
            // console.log("SUCCESS: ", err);
            var routines = null;
            var endpointUri = null;
            try {
                if (body.length == 0) {
                    speechOutput = "Ok";
                    cardTitle = "Fan speed changed"
                    cardOutput = deviceName + " set to " + deviceValue;
                } else {
                    speechOutput = "I could not set the fan speed for " + deviceName;
                    cardTitle = "Fan speed not changed";
                    cardOutput = speechOutput;
                }
                cardType = "Simple";
                callback(sessionAttributes,
                    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession, cardOutput, cardType));
            } catch (e) {
                console.log(e);
                console.log(body);
                callback(sessionAttributes,
                    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            }
        });
    });
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, speechOutput, repromptText, shouldEndSession, cardOutput, cardType) {
    console.log("START buildSpeechletResponse");

    if (cardOutput === undefined || cardOutput == null) {
        cardOutput = speechOutput;
    }

    var result = {
        outputSpeech: {
            type: "PlainText",
            text: speechOutput
        },
        card: {
            type: cardType,
            title: SERVICESMARTAPPNAME + " - " + title,
            content: cardOutput
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };

    if (cardType == null) {
       result = {
            outputSpeech: {
                type: "PlainText",
                text: speechOutput
            },
            card: null,
            reprompt: {
                outputSpeech: {
                    type: "PlainText",
                    text: repromptText
                }
            },
            shouldEndSession: shouldEndSession
        };
    }

    console.log("END buildSpeechletResponse");
    return result;
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

function getSmartthingsEndpoints(session, accessToken, cb) {
    request.get({
        "headers": { "Content-Type": "application/json", "Authorization": "Bearer " + accessToken },
        "uri": SMARTENDPOINTS, method: "GET", followRedirect: true
    }, function (err, res, body) {
        // console.log("SUCCESS: ", err);
        var endpoints = null;
        var endpointUri = null;
        try {
            endpoints = JSON.parse(body);
            console.log("getSmartthingsEndpoints BODY: " + body);
            if (endpoints !== null && endpoints.length > 0) {
                console.log("getSmartthingsEndpoints endpoint found: " + endpoints[0].uri);
                endpointUri = endpoints[0].uri;
            }
            cb(endpointUri);
        } catch (e) {
            console.log("Unexpected error in getSmartthingsEndpoints");
            console.log(e);
            console.log(body);
        }
    });
}