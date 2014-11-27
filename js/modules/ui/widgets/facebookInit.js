/**
 * Created by feonit on 05.10.14.
 */

define(['facebook', 'options'], function(FB, options){

    FB.init({
        appId      : options.Configs.facebookClientId,
        xfbml      : false, //SDK will parse your page's DOM to find and initialize any social plugins that have been added using XFBML
        version    : 'v2.0'
    });

    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            // the user is logged in and has authenticated your
            // app, and response.authResponse supplies
            // the user's ID, a valid access token, a signed
            // request, and the time the access token
            // and signed request each expire
            var uid = response.authResponse.userID;
            var accessToken = response.authResponse.accessToken;


        } else if (response.status === 'not_authorized') {
            // the user is logged in to Facebook,
            // but has not authenticated your app
        } else {
            // the user isn't logged in to Facebook.
        }
    });

    FB.Event.subscribe('auth.login', function(response) {
        // do something with response
    });

    //FB.Event.unsubscribe

    FB.getLoginStatus(function(response) {
        console.log(response);
    });

    return FB;
});