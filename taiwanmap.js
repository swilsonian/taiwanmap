var overlay,
    mapData,
    params = {};

var canMoveOverlay = false;

/* Store maps in subdirectory */
var mapsLocation = 'maps/';

var canHover = true;
var eventnames = [];
eventnames["up"] = "mouseup";
eventnames["down"] = "mousedown";
eventnames["move"] = "mousemove";

if(window.matchMedia("(any-hover: none)").matches) {
    canHover = false;
    console.log("No hover!")
    eventnames["up"] = "touchend";
    eventnames["down"] = "touchstart";
    eventnames["move"] = "touchmove";
    // eventnames["up"] = "dragstart";
    // eventnames["down"] = "dragend";
    // eventnames["move"] = "dragmove";
}
else {
    console.log("Can hover!")   
}

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

USGSOverlay.prototype.setDrag =  function(value) {
        // Add the element to the "overlayLayer" pane.
    var panes = this.getPanes();
    // panes.overlayLayer.appendChild(this.div_);

    if (this.div_.parentNode && this.div_.parentNode != null) {
        this.div_.parentNode.removeChild(this.div_);
    }  

    
    console.log("setDrag:" + value);
    if (value) {
        panes.floatPane.appendChild(this.div_);
    }
    else {
        panes.overlayLayer.appendChild(this.div_);
    }
    

    this.draw();
}


USGSOverlay.prototype.setOpacity =  function(value) {
    console.log(value);
    this.div_.style.opacity = value;
}

USGSOverlay.prototype.onRotate =  function() {
    this.div_.style.transform = 'rotate(' + (  this.value) + 'deg)';
    console.log(( this.value));
};

USGSOverlay.prototype.updateRotate =  function(value) {
    console.log("updateRotate");
    console.log(value);
    this.div_.style.transform = 'rotate(' + ( value) + 'deg)';
    console.log(( value));
};


/**
* onAdd is called when the map's panes are ready and the overlay has been
* added to the map.
*/

var moveHandler;

USGSOverlay.prototype.onAdd = function() {

    console.log("ON ADD");

    
    if (this.div_ == null) {

    var div = document.createElement('div');


    div.setAttribute("id", "theoverlayyo");
    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';
    div.style.opacity = 0.8;
    //div.style.transform = 'rotate(' + (360 - this.angle_) + 'deg)';
    
    //div.set('draggable',false);

    var img = document.createElement('img');
    img.src = this.image_;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = 'absolute';
    

    preventLongPressMenu(div);
    preventLongPressMenu(img);
    img.oncontextmenu = function(event) {
         event.preventDefault();
         event.stopPropagation();
         return false;
    };
    div.oncontextmenu = function(event) {
         event.preventDefault();
         event.stopPropagation();
         return false;
    };

    div.appendChild(img);

    this.div_ = div;
    }

    this.div_.draggable=false;
    
    that=this;

      // google.maps.event.addDomListener(this.map_.getDiv(),
      //                                  'mouseleave',
      //                                   function(){
      //     google.maps.event.trigger(this.div_,'mouseup');
      //   }
      // );
      

  
      google.maps.event.addDomListener(this.div_,
                                        eventnames["down"],
                                   function(e){

        // console.log("Event: " + eventnames["down"]);
                    
        
        this.style.cursor='move';
        that.map.set('draggable',false);
        that.map_.draggable = false;
        that.origin_ = e;

        that.moveHandler  = google.maps.event.addDomListener(that.map_.getDiv(),
                                                             eventnames["move"],
                                                             function(e){
            console.log("Event: " + eventnames["move"]);
   

            let eX, eY;

            if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
                var touch = e.touches[0] || e.changedTouches[0];
                eX = touch.pageX;
                eY = touch.pageY;
            } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
                eX = e.clientX;
                eY = e.clientY;
            }

            console.log("eX " + eX);             
            console.log("eY " + eY);

            var origin = that.origin_;

            let originX, originY;

          if(origin.type == 'touchstart' || origin.type == 'touchmove' || origin.type == 'touchend' || origin.type == 'touchcancel'){
                var touch = origin.touches[0] || origin.changedTouches[0];
                originX = touch.pageX;
                originY = touch.pageY;
            } else if (origin.type == 'mousedown' || origin.type == 'mouseup' || origin.type == 'mousemove' || origin.type == 'mouseover'|| origin.type=='mouseout' || origin.type=='mouseenter' || origin.type=='mouseleave') {
                originX = origin.clientX;
                originY = origin.clientY;
            }

            console.log( originX);             
            console.log( originY);


            var  left   = originX-eX;
            var   top    = originY-eY;

            console.log("left" + left);             
            console.log("top" + top); 

              // if (canMoveOverlay == false) {
              //   left = 0;
              //   top = 0;
              // }

              posNE    = that.getProjection()
                        .fromLatLngToDivPixel(that.bounds_.getNorthEast()),
              posSW    = that.getProjection()
                        .fromLatLngToDivPixel(that.bounds_.getSouthWest()),

              // left = posNE.x-e.clientX,
              // top = 

              newPosNE = new google.maps.Point(posNE.x-left, posNE.y-top),
              newPosSW = new google.maps.Point(posSW.x-left, posSW.y-top),
              latLngNE = that.getProjection()
                        .fromDivPixelToLatLng(newPosNE),
              latLngSW = that.getProjection()
                        .fromDivPixelToLatLng(newPosSW);                        
              
            console.log("old:" + posNE + ", " + posSW);
            console.log("new:" + newPosNE + ", " + newPosSW);


              that.bounds_ = new google.maps.LatLngBounds( latLngSW, latLngNE ); 

              that.origin_ = e; 
              that.draw();
          });
          
          moveHandler = that.moveHandler;
    
        }
     );
      
      google.maps.event.addDomListener(this.div_,  eventnames["up"], function(){

        console.log("Event: PICTURE " + eventnames["up"]);

        that.map.set('draggable',true);
        that.map_.draggable=true;
        this.style.cursor='default';
        // google.maps.event.clearListeners(that, 'mousemove');
        google.maps.event.removeListener(that.moveHandler);//that.moveHandler);
      });

      google.maps.event.addDomListener(map.getDiv(),  eventnames["up"], function(){

        console.log("Event: MAP " + eventnames["up"]);

        that.map.set('draggable',true);
        that.map_.draggable=true;
        this.style.cursor='default';
        // google.maps.event.clearListeners(that, 'mousemove');
        google.maps.event.removeListener(moveHandler);//that.moveHandler);
      });
       
  
   

    // document.getElementById('overlayslider').addEventListener("input", function() {
    //   div.style.transform = 'rotate(' + this.value + 'deg)';
    // });

    // Create the img element and attach it to the div.
    // var img = document.createElement('img');
    // img.src = this.image_;
    // img.style.width = '100%';
    // img.style.height = '100%';
    // img.style.position = 'absolute';
    // div.appendChild(img);


    // this.div_ = div;
    // }
    

    // Add the element to the "overlayLayer" pane.
    // var panes = this.getPanes();
    // panes.overlayLayer.appendChild(this.div_);
    
    this.setDrag(false); 
    // this.getPanes().floatPane.appendChild(this.div_);   

    console.log("Finished loading!");
    $("#loading-spinner").hide();
};




