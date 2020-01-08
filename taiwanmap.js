var overlay,
    mapData,
    params = {};

/* Store maps in subdirectory */
var mapsLocation = 'maps/';

var getParameters = function() {
    var query,
        vars;
    /* params */
    query = window.location.search.substring(1);
    vars = query.split("&");
    vars.forEach(function(item) {
        var pair = item.split("=");
        params[pair[0]] = decodeURI(pair[1]);
    });
    /* hash */
    query = window.location.hash.substring(1);
    if (query.length > 0) {
        vars = query.split("&");
        vars.forEach(function(item) {
            var pair = item.split("=");
            params[pair[0]] = decodeURI(pair[1]);
        });
    };
};

$.getJSON( "./taiwanmap.json", function( data ) {
    console.log(data);
    mapData = data;
    initMap();
});

var historicalOverlay,
    map,
    infoWindow,
    myPosMarker;

var overlay;
USGSOverlay.prototype = new google.maps.OverlayView();
/** @constructor */
function USGSOverlay(bounds, angle, image, map) {

    // Initialize all properties.
    this.bounds_ = bounds;
    this.image_ = image;
    this.map_ = map;
    this.angle_ = angle;

    console.log(bounds);
    console.log(image);
    console.log(map);

    // Define a property to hold the image's div. We'll
    // actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now.
    this.div_ = null;

    // Explicitly call setMap on this overlay.
    this.setMap(map);

}

USGSOverlay.prototype.setOpacity =  function(value) {
    console.log(value);
    this.div_.style.opacity = value;
}

USGSOverlay.prototype.onRotate =  function() {
    this.div_.style.transform = 'rotate(' + (360 - this.value) + 'deg)';
    console.log((360 - this.value));
};

USGSOverlay.prototype.updateRotate =  function(value) {
    console.log("updateRotate");
    this.div_.style.transform = 'rotate(' + (360 - value) + 'deg)';
    console.log((360 - value));
};


/**
* onAdd is called when the map's panes are ready and the overlay has been
* added to the map.
*/
USGSOverlay.prototype.onAdd = function() {

    console.log("ON ADD");

    if (this.div_ == null) {
    var div = document.createElement('div');
    div.setAttribute("id", "theoverlayyo");
    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';
    div.style.opacity = 0.8;
    div.style.transform = 'rotate(' + (360 - this.angle_) + 'deg)';

    // document.getElementById('overlayslider').addEventListener("input", function() {
    //   div.style.transform = 'rotate(' + this.value + 'deg)';
    // });

    // Create the img element and attach it to the div.
    var img = document.createElement('img');
    img.src = this.image_;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = 'absolute';
    div.appendChild(img);


    this.div_ = div;
    }
    

    // Add the element to the "overlayLayer" pane.
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(this.div_);

    console.log("Finished loading!");
    $("#loading-spinner").hide();
};

