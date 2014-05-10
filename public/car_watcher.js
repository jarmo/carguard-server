var CarWatcher = function(locations) {

  this.render = function() {
    var latestLocation = locations[0] && {lat: locations[0].latitude, lng: locations[0].longitude}

    var mapOptions = {
      center: latestLocation || new google.maps.LatLng(59.436961, 24.753575),
      zoom: latestLocation ? 14 : 12
    }

    var map = new google.maps.Map($("#map")[0], mapOptions)
    var markers = addRoute(map, locations)

    $(".location").on("click", function(event) {
      event.preventDefault()
      bounce(markers[$(event.target).data("index")])
    })
  }

  function addRoute(map, locations) {
    var markers = _(locations).chain().select(function(location) {
      return location.time >= new Date().getTime() - 48 * 60 * 60 * 1000
    }).map(function(location, i) {
      return new google.maps.Marker({
        position: {lat: location.latitude, lng: location.longitude},
        animation: google.maps.Animation.DROP,
        title: JSON.stringify(_(location).extend({time: new Date(location.time)}))
      })
    }).value()

    renderMarkers(map, markers, 0)

    return markers
  }

  function renderMarkers(map, markers, index) {
    setTimeout(function() {
      var marker = markers[index]
      if (!marker) return

      map.panTo(marker.getPosition())
      marker.setMap(map)
      renderMarkers(map, markers, ++index)
    }, 500)
  }

  function bounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE)
    setTimeout(function() { marker.setAnimation(null) }, 2000)
  }
}
