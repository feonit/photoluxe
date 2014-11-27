/**
 * Created by feonit on 05.10.14.
 */
define(['vkontakte'], function(){

    var onSuccess = function() {    // функция, вызываемая при успешной инициализации API.

        },

        onFail = function() {       // функция, вызываемая при ошибке.

        },

        apiVersion = 5.25;          // версия API, используемая приложением, актуальная версия 5.25.

    VK.init(onSuccess, onFail, apiVersion);

    //https://oauth.vk.com/authorize?
    //    client_id=APP_ID&
    //    scope=PERMISSIONS&
    //    redirect_uri=REDIRECT_URI&
    //    display=DISPLAY&
    //    v=API_VERSION&
    //    response_type=token

    return VK;
});