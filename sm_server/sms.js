var logger = require('./logger');
var request = require('request');
var async = require('async');

var m_msgQueue = new Array();
var m_inProgress = false;

var m_authToken = null;
var m_authUrl = 'https://api.att.com/oauth/token';
var m_authDataTemplate = 'client_id={CLIENT_ID}&client_secret={SECRET}&grant_type=client_credentials&scope={SCOPE}';
var m_clientId = "taibnvvvwnbjgmpjl0xh1kjjuzqmwhst";
var m_secret = "2ccobrtbdborgskgr1omkggjysi1lnfl";
var m_smsUrl = "https://api.att.com/sms/v3/messaging/outbox";
var m_simFlag = false;


exports.init = function(simFlag) {
	logger.info("SMS Initialized");
	m_simFlag = simFlag;
	var reqBody = m_authDataTemplate.replace("{CLIENT_ID}", m_clientId).replace("{SECRET}", m_secret).replace("{SCOPE}","SMS");
	request.post({
	  headers: {'content-type' : 'application/x-www-form-urlencoded'},
	  url:     m_authUrl,
	  body:    reqBody
	}, function(error, response, body){
	  console.log(body);
	  if (error) {
		  console.log("Error="+error);
	  } else {
		  var record = JSON.parse(body);
		  m_authToken = record.access_token;
          console.log("m_authToken = "+m_authToken);
	  }
	});
};


exports.send = function(ids, msg, mycallback) {  // ids is an array
	if (m_simFlag) {
		process.nextTick(function() {mycallback(null);});
		return;
	}
	if (!m_authToken) {
		var error = new Error("SMS module is not initialized!");
		logger.error(error);
		mycallback(error);
	} else {
		var idx = 0;
		async.whilst(
				function () { return idx < ids.length; },
				function (callback) {
					var body = {
							outboundSMSRequest: {
								address: "tel:+1"+ids[idx],
								message: msg
							}
					};
					request.post({
						headers: {
							         'Content-Type' : 'application/json',
							         'Accept' : 'application/json',
							         'Authorization' : 'Bearer ' + m_authToken
							     },
						url:     m_smsUrl,
						body:    JSON.stringify(body)
					}, function(error, response, body){
						idx++;
						console.log(body);
						if (error) {
							console.log("Error="+error);
						} else {
							
							console.log("SMS Success");
						}
						callback(error);
					});
				},
				function (err) {
					mycallback(err);
				});

	}
};
