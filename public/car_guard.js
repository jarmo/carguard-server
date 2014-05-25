var CarGuard = function(locations) {
  this.render = function() {
    var latestLocation = locations[0] && {lat: locations[0].latitude, lng: locations[0].longitude}

    var mapOptions = {
      center: latestLocation || new google.maps.LatLng(59.436961, 24.753575),
      zoom: latestLocation ? 14 : 12
    }

    var map = new google.maps.Map($("#map")[0], mapOptions)
    var markers = addRoute(map, locations)

    $("#locations").on("click", ".location", function(event) {
      event.preventDefault()
      bounce(map, $(event.target).closest("li").data("marker"))
    })
  }

  function addRoute(map, locations) {
    if (!locations.length) return

    var markers = _(locations).chain()
      .select(function(location) {
        return location.fixTime >= new Date().getTime() - 48 * 60 * 60 * 1000
      })
      .sortBy(function(location) {
        return location.fixTime
      })
      .map(function(location, i) {
        return new google.maps.Marker({
          position: {lat: location.latitude, lng: location.longitude},
          animation: google.maps.Animation.DROP,
          title: JSON.stringify(_(location).extend({fixTime: new Date(location.fixTime)})),
          location: location
        })
      }).value()
    
    var lastMarker = _(markers).last()

    if (lastMarker) {
      lastMarker.setIcon({
        url: "http://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=1.3"
      });
    }

    renderMarkers(map, markers, 0)

    return markers
  }

  function renderMarkers(map, markers, index) {
    setTimeout(function() {
      var marker = markers[index]
      if (!marker) return

      map.panTo(marker.getPosition())
      marker.setMap(map)
      $("#locations ul").append($("<li>").addClass("location").data("marker", marker).append($("<a>").attr("href", "#").text(new Date(marker.location.fixTime) + " - " + marker.location.latitude + ", " + marker.location.longitude)))
      renderMarkers(map, markers, ++index)
    }, 500)
  }

  function bounce(map, marker) {
    map.panTo(marker.getPosition())
    marker.setAnimation(google.maps.Animation.BOUNCE)
    setTimeout(function() { marker.setAnimation(null) }, 3000)
  }
}
