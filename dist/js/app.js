function ViewModel(){function removeVenueMarkers(){self.currentNeighbourhoodMarker.setMap(null),self.topPicks().forEach(function(venueItem){venueItem.marker.setMap(null),venueItem.marker={}})}function getFoursquareData(){var foursquare_appInfo="client_id=WLXQPOZK22SRFVLU2C5EP2ODWDNRSTK0TSTW0HUMGBJHOFCI&client_secret=XADMZHNBFKJCM35LFYPVFGPHM1DWV3MO4P4F0R0NN5GQ5GPJ",neighbourhoodLatLng="&ll="+placeLat+","+placeLng,query="&query="+self.searchInput(),foursquareURL="https://api.foursquare.com/v2/venues/explore?"+foursquare_appInfo+"&v=20161016"+neighbourhoodLatLng+query;$.ajax({url:foursquareURL,success:function(data){data.response.groups[0].items.forEach(function(venueItem){self.topPicks.push(new Venue(venueItem,foursquare_appInfo))}),self.topPicks().forEach(function(venueItem){createVenueMarker(venueItem)});var tempBounds=data.response.suggestedBounds;void 0!==tempBounds&&(bounds=new google.maps.LatLngBounds(new google.maps.LatLng(tempBounds.sw.lat,tempBounds.sw.lng),new google.maps.LatLng(tempBounds.ne.lat,tempBounds.ne.lng)),map.fitBounds(bounds))},complete:function(){0===self.topPicks().length&&$("#foursquare-error").html("<h2>No results available.</h2><h2>Please try refreshing the page.</h2>")},error:function(data){$("#foursquare-error").html("<h2>There were errors retrieving venue data. Please try refreshing the page.</h2>")}})}function setVenueInfoWindow(venue){return'<div class="venue-infowindow"><div class="venue-name"><a href ="'+venue.foursquareUrl+'">'+venue.name+'</a><span class="venue-rating badge">'+venue.rating+'</span></div><div class="venue-category"><span class="glyphicon glyphicon-info-sign"></span>'+venue.categories+'</div><div class="venue-address"><span class="glyphicon glyphicon-home"></span>'+venue.formattedAddress+'</div><div class="venue-contact"><span class="glyphicon glyphicon-earphone"></span>'+venue.formattedPhone+'</div><div class="venue-url"><span class="glyphicon glyphicon-globe"></span>'+venue.url+"</div></div>"}function createVenueMarker(venue){var venueInfoWindow=setVenueInfoWindow(venue),venuePosition=new google.maps.LatLng(venue.lat,venue.lng),venueMarker=new google.maps.Marker({map:map,position:venuePosition,title:venue.name,animation:null});google.maps.event.addListener(venueMarker,"click",function(){document.getElementById(venue.id).scrollIntoView(),self.selectedVenue(venue.id),infowindow.setContent(venueInfoWindow),infowindow.open(map,venueMarker),selectedMarkerBounce(venueMarker),map.panTo(venuePosition)}),venue.marker=venueMarker}function selectedMarkerBounce(venueMarker){null===venueMarker.getAnimation()&&(self.selectedMarker(venueMarker),self.topPicks().forEach(function(venue){venue.marker.setAnimation(null)}),venueMarker.setAnimation(google.maps.Animation.BOUNCE))}function createNeighbourhoodMarker(place){var placeName=place.name;console.log(placeName);var marker=new google.maps.Marker({map:map,position:place.geometry.location,title:placeName,icon:"images/place-icon.png"});google.maps.event.addListener(marker,"click",function(){infowindow.setContent(placeName),infowindow.open(map,marker)}),self.currentNeighbourhoodMarker=marker}function getNeighbourhoodVenues(place){infowindow=new google.maps.InfoWindow,placeLat=place.geometry.location.lat(),placeLng=place.geometry.location.lng(),self.formattedAddress(place.formatted_address);var newNeighbourhood=new google.maps.LatLng(placeLat,placeLng);map.setCenter(newNeighbourhood),createNeighbourhoodMarker(place),getFoursquareData(),google.maps.event.addListener(infowindow,"closeclick",function(){self.selectedMarker().setAnimation(null)})}function getNeighbourhoodCallback(results,status){if(status!=google.maps.places.PlacesServiceStatus.OK)return void gm_authFailure("places");status==google.maps.places.PlacesServiceStatus.OK&&getNeighbourhoodVenues(results[0])}function getNeighbourhood(neighbourhood){var request={query:neighbourhood};service=new google.maps.places.PlacesService(map),service.textSearch(request,getNeighbourhoodCallback)}var map,mapOptions,bounds,infowindow,placeLat,placeLng,self=this;self.neighbourhood=ko.observable("Montreal"),self.currentNeighbourhoodMarker=ko.observable(""),self.formattedAddress=ko.observable(""),self.searchInput=ko.observable(""),self.topPicks=ko.observableArray(""),self.selectedMarker=ko.observable(""),self.selectedVenue=ko.observable(""),self.displayVenuesList=ko.observable("false"),self.computedNeighbourhood=function(){null===self.neighbourhood()&&0!==self.neighbourhood.length||(removeVenueMarkers(),self.topPicks([]),getNeighbourhood(self.neighbourhood()))},self.toggleVenuesDisplay=function(){self.displayVenuesList(!self.displayVenuesList())},self.neighbourhood.subscribe(self.computedNeighbourhood),self.searchInput.subscribe(self.computedNeighbourhood),self.panToMarker=function(venue){console.log("fired click event");var venueInfoWindow=setVenueInfoWindow(venue),venuePosition=new google.maps.LatLng(venue.lat,venue.lng);self.selectedMarker(venue.marker),self.selectedVenue(venue.id),infowindow.setContent(venueInfoWindow),infowindow.open(map,venue.marker),map.panTo(venuePosition),selectedMarkerBounce(venue.marker)},function(){mapOptions={zoom:17,disableDefaultUI:!0,styles:[{featureType:"landscape.man_made",elementType:"geometry",stylers:[{color:"#f7f1df"}]},{featureType:"landscape.natural",elementType:"geometry",stylers:[{color:"#d0e3b4"}]},{featureType:"landscape.natural.terrain",elementType:"geometry",stylers:[{visibility:"off"}]},{featureType:"poi",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.business",elementType:"all",stylers:[{visibility:"off"}]},{featureType:"poi.medical",elementType:"geometry",stylers:[{color:"#fbd3da"}]},{featureType:"poi.park",elementType:"geometry",stylers:[{color:"#bde6ab"}]},{featureType:"road",elementType:"geometry.stroke",stylers:[{visibility:"off"}]},{featureType:"road",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"road.highway",elementType:"geometry.fill",stylers:[{color:"#ffe15f"}]},{featureType:"road.highway",elementType:"geometry.stroke",stylers:[{color:"#efd151"}]},{featureType:"road.arterial",elementType:"geometry.fill",stylers:[{color:"#ffffff"}]},{featureType:"road.local",elementType:"geometry.fill",stylers:[{color:"black"}]},{featureType:"transit.station.airport",elementType:"geometry.fill",stylers:[{color:"#cfb2db"}]},{featureType:"water",elementType:"geometry",stylers:[{color:"#a2daf2"}]}]},map=new google.maps.Map(document.getElementById("map"),mapOptions)}(),function(neighbourhood){getNeighbourhood(neighbourhood)}("Montreal")}function gm_authFailure(service){if("places"==service)return void $("#map-error").html("<h2>It seems your search does not exist...</h2><h2>Please refresh the page and try a different search result.</h2>");$("#map-error").html("<h2>There were errors when retrieving map data.</h2><h2>Please try refreshing the page.</h2>")}var Venue=function(data,foursquare_appInfo){this.id=data.venue.id,this.name=data.venue.name,this.lat=data.venue.location.lat,this.lng=data.venue.location.lng,this.formattedAddress=data.venue.location.formattedAddress,this.categories=data.venue.categories[0].name,this.foursquareUrl="https://foursquare.com/v/"+this.id,this.marker={},this.formattedPhone=this.getFormattedPhone(data),this.url=this.getUrl(data),this.rating=this.getRating(data)};Venue.prototype={getFormattedPhone:function(data){return data.venue.contact.formattedPhone?data.venue.contact.formattedPhone:"Contact Not Available"},getUrl:function(data){return data.venue.url?data.venue.url:"Website Not Available"},getRating:function(data){return data.venue.rating?data.venue.rating:"0.0"}},$(function(){ko.applyBindings(new ViewModel)});