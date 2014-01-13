var logger = require('./logger');
var sms = require('./sms');
var call = require('./call');
var async = require('async');
var util = require('util');
var fs = require('fs');

var MaxActiveCount = 10;
var m_minRssi = -90;
var m_updateTimer = 3000;


var m_currentDateTime = new Date();

var m_initParams = { 
        simLoggerStorage: true,
        simSms: false,
        tickSeconds:60  
};

function TetherData(name) {
    this.name = name;
    this.status = "false";
}

function SensorData(temp, rssi) {
    this.temp = temp;
    this.rssi = rssi;
}

function ProximityData(name, rssi) {
    this.name = name;
    this.rssi = rssi;
}

function ReportData(name) {
    this.name = name;
    this.avgRssi = -100;
    this.readings = new Array();  // SensorData
}

function Member(name) {
    this.name = name;
    this.distressFlag = "false";
    this.active = 0;
    this.maxRssi = -100;
    this.temp = 0;
    this.reports = new Array();  // Report Data
}

function MemberData(member) {
    this.name = member.name;
    this.temp = member.temp;
    this.distressFlag = member.distressFlag;
    this.active = member.active;
    this.tethered = "true";
    this.maxRssi = member.maxRssi;  
    this.proximityList = new Array();
    var otherRssi = -100;
    for (var k = 0; k < member.reports.length; k++) {
    	var data = new ProximityData(member.reports[k].name, member.reports[k].avgRssi);
    	this.proximityList.push(data);
        otherRssi = Math.max(member.reports[k].avgRssi, otherRssi);    		
    }
    if ((this.maxRssi < m_minRssi) && (otherRssi < m_minRssi)) {
        this.tethered = "false";
	}
}

var SquadMate = exports.SquadMate =  function SquadMate(mycallback) {
    var self = this;
    this.lastIdx = -1;
    this.phoneNumber = "19723527082";
    this.members = new Array();
    this.timerId = 0;
    /*
     * Initialization code
     */
    async.series(
            [
             function(callback){
                 logger.init(null, function(err) {
                     //logger.setLogLevel(1);
                     if (err) logger.error("Unable to init logger: "+err);
                     callback(err);
                 });
             },
             ],
             function(err) {
                if (err) {
                    mycallback(err);
                } else {
                	self.members.push(new Member("Tom"));
                	self.members.push(new Member("Kamal"));
                	self.members.push(new Member("Vince"));
                	self.members.push(new Member("Fred"));

                    self.timerId = setTimeout(function() { self.handleTimeout(); }, m_updateTimer);
                    sms.init(m_initParams.simSms, self.phoneNumber);
                    call.init(m_initParams.simSms);
                    mycallback(null);
                }
            });
};

SquadMate.prototype.procTick = function(myCallback) {
    //var self = this;
    if (this.members.length == 0) {  // Nothing to do
        myCallback(null);
    } else {
        for (var i = 0; i < this.members.length; i++) {
            this.members[i].active--;
            this.members[i].active = Math.max(this.members[i].active, 0);
            var currName = this.members[i].name;
            var maxRssi = -100;
            var currTemp = 0;
            for (var j = 0; j < this.members.length; j++) {
            	if (this.members[j].name != currName) {
            		for (var k = 0; k < this.members[j].reports.length; k++) {
            			if (this.members[j].reports[k].name.indexOf(currName) != -1){
            				var sum = 0;
            				for (var m = 0; m < this.members[j].reports[k].readings.length; m++) {
            					sum += this.members[j].reports[k].readings[m].rssi;
            					if (this.members[j].reports[k].readings[m].temp > 0)
            					     currTemp = this.members[j].reports[k].readings[m].temp;
            				}
            				var avgRssi = sum/this.members[j].reports[k].readings.length;
            				if (avgRssi > maxRssi) 
            						maxRssi = avgRssi;
            				this.members[j].reports[k].avgRssi = avgRssi;
            				this.members[j].reports[k].readings = new Array();
            			}
            		}
            	}
            }
            if (currTemp > 0)
        	    this.members[i].temp = currTemp;
        	this.members[i].maxRssi = maxRssi;
        }
        myCallback(null);
    }
};

