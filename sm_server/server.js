/* Tom Hambleton */
/**
 * Module dependencies.
 */

var port = (process.env.PORT || 8080);
var host = (process.env.IP_ADDR || 'localhost');
var dataPath = (process.env.DATA_DIR || '/var/tmp/');

var express = require('express')
  , https = require('https')
  , http = require('http')
  , path = require('path')
  , util = require('util')
  , fs = require('fs')
  , SquadMate = require('./squadmate').SquadMate;


var app = express();

function listAllProperties(o){     
    var objectToInspect;     
    var result = [];
     
    for(objectToInspect = o; objectToInspect !== null; objectToInspect = Object.getPrototypeOf(objectToInspect)){  
        result = result.concat(Object.getOwnPropertyNames(objectToInspect));  
    }
     
    return result; 
}
console.log(listAllProperties(process.env));

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

function setupDataPath() {
    var eventDataDir = './public/eventdata';

    if (!fs.existsSync(eventDataDir)) {
        fs.symlinkSync(dataPath, eventDataDir);
        console.log("Created symlink from: " + eventDataDir + " to " + dataPath);
    } 
}

app.configure(function(){
  app.set('port', port);
  app.set('host', host);
  app.set('dataPath', dataPath);
  setupDataPath();
  app.use(allowCrossDomain);
  // app.use(express.basicAuth(function(user, pass, callback) {
  //      var result = (user === 'hambtw' && pass ==='Squadmate123');
  //      callback(null /* error */, result);
  //     }));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({uploadDir:'./uploads'}));
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.squadmate = new SquadMate(function(err) {
      if (err) {
          console.log("SquadMate Init failed:"+ err);
          process.exit(1);
      } else {
          console.log("SquadMate Created");
      }
  });
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//
// Routes
//

app.get('/', function(req, res) { res.send("Squadmate Server"); });

app.get('/health', function(req, res){
      res.send({
        pid: process.pid,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      });
    });

app.get('/squadmate/status', function(req, res) {  // ?name=<namestr>
    app.squadmate.procGetStatus(req, res);
});

app.get('/squadmate/tether', function(req, res) {  // ?name=<namestr>
    app.squadmate.procGetTetherStatus(req, res);
});

app.get('/squadmate/distress', function(req, res) {  // ?name=<namestr>?flag=<0|1>
    app.squadmate.procDistressFlag(req, res);
});

app.post('/squadmate/update', function(req, res) {  //?name=<namestr>
    app.squadmate.procUpdateStatus(req,res); 
});

app.post('/squadmate/sms', function(req, res) {  
    app.squadmate.procSendSms(req,res); 
});

app.post('/squadmate/call', function(req, res) {  
    app.squadmate.procSetupCall(req,res); 
});

process.on('uncaughtException', function (err) {
      var msg = "uncaughtException: "+err.message;
      console.error(msg);
      console.error(err.stack);
      process.exit(1);});


console.log("About to createServer");

//http.createServer(app).listen(app.get('port'), function(){
//    console.log("Express server listening on port " + app.get('port'));
//});
http.createServer(app).listen(app.get('port'), app.get('host'), function(){
      console.log("Express server listening on port " + app.get('port'));
});

