define(['jquery', 'underscore', 'geolocation', 'async!googleapis'], function($, _, geolocation){

    // дефолтные настройки карты

    var defaultOptions = {
        zoom: 8,
        //center: new google.maps.LatLng(, ),

        // управление контролами
        panControl: false,

        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.BOTTOM_RIGHT

        },

        mapTypeControl: false,       //тип ("Карта" или "Спутник").
        //mapTypeControlOptions: {
        //    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        //    position: google.maps.ControlPosition.BOTTOM_CENTER
        //},

        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: false,

        // по дефолтку установим Москву
        latitude: 55.4506,
        longitude: 37.3704,

        // управление типом карты
        mapTypeId: google.maps.MapTypeId.TERRAIN


    };

    // Add a marker to the map and push to the array.
    function addMarker(location, map, markers) {
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
        markers.push(marker);
    }

    // Sets the map on all markers in the array.
    function setAllMap(map, markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }

    // Removes the markers from the map, but keeps them in the array.
    function clearMarkers(markers) {
        setAllMap(null, markers);
    }

    // Shows any markers currently in the array.
    function showMarkers(map, markers) {
        setAllMap(map, markers);
    }

    // Deletes all markers in the array by removing references to them.
    function deleteMarkers(markers) {
        clearMarkers(markers);
        markers.length = 0;
    }

    function HomeControl(controlDiv, map, markers, geocoder, infowindow) {

        // Set CSS styles for the DIV containing the control
        // Setting padding to 5 px will offset the control
        // from the edge of the map
        controlDiv.style.padding = '5px';

        // Set CSS for the control border
        var controlUI = document.createElement('div');
        controlUI.className = 'mylocation';
        controlUI.class = 'mylocation';
        controlDiv.appendChild(controlUI);


        // Setup the click event listeners: simply set the map to
        // Chicago
        google.maps.event.addDomListener(controlUI, 'click', function() {

            $(controlUI).addClass('mylocation-process');

            var successHandler = function(pos){
                $(controlUI).addClass('mylocation-success');

                var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                map.setCenter(latlng);

                clearMarkers(markers);
                deleteMarkers(markers);
                addMarker(latlng, map, markers);
                setAllMap(map, markers);

                codeLatLng( map, latlng, geocoder, infowindow );

            };

            var errorHandler = function(error){
                $(controlUI).addClass('mylocation-fail');
            };

            geolocation.getCurrentPosition(successHandler, errorHandler)

        });
    }

    function codeLatLng( map, latlng, input, geocoder, infowindow ) {

        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var text = getStringLocalityGeocoding(results);
                input.value = text;
            } else {
                alert('Geocoder failed due to: ' + status);
            }
        });
    }

    /**
     * API https://developers.google.com/maps/documentation/javascript/geocoding
     * Среди результатов поиска находим ту строку,
     * которая характеризуется принадлежностью к типу:
     * locality, обозначающий города, являющиеся политическими или административными единицами.
     * political, обозначающий политические образования. Последний тип обычно обозначает многоугольник, включающий местную административно-территориальную единицу.
     * */
    function getStringLocalityGeocoding(results){
        var test, result;

        result = _.find(results, function(result){
            test = result.types !== "undefined" && result.types[0] !== "undefined" && result.types[1] !== "undefined"
                && (
                       (result.types[0] === "locality" && result.types[1] === "political")
                    || (result.types[1] === "locality" && result.types[0] === "political")
                );
            return test
        });

        return result['formatted_address'];
    }

    // Создаём новую карту
    // Создаём точку для карты
    // Устанавливаем карту по точке
    // Create the search box and link it to the UI element.
    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.

    // Фабрика создания объектов карт

    function GoogleMap( customOptions ) {
        var markers = [],
            searchBox,
            infowindow = new google.maps.InfoWindow(),
            geocoder = new google.maps.Geocoder(),
            container = (customOptions && customOptions.container) ?  $(customOptions.container)[0] : document.getElementById('map_canvas'),
            map = new google.maps.Map(container, _.extend(defaultOptions, customOptions)),
            input = document.getElementById('pac-input'),
            ll = {
                latitude : customOptions.latitude || defaultOptions.latitude,
                longitude : customOptions.longitude || defaultOptions.longitude
            },
            initialLocation = new google.maps.LatLng(
                ll.latitude,
                ll.longitude
            );

        map.setCenter(initialLocation);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        searchBox = new google.maps.places.SearchBox(input);

        google.maps.event.addListener(searchBox, 'places_changed', function() {
            var places = searchBox.getPlaces(),
                i,place,
                bounds,
                image,
                marker;

            for (i = 0; marker = markers[i]; i++) {
                marker.setMap(null);
            }

            // For each place, get the icon, place name, and location.
            markers = [];
            bounds = new google.maps.LatLngBounds();
            for (i = 0; place = places[i]; i++) {
                image = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };

                // Create a marker for each place.
                marker = new google.maps.Marker({
                    map: map,
                    icon: image,
                    title: place.name,
                    position: place.geometry.location
                });

                markers.push(marker);

                bounds.extend(place.geometry.location);
            }

            map.fitBounds(bounds);
        });

        google.maps.event.addListener(map, 'bounds_changed', function() {
            var bounds = map.getBounds();
            searchBox.setBounds(bounds);
        });

        addMarker(initialLocation, map, markers);

        // Create the DIV to hold the control and
        // call the HomeControl() constructor passing
        // in this DIV.
        var homeControlDiv = document.createElement('div');
        var homeControl = new HomeControl(homeControlDiv, map, markers, input, geocoder, infowindow);

        homeControlDiv.index = 1;
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(homeControlDiv);

        google.maps.event.addListener(map, 'click', function(event) {
            addMarker(event.latLng);
        });

        return {
            google : window.google,
            map : map,
            geocoder : geocoder
        }
    }

    /**
     * @public API
     * https://developers.google.com/maps/documentation/javascript/reference?hl=ru#Map
     * */

     return {
        init: function(options){
            return GoogleMap(options);
        }
    }

});