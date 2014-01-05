$(document).ready(function() {

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

    var buildUI = function(parent, items) {
        $(parent).empty();
        
        $.each(items, function() {
            console.log(JSON.stringify(this));
            
            var ul = $("<tr></tr>");
            ul.appendTo(parent);

            var action;

            if (this.tethered == "true") {
                action = '<td class="td-actions"><a href="javascript:;" class="btn btn-xs btn-primary"><i class="btn-icon-only icon-ok"></i></a></td>';

            } else {
                action = '<td class="td-actions"><a href="javascript:;" class="btn btn-xs btn-warning"><i class="btn-icon-only icon-remove"></i></a></td>';
            }

            var li = $('<td>' + this.name + '</td>' + '<td>' + this.temp + '</td>' + action);
            li.appendTo(ul);
        });

        setTimeout(getData, 2000);
    };


    function getData() {
        $.ajax({
            type: "GET",
            data: null,
            dataType: "json",
            url: "https://snoop-wileycoyote.rhcloud.com/squadmate/status",
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