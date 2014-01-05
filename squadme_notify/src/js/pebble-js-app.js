//function getCurrentLocation() {
//    console.log("inside location");
//    navigator.geolocation.getCurrentPosition(function(position) {
//        insert_coord(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
//    });
//}
//
//function insert_coord(loc) {
//    var request = new XMLHttpRequest();
//    request.open("POST", "start.php", true);
//    request.onreadystatechange = function() {
//        callback(request);
//    };
//    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//    request.send("lat=" + encodeURIComponent(loc.lat()) + "&lng=" + encodeURIComponent(loc.lng()));
//
//    return request;
//}
//
//function callback(req) {
//    console.log("inside callback");
//    if (req.readyState == 4)
//        if (req.status == 200) {
//            document.getElementById("scratch").innerHTML = "callback success";
//            //window.setTimeout("getCurrentLocation()",5000);
//            setTimeout(getCurrentLocation, 5000);
//        }
//}
//
//getCurrentLocation(); //called on body load

function checkTethering() {
    getData();
    //console.log("calling getData");
    //setTimeOut(getData, 3000);
}

function getData() {
    var req = new XMLHttpRequest();

    //req.open('GET', "http://webtest.ic.att.com/check_tethering.php");
    req.open('GET', "http://snoop-wileycoyote.rhcloud.com/squadmate/tether");

    req.onreadystatechange = function() {
        callback(req);
    };

    req.send(null);
}

function callback(req) {
    var response;

    if (req.readyState == 4) { //whats it?
        if (req.status == 200) {
            console.log(req.responseText);
            response = JSON.parse(req.responseText);

            console.log("sending App message: " + JSON.stringify(response));
            console.log(JSON.stringify(response));

            if (response.length != 0) {
                console.log("name : " + response[0].name);
                console.log("message: " + response[0].status);

                var msg;

                if (response[0].status == "false") {
                    msg = "Out of Network";

                } else {
                    msg = "In network";
                }

                Pebble.sendAppMessage({
                    "name": response[0].name,
                    "message": msg
                });

            } else {
                console.log("everybody is in");

                Pebble.sendAppMessage({
                    "name": 'All',
                    "message": "In the network"
                });
            }

        } else {
            console.log("Error");
            Pebble.sendAppMessage({
                "name": 'All',
                "message": "In the network"
            });
        }

        setTimeout(checkTethering, 5000)
    }
}

function getData2() {
    var response;
    var req = new XMLHttpRequest();

    req.open('GET', "http://webtest.ic.att.com/check_tethering.php");

    req.onload = function(e) {
        if (req.readyState == 4) { //whats it?
            if (req.status == 200) {
                console.log(req.responseText);
                response = JSON.parse(req.responseText);

                console.log("sending App message: " + JSON.stringify(response));
                console.log(JSON.stringify(response));

                if (response == null) {
                    console.log("name : " + response.name);
                    console.log("message: " + response.status);

                    var msg;

                    if (response.status = "false") {
                        msg = "Out of Network";

                    } else {
                        msg = "In network";
                    }

                    Pebble.sendAppMessage({
                        "name": response.name,
                        "message": msg
                    });

                } else {
                    console.log("everybody is in");

                    Pebble.sendAppMessage({
                        "name": 'all',
                        "message": "tethered"
                    });
                }

            } else {
                console.log("Error");
            }
        }
    }
    req.send(null);
}

Pebble.addEventListener("ready",
        function(e) {
            console.log("connecting to API" + e.ready);
            checkTethering();
            //setTimeOut('checkTethering()', 3000);
        });

Pebble.addEventListener("appmessage",
        function(e) {
            console.log("got message!" + e.payload);
        });

Pebble.addEventListener("webviewclosed",
        function(e) {
            console.log("webview closed");
            console.log(e.type);
            console.log(e.response);
        });