// USGSOverlay.prototype.draw = function() {
//   var div = this.div_;
//   var pos = this.getProjection().fromLatLngToDivPixel(this.bounds_.getNorthEast());
//   div.style.left = pos.x + 'px';
//   div.style.top = pos.y + 'px';
// };

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
    
    map.getDiv().oncontextmenu = function(event) {
         event.preventDefault();
         event.stopPropagation();
         return false;
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

    var mapImage = "./" + mapsLocation + location['map'];

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

            // myPosMarker = new google.maps.Marker({position:pos, map:map, zIndex: 10000 });
            infoWindow = new google.maps.InfoWindow;

            infoWindow.setPosition(pos);
            infoWindow.setContent('You');
            infoWindow.open(map);
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
    overlay.updateRotate( overlaySlider.val()/10 );
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


function cancelMapMove() {
    // div.gmnoprint
    // button.gm-control-active

    map.getDiv().dispatchEvent(new Event(eventnames["up"]));
}





function preventLongPressMenu(nodes) {
  for(var i=0; i<nodes.length; i++){
     nodes[i].ontouchstart = no;
     nodes[i].ontouchmove = no;
     nodes[i].ontouchend = no;
     nodes[i].ontouchcancel = no;
  }
}

let no = function(event) {
    event.preventDefault();
    event.stopPropagation(); // not necessary in my case, could leave in case stopImmediateProp isn't available? 
    event.stopImmediatePropagation();
    return false;
};

// document.getElementById('yourElement').oncontextmenu = function(event) {
//     event.preventDefault();
//     event.stopPropagation(); // not necessary in my case, could leave in case stopImmediateProp isn't available? 
//     event.stopImmediatePropagation();
//     return false;
// };




$(document).ready(function() {

    // window.oncontextmenu = function(event) {
    //  event.preventDefault();
    //  event.stopPropagation();
    //  return false;
    // };  

    function preventBehavior(e) {
        console.log(e);
        e.preventDefault(); 
    };

    // $('#fix').on('touchmove',function(e){
    // if(!$('.scroll').has($(e.target)).length)
    //     e.preventDefault();
    // });

    // $('body').delegate('#panel','touchmove',function(e){

    //     preventBehavior();

    // }).delegate('#map','touchmove',function(e){

    //     e.stopPropagation();
    //     return false;

    // });


    window.addEventListener("touchmove", preventBehavior, {passive: false});

    // window.addEventListener('touchforcechange', function(event) {
    //     var force = event.changedTouches[0].force;
    //     var id = event.changedTouches[0].target.id;
    //     console.log("force: " + force);
    //     if ($('img') && force > 0.4) {
    //         alert("force: " + force);
    //         //event.preventDefault();
    //         console.log('prevented 3D touch on element with id = ' + id);
    //     }
    // });


    opacitySlider = $("#opacity");
    overlaySlider = $("#overlayslider");
    moveButton = $("#movebutton");

    moveButton.change(function(event) {
        console.log("!!!!" +moveButton.checked);
      if (event.target.checked) {
        overlay.setDrag(true);
        canMoveOverlay = true;
      } else {
        overlay.setDrag(false);
        canMoveOverlay = false;
      }
  })

    // document.addEventListener('touchmove', function(e){e.preventDefault()}, false);
    overlaySlider.on('touchmove', function(e){e.stopPropagation()});
    opacitySlider.on('touchmove', function(e){e.stopPropagation()});
    // map.on('touchmove', function(e){e.stopPropagation()});
    // addEventListener('touchmove', , false);
    // opacitySlider.addEventListener('touchmove', function(e){e.stopPropagation()}, false);
    


});
