var main = function () {
    "use strict";

    var insertIntoDOM = function (myJson) {
        var obj = JSON.parse(myJson)
        $("p").text("Enter a URL above to begin!");
    };

    $.getJSON("/results.json", insertIntoDOM);

    $("h3").text("Loading...");
    var url = "http://localhost:3000/listdb";

    $.getJSON(url, function(data) {
        $("h3").html("Top 10 Visited URLs<br>");
        for(var i=0;i<10;i++) {
            $("h3").append("http://localhost:3000/" + data[i].shorturl + " - Views: " + data[i].views + "<br>");
        }
    });
};

$(document).ready(main);

function postURL () {
    var name = document.getElementById("name").value;
    name = name.replace("/","-slashie-");
    //your code to be executed after 1 seconds
     
    var yourURL = function (myJson) {
        var obj = JSON.parse(myJson)
        
        $("p").html("Your URL: <a href='http://" + obj.shortURL + "' target='_blank'>" + obj.shortURL + "</a>");
    };
    $.post("/" + name, yourURL, 'json');
};