USGSOverlay.prototype.draw = function() {

    // We use the south-west and north-east
    // coordinates of the overlay to peg it to the correct position and size.
    // To do this, we need to retrieve the projection from the overlay.
    var overlayProjection = this.getProjection();

    // Retrieve the south-west and north-east coordinates of this overlay
    // in LatLngs and convert them to pixel coordinates.
    // We'll use these coordinates to resize the div.
    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

    // console.log(sw);
    // console.log(ne);

    // Resize the image's div to fit the indicated dimensions.
    var div = this.div_;
    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
USGSOverlay.prototype.onRemove = function() {
    console.log("REMOVE!");
    this.div_.parentNode.removeChild(this.div_);
    // this.div_ = null;
};

function initMap() {
    getParameters();
    var locationName = params['location'];
    if (!mapData[locationName]) {
        locationName = 'Taipei';
	    console.log("Can't find!");
    }
    var location = mapData[locationName];
    document.title = location['name'] + " / " + locationName;

    if (params['lat'] && params['lng'] && params['z']) {
        /* load at requested coordinates */
        map = new google.maps.Map(document.getElementById('map'), {
	    zoom: parseInt(params['z']),
	    center: {lat: parseFloat(params['lat']), lng: parseFloat(params['lng'])},
	    mapTypeId: google.maps.MapTypeId.SATELLITE
        });
    } else {
        /* load at default coordinates */
        map = new google.maps.Map(document.getElementById('map'), {
	    zoom: location['zoom'],
	    center: {lat: location['center']['lat'], lng: location['center']['lng']},
	    mapTypeId: google.maps.MapTypeId.SATELLITE
        });
    };
    
    console.log("BOUNDS");
    console.log(location);
    var imageBounds = new google.maps.LatLngBounds(            
            new google.maps.LatLng(location['bounds']['south'], location['bounds']['west']),
            new google.maps.LatLng(location['bounds']['north'], location['bounds']['east']));


    // console.log(location['bounds']['south']);
    // console.log(location['bounds']['west']);
    // console.log(imageBounds.getSouthWest().lat()); 
    // console.log(imageBounds.getSouthWest().lng());    
    
    // console.log("!!");
    // console.log(location['bounds']['north']);
    // console.log(location['bounds']['east']);
    // console.log(imageBounds.getNorthEast().lat());
    // console.log(imageBounds.getNorthEast().lng());
    // console.log("BOUNDS");

    // var imageBounds = {
    //     north: location['bounds']['north'],
    //     east: location['bounds']['east'],
    //     south: location['bounds']['south'],
    //     west:location['bounds']['west']
    // };

    var mapImage = "/" + mapsLocation + location['map'];

    var angle = location['rotation'];

    // Set map list dropdown
    var maplist = $("#location");
    $.each(mapData, function(key, value) {
        maplist.append($("<option></option>").attr("value",key).text(value['name'] + " / " + key));
    });
    maplist.val(locationName);
    maplist.change(function() {
        var newQuery = $.param({ location: encodeURIComponent(maplist.val()) });
        window.location.href = window.location.origin + window.location.pathname + "?" + newQuery;
    });

    /* Update location bar as map is moved around, so it can be shared */
    google.maps.event.addListener(map, 'idle', function() {
        document.location.hash = "lat="+this.getCenter().lat().toFixed(6)+
                        "&lng="+this.getCenter().lng().toFixed(6)+
                        "&z="+this.getZoom();
    });

    


    // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            myPosMarker = new google.maps.Marker({position:pos, map:map});
            // infoWindow.setPosition(pos);
            // infoWindow.setContent('Your Location.');

            // infoWindow.open(map);
            // map.setCenter(pos);
          }, function() {
            handleLocationError(true, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, map.getCenter());
        }


    overlay = new USGSOverlay(imageBounds, angle, mapImage, map);  
}

function handleLocationError(browserHasGeolocation, pos) {
    infoWindow = new google.maps.InfoWindow;
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

var toggleVisibility = function() {
    if (overlay.getMap()) {
	   overlay.setMap(null);
    } else {
	   overlay.setMap(map);
    }
};

var opacitySlider;
var updateOpacity = function() {
    overlay.setOpacity( opacitySlider.val() / 10 );
};

var overlaySlider;
var updateRotate = function() {    
    overlay.updateRotate( overlaySlider.val() );
};


      // This example creates a custom overlay called USGSOverlay, containing
      // a U.S. Geological Survey (USGS) image of the relevant area on the map.

      // Set the custom overlay object's prototype to a new instance
      // of OverlayView. In effect, this will subclass the overlay class therefore
      // it's simpler to load the API synchronously, using
      // google.maps.event.addDomListener().
      // Note that we set the prototype to an instance, rather than the
      // parent class itself, because we do not wish to modify the parent class.

      
 // google.maps.event.addDomListener(window, 'load', initMap);      


$(document).ready(function() {
    opacitySlider = $("#opacity");
    overlaySlider = $("#overlayslider");
});