SquadMate.prototype.handleTimeout = function() {
    var self = this;
    this.procTick(function(err) {
            self.timerId = setTimeout(function() { self.handleTimeout(); }, m_updateTimer);
    });
};
SquadMate.prototype.procUpdateStatus = function(req, res) { 
    logger.info("In procUpdateStatus");
    if (req.query.name == undefined) {
        var body = [{status:"ERROR",msg:"Missing name parameter"}];
        res.contentType('json');
        res.send(JSON.stringify(body), 400);
        return;
    }
    var name = req.query.name;
    console.log("name ="+name);
    for (var i = 0; i < this.members.length; i++) {
    	if (name.indexOf(this.members[i].name) != -1 ) {
    		this.members[i].active++;
            this.members[i].active = Math.min(this.members[i].active, 10);
            var found = false;
            var sensorData = new SensorData(req.body.temp, req.body.rssi);
            for (var j = 0; j<this.members[i].reports.length; j++) {
                if (this.members[i].reports[j].name == req.body.name) {
                	this.members[i].reports[j].readings.unshift(sensorData);
                	if (this.members[i].reports[j].readings.length > 5) {
                		this.members[i].reports[j].readings.pop;
                	}
                	found = true;
                	break;
                }
            }
            if (!found) {
            	var report = new ReportData(req.body.name);
            	report.readings.push(sensorData);
            	this.members[i].reports.push(report);
            }
            break;
    	}
    }
    console.log(JSON.stringify(req.body));
    /*
    if (req.body.pixelCount != undefined) {
        params.pixelCount = parseInt(req.body.pixelCount);
    }
    */
    res.send(200);
};

SquadMate.prototype.procGetStatus = function(req, res) {
    logger.info("In procGetStatus");

    var results = new Array();
    for (var i = 0; i < this.members.length; i++) {
    	var data = new MemberData(this.members[i]);
        results.push(data);
    } 

    res.contentType('json');
    res.send(JSON.stringify(results), 200);
    
};

SquadMate.prototype.procDistressFlag = function(req, res) {
    logger.info("In procDistressFlag");
    if (req.query.name == undefined) {
        var body = [{status:"ERROR",msg:"Missing name parameter"}];
        res.contentType('json');
        res.send(JSON.stringify(body), 400);
        return;
    }
    var flag = "false";
    if (req.query.flag != undefined) {
        if (req.query.flag == "1") {
        	flag = "true";
        }
    }
    var name = req.query.name;
    for (var i = 0; i < this.members.length; i++) {
    	if (this.members[i].name == name) {
    		this.members[i].distressFlag = flag;
    	}
    }
    res.send(200);
};

SquadMate.prototype.procGetTetherStatus = function(req, res) {
    logger.info("In procGetTetherStatus");

    var results = new Array();
    for (var i = 0; i < this.members.length; i++) {
    	var otherRssi = -100;
    	for (var k = 0; k < this.members[i].reports.length; k++) {
    		if (this.members[i].reports[k].avgRssi > otherRssi)
    			otherRssi = this.members[i].reports[k].avgRssi;
        }
    	if ((this.members[i].maxRssi < m_minRssi) && (otherRssi < m_minRssi)) {
    		var data = new TetherData(this.members[i].name);
    		results.push(data);
    	}
    }  
    res.contentType('json');
    res.send(JSON.stringify(results), 200);
};

SquadMate.prototype.procSendSms = function(req, res) { 
    logger.info("In procSendSms");
    console.log("req.body.numbers= "+req.body.numbers);
    console.log("req.body.msg= "+req.body.msg);
    sms.send(req.body.numbers, req.body.msg, function(error) {
        res.send(200);
    });
};

SquadMate.prototype.procSetupCall = function(req, res) { 
    logger.info("In procSetupCall");
    console.log("req.body.numbers= "+req.body.numbers);
    call.send(req.body.numbers, function(error) {
        res.send(200);
    });
};


