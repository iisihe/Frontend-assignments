$(document).ready(function(){
    showMap();
    getLines();
});

// Show map for coordinates 60.47, 22.28 (near Turku)
function showMap() {
    map = L.map('map').setView([60.47, 22.28], 11);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaWlzayIsImEiOiJjanAxZ2c3em0wZGE0M3BtcTI3emNyZmJtIn0.NXvcK7U0wCI61fM0oN92Gw', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiaWlzayIsImEiOiJjanAxZ2c3em0wZGE0M3BtcTI3emNyZmJtIn0.NXvcK7U0wCI61fM0oN92Gw'
    }).addTo(map);
}

// Get all buslines for the drop-down list
function getLines() {
    var client = new XMLHttpRequest();
    client.open("GET", "https://data.foli.fi/gtfs/routes", true);
    client.onreadystatechange = function () {
        if (client.readyState === 4) {
            var obj = JSON.parse(client.responseText);
            var optionsArray = [];
            // Go through all routes and add short name of route and id of route to array
            for (route of obj) {
                optionsArray.push(route.route_short_name + " " + route.route_id);
            }
            // Sort Array do that it is easier to find a specific bus line from the drop-down list
            optionsArray.sort();
            var busline = document.getElementById("busline");
            // Go through all routes in array, set short name of the route as text and id of route as value of option
            for (route of optionsArray) {
                words = route.split(" ");
                option = document.createElement("option");
                option.text = words[0];
                option.value = words[1];
                busline.add(option);
            }
        }
    };
    client.send();
}

// Draw route selected in the drop-down list
function drawRoute() {
    map.remove();
    showMap();
    // Get element "busline" (drop-down-list)
    var selector = document.getElementById("busline");
    // Get selected value from drop-down-list
    var route_id = selector[selector.selectedIndex].value;
    var client = new XMLHttpRequest();
    var shape_id = "";
    client.open("GET", "https://data.foli.fi/gtfs/trips/route/" + route_id, true);
    client.onreadystatechange = function () {
        if (client.readyState === 4) {
            if (client.status === 404){
                alert("Couldn't find route for the selected bus line.");
            }
            // Get shape_id and use it forming the wanted url
            var obj = JSON.parse(client.responseText);
            shape_id = obj[0].shape_id;
            var c = new XMLHttpRequest();
            c.open("GET", "https://data.foli.fi/gtfs/shapes/" + shape_id, true);
            c.onreadystatechange = function () {
                if (c.readyState === 4) {
                    var o = JSON.parse(c.responseText);
                    var pointList = [];
                    // Go through all points in the route and put latitude and longitude of points to pointlist
                    for (point of o) {
                        point = new L.LatLng(point.lat, point.lon);
                        pointList.push(point);
                    }
                    // Draw the line using pointlist
                    var line = new L.Polyline(pointList, {
                        color: 'red',
                        weight: 3,
                        opacity: 0.5,
                        smoothFactor: 1
                    });
                    line.addTo(map);
                }
            };
            c.send();
        }
    };
    client.send();
}

// Refresh the page so, that after refresh the route and buses in real-time are shown
function refresh() {
    map.remove();
    showMap();
    drawRoute();
    showBuses();
}

// Show where buses are right now in selected busline
function showBuses() {
    var selector = document.getElementById("busline");
    var route_name = selector[selector.selectedIndex].text;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://data.foli.fi/siri/vm/", true);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            var obj = JSON.parse(xmlHttp.responseText);
            buses = obj.result.vehicles;
            // Go through all buses and check if the name of it is same as selected in drop-down-list
            for (bus in buses) {
                // Add buses from the selected line to the map
                if (buses[bus].publishedlinename === route_name) {
                    lat = buses[bus].latitude;
                    lon = buses[bus].longitude;
                    marker = L.marker([lat, lon], {icon: busIcon}).addTo(map);
                }
            }
        }

    };
    xmlHttp.send();
}

// Bus icon used when showing buses in the map
var busIcon = L.icon({
    iconUrl: 'images/bus-icon.png',
    shadowUrl: 'images/marker-shadow.png',
    iconSize:     [38, 65],
    shadowSize:   [50, 64],
    iconAnchor:   [22, 64],
    shadowAnchor: [4, 62],
    popupAnchor:  [-3, -76]
});