var logger = require('./logger');
var request = require('request');
var async = require('async');


var m_callUrl = "http://12.230.212.109:8080/ParlayREST/thirdpartycall/v1/callSessions";
var m_simFlag = false;
var m_counter;

exports.init = function(simFlag) {
};

function ParticipantData(name, address) {
    this.participantAddress = address;
    this.participantName = name;
}


exports.send = function(ids, mycallback) {  // ids is an array
	if (m_simFlag) {
		process.nextTick(function() {mycallback(null);});
		return;
	}
	if (!m_callUrl) {
		var error = new Error("Call module is not initialized!");
		logger.error(error);
		mycallback(error);
	} else {
		var idx = 0;
		var body = {
		    "callSessionInformation": {
		        "clientCorrelator": m_counter++,
		        "participant": new Array()
		    }
		};
		for (var i =0; i< ids.length; i++) {
			var sipAddress = "sip:+1"+ids[i]+"@foundry.att.com";
			//var sipAddress = "tel:+1"+ids[i];
			var data = new ParticipantData("SquadMember", sipAddress);
			body.callSessionInformation.participant.push(data);
		}
		console.log(JSON.stringify(body));
		request.post({
			headers: {
				'Content-Type' : 'application/json',
				'Accept' : 'application/json',
			},
			url:     m_callUrl,
			body:    JSON.stringify(body)
		}, function(error, response, body){
			console.log(body);
			if (error) {
				console.log("Error="+error);
			} else {
				console.log("CALL Success");
			}
			mycallback(error);
		});
	}
};
