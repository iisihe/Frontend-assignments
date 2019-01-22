$(document).ready(function(){
    showHistory();
    showMap(60.45, 22.2833);
});

// Get information based on given country and zipcode
function getPlace() {
    // Clear table from previous place information
    clearTable();
    var client = new XMLHttpRequest();
    c = document.getElementById("country");
    country = c.options[c.selectedIndex].value;
    zipcode = document.getElementById("zipcode").value;
    countrytext = c.options[c.selectedIndex].text;
    saveHistory(countrytext, zipcode);

    client.open("GET", "https://api.zippopotam.us/" + country + "/" + zipcode, true);
    client.onreadystatechange = function () {
        if (client.readyState === 4) {
            // If response is not empty
            if (client.responseText !== "{}") {
                var obj = JSON.parse(client.responseText);
                // Remove previous map
                map.remove();
                // Show map with latitude and longitude of given place
                showMap(obj.places[0].latitude, obj.places[0].longitude);
                // Go through all places for given country and zipcode
                for (place of obj.places) {
                    // get the table, insert new row and cells and put place name, longitude and latitude there
                    var table = document.getElementById("table");
                    var row = table.insertRow(1);
                    var cell0 = row.insertCell(0);
                    var cell1 = row.insertCell(1);
                    var cell2 = row.insertCell(2);
                    cell0.innerHTML = place["place name"];
                    cell1.innerHTML = place.longitude;
                    cell2.innerHTML = place.latitude;
                    // set market to the map based on latitude and longitude
                    setMarker(place.latitude, place.longitude);
                }
            }
            // If response is empty, the given zipcode didn't found from the chosen country
            else {
                map.remove();
                showMap(60.45, 22.2833);
                alert("Zipcode " + zipcode + " not found from country " + countrytext);
            }
        }
    };
    client.send();
}

function saveHistory(country, zipcode) {
    if(typeof(Storage) !== "undefined") {
        var jsonHistory = [];
        // If there are previous history, get it
        if (localStorage.getItem('history')) {
            var retrievedObject = localStorage.getItem('history');
            jsonHistory = JSON.parse(retrievedObject);
        }
        // Create new Search object and push it to history
        var search = new Search(country, zipcode);
        jsonHistory.push(search);

        // If there are more than 10 searches in history, remove them
        while (jsonHistory.length > 10) {
            jsonHistory = jsonHistory.slice(1);
        }
        // Set history to localStorage
        localStorage.setItem("history", JSON.stringify(jsonHistory));
    } else {
        document.getElementById("historyarea").innerHTML = "Unfortunately your browser doesn't support web storage";
    }
    // Show the updated history
    showHistory();
}

function showHistory(){
    if(localStorage.length !== 0){
        var history = document.getElementById("historyarea");
        history.innerHTML = "History of  the last 10 searches: <br>";
        // Get all searches from history
        all = JSON.parse(localStorage.getItem("history"));
        // Go through all searches and print them one by one
        for (i=all.length-1; i>=0; i--) {
            var search = all[i];
            history.innerHTML += search.country + " - " + search.zipcode + "<br>";
        }
    }
}

// Clear the table, except header
function clearTable() {
    var tableHeaderRowCount = 1;
    var table = document.getElementById('table');
    var rowCount = table.rows.length;
    for (var i = tableHeaderRowCount; i < rowCount; i++) {
        table.deleteRow(tableHeaderRowCount);
    }
}

function Search(country, zipcode) {
    this.country = country;
    this.zipcode = zipcode;
}

// Show map by given latitude and longitude
function showMap(latitude, longitude) {
    map = L.map('map').setView([latitude, longitude], 11);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaWlzayIsImEiOiJjanAxZ2c3em0wZGE0M3BtcTI3emNyZmJtIn0.NXvcK7U0wCI61fM0oN92Gw', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiaWlzayIsImEiOiJjanAxZ2c3em0wZGE0M3BtcTI3emNyZmJtIn0.NXvcK7U0wCI61fM0oN92Gw'
    }).addTo(map);
}

// Set market to map by given latitude and longitude
function setMarker(latitude, longitude) {
    marker = L.marker([latitude, longitude]).addTo(map);
}