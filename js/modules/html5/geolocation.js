/**
 * Created by feonit on 03.10.14.
 * Прослойка для работы с Геолокацией
 * (todo определение поддержки геолокации вынести в др. место)
 * (todo обработку ошибок)
 */


define(['statusLoad', 'jquery.cookie'], function(statusLoad, noObj){
    // HTML5 GeoLocation API. https://developers.google.com/maps/articles/geolocation?hl=ru

    function getCurrentPosition( callback, error ){

        var example = {
            coords: {
                latitude : '',
                longitude : ''
            },
            timestamp : ''
        };

        if ($.cookie('latitude') && $.cookie('longitude') && $.cookie('timestamp')){
            callback({
                coords: {
                    latitude : $.cookie('latitude'),
                    longitude : $.cookie('longitude')
                },
                timestamp : $.cookie('timestamp')
            });
            return true;
        }

        if(navigator.geolocation) {
            statusLoad.start();
            navigator.geolocation.getCurrentPosition(function(position) {
                if (callback){
                    callback(position);
                    statusLoad.stop();
                    $.cookie('latitude', position.coords.latitude),
                    $.cookie('longitude', position.coords.longitude),
                    $.cookie('timestamp', position.timestamp)
                }

            }, function(e) {
                handleNoGeolocation(true);
                error(e);
            });
        } else {
            handleNoGeolocation(false);
            error();
        }

    }


    function handleNoGeolocation(errorFlag) {
        if (errorFlag == true) {
            alert("Geolocation service failed.");
        } else {
            alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
        }
    }

    // if default must to be place here (Siberia)

     return {
         getCurrentPosition : getCurrentPosition
     };
});