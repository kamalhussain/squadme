$(document).ready(function() {

    window.m_selectedNames = [];
    window.m_memberData = [];
    window.m_timer = null;

    var buildUI2 = function(parent, items) {
        $.each(items, function() {
            var ul = $("<tr></tr>");
            ul.appendTo(parent);
            var buttons = '<td> <a class="btn btn-small btn-primary href="#"><i class="icon-play icon-white"></i> Play</a></td>' +
                    '<td> <a class="btn btn-small href="#"><i class="icon-trash"></i> Delete</a></td>';
            var li2 = $("<td>" + this.Date + "</td><td>" + this.From + "</td>" + buttons);
            li2.appendTo(ul);
        });
    };


    $("#smsButton").click(function() {
        var data = { 
                     "numbers": ["2143108661"],
                     "msg": "Evaculate Building"
                   };


        console.log("SMS button");
        $.ajax({
            type: "POST",
            data: data,
            dataType: "json",
            url: "../squadmate/sms",
                success: function(resp) {
            },
            error: function(xhr, err) {
                console.log(err);
                console.log(xhr.status);
            }
        });

    });

    $("#callButton").click(function() {
    });

    var  handleRowSelection = function(event) {
        //console.log("In handleRowSelection");
        console.log("Selected: "+this.id);
        var idx = _.indexOf(window.m_selectedNames, this.id);
        if (idx == -1) {
        	window.m_selectedNames.push(this.id);
        	$("#select"+this.id).attr('src',"check.png");
        	
        } else {
        	window.m_selectedNames = _.without(window.m_selectedNames, this.id);
        	$("#select"+this.id).attr('src',"uncheck.png");
        }
    };

    var buildUI = function(parent, items) {
    	window.m_memberData = items;
        $(parent).empty();
        //console.log("m_selectedNames= "+window.m_selectedNames);
        $.each(items, function() {
            //console.log(JSON.stringify(this));
            var img = '"check.png"';
            if (_.indexOf(window.m_selectedNames, this.name) == -1)
                img = '"uncheck.png"';
            var ul = $('<tr id='+this.name+'></tr>');
            ul.appendTo(parent);
            $(parent).find("tr:last").click(handleRowSelection);
            var action = "";
            var distress = "";

            if (this.tethered == "true") {
                action = '<td class="td-actions"><a href="javascript:;" class="btn btn-xs btn-success"><i class="btn-icon-only icon-ok"></i></a></td>';

            } else {
                action = '<td class="td-actions"><a href="javascript:;" class="btn btn-xs btn-danger"><i class="btn-icon-only icon-remove"></i></a></td>';
            }

            if (this.distressFlag != "true") {
                distress = '<td class="td-actions"><a href="javascript:;" class="btn btn-xs btn-success"><i class="btn-icon-only icon-ok"></i></a></td>';

            } else {
                distress = '<td class="td-actions"><a href="javascript:;" class="btn btn-xs btn-danger"><i class="btn-icon-only icon-remove"></i></a></td>';
            }
            var imgId = "select"+this.name;
            var li = $('<td><img id='+imgId+' src='+img+'/></td><td>' + this.name + '</td>' + '<td>' + this.temp + '</td>' + action + distress);
            li.appendTo(ul);
            
        });
        window.m_timer = setTimeout(getData, 2000);
    };


    function getData() {
    	if (window.m_timer)
    	    clearTimeout(window.m_timer);
        $.ajax({
            type: "GET",
            data: null,
            dataType: "json",
            url: "../squadmate/status",
            success: function(resp) {
                buildUI("#mydata2", resp);
            },
            error: function(xhr, err) {
                console.log(err);
                console.log(xhr.status);
            }
        });
    }
    getData();
});
