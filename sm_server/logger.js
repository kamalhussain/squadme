var m_datastore = null;
var m_collection = null;
var m_logLevel = parseInt(2); // 0 - ERROR, 1 - WARN+ERROR, 2 - INFO+WARN+ERROR

var logMsg = function(msgType, message) {
	if (typeof message !== 'string') {
		message = JSON.stringify(message);
	}
	console.log(msgType+': '+message);
	if (m_collection) {
		m_collection.save({
			ts: new Date(),
			type:msgType,
			msg:message
			}, function(err, doc) {});
	}
};
exports.setLogLevel = function(newLevel)  {
	var level = parseInt(newLevel);
	if (level < 0) 
		level = 0;
	if (level > 2) 
		level = 2;
	m_logLevel = level;
};

exports.init = function(datastore, mycallback) { 
	m_datastore = datastore; 
	if (m_datastore) {
		m_datastore.getCollection("logger", function(err, collection) {
			if (!err) m_collection = collection;
			mycallback(err);
		});
	} else {
		mycallback(null);
	}
};

exports.info = function(message) { if (m_logLevel > 1) logMsg('INFO', message); };
exports.warn = function(message) {if (m_logLevel > 0) logMsg('WARN', message); };
exports.error = function(message) {logMsg('ERROR', message); };

