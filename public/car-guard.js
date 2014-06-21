var CarGuard = function() {
  this.locations = []

  var mapOptions = {
    center: new google.maps.LatLng(59.436961, 24.753575),
    zoom: 14
  }

  var map = new google.maps.Map($("#map")[0], mapOptions)

  $("#locations").on("click", ".icon", function(event) {
    event.preventDefault()
    bounce(map, $(event.target).closest("li").data("marker"))
  })    

  $("#show-location-details").on("click", function(event) {
    event.preventDefault()
    $("#wrap").toggleClass("with-location-details")
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
      .map(function(location) {
        var formattedLocation = _({}).extend(location, {
          latitude: location.latitude.toFixed(5),
          longitude: location.longitude.toFixed(5),
          speed: (location.speed / 1000 * 3600).toFixed(1) + " km/h",
          date: new Date(location.fixTime)
        })

        return new google.maps.Marker({
          position: {lat: location.latitude, lng: location.longitude},
          animation: google.maps.Animation.DROP,
          title: JSON.stringify(formattedLocation),
          location: formattedLocation
        })
      }).value()
   
    if (!self.locations.length) {
      var lastMarker = _(markers).last()

      if (lastMarker) {
        lastMarker.setIcon({
          url: "http://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png&scale=1.3"
        });
      }
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
            return strftime("%H:%M %d.%m", this.date)
          }
        }
      }
    }

    $("#locations ul").append($("#locations-template").clone().render(_(markers).reverse(), directives).find("li"))
    $("#wrap").addClass("with-locations")
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
