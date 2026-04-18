document.addEventListener("DOMContentLoaded", function () {

    // console.log("Coordinates from EJS:", window.listingCoordinates);

    const map = new maplibregl.Map({
        container: 'map',
        style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${window.geoKey}`,
        center: window.listingCoordinates,   // 🔥 dynamic
        zoom: 12
    }); //Loads OpenStreetMap tiles, Centers map on saved coordinates, Adds navigation controls

    map.addControl(new maplibregl.NavigationControl());

    //Marker Points exactly where the hotel is located.
    new maplibregl.Marker()
        .setLngLat(window.listingCoordinates)  // 🔥 dynamic
        .setPopup(new maplibregl.Popup().setText("Welcome to Great Hotels"))
        .addTo(map);

});