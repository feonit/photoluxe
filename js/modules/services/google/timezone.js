/**
 * Created by feonit on 04.10.14.
 */

/**
 * Серсис для определения таймзоны по координате
 * Пример ответа
 *
 * {
       "dstOffset" : 0,
       "rawOffset" : -28800,
       "status" : "OK",
       "timeZoneId" : "America/Los_Angeles",
       "timeZoneName" : "Pacific Standard Time"
    }
 * */


define(['underscore', 'ajax', 'options'], function(_, ajax, options){

    return function( latitude, longitude, timestamp, callback ){

        var key = options.Configs.service.google.apiKey;

        var data = {
            latitude: latitude,
            longitude: longitude,
            timestamp: timestamp,
            key : key
        };

        var tamplate = "https://maps.googleapis.com/maps/api/timezone/json?" +
            "location=<%=latitude%>,<%=longitude%>" +
            "&timestamp=<%= timestamp%>" +
            "&key=<%= key%>";

        var url;

        url = _.template(tamplate, data);

        ajax.getJSONP(url, function(data){
            callback(data)
        });
    }

});