var mymap = L.map('mapid').setView([52.208725, 20.999292], 18);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1Ijoid2lzbmlhazE5OSIsImEiOiJjaXY5c2EyZnMwMDJmMm9sNWV0YXloZXoyIn0.Q4f-N5IEUVF-YuIBxkt1JQ'
}).addTo(mymap);

var marker = L.marker([52.208725, 20.999499]).addTo(mymap);
marker.bindPopup("<b>Impreza na Bruna</b>").openPopup();

var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

mymap.on('click', onMapClick);

