var CarGuard = function() {
  this.locations = []

  var mapOptions = {
    center: new google.maps.LatLng(59.436961, 24.753575),
    zoom: 14
  }

  var map = new google.maps.Map($("#map")[0], mapOptions)

  $("#locations").on("click", ".location", function(event) {
    event.preventDefault()
    bounce(map, $(event.target).closest("li").data("marker"))
  })    

  var self = this

  this.render = function(apiKey, secret, latestLocationTime) {
    var dfd = $.Deferred()
    var self = this

    var locationsUrl = "/locations/" + apiKey
    if (latestLocationTime) locationsUrl += "/" + new Date(latestLocationTime).getTime()

    $.getJSON(locationsUrl)
      .done(function(locations) {
        EncryptedLocations.decryptAll(locations, secret).done(function(locations) {
          dfd.resolve()
          addRoute(locations)
          self.locations = self.locations.concat(locations)
        }).fail(function() { dfd.reject() })
      })

    $("#show-more").one("click", function(event) {
      event.preventDefault()

      self.render(apiKey, secret, _(self.locations).last().created_at)
    })

    return dfd
  }

  function addRoute(locations) {
    if (!locations.length) return

    var markers = _(locations).chain()
      .sortBy(function(location) {
        return location.fixTime
      })
      .map(function(location, i) {
        return new google.maps.Marker({
          position: {lat: location.latitude, lng: location.longitude},
          animation: google.maps.Animation.DROP,
          title: JSON.stringify({
            date: new Date(location.fixTime),
            speed: location.speed,
            latitude: location.latitude,
            longitude: location.longitude
          }),
          location: location
        })
      }).value()
    
    var lastMarker = _(markers).last()

    if (lastMarker) {
      lastMarker.setIcon({
        url: "http://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=1.3"
      });
    }

    renderMarkersList(markers)
    renderMarkers(map, markers, 0)
  }

  function renderMarkersList(markers) {
    var directives = {
      location: {
        html: function(params) {
          $(params.element).data("marker", this)
        },
        fixTime: {
          text: function() {
            return strftime("%d.%m %H:%M", new Date(this.fixTime))
          }
        }
      }
    }

    $("#locations ul").append($("#locations-template").clone().render(_(markers).reverse(), directives).find("li"))
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

  function bounce(map, marker) {
    map.panTo(marker.getPosition())
    marker.setAnimation(google.maps.Animation.BOUNCE)
    setTimeout(function() { marker.setAnimation(null) }, 3000)
  }
}
