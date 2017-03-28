// Venue Model Initialization
var Venue = function(data, foursquare_appInfo) {
    // Variables for data that is always defined or doesn't need formatting
    this.id = data.venue.id;
    this.name = data.venue.name;
    this.lat = data.venue.location.lat;
    this.lng = data.venue.location.lng;
    this.formattedAddress = data.venue.location.formattedAddress;
    this.categories = data.venue.categories[0].name;
    this.foursquareUrl = "https://foursquare.com/v/" + this.id;
    this.marker = {};

    // Data that may be undefined or need formatting
    this.formattedPhone = this.getFormattedPhone(data);
    this.url = this.getUrl(data);
    this.rating = this.getRating(data);
};

// Functions for Venue data formmatting
Venue.prototype = {

    getFormattedPhone: function(data) {
        if (!data.venue.contact.formattedPhone)
            return 'Contact Not Available';
        else
            return data.venue.contact.formattedPhone;
    },

    getUrl: function(data) {
        if (!data.venue.url)
            return 'Website Not Available';
        else
            return data.venue.url;
    },

    getRating: function(data) {
        if (!data.venue.rating)
            return '0.0';
        else
            return data.venue.rating;
    },
};

/* View model for Neighbourhood Map application */
function ViewModel() {

    var self = this;
    var map,
        mapOptions,
        bounds,
        infowindow,
        placeLat,
        placeLng;

    var defaultNeighbourhood = 'Montreal';

    self.neighbourhood = ko.observable(defaultNeighbourhood); // search value for neighbourhood
    self.currentNeighbourhoodMarker = ko.observable(''); // current neighborhood marker
    self.formattedAddress = ko.observable(''); // formatted neighborhood location address
    self.searchInput = ko.observable(''); // user search input
    self.topPicks = ko.observableArray(''); //topPicks from foursquare
    self.selectedMarker = ko.observable(''); // selected marker
    self.selectedVenue = ko.observable(''); // selected venue
    self.displayVenuesList = ko.observable('false'); // boolean for display venues list (default: false)

    // Update displays for map and venues when user
    // types in area search box
    self.computedNeighbourhood = function() {
        // Check if we have neighbourhood value and handle empty string
        if (self.neighbourhood() !== null || self.neighbourhood.length === 0) {
            removeVenueMarkers();
            self.topPicks([]);
            getNeighbourhood(self.neighbourhood());
        }

    };

    // toggle display function for venues list
    self.toggleVenuesDisplay = function() {
        self.displayVenuesList(!self.displayVenuesList());
    };

    // when user changes area in search box
    // update displays for map and venues
    // http://blog.mgechev.com/2013/04/24/why-to-use-publishsubscribe-in-javascript/
    self.neighbourhood.subscribe(self.computedNeighbourhood);

    // when user inputs a search keyword, catch and
    // update displays for map and venues
    self.searchInput.subscribe(self.computedNeighbourhood);

    /*
     * When venue item is clicked on:
     * 1. Pan to marker on map
     * 2. Open infoWindow
     * 3. Animate marker with bounce
     * @param venue {Object}. Venue object of
     * clicked venue item in list
     * @return {void}
     */
    self.panToMarker = function(venue) {
        console.log('fired click event');

        var venueInfoWindow = setVenueInfoWindow(venue);
        var venuePosition = new google.maps.LatLng(venue.lat, venue.lng);

        self.selectedMarker(venue.marker);
        self.selectedVenue(venue.id);
        infowindow.setContent(venueInfoWindow);
        infowindow.open(map, venue.marker);
        map.panTo(venuePosition);
        selectedMarkerBounce(venue.marker);

    };


    // Make sure last area markers are removed from map
    // after user changes location
    function removeVenueMarkers() {

        // clear current neighborhood marker
        self.currentNeighbourhoodMarker.setMap(null);

        // clear all venues' markers
        self.topPicks().forEach(function(venueItem) {
            venueItem.marker.setMap(null);
            venueItem.marker = {};
        });

    }

    /*
     * Get top pick nearby venues data from foursquare API
     * of current neighbourhood and create venue
     * markers on map
     * @return {void}
     */
    function getFoursquareData() {

        var foursquareBaseURL = 'https://api.foursquare.com/v2/venues/explore?';
        var foursquare_appInfo = 'client_id=WLXQPOZK22SRFVLU2C5EP2ODWDNRSTK0TSTW0HUMGBJHOFCI&client_secret=XADMZHNBFKJCM35LFYPVFGPHM1DWV3MO4P4F0R0NN5GQ5GPJ';
        var neighbourhoodLatLng = '&ll=' + placeLat + ',' + placeLng;
        var query = '&query=' + self.searchInput();
        var foursquareURL = foursquareBaseURL + foursquare_appInfo + '&v=20161016' + neighbourhoodLatLng + query;

        $.ajax({
            url: foursquareURL,
            success: function(data) {

                var initialFoursquareData = data.response.groups[0].items;

                // retrieve and set foursquare venue data in topPicks observable array
                initialFoursquareData.forEach(function(venueItem) {
                    self.topPicks.push(new Venue(venueItem, foursquare_appInfo));
                });

                // set marker for each venue
                self.topPicks().forEach(function(venueItem) {
                    createVenueMarker(venueItem);
                });

                // Check if we need to change bounds to fit venue markers from Four Square
                var tempBounds = data.response.suggestedBounds;
                if (tempBounds !== undefined) {
                    // Set the new rectangular area
                    // gmapAPI: https://developers.google.com/maps/documentation/javascript/reference#LatLng
                    bounds = new google.maps.LatLngBounds(
                        new google.maps.LatLng(tempBounds.sw.lat, tempBounds.sw.lng),
                        new google.maps.LatLng(tempBounds.ne.lat, tempBounds.ne.lng));
                    map.fitBounds(bounds);
                }
            },
            complete: function() {
                if (self.topPicks().length === 0)
                    $('#foursquare-error').html('<h2>No results available.</h2><h2>Please try refreshing the page.</h2>');
            },
            error: function(data) {
                $('#foursquare-error').html('<h2>There were errors retrieving venue data. Please try refreshing the page.</h2>');
            }
        });
    }


    /**
     * set up styled infoWindow
     * @param venue {Object}. A venue object
     * @return {void}
     */
    function setVenueInfoWindow(venue) {

        // set venue info window string
        var contentString = '<div class="venue-infowindow">'
                            + '<div class="venue-name">'
                            + '<a href ="' + venue.foursquareUrl + '">'
                            + venue.name
                            + '</a>'
                            + '<span class="venue-rating badge">'
                            + venue.rating
                            + '</span>'
                            + '</div>'
                            + '<div class="venue-category"><span class="glyphicon glyphicon-info-sign"></span>'
                            + venue.categories
                            + '</div>'
                            + '<div class="venue-address"><span class="glyphicon glyphicon-home"></span>'
                            + venue.formattedAddress
                            + '</div>'
                            + '<div class="venue-contact"><span class="glyphicon glyphicon-earphone"></span>'
                            + venue.formattedPhone
                            + '</div>'
                            + '<div class="venue-url"><span class="glyphicon glyphicon-globe"></span>'
                            + venue.url
                            + '</div>'
                            + '</div>';

        return contentString;

    }


    /*
     * create a venue marker on map
     * on click opens info window with bounce animation
     * panto this marker on map
     * @param venue {Object}. A venue object
     * @return {void}
     */
    function createVenueMarker(venue) {

        // save venue info window content in a var
        var venueInfoWindow = setVenueInfoWindow(venue);

        var venuePosition = new google.maps.LatLng(venue.lat, venue.lng);

        // create marker data
        var venueMarker = new google.maps.Marker({
            map: map,
            position: venuePosition,
            title: venue.name,
            animation: null
        });

        // set marker click event
        google.maps.event.addListener(venueMarker, 'click', function() {

            document.getElementById(venue.id).scrollIntoView();
            // set this venue id as selected venue
            self.selectedVenue(venue.id);
            // set info window content
            infowindow.setContent(venueInfoWindow);
            // open info window if this marker is clicked
            infowindow.open(map, venueMarker);
            // set marker animation to bounce if this marker is clicked
            selectedMarkerBounce(venueMarker);
            // pan to this venue's position if this marker is clicked
            map.panTo(venuePosition);
        });

        // set marker info in passed venue object
        venue.marker = venueMarker;

    }


    /*
     * set this marker's animation to bounce
     * @param venueMarker {Object}. A venue marker object
     * @return {void}
     */
    function selectedMarkerBounce(venueMarker) {
        // Check if venue is animating
        if (venueMarker.getAnimation() === null) {
            // set to currently selected marker
            self.selectedMarker(venueMarker);
            // disable any other vanueMarkers that may be animating
            self.topPicks().forEach(function(venue) {
                venue.marker.setAnimation(null);
            });
            // set this marker to animate
            venueMarker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }


    /*
     * Create a neighborhood marker with customized icon
     * for neighborhood address
     * @param {Object}. A place object returned by Google Map place callback
     * @return {void}
     */
    function createNeighbourhoodMarker(place) {

        var placeName = place.name;
        console.log(placeName);

        // Custom icon for place address
        var placeIcon = 'images/place-icon.png';

        // create a marker for this position
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            title: placeName,
            icon: placeIcon
        });

        // click event to this marker
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(placeName);
            infowindow.open(map, marker);
        });

        // set current neighborhood marker to this marker
        self.currentNeighbourhoodMarker = marker;

    }


    /**
     * Get top pick nearby venues data from foursquare API,
     * create venue markers on map
     * @param {Object} place. A place object returned by Google Map place callback
     * @return {void}
     */
    function getNeighbourhoodVenues(place) {

        infowindow = new google.maps.InfoWindow();
        placeLat = place.geometry.location.lat();
        placeLng = place.geometry.location.lng();
        self.formattedAddress(place.formatted_address);
        var newNeighbourhood = new google.maps.LatLng(placeLat, placeLng);
        map.setCenter(newNeighbourhood);

        // create marker for neighborhood address
        createNeighbourhoodMarker(place);

        // get venues from Four Square
        getFoursquareData();


        // disable marker animation when infowindow is closed
        google.maps.event.addListener(infowindow, 'closeclick', function() {
            self.selectedMarker().setAnimation(null);
        });

    }

    // getNeighbourhoodCallBack(results, status) makes sure the search returned results for a location.
    // if so, get and update neighborhood venues
    function getNeighbourhoodCallback(results, status) {


        if (status != google.maps.places.PlacesServiceStatus.OK) {
            gm_authFailure('places');
            return;
        }

        if (status == google.maps.places.PlacesServiceStatus.OK) {
            getNeighbourhoodVenues(results[0]);

        }
    }

    /*
     * Get neighbourhood data for the app
     * @param {string} neighbourhood. A neighbourhood location retrieved from user input
     * @return {void}
     */
    function getNeighbourhood(neighbourhood) {
        // the search request object
        var request = {
            query: neighbourhood
        };

        // create a Google place search service object.
        // PlacesService does searching for location data.
        service = new google.maps.places.PlacesService(map);
        // searches the Google Maps API for location data and runs callback
        service.textSearch(request, getNeighbourhoodCallback);

    }

    // Function to initialize neighbourhood data
    function initNeighbourhood(neighbourhood) {
        getNeighbourhood(neighbourhood);
    }

    // Function to initialize map on page
    function initMap() {
        mapOptions = {
            zoom: 17,
            disableDefaultUI: true,
            // https://snazzymaps.com/style/42/apple-maps-esque
            styles: [{ "featureType": "landscape.man_made", "elementType": "geometry", "stylers": [{ "color": "#f7f1df" }] }, { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#d0e3b4" }] }, { "featureType": "landscape.natural.terrain", "elementType": "geometry", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi.business", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi.medical", "elementType": "geometry", "stylers": [{ "color": "#fbd3da" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#bde6ab" }] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffe15f" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#efd151" }] }, { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "road.local", "elementType": "geometry.fill", "stylers": [{ "color": "black" }] }, { "featureType": "transit.station.airport", "elementType": "geometry.fill", "stylers": [{ "color": "#cfb2db" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#a2daf2" }] }]
        };

        map = new google.maps.Map(document.getElementById('map'), mapOptions);

        /* Auto geolocation seems to break observable...
         * Come back to this later.
         */
        // Try Geolocation. Auto locate user location.
        // if (navigator.geolocation) {
        //     navigator.geolocation.getCurrentPosition(function(position) {
        //         var pos = {
        //             lat: position.coords.latitude,
        //             lng: position.coords.longitude
        //         };
        //         // Reverse geocode to get formatted address
        //         /* Source:
        //         https://developers.google.com/maps/documentation/javascript/examples/geocoding-reverse
        //         */
        //         var geocoder = new google.maps.Geocoder();
        //         geocoder.geocode({ 'location': pos }, function(results, status) {
        //             if (status === 'OK') {
        //                 if (results[0]) {
        //                     // When reverse geolocation is complete
        //                     // let's take user to their city
        //                     var address_components = results[0].address_components;
        //                     for (i = 0; i < results[0].address_components.length; i++) {
        //                         // Find users city
        //                         if (address_components[i].types[0] === 'locality') {
        //                             // strip city name and go through process of setting up maps new location
        //                             city = address_components[i].short_name;
        //                             self.neighbourhood = city;
        //                             getNeighbourhood(city);
        //                         }
        //                     }
        //                 }
        //             } else {
        //                 gm_authFailure('places');
        //             }
        //         });
        //     });
        // }
    }

    // Initialize map
    initMap();

    // Initialize neighbourhood
    initNeighbourhood(defaultNeighbourhood);

}

// Catch errors returned from the map
function gm_authFailure(service) {
    if (service == 'places') {
        $('#map-error').html('<h2>It seems your search does not exist...</h2><h2>Please refresh the page and try a different search result.</h2>');
        return;
    }
    $('#map-error').html('<h2>There were errors when retrieving map data.</h2><h2>Please try refreshing the page.</h2>');
    return;
}

// initialize ViewModel
$(function() {

    ko.applyBindings(new ViewModel());

});
